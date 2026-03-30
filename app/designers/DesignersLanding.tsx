'use client';

import { useState } from 'react';
import Link from 'next/link';

/* ─── Reusable inline email form ─────────────────────────────────────────── */
function InlineEmailForm({
  theme = 'light',
  subEmail,
  subStatus,
  subError,
  onEmailChange,
  onSubmit,
  buttonLabel = 'Get the free kit →',
}: {
  theme?: 'light' | 'dark';
  subEmail: string;
  subStatus: 'idle' | 'loading' | 'success' | 'error';
  subError: string;
  onEmailChange: (v: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  buttonLabel?: string;
}) {
  if (subStatus === 'success') {
    return (
      <div className={`flex items-center gap-2.5 text-base font-sans ${theme === 'dark' ? 'text-white/80' : 'text-neutral-600'}`}>
        <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
        You&apos;re on the list. We&apos;ll email you the moment it launches.
      </div>
    );
  }

  return (
    <div>
      <form onSubmit={onSubmit} className="flex flex-col sm:flex-row gap-3 w-full">
        <input
          type="email"
          value={subEmail}
          onChange={(e) => onEmailChange(e.target.value)}
          placeholder="your@email.com"
          required
          className={`flex-1 min-w-0 px-4 py-3 rounded-full text-base focus:outline-none transition-colors ${
            theme === 'dark'
              ? 'bg-white/10 border border-white/15 text-white placeholder:text-white/35 focus:border-white/35'
              : 'bg-white border border-neutral-200 text-black placeholder:text-neutral-400 focus:border-neutral-400'
          }`}
        />
        <button
          type="submit"
          disabled={subStatus === 'loading'}
          className={`flex-shrink-0 px-6 py-3 rounded-full font-sans font-semibold text-base active:scale-[0.98] transition-all disabled:opacity-60 whitespace-nowrap ${
            theme === 'dark'
              ? 'bg-white text-black hover:bg-neutral-100'
              : 'bg-black text-white hover:bg-neutral-800'
          }`}
        >
          {subStatus === 'loading' ? 'Sending…' : buttonLabel}
        </button>
      </form>
      {subError && (
        <p className={`mt-2 text-sm font-sans ${theme === 'dark' ? 'text-red-400' : 'text-red-500'}`}>
          {subError}
        </p>
      )}
    </div>
  );
}

/* ─── Main component ──────────────────────────────────────────────────────── */
export default function DesignersLanding() {
  const [subEmail, setSubEmail] = useState('');
  const [subStatus, setSubStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [subError, setSubError] = useState('');
  const [isMobileCtaOpen, setIsMobileCtaOpen] = useState(false);

  const handleEmailChange = (v: string) => {
    setSubEmail(v);
    if (subStatus === 'error') setSubStatus('idle');
  };

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
        setIsMobileCtaOpen(false);
      } else {
        setSubError(data.error || 'Something went wrong.');
        setSubStatus('error');
      }
    } catch {
      setSubError('Network error — please try again.');
      setSubStatus('error');
    }
  };

  const formProps = {
    subEmail,
    subStatus,
    subError,
    onEmailChange: handleEmailChange,
    onSubmit: handleSubscribe,
  };

  return (
    <div className="min-h-screen bg-stone-50 pb-20 sm:pb-0">

      {/* ── Minimal fixed header ── */}
      <header className="fixed top-0 left-0 right-0 z-40 px-6 py-4 bg-white/90 backdrop-blur-sm border-b border-neutral-200">
        <Link
          href="/"
          className="font-sans font-light text-base tracking-[-0.04em] text-black hover:opacity-60 transition-opacity"
        >
          vibestack
        </Link>
      </header>

      {/* ══════════════════════════════════════════════════
          SECTION 1 — HERO
          Warm cream bg, smaller headline, creator photo,
          single CTA button → scrolls to #offer (no form)
      ══════════════════════════════════════════════════ */}
      <section className="bg-stone-50 pt-32 pb-20 sm:pt-40 sm:pb-28 px-6 border-b border-neutral-200">
        <div className="max-w-3xl mx-auto">

          <span className="inline-block px-3 py-1 rounded-full bg-black/6 text-neutral-500 text-xs font-sans tracking-wide uppercase mb-8">
            Coming soon · Free for designers
          </span>

          <h1 className="font-serif font-normal text-[clamp(28px,3.8vw,54px)] leading-[1.08] tracking-[-0.03em] text-black mb-6">
            How Designers Are Building
            <br />
            <em>Real Products in 48 Hours</em>
            <br />
            Without Writing Code
          </h1>

          <p className="font-sans text-[clamp(15px,1.3vw,19px)] leading-[1.6] text-neutral-700 max-w-xl mb-10">
            The tools, workflow, and mindset shift that let you go from Figma file to live URL — this weekend.
          </p>

          {/* Creator mini-card */}
          <div className="flex items-center gap-4 mb-10">
            <div className="w-[72px] h-[72px] sm:w-[88px] sm:h-[88px] rounded-full flex-shrink-0 overflow-hidden border-2 border-neutral-200 bg-neutral-100">
              {/* TODO: replace with <img src="/creator-photo.jpg" alt="Your name" className="w-full h-full object-cover" /> */}
              <div className="w-full h-full flex items-center justify-center text-neutral-300">
                <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z"/>
                </svg>
              </div>
            </div>
            <div>
              {/* TODO: fill in your name and background */}
              <p className="font-sans font-semibold text-black text-sm leading-tight">Your Name</p>
              <p className="font-sans text-sm text-neutral-500 mt-0.5">Founder, VibeStack · Product Designer</p>
            </div>
          </div>

          {/* Single CTA — anchor to offer, no email form */}
          <a
            href="#offer"
            className="inline-block px-7 py-4 rounded-full bg-black text-white font-sans font-semibold text-base hover:bg-neutral-800 active:scale-[0.98] transition-all"
          >
            Get early access →
          </a>
          <p className="mt-4 font-sans text-xs text-neutral-400">
            Free. Be first when it launches.
          </p>

        </div>
      </section>

      {/* ══════════════════════════════════════════════════
          SECTION 2 — PAIN AGITATION
          Bold highlights, pull-quote at end
      ══════════════════════════════════════════════════ */}
      <section className="bg-white py-20 sm:py-28 px-6">
        <div className="max-w-3xl mx-auto">

          <h2 className="font-serif font-normal text-[clamp(24px,3.2vw,44px)] leading-[1.12] tracking-[-0.03em] text-black mb-10">
            You have ideas.
            <br />
            You can&apos;t build them.
            <br />
            <em>Here&apos;s why that&apos;s changing.</em>
          </h2>

          <div className="space-y-6 font-sans text-[clamp(15px,1.2vw,18px)] leading-[1.75] text-neutral-700 max-w-2xl">
            <p>
              You know exactly what the product should feel like. You&apos;ve sketched it in Figma, written the copy, mapped the flows. But every time you try to move it forward, you hit the same wall:{' '}
              <strong className="text-black font-semibold">someone else has to write the code.</strong>
            </p>
            <p>
              So you wait. For a dev friend with spare time. For a freelancer who ghosts you. For funding you don&apos;t have yet.{' '}
              <strong className="text-black font-semibold">Meanwhile, your idea sits in a folder, getting stale.</strong>
            </p>
            <p>
              That bottleneck just disappeared. Not theoretically —{' '}
              <strong className="text-black font-semibold">practically, this weekend.</strong>{' '}
              A new class of AI tools has collapsed the gap between design and shipping. And{' '}
              <strong className="text-black font-semibold">designers who figure this out first</strong>{' '}
              are moving at a speed that was impossible 12 months ago.
            </p>
          </div>

          <blockquote className="mt-10 pl-5 border-l-4 border-black font-serif text-[clamp(17px,1.8vw,24px)] text-black leading-snug italic max-w-2xl">
            &ldquo;The designers shipping products right now aren&apos;t more talented than you. They just found the right tools first.&rdquo;
          </blockquote>

        </div>
      </section>

      {/* ══════════════════════════════════════════════════
          SECTION 3 — CREATOR STORY
          Moved earlier in page, screenshot grid removed
      ══════════════════════════════════════════════════ */}
      <section className="bg-stone-50 py-20 sm:py-28 px-6 border-y border-neutral-200">
        <div className="max-w-3xl mx-auto">

          <span className="inline-block px-3 py-1 rounded-full bg-black/6 text-neutral-500 text-xs font-sans uppercase tracking-wide mb-8">
            The story behind the kit
          </span>

          <h2 className="font-serif font-normal text-[clamp(22px,3vw,40px)] leading-[1.15] tracking-[-0.03em] text-black mb-10">
            Designer. Zero code.
            <br />
            <em>Built VibeStack in 2 nights.</em>
          </h2>

          {/* Creator bio card — TODO: add your photo at public/creator-photo.jpg */}
          <div className="flex items-start gap-5 mb-10 p-5 rounded-2xl bg-white border border-neutral-200">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full flex-shrink-0 overflow-hidden border-2 border-neutral-200 bg-neutral-100">
              {/* TODO: replace with <img src="/creator-photo.jpg" alt="Your name" className="w-full h-full object-cover" /> */}
              <div className="w-full h-full flex items-center justify-center text-neutral-300">
                <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z"/>
                </svg>
              </div>
            </div>
            <div>
              {/* TODO: fill in your real name and background */}
              <p className="font-sans font-semibold text-black text-sm mb-1">
                Your Name — Founder, VibeStack
              </p>
              <p className="font-sans text-sm leading-relaxed text-neutral-600">
                {/* TODO: e.g. "5 years in product design at [Company]. Never written production code." */}
                Product designer. Previously at [Company]. Never written production code in my life.
              </p>
            </div>
          </div>

          {/* Story with bold highlights */}
          <div className="max-w-2xl space-y-5 font-sans text-[clamp(15px,1.2vw,18px)] leading-[1.75] text-neutral-700 mb-8">
            <p>
              I&apos;m a designer. I&apos;ve never written a line of production code in my life. Two nights after discovering the right stack of AI tools, I shipped VibeStack —{' '}
              <strong className="text-black font-semibold">a live, working product with a real database, search, and a subscribe flow.</strong>
            </p>
            <p>
              I didn&apos;t get lucky. I used{' '}
              <strong className="text-black font-semibold">a specific set of tools in a specific order,</strong>{' '}
              with a workflow that&apos;s repeatable. Every decision I made in those 48 hours is documented in this kit.
            </p>
            <p>
              I made this because I kept getting the same message from designer friends:{' '}
              <em>&ldquo;I have this idea but I can&apos;t build it.&rdquo;</em>{' '}
              That sentence used to be true.{' '}
              <strong className="text-black font-semibold">It isn&apos;t anymore.</strong>{' '}
              This kit is the fastest path I know from that sentence to a live URL.
            </p>
          </div>

          {/* Social links — TODO: replace with your real profile URLs */}
          <div className="flex items-center gap-3">
            <a
              href="https://linkedin.com/in/YOUR_LINKEDIN_HANDLE"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-neutral-200 text-sm font-sans text-neutral-600 hover:text-black hover:border-neutral-400 transition-all"
            >
              <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
              </svg>
              LinkedIn
            </a>
            <a
              href="https://medium.com/@YOUR_MEDIUM_HANDLE"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-neutral-200 text-sm font-sans text-neutral-600 hover:text-black hover:border-neutral-400 transition-all"
            >
              <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M13.54 12a6.8 6.8 0 01-6.77 6.82A6.8 6.8 0 010 12a6.8 6.8 0 016.77-6.82A6.8 6.8 0 0113.54 12zM20.96 12c0 3.54-1.51 6.42-3.38 6.42-1.87 0-3.39-2.88-3.39-6.42s1.52-6.42 3.39-6.42 3.38 2.88 3.38 6.42M24 12c0 3.17-.53 5.75-1.19 5.75-.66 0-1.19-2.58-1.19-5.75s.53-5.75 1.19-5.75C23.47 6.25 24 8.83 24 12z"/>
              </svg>
              Medium
            </a>
          </div>

        </div>
      </section>

      {/* ══════════════════════════════════════════════════
          SECTION 4 — HOW IT WORKS
          Replaces "Dream Outcome" numbered list
          3-step emoji rows, clean and scannable
      ══════════════════════════════════════════════════ */}
      <section className="bg-white py-20 sm:py-28 px-6 border-b border-neutral-200">
        <div className="max-w-3xl mx-auto">

          <span className="inline-block px-3 py-1 rounded-full bg-black/6 text-neutral-500 text-xs font-sans uppercase tracking-wide mb-8">
            How it works
          </span>

          <h2 className="font-serif font-normal text-[clamp(22px,3vw,40px)] leading-[1.12] tracking-[-0.03em] text-black mb-12">
            Three steps.
            <br />
            <em>One weekend.</em>
          </h2>

          <div className="divide-y divide-neutral-200">
            {[
              {
                emoji: '🗂️',
                step: '01',
                headline: 'Pick the right tool for each stage',
                body: 'Not all AI tools are the same. The kit shows you which tool handles which job — and in what order they hand off to each other.',
              },
              {
                emoji: '⚡',
                step: '02',
                headline: 'Follow the 48-hour sequence',
                body: 'Hour by hour. No ambiguity. You know exactly what to do at hour 1, hour 12, and hour 47.',
              },
              {
                emoji: '🚀',
                step: '03',
                headline: 'Deploy something real',
                body: 'Not a prototype. A live URL — with a database, a real UI, and something people can actually use.',
              },
            ].map(({ emoji, step, headline, body }) => (
              <div key={step} className="flex gap-6 sm:gap-8 items-start py-8 first:pt-0 last:pb-0">
                <span className="text-2xl flex-shrink-0 mt-0.5">{emoji}</span>
                <div>
                  <p className="font-sans text-xs font-semibold text-neutral-400 uppercase tracking-widest mb-1.5">
                    Step {step}
                  </p>
                  <h3 className="font-serif font-normal text-xl sm:text-2xl text-black leading-snug mb-2">
                    {headline}
                  </h3>
                  <p className="font-sans text-base leading-relaxed text-neutral-600">
                    {body}
                  </p>
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* ══════════════════════════════════════════════════
          SECTION 5 — WHAT'S INSIDE
          Emoji flat list (replaces 2-column card grid)
      ══════════════════════════════════════════════════ */}
      <section className="bg-stone-50 py-20 sm:py-28 px-6 border-b border-neutral-200">
        <div className="max-w-3xl mx-auto">

          <h2 className="font-serif font-normal text-[clamp(22px,3vw,40px)] leading-[1.15] tracking-[-0.03em] text-black mb-3">
            Here&apos;s what&apos;s in the kit:
          </h2>
          <p className="font-sans text-base text-neutral-500 mb-12">
            Everything we&apos;re building into it — yours free when it launches.
          </p>

          <ul className="space-y-8 max-w-2xl">
            {[
              {
                emoji: '🛠️',
                headline: 'The exact 6-tool stack — in the order you use them',
                body: 'Not a roundup. A sequence. Each tool hands off to the next. You know when to use which one.',
              },
              {
                emoji: '⏱️',
                headline: 'A 48-hour workflow with zero ambiguity',
                body: 'Hour by hour. Every stage mapped. Blockers pre-answered. You follow the sequence, you ship.',
              },
              {
                emoji: '💬',
                headline: 'Prompt patterns that get AI to write production-quality code',
                body: "From your design descriptions — not a developer's. No wrestling with hallucinations.",
              },
              {
                emoji: '🔌',
                headline: '5 MCP servers that let AI actually build — not just suggest',
                body: 'AI that reads your files, runs commands, checks errors, and iterates without copy-pasting.',
              },
              {
                emoji: '🧠',
                headline: "A designer's mental model for building",
                body: 'Components, state, data — explained in the spatial language you already think in.',
              },
              {
                emoji: '🎯',
                headline: '3 weekend project ideas you can ship right now',
                body: 'Scoped for 48 hours. Chosen because they reward design thinking. Each one ships and shows your skills.',
              },
            ].map(({ emoji, headline, body }) => (
              <li key={headline} className="flex gap-4 items-start">
                <span className="text-2xl flex-shrink-0 mt-0.5">{emoji}</span>
                <div>
                  <p className="font-sans font-semibold text-black text-base mb-1">{headline}</p>
                  <p className="font-sans text-base leading-relaxed text-neutral-600">{body}</p>
                </div>
              </li>
            ))}
          </ul>

        </div>
      </section>

      {/* ══════════════════════════════════════════════════
          SECTION 6 — WHO IT'S FOR
          Sharpened copy, solid color text
      ══════════════════════════════════════════════════ */}
      <section className="bg-white py-20 sm:py-28 px-6 border-b border-neutral-200">
        <div className="max-w-3xl mx-auto">

          <h2 className="font-serif font-normal text-[clamp(22px,3vw,40px)] leading-[1.15] tracking-[-0.03em] text-black mb-12">
            Is this for you?
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 sm:gap-16">
            <div>
              <p className="font-sans text-xs font-semibold uppercase tracking-widest text-neutral-400 mb-5">
                This is for you if…
              </p>
              <ul className="space-y-4">
                {[
                  "You're a designer with at least one idea rotting in a Figma file right now.",
                  "You can describe what you want in clear detail — you just can't build it yet.",
                  "You have one free weekend and you'd rather ship than watch tutorials.",
                  "You've watched non-designers ship things and quietly wondered why it wasn't you.",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3 font-sans text-sm sm:text-base leading-relaxed text-neutral-700">
                    <span className="text-emerald-500 mt-0.5 flex-shrink-0 font-bold">✓</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <p className="font-sans text-xs font-semibold uppercase tracking-widest text-neutral-400 mb-5">
                This is NOT for you if…
              </p>
              <ul className="space-y-4">
                {[
                  "You want a shortcut that requires zero effort or attention.",
                  "You'd rather hire someone than ever touch a keyboard.",
                  "You're already shipping products with code — this isn't your next level.",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3 font-sans text-sm sm:text-base leading-relaxed text-neutral-600">
                    <span className="text-neutral-300 mt-0.5 flex-shrink-0 font-bold">✗</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>

        </div>
      </section>

      {/* ══════════════════════════════════════════════════
          SECTION 7 — OBJECTION FAQ
          Stacked layout (not 2-col), 4th Q&A added,
          bold highlights in answers
      ══════════════════════════════════════════════════ */}
      <section className="bg-stone-50 py-20 sm:py-28 px-6 border-b border-neutral-200">
        <div className="max-w-3xl mx-auto">

          <h2 className="font-serif font-normal text-[clamp(22px,3vw,40px)] leading-[1.15] tracking-[-0.03em] text-black mb-12">
            &ldquo;But I&apos;m not sure this
            <br />
            <em>is for me…&rdquo;</em>
          </h2>

          <div className="max-w-2xl">
            {[
              {
                objection: '"But I\'m not technical."',
                rebuttal: (
                  <>
                    You don&apos;t need to be. You need to describe what you want clearly — which{' '}
                    <strong className="text-black font-semibold">designers do better than anyone.</strong>{' '}
                    The tools handle the rest. Technical knowledge helps zero percent with getting your first product shipped.
                  </>
                ),
              },
              {
                objection: '"I\'ve tried AI before. It didn\'t work."',
                rebuttal: (
                  <>
                    That was before the right tooling existed. Six months ago, the workflow genuinely didn&apos;t work well.{' '}
                    <strong className="text-black font-semibold">The combination of tools and prompt patterns in this kit didn&apos;t exist in the form you need until recently.</strong>{' '}
                    It&apos;s a different experience now.
                  </>
                ),
              },
              {
                objection: '"I don\'t have time for this."',
                rebuttal: (
                  <>
                    You need{' '}
                    <strong className="text-black font-semibold">one weekend. That&apos;s it.</strong>{' '}
                    Not a course. Not months of learning. The kit gets you to a shipped product in 48 focused hours. If you have a weekend, you have time.
                  </>
                ),
              },
              {
                objection: '"What if I get stuck?"',
                rebuttal: (
                  <>
                    The kit anticipates the exact blockers most designers hit and pre-answers them.{' '}
                    The prompt patterns are designed specifically for{' '}
                    <strong className="text-black font-semibold">when AI gives you something broken</strong>{' '}
                    — which it will, sometimes. You&apos;ll know what to do.
                  </>
                ),
              },
            ].map(({ objection, rebuttal }) => (
              <div key={objection} className="py-8 border-b border-neutral-200 last:border-0">
                <p className="font-serif font-normal text-xl sm:text-2xl text-black mb-4 leading-snug">
                  {objection}
                </p>
                <p className="font-sans text-base leading-relaxed text-neutral-700">
                  {rebuttal}
                </p>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* ══════════════════════════════════════════════════
          SECTION 8 — THE OFFER (always dark)
          Email form lives HERE — not in hero
      ══════════════════════════════════════════════════ */}
      <section id="offer" className="bg-zinc-950 py-20 sm:py-28 px-6">
        <div className="max-w-3xl mx-auto text-center">

          <span className="inline-block px-3 py-1 rounded-full bg-white/10 text-white/60 text-xs font-sans uppercase tracking-wide mb-8">
            Coming soon
          </span>

          <h2 className="font-serif font-normal text-[clamp(24px,3.5vw,46px)] leading-[1.1] tracking-[-0.03em] text-white mb-4">
            Launching soon.
            <br />
            <em>Be the first to know.</em>
          </h2>

          <p className="font-sans text-base text-white/60 mb-10 max-w-md mx-auto leading-relaxed">
            Drop your email and you&apos;ll get a single notification the moment this launches. Nothing else.
          </p>

          <p className="font-sans text-xs font-semibold uppercase tracking-widest text-white/35 mb-4 text-left max-w-sm mx-auto">
            When it launches, you&apos;ll get:
          </p>
          <ul className="text-left max-w-sm mx-auto space-y-3 mb-12">
            {[
              '🛠️  The 6-tool stack — in order of use',
              '⏱️  48-hour workflow — hour by hour',
              '💬  Prompt patterns for production-quality code',
              '🔌  5 MCP servers that replace whole dev workflows',
              '🧠  Designer\'s mental model for building',
              '🎯  3 weekend project ideas to start with',
            ].map((item) => (
              <li key={item} className="flex items-start gap-3 font-sans text-sm text-white/80">
                <svg className="w-4 h-4 mt-0.5 flex-shrink-0 text-white/50" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                {item}
              </li>
            ))}
          </ul>

          <div className="max-w-md mx-auto">
            <InlineEmailForm {...formProps} theme="dark" buttonLabel="Notify me at launch" />
            <p className="mt-4 text-xs text-white/40 font-sans">One email when it launches. That&apos;s it.</p>
          </div>

        </div>
      </section>

      {/* ══════════════════════════════════════════════════
          SECTION 9 — FINAL CTA
      ══════════════════════════════════════════════════ */}
      <section className="bg-stone-50 py-20 sm:py-28 px-6 border-t border-neutral-200">
        <div className="max-w-3xl mx-auto text-center">

          <h2 className="font-serif font-normal text-[clamp(22px,3vw,40px)] leading-[1.15] tracking-[-0.03em] text-black mb-4">
            Don&apos;t wait another quarter
            <br />
            <em>for your idea to ship.</em>
          </h2>

          <p className="font-sans text-base text-neutral-700 max-w-md mx-auto leading-relaxed mb-10">
            The designers shipping products right now aren&apos;t more talented than you. They just found the right tools first. The kit is almost ready — get on the list and you&apos;ll be the first to know when it drops.
          </p>

          <div className="max-w-md mx-auto">
            <InlineEmailForm {...formProps} theme="light" buttonLabel="Get early access →" />
            <p className="mt-4 text-xs text-neutral-400 font-sans">
              You&apos;ll be first in line when it launches.
            </p>
          </div>

        </div>
      </section>

      {/* ── Minimal Footer ── */}
      <footer className="border-t border-neutral-200 px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-3">
        <p className="font-sans text-sm text-neutral-400">
          © 2026 VibeStack
        </p>
        <Link
          href="/"
          className="font-sans text-sm text-neutral-500 hover:text-black transition-colors"
        >
          ← Browse the directory
        </Link>
      </footer>

      {/* ══════════════════════════════════════════════════
          MOBILE BOTTOM SHEET MODAL
      ══════════════════════════════════════════════════ */}
      {isMobileCtaOpen && (
        <div className="fixed inset-0 z-50 sm:hidden flex flex-col justify-end">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setIsMobileCtaOpen(false)}
          />
          <div className="relative bg-white rounded-t-2xl px-6 pt-6 pb-10">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-serif text-xl text-black">Get early access</h3>
              <button
                onClick={() => setIsMobileCtaOpen(false)}
                className="w-8 h-8 flex items-center justify-center rounded-full bg-neutral-100 text-neutral-500 text-sm leading-none"
              >
                ✕
              </button>
            </div>
            <InlineEmailForm {...formProps} theme="light" buttonLabel="Notify me at launch" />
            <p className="mt-3 text-xs text-neutral-400 font-sans">One email when it launches. That&apos;s it.</p>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════
          MOBILE STICKY CTA BAR
      ══════════════════════════════════════════════════ */}
      <div className="fixed bottom-0 left-0 right-0 z-40 sm:hidden px-4 py-3 bg-white border-t border-neutral-200 shadow-[0_-4px_20px_rgba(0,0,0,0.06)]">
        {subStatus === 'success' ? (
          <div className="flex items-center justify-center gap-2 py-3 text-sm font-sans text-neutral-600">
            <svg className="w-4 h-4 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
            You&apos;re in! Check your inbox.
          </div>
        ) : (
          <button
            onClick={() => setIsMobileCtaOpen(true)}
            className="w-full py-3.5 rounded-full bg-black text-white font-sans font-semibold text-base active:scale-[0.98] transition-all"
          >
            Get early access — it&apos;s free
          </button>
        )}
      </div>

    </div>
  );
}
