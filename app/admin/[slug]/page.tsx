'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import AdminPanel from '@/components/AdminPanel';

const ADMIN_SLUG = process.env.NEXT_PUBLIC_ADMIN_SLUG || 'admin-secret';

export default function AdminPage() {
  const params = useParams();
  const slug = params.slug as string;

  const [password, setPassword] = useState('');
  const [inputPassword, setInputPassword] = useState('');
  const [error, setError] = useState('');
  const [checking, setChecking] = useState(false);

  // Check if slug matches
  const slugValid = slug === ADMIN_SLUG;

  // Persist auth in sessionStorage
  useEffect(() => {
    const stored = sessionStorage.getItem('vs_admin_pass');
    if (stored) setPassword(stored);
  }, []);

  if (!slugValid) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center text-slate-400">
          <p className="text-6xl mb-4">404</p>
          <p>Page not found.</p>
        </div>
      </div>
    );
  }

  if (password) {
    return <AdminPanel adminPassword={password} />;
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setChecking(true);
    setError('');

    // Verify password by calling the admin API with a harmless request
    try {
      const res = await fetch('/api/admin/resources', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-password': inputPassword,
        },
        body: JSON.stringify({ type: 'tool', name: '', url: '' }),
      });

      // 401 = wrong password, anything else = correct password (even 400 = missing fields)
      if (res.status === 401) {
        setError('Incorrect password.');
      } else {
        sessionStorage.setItem('vs_admin_pass', inputPassword);
        setPassword(inputPassword);
      }
    } catch {
      setError('Could not connect. Try again.');
    } finally {
      setChecking(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
      <div className="w-full max-w-sm bg-white rounded-2xl border border-slate-100 shadow-sm p-8">
        <h1 className="text-xl font-bold text-slate-900 mb-1">
          Vibe<span className="text-violet-600">Stack</span>
        </h1>
        <p className="text-sm text-slate-500 mb-6">Enter admin password to continue.</p>

        <form onSubmit={handleLogin} className="space-y-4">
          <input
            type="password"
            value={inputPassword}
            onChange={(e) => setInputPassword(e.target.value)}
            placeholder="Password"
            autoFocus
            className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
          />

          {error && (
            <p className="text-red-600 text-sm">{error}</p>
          )}

          <button
            type="submit"
            disabled={checking || !inputPassword}
            className="w-full py-2 bg-violet-600 text-white rounded-lg font-medium text-sm hover:bg-violet-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {checking ? 'Checking…' : 'Enter'}
          </button>
        </form>
      </div>
    </div>
  );
}
