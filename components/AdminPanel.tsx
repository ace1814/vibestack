'use client';

import { useState, useEffect } from 'react';
import ResourceForm from './ResourceForm';
import { Resource } from '@/lib/types';

interface AdminPanelProps {
  adminPassword: string;
}

export default function AdminPanel({ adminPassword }: AdminPanelProps) {
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchResources = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/resources');
      const data = await res.json();
      setResources(data.items || []);
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResources();
  }, []);

  const handleAddSuccess = (resource: Resource) => {
    setResources((prev) => [resource, ...prev]);
    setShowAddForm(false);
  };

  const handleEditSuccess = (updated: Resource) => {
    setResources((prev) =>
      prev.map((r) => (r.id === updated.id ? updated : r))
    );
    setEditingId(null);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this resource? This cannot be undone.')) return;
    setDeletingId(id);
    try {
      await fetch(`/api/admin/resources/${id}`, {
        method: 'DELETE',
        headers: { 'x-admin-password': adminPassword },
      });
      setResources((prev) => prev.filter((r) => r.id !== id));
    } catch {
      alert('Failed to delete. Try again.');
    } finally {
      setDeletingId(null);
    }
  };

  const typeColors: Record<string, string> = {
    tool: 'bg-violet-100 text-violet-700',
    learning: 'bg-emerald-100 text-emerald-700',
    project: 'bg-amber-100 text-amber-700',
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-100 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-slate-900">
              Vibe<span className="text-violet-600">Stack</span>{' '}
              <span className="text-slate-400 font-normal text-base">/ Admin</span>
            </h1>
          </div>
          <button
            onClick={() => {
              setShowAddForm(true);
              setEditingId(null);
            }}
            className="flex items-center gap-2 px-4 py-2 bg-violet-600 text-white rounded-full text-sm font-medium hover:bg-violet-700 transition-colors"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 4v16m8-8H4"
              />
            </svg>
            Add resource
          </button>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        {/* Add form */}
        {showAddForm && (
          <div className="bg-white rounded-2xl border border-violet-200 shadow-sm p-6 mb-6">
            <h2 className="font-semibold text-slate-900 mb-4">New resource</h2>
            <ResourceForm
              adminPassword={adminPassword}
              onSuccess={handleAddSuccess}
              onCancel={() => setShowAddForm(false)}
            />
          </div>
        )}

        {/* Resources list */}
        {loading ? (
          <div className="text-center py-20 text-slate-400">Loading…</div>
        ) : resources.length === 0 ? (
          <div className="text-center py-20 text-slate-400">
            No resources yet. Add one above!
          </div>
        ) : (
          <div className="space-y-3">
            <p className="text-sm text-slate-500 mb-4">
              {resources.length} resource{resources.length !== 1 ? 's' : ''}
            </p>
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
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none';
                        }}
                      />
                    ) : (
                      <div className="w-20 h-14 rounded-lg bg-slate-100 flex-shrink-0 flex items-center justify-center text-2xl">
                        🔗
                      </div>
                    )}

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span
                          className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                            typeColors[resource.type] ||
                            'bg-slate-100 text-slate-600'
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

                    <div className="flex items-center gap-2 flex-shrink-0">
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
          </div>
        )}
      </main>
    </div>
  );
}
