'use client';

import { useState } from 'react';
import Link from 'next/link';
import SubscribeModal from '@/components/SubscribeModal';

export default function DesignersLanding() {
  const [isSubscribeOpen, setIsSubscribeOpen] = useState(false);
  const [subEmail, setSubEmail] = useState('');
  const [subStatus, setSubStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [subError, setSubError] = useState('');

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (subStatus === 'loading' || subStatus === 'success') return;
    setSubStatus('loading');
    setSubError('');
    try {
      const res = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: subEmail }),
      });
      const data = await res.json();
      if (data.ok) {
        setSubStatus('success');
      } else {
        setSubError(data.error || 'Something went wrong.');
        setSubStatus('error');
      }
    } catch {
      setSubError('Network error — please try again.');
      setSubStatus('error');
    }
  };

  const handleSubscribeClose = () => {
    setIsSubscribeOpen(false);
    if (subStatus === 'error') {
      setSubStatus('idle');
      setSubError('');
    }
  };

  const openModal = () => setIsSubscribeOpen(true);

  return (
    <div className="min-h-screen bg-white dark:bg-zinc-950">
      <SubscribeModal
        isOpen={isSubscribeOpen}
        subEmail={subEmail}
        subStatus={subStatus}
        subError={subError}
        onEmailChange={(v) => {
          setSubEmail(v);
          if (subStatus === 'error') setSubStatus('idle');
        }}
        onSubmit={handleSubscribe}
        onClose={handleSubscribeClose}
      />

      {/* ── Minimal fixed header ── */}
      <header className="fixed top-0 left-0 right-0 z-40 px-6 py-4 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-sm border-b border-black/6 dark:border-white/6">
        <Link
          href="/"
          className="font-sans font-light text-base tracking-[-0.04em] text-black dark:text-white hover:opacity-70 transition-opacity"
        >
          vibestack
        </Link>
      </header>

      {/* ── Section 1: Hero (always dark) ── */}
      <section className="bg-zinc-950 pt-32 pb-24 sm:pt-40 sm:pb-32 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <span className="inline-block px-3 py-1 rounded-full bg-white/10 text-white/55 text-xs font-sans tracking-wide uppercase mb-8">
            Free resource for designers
          </span>

          <h1 className="font-serif font-normal text-[clamp(32px,5.5vw,72px)] leading-[1.08] tracking-[-0.03em] text-white mb-6">
            How Designers Are Shipping
            <br />
            <em>Real Products in 48 Hours</em>
            <br className="hidden sm:block" />
            {' '}— Without Writing a Single
            <br className="hidden sm:block" />
            {' '}Line of Code
          </h1>

          <p className="font-sans text-[clamp(15px,1.4vw,20px)] leading-[1.6] text-white/50 max-w-xl mx-auto mb-10">
            The tools, workflows, and mindset shift that let designers finally build — without waiting on a dev team.
          </p>

          <button
            onClick={openModal}
            className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full bg-white text-black font-sans font-semibold text-base hover:bg-neutral-100 active:scale-[0.98] transition-all"
          >
            Get the free kit →
          </button>

          <p className="mt-5 text-xs text-white/30 font-sans">
            Free. Instant. No credit card. Joined by 300+ designers.
          </p>
        </div>
      </section>

      {/* ── Section 2: Pain Agitation (light) ── */}
      <section className="bg-white dark:bg-zinc-950 py-20 sm:py-28 px-6 border-b border-black/6 dark:border-white/6">
        <div className="max-w-3xl mx-auto">
          <h2 className="font-serif font-normal text-[clamp(28px,3.8vw,52px)] leading-[1.12] tracking-[-0.03em] text-black dark:text-white mb-10">
            You have ideas.
            <br />
            You can&apos;t build them.
            <br />
            <em>Here&apos;s why that&apos;s changing.</em>
          </h2>

          <div className="space-y-6 font-sans text-[clamp(15px,1.2vw,18px)] leading-[1.75] text-black/60 dark:text-white/55 max-w-2xl">
            <p>
              You know exactly what the product should feel like. You&apos;ve sketched it in Figma, written the copy, mapped the flows. But every time you try to move it forward, you hit the same wall: someone else has to write the code.
            </p>
            <p>
              So you wait. For a dev friend with spare time. For a freelancer who ghosts you. For funding you don&apos;t have yet. Meanwhile, your idea sits in a folder, getting stale.
            </p>
            <p>
              That bottleneck just disappeared. Not theoretically —{' '}
              <strong className="text-black dark:text-white font-semibold">
                practically, this weekend
              </strong>
              . A new class of AI tools has collapsed the gap between design and shipping. And designers who figure this out first are moving at a speed that was impossible 12 months ago.
            </p>
          </div>
        </div>
      </section>

      {/* ── Section 3: Dream Outcome (always dark) ── */}
      <section className="bg-zinc-950 py-20 sm:py-28 px-6">
        <div className="max-w-3xl mx-auto">
          <h2 className="font-serif font-normal text-[clamp(24px,3.5vw,48px)] leading-[1.15] tracking-[-0.03em] text-white mb-12">
            What happens after this weekend:
          </h2>

          <div className="space-y-0 divide-y divide-white/8">
            {[
              {
                number: '01',
                headline: 'You deploy something real.',
                body: 'Not a prototype. Not a mockup. A live URL you can share, that people can actually use — built by you, in 48 hours.',
              },
              {
                number: '02',
                headline: 'You stop waiting for permission.',
                body: 'No dev handoff. No scope doc. No standups. You move from idea to shipped product in the time you would spend writing a brief.',
              },
              {
                number: '03',
                headline: 'Your design instincts become your superpower.',
                body: 'Years of taste and UX thinking make you a better builder than most engineers. You just needed the right tools to unlock it.',
              },
            ].map(({ number, headline, body }) => (
              <div key={number} className="flex gap-6 sm:gap-10 items-start py-8 first:pt-0 last:pb-0">
                <span className="font-serif text-[clamp(28px,3vw,42px)] text-white/20 leading-none flex-shrink-0 w-10 sm:w-14 pt-1">
                  {number}
                </span>
                <div>
                  <h3 className="font-serif font-normal text-xl sm:text-2xl text-white leading-snug mb-2">
                    {headline}
                  </h3>
                  <p className="font-sans text-base leading-relaxed text-white/50">
                    {body}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Section 4: Proof (tinted) ── */}
      <section className="bg-zinc-100 dark:bg-zinc-900 py-20 sm:py-28 px-6">
        <div className="max-w-3xl mx-auto">
          <span className="inline-block px-3 py-1 rounded-full bg-black/8 dark:bg-white/10 text-black/50 dark:text-white/50 text-xs font-sans uppercase tracking-wide mb-8">
            The origin story
          </span>

          <h2 className="font-serif font-normal text-[clamp(24px,3.5vw,48px)] leading-[1.15] tracking-[-0.03em] text-black dark:text-white mb-8">
            Designer. Zero code.
            <br />
            <em>Built VibeStack in 2 nights.</em>
          </h2>

          {/* Screenshot */}
          <div className="rounded-2xl overflow-hidden border border-black/8 dark:border-white/8 shadow-xl mb-10 bg-zinc-200 dark:bg-zinc-800 aspect-[16/9] relative">
            <img
              src="https://www.vibestack.in/og-image.png"
              alt="Screenshot of vibestack.in — a curated AI tools directory built by a designer in 2 nights"
              className="w-full h-full object-cover object-top"
              loading="lazy"
            />
          </div>

          <div className="max-w-2xl space-y-4 font-sans text-[clamp(15px,1.2vw,18px)] leading-[1.75] text-black/60 dark:text-white/55">
            <p>
              I&apos;m a designer. I&apos;ve never written a line of production code in my life. Two nights after discovering the right stack of AI tools, I shipped VibeStack — a live, working product with a real database, search, and a subscribe flow.
            </p>
            <p>
              I didn&apos;t get lucky. I used a specific set of tools in a specific order, with a workflow that&apos;s repeatable. This kit is that workflow, documented.
            </p>
          </div>
        </div>
      </section>

      {/* ── Section 5: What's Inside (light) ── */}
      <section className="bg-white dark:bg-zinc-950 py-20 sm:py-28 px-6">
        <div className="max-w-3xl mx-auto">
          <h2 className="font-serif font-normal text-[clamp(24px,3.5vw,48px)] leading-[1.15] tracking-[-0.03em] text-black dark:text-white mb-3">
            Here&apos;s exactly what you get:
          </h2>
          <p className="font-sans text-base text-black/40 dark:text-white/35 mb-12">
            Not vague tips. Actual deliverables you use the same weekend.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              {
                tag: 'Tool Stack',
                headline: 'The curated 6-tool AI stack',
                body: 'The exact setup used to build VibeStack — with notes on what each tool does and why it belongs in the stack.',
              },
              {
                tag: 'Workflow',
                headline: 'The 48-hour workflow breakdown',
                body: 'A step-by-step sequence: from blank canvas to deployed URL. No ambiguity, no skipped steps.',
              },
              {
                tag: 'Prompts',
                headline: 'Prompt patterns that actually work',
                body: 'The specific prompt structures that get AI to write production-quality code from a designer\'s descriptions.',
              },
              {
                tag: 'MCP Servers',
                headline: 'The MCP server shortlist',
                body: 'The 5 Model Context Protocol servers that let AI read your files, run commands, and iterate at speed.',
              },
              {
                tag: 'Mental Model',
                headline: 'The designer\'s mental model for building',
                body: 'How to think about components, data, and state — without needing to understand any of the code underneath.',
              },
              {
                tag: 'Quick Wins',
                headline: '3 weekend project ideas to start with',
                body: 'Scoped projects sized for a first build — chosen because they showcase design skills and ship in under 2 days.',
              },
            ].map(({ tag, headline, body }) => (
              <div
                key={tag}
                className="p-6 rounded-2xl border border-black/8 dark:border-white/8 bg-white dark:bg-zinc-900 hover:border-black/15 dark:hover:border-white/15 transition-colors"
              >
                <span className="inline-block px-2.5 py-0.5 rounded-full bg-black/5 dark:bg-white/8 text-xs font-sans text-black/45 dark:text-white/40 mb-3">
                  {tag}
                </span>
                <h3 className="font-serif font-normal text-lg text-black dark:text-white mb-2 leading-snug">
                  {headline}
                </h3>
                <p className="font-sans text-sm leading-relaxed text-black/50 dark:text-white/45">
                  {body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Section 6: Objection Crush (tinted) ── */}
      <section className="bg-zinc-50 dark:bg-zinc-900 py-20 sm:py-28 px-6">
        <div className="max-w-3xl mx-auto">
          <h2 className="font-serif font-normal text-[clamp(24px,3.5vw,48px)] leading-[1.15] tracking-[-0.03em] text-black dark:text-white mb-12">
            &ldquo;But I&apos;m not sure this
            <br />
            <em>is for me…&rdquo;</em>
          </h2>

          <div className="divide-y divide-black/8 dark:divide-white/8">
            {[
              {
                objection: '"But I\'m not technical."',
                rebuttal:
                  "You don't need to be. You need to describe what you want clearly — which designers do better than anyone. The tools handle the rest. Technical knowledge helps zero percent with getting your first product shipped.",
              },
              {
                objection: '"I\'ve tried AI before. It didn\'t work."',
                rebuttal:
                  "That was before the right tooling existed. Six months ago, the workflow genuinely didn't work well. The combination of tools and the prompt patterns in this kit are what changed — they didn't exist in the form you need until recently.",
              },
              {
                objection: '"I don\'t have time for this."',
                rebuttal:
                  "You need one weekend. That's it. Not a course. Not months of learning. The kit is designed to get you to a shipped product in 48 focused hours. If you have a weekend, you have time.",
              },
            ].map(({ objection, rebuttal }) => (
              <div
                key={objection}
                className="py-8 grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-10 items-start"
              >
                <p className="font-serif font-normal text-lg sm:text-xl text-black dark:text-white leading-snug">
                  {objection}
                </p>
                <p className="font-sans text-base leading-relaxed text-black/55 dark:text-white/50">
                  {rebuttal}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Section 7: The Offer (always dark) ── */}
      <section className="bg-zinc-950 py-20 sm:py-28 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <span className="inline-block px-3 py-1 rounded-full bg-white/10 text-white/50 text-xs font-sans uppercase tracking-wide mb-8">
            The kit
          </span>

          <h2 className="font-serif font-normal text-[clamp(28px,4vw,56px)] leading-[1.1] tracking-[-0.03em] text-white mb-4">
            Free. Instant access.
            <br />
            <em>No credit card.</em>
          </h2>

          <p className="font-sans text-base text-white/45 mb-10 max-w-md mx-auto leading-relaxed">
            Everything you need to go from designer to builder — delivered to your inbox immediately.
          </p>

          <ul className="text-left max-w-sm mx-auto space-y-3 mb-12">
            {[
              'The curated 6-tool AI stack',
              '48-hour workflow breakdown',
              'Prompt patterns for production code',
              'MCP server shortlist',
              "Designer's mental model for building",
              '3 weekend project ideas to start now',
            ].map((item) => (
              <li key={item} className="flex items-start gap-3 font-sans text-sm text-white/65">
                <svg
                  className="w-4 h-4 mt-0.5 flex-shrink-0 text-white/35"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2.5}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                {item}
              </li>
            ))}
          </ul>

          <button
            onClick={openModal}
            className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-white text-black font-sans font-semibold text-lg hover:bg-neutral-100 active:scale-[0.98] transition-all shadow-[0_0_40px_rgba(255,255,255,0.12)]"
          >
            Get the kit — it&apos;s free
          </button>

          <p className="mt-4 text-xs text-white/25 font-sans">
            Unsubscribe anytime. No spam.
          </p>
        </div>
      </section>

      {/* ── Section 8: Final CTA (light) ── */}
      <section className="bg-white dark:bg-zinc-950 py-20 sm:py-28 px-6 border-t border-black/6 dark:border-white/6">
        <div className="max-w-3xl mx-auto text-center">
          {/* Social proof */}
          <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-black/5 dark:bg-white/8 mb-10">
            <div className="flex -space-x-1.5">
              {['bg-violet-400', 'bg-sky-400', 'bg-emerald-400'].map((c) => (
                <div
                  key={c}
                  className={`w-6 h-6 rounded-full ${c} border-2 border-white dark:border-zinc-950`}
                />
              ))}
            </div>
            <span className="font-sans text-sm text-black/60 dark:text-white/55">
              <strong className="text-black dark:text-white font-semibold">300+</strong> designers have already downloaded this
            </span>
          </div>

          <h2 className="font-serif font-normal text-[clamp(24px,3.5vw,48px)] leading-[1.15] tracking-[-0.03em] text-black dark:text-white mb-4">
            Don&apos;t wait another quarter
            <br />
            <em>for your idea to ship.</em>
          </h2>

          <p className="font-sans text-base text-black/50 dark:text-white/45 max-w-md mx-auto leading-relaxed mb-10">
            The designers shipping products right now aren&apos;t more talented than you. They just found the right tools first.
          </p>

          <button
            onClick={openModal}
            className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full bg-black dark:bg-white text-white dark:text-black font-sans font-semibold text-base hover:bg-neutral-800 dark:hover:bg-neutral-100 active:scale-[0.98] transition-all"
          >
            Get the free kit →
          </button>

          <p className="mt-5 text-xs text-black/30 dark:text-white/25 font-sans">
            Free. Instant. No credit card.
          </p>
        </div>
      </section>

      {/* ── Minimal Footer ── */}
      <footer className="border-t border-black/8 dark:border-white/8 px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-3">
        <p className="font-sans text-sm text-black/35 dark:text-white/30">
          © 2025 VibeStack
        </p>
        <Link
          href="/"
          className="font-sans text-sm text-black/50 dark:text-white/45 hover:text-black dark:hover:text-white transition-colors"
        >
          ← Browse the directory
        </Link>
      </footer>
    </div>
  );
}
