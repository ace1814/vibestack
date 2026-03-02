'use client';

import { useState } from 'react';
import { Resource, ResourceType } from '@/lib/types';

interface ResourceFormProps {
  adminPassword: string;
  initialData?: Resource;
  onSuccess: (resource: Resource) => void;
  onCancel?: () => void;
}

const TYPES: ResourceType[] = ['tool', 'learning', 'project'];

export default function ResourceForm({
  adminPassword,
  initialData,
  onSuccess,
  onCancel,
}: ResourceFormProps) {
  const isEdit = !!initialData;

  const [form, setForm] = useState({
    type: initialData?.type || ('tool' as ResourceType),
    name: initialData?.name || '',
    description: initialData?.description || '',
    url: initialData?.url || '',
    tags: initialData?.tags?.join(', ') || '',
    preview_image_url: initialData?.preview_image_url || '',
  });
  const [loading, setLoading] = useState(false);
  const [scraping, setScraping] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Manually trigger OG scrape and populate image field
  const handleScrapeImage = async () => {
    if (!form.url) return;
    setScraping(true);
    try {
      const res = await fetch('/api/admin/scrape-og', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-password': adminPassword,
        },
        body: JSON.stringify({ url: form.url }),
      });
      const data = await res.json();
      if (data.previewImageUrl) {
        setForm((f) => ({ ...f, preview_image_url: data.previewImageUrl }));
      } else {
        setError('Could not fetch image from that URL. Paste one manually below.');
      }
    } catch {
      setError('Scrape failed. Try pasting the image URL manually.');
    } finally {
      setScraping(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const tagsArray = form.tags
      .split(',')
      .map((t) => t.trim().toLowerCase())
      .filter(Boolean);

    const body = {
      type: form.type,
      name: form.name,
      description: form.description,
      url: form.url,
      tags: tagsArray,
      // Only send if manually set
      ...(form.preview_image_url ? { preview_image_url: form.preview_image_url } : {}),
    };

    try {
      const endpoint = isEdit
        ? `/api/admin/resources/${initialData!.id}`
        : '/api/admin/resources';
      const method = isEdit ? 'PATCH' : 'POST';

      const res = await fetch(endpoint, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'x-admin-password': adminPassword,
        },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Something went wrong');
        return;
      }

      onSuccess(data);
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Type */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">
          Type <span className="text-red-500">*</span>
        </label>
        <div className="flex gap-2">
          {TYPES.map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setForm((f) => ({ ...f, type: t }))}
              className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-colors ${
                form.type === t
                  ? 'bg-slate-900 text-white border-slate-900'
                  : 'bg-white text-slate-600 border-slate-200 hover:border-slate-400'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Name */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">
          Name <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          required
          value={form.name}
          onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
          placeholder="e.g. Cursor IDE"
          className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
        />
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">
          Description
        </label>
        <textarea
          value={form.description}
          onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
          placeholder="What does it do? Keep it brief."
          rows={3}
          className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent resize-none"
        />
      </div>

      {/* URL */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">
          URL <span className="text-red-500">*</span>
        </label>
        <input
          type="url"
          required
          value={form.url}
          onChange={(e) => setForm((f) => ({ ...f, url: e.target.value }))}
          placeholder="https://example.com"
          className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
        />
      </div>

      {/* Preview Image */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">
          Preview Image
        </label>

        {/* Image preview + scrape row */}
        <div className="flex gap-2 mb-2">
          {form.preview_image_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={form.preview_image_url}
              alt="Preview"
              className="w-24 h-16 object-cover rounded-lg border border-slate-200 flex-shrink-0 bg-slate-50"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none';
              }}
            />
          ) : (
            <div className="w-24 h-16 rounded-lg border border-dashed border-slate-200 flex items-center justify-center text-slate-300 flex-shrink-0 text-xl">
              🖼
            </div>
          )}

          <div className="flex-1 flex flex-col gap-1.5">
            <input
              type="url"
              value={form.preview_image_url}
              onChange={(e) =>
                setForm((f) => ({ ...f, preview_image_url: e.target.value }))
              }
              placeholder="https://example.com/og-image.png (optional)"
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
            />
            <button
              type="button"
              onClick={handleScrapeImage}
              disabled={scraping || !form.url}
              className="self-start flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              {scraping ? (
                <>
                  <svg className="w-3 h-3 animate-spin" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
                  </svg>
                  Fetching…
                </>
              ) : (
                <>
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Auto-fetch from URL
                </>
              )}
            </button>
          </div>
        </div>
        <p className="text-xs text-slate-400">
          Leave blank to auto-fetch on save. Paste a direct image URL to override.
        </p>
      </div>

      {/* Tags */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">
          Tags
        </label>
        <input
          type="text"
          value={form.tags}
          onChange={(e) => setForm((f) => ({ ...f, tags: e.target.value }))}
          placeholder="ai, automation, design (comma-separated)"
          className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
        />
        <p className="text-xs text-slate-400 mt-1">
          Tags are used for filtering. New tags are created automatically.
        </p>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-3 py-2 rounded-lg">
          {error}
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-3 pt-2">
        <button
          type="submit"
          disabled={loading}
          className="flex-1 py-2 bg-violet-600 text-white rounded-lg font-medium text-sm hover:bg-violet-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {loading
            ? isEdit ? 'Saving...' : 'Adding...'
            : isEdit ? 'Save changes' : 'Add resource'}
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 border border-slate-200 text-slate-600 rounded-lg text-sm hover:bg-slate-50 transition-colors"
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}
