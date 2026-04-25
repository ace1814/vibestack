'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ArrowRight,
  CheckCircle,
  XCircle,
  ChatTeardrop,
  Robot,
  Rocket,
  Brain,
  Wrench,
  SquaresFour,
  Database,
  Globe,
} from '@phosphor-icons/react';

type Status = 'idle' | 'loading' | 'success' | 'error';

type ModuleEntry = {
  n: number;
  Icon: React.ElementType;
  title: string;
  desc: string;
};

const LANDING_MODULES: ModuleEntry[] = [
  { n: 1, Icon: Brain,       title: 'What Is Vibe Coding?',    desc: 'Understand AI, the internet, and how this all works' },
  { n: 2, Icon: Wrench,      title: 'Set Up Your Tools',        desc: 'Get Cursor, GitHub, Supabase, and Vercel ready — with video walkthroughs' },
  { n: 3, Icon: ChatTeardrop,title: 'How to Talk to AI',        desc: 'The exact prompts that work, plus tool options for every preference' },
  { n: 4, Icon: SquaresFour, title: 'Build Your Kanban Board',  desc: 'Go from blank screen to a working board in your browser' },
  { n: 5, Icon: Database,    title: 'Save Tasks to Supabase',   desc: 'Give your app a real database (explained in plain English)' },
  { n: 6, Icon: Globe,       title: 'Go Live with Vercel',      desc: 'Put your app on the internet at its own URL' },
];

export default function CourseLanding() {
  const [email, setEmail] = useState('');
  const [alsoSubscribe, setAlsoSubscribe] = useState(true);
  const [status, setStatus] = useState<Status>('idle');
  const [error, setError] = useState('');
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (status === 'loading') return;
    setStatus('loading');
    setError('');

    const form = e.currentTarget;
    const honeypot = (form.elements.namedItem('website') as HTMLInputElement)?.value ?? '';

    try {
      const res = await fetch('/api/course-signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, also_subscribe: alsoSubscribe, website: honeypot }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Something went wrong');
      setStatus('success');
      setTimeout(() => router.push('/course/content'), 800);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
      setStatus('error');
    }
  }

  return (
    <div className="min-h-screen bg-white dark:bg-zinc-950 text-black dark:text-white">
      {/* Header */}
      <header className="border-b border-black/8 dark:border-white/8 px-6 py-4">
        <Link
          href="/"
          className="text-sm font-semibold tracking-tight text-black dark:text-white hover:opacity-70 transition-opacity"
        >
          vibestack
        </Link>
      </header>

      {/* ── Section 1: Hero ───────────────────────────────────────────────── */}
      <section className="bg-stone-50 dark:bg-zinc-900 px-6 py-24 text-center">
        <p className="text-xs font-semibold uppercase tracking-widest text-black/40 dark:text-white/40 mb-6">
          Free course · No coding experience needed
        </p>
        <h1 className="text-4xl sm:text-5xl lg:text-[3.5rem] font-serif font-normal leading-[1.1] mb-6 max-w-3xl mx-auto">
          Build and launch<br />
          your first real app,<br />
          <span className="text-black/45 dark:text-white/45">even if you&apos;ve never coded.</span>
        </h1>
        <p className="text-lg text-black/60 dark:text-white/60 max-w-xl mx-auto mb-8 leading-relaxed">
          A step-by-step course in plain English. No jargon. No CS degree. Just you, AI, and your
          first live Kanban board app.
        </p>
        <a
          href="#signup"
          className="inline-flex items-center gap-2 bg-black dark:bg-white text-white dark:text-black font-semibold px-7 py-3.5 rounded-full text-sm hover:opacity-80 transition-opacity"
        >
          Start for free
          <ArrowRight size={15} weight="bold" />
        </a>
        <p className="mt-3 text-xs text-black/35 dark:text-white/35">
          Free forever. Takes 20 seconds to sign up.
        </p>
      </section>

      {/* ── Section 2: Pain ───────────────────────────────────────────────── */}
      <section className="bg-white dark:bg-zinc-950 px-6 py-20">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-3xl font-serif font-normal mb-8 leading-snug">
            You have an idea. It&apos;s been sitting there for months.
          </h2>
          <div className="space-y-5 text-lg text-black/65 dark:text-white/65 leading-relaxed">
            <p>
              You&apos;ve tried learning to code. You watched tutorials. You opened a code editor once,
              felt completely lost, and closed it.
            </p>
            <p>
              You&apos;ve looked at tools like Webflow or Bubble, but they&apos;re either{' '}
              <strong className="text-black dark:text-white">too expensive</strong>,{' '}
              <strong className="text-black dark:text-white">too limited</strong>, or you still end up
              stuck.
            </p>
            <p>
              Meanwhile, other people —{' '}
              <strong className="text-black dark:text-white">
                designers, marketers, PMs with zero coding background
              </strong>{' '}
              — are shipping real apps. Not because they&apos;re smarter. Because they found a
              different way.
            </p>
          </div>
        </div>
      </section>

      {/* ── Section 3: Solution ───────────────────────────────────────────── */}
      <section className="bg-stone-50 dark:bg-zinc-900 px-6 py-20">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-3xl font-serif font-normal mb-5 leading-snug">
            That different way is called vibe coding.
          </h2>
          <p className="text-lg text-black/65 dark:text-white/65 leading-relaxed mb-10">
            You describe what you want in plain English. AI builds it. You review it, make changes by
            describing them, and ship. That&apos;s the whole thing.
          </p>
          <div className="space-y-3">
            {([
              { Icon: ChatTeardrop, label: 'You describe your idea in plain English' },
              { Icon: Robot,        label: 'AI writes the code' },
              { Icon: Rocket,       label: 'You review, tweak, and publish' },
            ] as { Icon: React.ElementType; label: string }[]).map(({ Icon, label }) => (
              <div
                key={label}
                className="flex items-center gap-4 p-4 bg-white dark:bg-zinc-950 rounded-xl border border-black/6 dark:border-white/6"
              >
                <div className="w-10 h-10 rounded-xl bg-black/6 dark:bg-white/8 flex items-center justify-center shrink-0 text-black/60 dark:text-white/60">
                  <Icon size={20} weight="duotone" />
                </div>
                <span className="font-medium text-base">{label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Section 4: What You'll Build ──────────────────────────────────── */}
      <section className="bg-white dark:bg-zinc-950 px-6 py-20">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-3xl font-serif font-normal mb-8 leading-snug">
            By the end of this course, you&apos;ll have built a Kanban board app:
          </h2>
          <ul className="space-y-3 mb-8">
            {[
              'A real Kanban board — To Do / In Progress / Done columns',
              'Cards you can add, move between columns, and delete',
              'A database that saves your tasks automatically',
              'Your app live on the internet at its own URL',
              'The confidence to build your next idea faster',
            ].map((item) => (
              <li key={item} className="flex items-start gap-3 text-lg">
                <CheckCircle
                  size={22}
                  weight="fill"
                  className="text-emerald-500 dark:text-emerald-400 shrink-0 mt-0.5"
                />
                <span>{item}</span>
              </li>
            ))}
          </ul>
          <p className="text-sm text-black/45 dark:text-white/45 border-t border-black/8 dark:border-white/8 pt-5 mt-5">
            Built with <strong className="text-black dark:text-white">Cursor</strong>,{' '}
            <strong className="text-black dark:text-white">Supabase</strong>, and{' '}
            <strong className="text-black dark:text-white">Vercel</strong> — the same stack used by
            real startups.
          </p>
        </div>
      </section>

      {/* ── Section 5: What's Inside ──────────────────────────────────────── */}
      <section className="bg-stone-50 dark:bg-zinc-900 px-6 py-20">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-3xl font-serif font-normal mb-3">
            6 modules. Plain English. No prior experience needed.
          </h2>
          <p className="text-black/50 dark:text-white/50 mb-10">
            Each module opens with a quick summary — skip ahead if you already know the topic.
          </p>
          <div className="space-y-3">
            {LANDING_MODULES.map((m) => (
              <div
                key={m.n}
                className="flex items-start gap-4 p-4 bg-white dark:bg-zinc-950 rounded-xl border border-black/6 dark:border-white/6"
              >
                <div className="w-9 h-9 rounded-xl bg-black/6 dark:bg-white/8 flex items-center justify-center shrink-0 text-black/60 dark:text-white/60">
                  <m.Icon size={18} weight="duotone" />
                </div>
                <div>
                  <p className="text-xs font-medium text-black/35 dark:text-white/35 mb-0.5">
                    Module {m.n}
                  </p>
                  <p className="font-semibold">{m.title}</p>
                  <p className="text-sm text-black/50 dark:text-white/50 mt-0.5">{m.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Section 6: Who It's For ────────────────────────────────────────── */}
      <section className="bg-white dark:bg-zinc-950 px-6 py-20">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-3xl font-serif font-normal mb-10">Is this for you?</h2>
          <div className="grid sm:grid-cols-2 gap-8">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-black/40 dark:text-white/40 mb-4">
                This is for you if…
              </p>
              <ul className="space-y-3">
                {[
                  "You've never written a line of code",
                  "You have an app idea and don't know where to start",
                  "You've tried tutorials and found them too technical",
                  'You want to build something real, not just follow along',
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2.5 text-sm leading-snug">
                    <CheckCircle
                      size={17}
                      weight="fill"
                      className="text-emerald-500 dark:text-emerald-400 shrink-0 mt-0.5"
                    />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-black/40 dark:text-white/40 mb-4">
                This is NOT for you if…
              </p>
              <ul className="space-y-3">
                {[
                  "You're already a developer (this will be too slow for you)",
                  'You want to learn "real" programming syntax',
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2.5 text-sm leading-snug">
                    <XCircle
                      size={17}
                      weight="fill"
                      className="text-red-400 dark:text-red-400 shrink-0 mt-0.5"
                    />
                    <span className="text-black/55 dark:text-white/55">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ── Section 7: Signup ─────────────────────────────────────────────── */}
      <section id="signup" className="bg-zinc-950 dark:bg-black px-6 py-24">
        <div className="max-w-md mx-auto text-center">
          <p className="text-xs font-semibold uppercase tracking-widest text-white/40 mb-4">
            Free · Start immediately
          </p>
          <h2 className="text-3xl font-serif font-normal text-white mb-3">Ready to build your first app?</h2>
          <p className="text-white/55 mb-8">Sign up and get instant access to all 6 modules.</p>

          {status === 'success' ? (
            <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-2xl p-10">
              <p className="text-2xl font-bold text-emerald-300 mb-1">You&apos;re in! 🎉</p>
              <p className="text-sm text-emerald-300/70">Taking you to the course…</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4 text-left">
              {/* Honeypot — invisible to humans */}
              <input
                type="text"
                name="website"
                tabIndex={-1}
                aria-hidden="true"
                className="sr-only"
                autoComplete="off"
              />

              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="your@email.com"
                className="w-full px-4 py-3.5 rounded-xl bg-white/8 border border-white/12 text-white placeholder:text-white/30 focus:outline-none focus:border-white/35 text-sm transition-colors"
              />

              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={alsoSubscribe}
                  onChange={(e) => setAlsoSubscribe(e.target.checked)}
                  className="mt-0.5 accent-white"
                />
                <span className="text-sm text-white/55 leading-snug">
                  Also keep me updated with new tools and resources from VibeStack
                </span>
              </label>

              {status === 'error' && error && (
                <p className="text-sm text-red-400 bg-red-400/10 border border-red-400/20 rounded-lg px-4 py-2">
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={status === 'loading'}
                className="w-full flex items-center justify-center gap-2 bg-white text-black font-semibold py-3.5 rounded-xl text-sm hover:opacity-90 transition-opacity disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
              >
                {status === 'loading' ? 'Signing you up…' : (
                  <>Get instant access <ArrowRight size={15} weight="bold" /></>
                )}
              </button>

              <p className="text-center text-xs text-white/30">
                Free forever. No credit card. No spam.
              </p>
            </form>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-black/8 dark:border-white/8 px-6 py-6 text-center text-sm text-black/40 dark:text-white/40 bg-white dark:bg-zinc-950">
        <Link href="/" className="hover:text-black dark:hover:text-white transition-colors">
          ← Back to VibeStack — curated tools for non-coder builders
        </Link>
      </footer>
    </div>
  );
}
