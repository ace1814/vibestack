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
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
    };

    try {
      const url = isEdit
        ? `/api/admin/resources/${initialData!.id}`
        : '/api/admin/resources';
      const method = isEdit ? 'PATCH' : 'POST';

      const res = await fetch(url, {
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
          onChange={(e) =>
            setForm((f) => ({ ...f, description: e.target.value }))
          }
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
        <p className="text-xs text-slate-400 mt-1">
          Preview image will be fetched automatically from this URL.
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
            ? isEdit
              ? 'Saving...'
              : 'Adding...'
            : isEdit
            ? 'Save changes'
            : 'Add resource'}
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
