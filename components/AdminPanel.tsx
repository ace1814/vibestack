'use client';

import { useState } from 'react';
import useSWR, { mutate as globalMutate } from 'swr';
import ResourceForm from './ResourceForm';
import { Resource, Tag } from '@/lib/types';

interface AdminPanelProps {
  adminPassword: string;
}

interface AdminResourcesPage {
  items: Resource[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

/** SWR fetcher that passes the admin password header */
const adminFetcher = ([url, password]: [string, string]) =>
  fetch(url, { headers: { 'x-admin-password': password } }).then((r) => r.json());

const tagsFetcher = (url: string) => fetch(url).then((r) => r.json());

export default function AdminPanel({ adminPassword }: AdminPanelProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [rescrapingId, setRescrapingId] = useState<string | null>(null);

  // SWR key includes page — each page is independently cached
  const resourceKey: [string, string] = [
    `/api/admin/resources?page=${currentPage}`,
    adminPassword,
  ];

  const {
    data: resourceData,
    isLoading: loading,
    mutate: revalidatePage,
  } = useSWR<AdminResourcesPage>(resourceKey, adminFetcher, {
    revalidateOnFocus: false,
    dedupingInterval: 10_000,   // 10 s in-memory dedup
  });

  const { data: allTags = [] } = useSWR<Tag[]>('/api/tags', tagsFetcher, {
    revalidateOnFocus: false,
    dedupingInterval: 60_000,
  });

  const resources = resourceData?.items ?? [];
  const total = resourceData?.total ?? 0;
  const totalPages = resourceData?.totalPages ?? 1;

  /** Bust every cached admin resources page so counts stay accurate */
  const revalidateAllPages = () =>
    globalMutate(
      (key: unknown) =>
        Array.isArray(key) &&
        typeof key[0] === 'string' &&
        key[0].startsWith('/api/admin/resources'),
      undefined,
      { revalidate: true },
    );

  // ─── CRUD handlers ──────────────────────────────────────────────────────────

  const handleAddSuccess = (_resource: Resource) => {
    setShowAddForm(false);
    setCurrentPage(1);
    revalidateAllPages();
    globalMutate('/api/tags');
  };

  const handleEditSuccess = (updated: Resource) => {
    setEditingId(null);
    // Optimistically update the cached page, no extra network request
    revalidatePage(
      (prev) =>
        prev
          ? { ...prev, items: prev.items.map((r) => (r.id === updated.id ? updated : r)) }
          : prev,
      { revalidate: false },
    );
    globalMutate('/api/tags');
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this resource? This cannot be undone.')) return;
    setDeletingId(id);
    try {
      const res = await fetch(`/api/admin/resources/${id}`, {
        method: 'DELETE',
        headers: { 'x-admin-password': adminPassword },
      });
      if (!res.ok) throw new Error('Delete failed');
      // Optimistic remove, then revalidate so totals/pages stay consistent
      revalidatePage(
        (prev) =>
          prev
            ? { ...prev, items: prev.items.filter((r) => r.id !== id), total: prev.total - 1 }
            : prev,
        { revalidate: false },
      );
      revalidateAllPages();
    } catch {
      alert('Failed to delete. Try again.');
    } finally {
      setDeletingId(null);
    }
  };

  const handleRescrape = async (resource: Resource) => {
    setRescrapingId(resource.id);
    try {
      const scrapeRes = await fetch('/api/admin/scrape-og', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-admin-password': adminPassword },
        body: JSON.stringify({ url: resource.url }),
      });
      const scrapeData = await scrapeRes.json();

      if (!scrapeRes.ok || !scrapeData.previewImageUrl) {
        alert('Could not fetch an image for this URL.');
        return;
      }

      const patchRes = await fetch(`/api/admin/resources/${resource.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'x-admin-password': adminPassword },
        body: JSON.stringify({ preview_image_url: scrapeData.previewImageUrl }),
      });
      const updated = await patchRes.json();

      if (!patchRes.ok) {
        alert(updated.error || 'Failed to update image.');
        return;
      }

      revalidatePage(
        (prev) =>
          prev
            ? {
                ...prev,
                items: prev.items.map((r) =>
                  r.id === resource.id
                    ? { ...r, preview_image_url: scrapeData.previewImageUrl }
                    : r,
                ),
              }
            : prev,
        { revalidate: false },
      );
    } catch {
      alert('Re-scrape failed. Try again.');
    } finally {
      setRescrapingId(null);
    }
  };

  // ─── Styles ─────────────────────────────────────────────────────────────────

  const typeColors: Record<string, string> = {
    tool: 'bg-violet-100 text-violet-700',
    learning: 'bg-emerald-100 text-emerald-700',
    project: 'bg-amber-100 text-amber-700',
    mcp: 'bg-sky-100 text-sky-700',
  };

  // ─── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-100 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-slate-900">
              Vibe<span className="text-violet-600">Stack</span>{' '}
              <span className="text-slate-400 font-normal text-base">/ Admin</span>
            </h1>
          </div>
          <button
            onClick={() => { setShowAddForm(true); setEditingId(null); }}
            className="flex items-center gap-2 px-4 py-2 bg-violet-600 text-white rounded-full text-sm font-medium hover:bg-violet-700 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            Add resource
          </button>
        </div>
      </header>

      {/* Main */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8">

        {/* Add form */}
        {showAddForm && (
          <div className="bg-white rounded-2xl border border-violet-200 shadow-sm p-6 mb-6">
            <h2 className="font-semibold text-slate-900 mb-4">New resource</h2>
            <ResourceForm
              adminPassword={adminPassword}
              existingTags={allTags}
              onSuccess={handleAddSuccess}
              onCancel={() => setShowAddForm(false)}
            />
          </div>
        )}

        {/* Resource list */}
        {loading ? (
          /* Skeleton */
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 flex items-start gap-4 animate-pulse">
                <div className="w-20 h-14 rounded-lg bg-slate-100 flex-shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-slate-100 rounded w-1/3" />
                  <div className="h-3 bg-slate-100 rounded w-2/3" />
                  <div className="h-3 bg-slate-100 rounded w-1/4" />
                </div>
              </div>
            ))}
          </div>
        ) : total === 0 ? (
          <div className="text-center py-20 text-slate-400">
            No resources yet. Add one above!
          </div>
        ) : (
          <div className="space-y-3">

            {/* Count + page info */}
            <p className="text-sm text-slate-500 mb-4">
              {total} resource{total !== 1 ? 's' : ''}
              {totalPages > 1 && (
                <span className="text-slate-400 ml-1">
                  · page {currentPage} of {totalPages}
                </span>
              )}
            </p>

            {/* Resource rows */}
            {resources.map((resource) => (
              <div key={resource.id}>
                {editingId === resource.id ? (
                  <div className="bg-white rounded-2xl border border-violet-200 shadow-sm p-6">
                    <h2 className="font-semibold text-slate-900 mb-4">
                      Edit: {resource.name}
                    </h2>
                    <ResourceForm
                      adminPassword={adminPassword}
                      initialData={resource}
                      existingTags={allTags}
                      onSuccess={handleEditSuccess}
                      onCancel={() => setEditingId(null)}
                    />
                  </div>
                ) : (
                  <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 flex items-start gap-4">
                    {/* Thumbnail */}
                    {resource.preview_image_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={resource.preview_image_url}
                        alt={resource.name}
                        className="w-20 h-14 object-cover rounded-lg flex-shrink-0 bg-slate-100"
                        onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                      />
                    ) : (
                      <div className="w-20 h-14 rounded-lg bg-slate-100 flex-shrink-0 flex items-center justify-center text-2xl">
                        🔗
                      </div>
                    )}

                    {/* Meta */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span
                          className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                            typeColors[resource.type] || 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          {resource.type}
                        </span>
                        <h3 className="font-semibold text-slate-900 text-sm truncate">
                          {resource.name}
                        </h3>
                      </div>
                      <p className="text-xs text-slate-500 line-clamp-1 mb-1">
                        {resource.description}
                      </p>
                      <p className="text-xs text-slate-400">{resource.domain}</p>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <button
                        onClick={() => handleRescrape(resource)}
                        disabled={rescrapingId === resource.id}
                        title="Re-fetch OG image from URL"
                        className="px-3 py-1.5 text-xs border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
                      >
                        {rescrapingId === resource.id ? (
                          <>
                            <svg className="w-3 h-3 animate-spin" viewBox="0 0 24 24" fill="none">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                            </svg>
                            Fetching…
                          </>
                        ) : (
                          <>
                            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                            </svg>
                            Re-scrape
                          </>
                        )}
                      </button>
                      <button
                        onClick={() => setEditingId(resource.id)}
                        className="px-3 py-1.5 text-xs border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 transition-colors"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(resource.id)}
                        disabled={deletingId === resource.id}
                        className="px-3 py-1.5 text-xs border border-red-200 rounded-lg text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50"
                      >
                        {deletingId === resource.id ? '...' : 'Delete'}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}

            {/* Pagination controls */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between pt-6">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage <= 1}
                  className="flex items-center gap-1.5 px-4 py-2 text-sm border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  ← Previous
                </button>

                {/* Page number pills */}
                <div className="flex items-center gap-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                    <button
                      key={p}
                      onClick={() => setCurrentPage(p)}
                      className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors ${
                        p === currentPage
                          ? 'bg-violet-600 text-white'
                          : 'text-slate-500 hover:bg-slate-100'
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>

                <button
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage >= totalPages}
                  className="flex items-center gap-1.5 px-4 py-2 text-sm border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  Next →
                </button>
              </div>
            )}

          </div>
        )}
      </main>
    </div>
  );
}
