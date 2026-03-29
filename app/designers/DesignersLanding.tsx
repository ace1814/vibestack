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
      <div className={`flex items-center gap-2.5 text-base font-sans ${theme === 'dark' ? 'text-white/80' : 'text-black/70'}`}>
        <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
        You&apos;re in. Check your inbox.
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
              : 'bg-white border border-black/15 text-black placeholder:text-black/30 focus:border-black/30'
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
    /* pb-20 sm:pb-0 → clear the mobile sticky CTA bar */
    <div className="min-h-screen bg-white pb-20 sm:pb-0">

      {/* ── Minimal fixed header ── */}
      <header className="fixed top-0 left-0 right-0 z-40 px-6 py-4 bg-white/90 backdrop-blur-sm border-b border-black/6">
        <Link
          href="/"
          className="font-sans font-light text-base tracking-[-0.04em] text-black hover:opacity-60 transition-opacity"
        >
          vibestack
        </Link>
      </header>

      {/* ══════════════════════════════════════════════════
          SECTION 1 — HERO (light, editorial)
      ══════════════════════════════════════════════════ */}
      <section className="bg-white pt-32 pb-20 sm:pt-40 sm:pb-28 px-6 border-b border-black/6">
        <div className="max-w-3xl mx-auto">
          <span className="inline-block px-3 py-1 rounded-full bg-black/5 text-black/45 text-xs font-sans tracking-wide uppercase mb-8">
            Free resource for designers
          </span>

          <h1 className="font-serif font-normal text-[clamp(36px,5.5vw,76px)] leading-[1.06] tracking-[-0.03em] text-black mb-6">
            How Designers Are Shipping
            <br />
            <em>Real Products in 48 Hours</em>
            <br />
            — Without Writing a Single
            <br />
            Line of Code
          </h1>

          <p className="font-sans text-[clamp(15px,1.4vw,20px)] leading-[1.6] text-black/50 max-w-xl mb-8">
            The tools, workflows, and mindset shift that let designers finally build — without waiting on a dev team.
          </p>

          {/* YouTube embed — TODO: replace VIDEO_ID with your actual YouTube video ID
              e.g. for https://www.youtube.com/watch?v=dQw4w9WgXcQ → use dQw4w9WgXcQ
              e.g. for https://youtu.be/dQw4w9WgXcQ → use dQw4w9WgXcQ */}
          <div className="relative aspect-video rounded-2xl overflow-hidden border border-black/8 mb-10 bg-zinc-100">
            <iframe
              src="https://www.youtube.com/embed/VIDEO_ID?rel=0&modestbranding=1"
              title="How designers are shipping real products in 48 hours"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="absolute inset-0 w-full h-full"
            />
          </div>

          <div className="max-w-md">
            <InlineEmailForm {...formProps} theme="light" buttonLabel="Get the free kit →" />
            <p className="mt-3 text-xs text-black/30 font-sans">
              Free. Instant. No credit card.
            </p>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════
          SECTION 2 — PAIN AGITATION
      ══════════════════════════════════════════════════ */}
      <section className="bg-zinc-50 py-20 sm:py-28 px-6">
        <div className="max-w-3xl mx-auto">
          <h2 className="font-serif font-normal text-[clamp(28px,3.8vw,52px)] leading-[1.12] tracking-[-0.03em] text-black mb-10">
            You have ideas.
            <br />
            You can&apos;t build them.
            <br />
            <em>Here&apos;s why that&apos;s changing.</em>
          </h2>

          <div className="space-y-6 font-sans text-[clamp(15px,1.2vw,18px)] leading-[1.75] text-black/60 max-w-2xl">
            <p>
              You know exactly what the product should feel like. You&apos;ve sketched it in Figma, written the copy, mapped the flows. But every time you try to move it forward, you hit the same wall: someone else has to write the code.
            </p>
            <p>
              So you wait. For a dev friend with spare time. For a freelancer who ghosts you. For funding you don&apos;t have yet. Meanwhile, your idea sits in a folder, getting stale.
            </p>
            <p>
              That bottleneck just disappeared. Not theoretically —{' '}
              <strong className="text-black font-semibold">practically, this weekend</strong>. A new class of AI tools has collapsed the gap between design and shipping. And designers who figure this out first are moving at a speed that was impossible 12 months ago.
            </p>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════
          SECTION 3 — DREAM OUTCOME
      ══════════════════════════════════════════════════ */}
      <section className="bg-white py-20 sm:py-28 px-6 border-y border-black/6">
        <div className="max-w-3xl mx-auto">
          <h2 className="font-serif font-normal text-[clamp(24px,3.5vw,48px)] leading-[1.15] tracking-[-0.03em] text-black mb-12">
            What happens after this weekend:
          </h2>

          <div className="divide-y divide-black/8">
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
                <span className="font-serif text-[clamp(28px,3vw,42px)] text-black/15 leading-none flex-shrink-0 w-10 sm:w-14 pt-1">
                  {number}
                </span>
                <div>
                  <h3 className="font-serif font-normal text-xl sm:text-2xl text-black leading-snug mb-2">
                    {headline}
                  </h3>
                  <p className="font-sans text-base leading-relaxed text-black/50">
                    {body}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════
          SECTION 4 — PROOF
      ══════════════════════════════════════════════════ */}
      <section className="bg-zinc-50 py-20 sm:py-28 px-6">
        <div className="max-w-3xl mx-auto">
          <span className="inline-block px-3 py-1 rounded-full bg-black/6 text-black/45 text-xs font-sans uppercase tracking-wide mb-8">
            The origin story
          </span>

          <h2 className="font-serif font-normal text-[clamp(24px,3.5vw,48px)] leading-[1.15] tracking-[-0.03em] text-black mb-10">
            Designer. Zero code.
            <br />
            <em>Built VibeStack in 2 nights.</em>
          </h2>

          {/* Creator bio — TODO: add your photo at public/creator-photo.jpg */}
          <div className="flex items-start gap-5 mb-10 p-5 rounded-2xl bg-white border border-black/6">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full flex-shrink-0 overflow-hidden border-2 border-black/8 bg-zinc-200">
              {/* TODO: replace with <img src="/creator-photo.jpg" alt="Your name" className="w-full h-full object-cover" /> */}
              <div className="w-full h-full flex items-center justify-center text-black/20">
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
              <p className="font-sans text-sm leading-relaxed text-black/55">
                {/* TODO: replace with your actual background e.g. "5 years in product design at [Company]. Never written production code." */}
                Product designer. Previously at [Company]. Never written production code in my life.
              </p>
            </div>
          </div>

          {/* Story */}
          <div className="max-w-2xl space-y-4 font-sans text-[clamp(15px,1.2vw,18px)] leading-[1.75] text-black/60 mb-6">
            <p>
              I&apos;m a designer. I&apos;ve never written a line of production code in my life. Two nights after discovering the right stack of AI tools, I shipped VibeStack — a live, working product with a real database, search, and a subscribe flow.
            </p>
            <p>
              I didn&apos;t get lucky. I used a specific set of tools in a specific order, with a workflow that&apos;s repeatable. This kit is that workflow, documented.
            </p>
          </div>

          {/* Social links — TODO: replace with your real profile URLs */}
          <div className="flex items-center gap-3 mb-12">
            <a
              href="https://linkedin.com/in/YOUR_LINKEDIN_HANDLE"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-black/12 text-sm font-sans text-black/55 hover:text-black hover:border-black/25 transition-all"
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
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-black/12 text-sm font-sans text-black/55 hover:text-black hover:border-black/25 transition-all"
            >
              <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M13.54 12a6.8 6.8 0 01-6.77 6.82A6.8 6.8 0 010 12a6.8 6.8 0 016.77-6.82A6.8 6.8 0 0113.54 12zM20.96 12c0 3.54-1.51 6.42-3.38 6.42-1.87 0-3.39-2.88-3.39-6.42s1.52-6.42 3.39-6.42 3.38 2.88 3.38 6.42M24 12c0 3.17-.53 5.75-1.19 5.75-.66 0-1.19-2.58-1.19-5.75s.53-5.75 1.19-5.75C23.47 6.25 24 8.83 24 12z"/>
              </svg>
              Medium
            </a>
          </div>

          {/* Evidence grid — TODO: replace placeholder boxes with real screenshots */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              { label: 'Vercel deployment — night 2', note: 'Replace with screenshot of your Vercel dashboard showing the deploy timestamp' },
              { label: 'Supabase — live data', note: 'Replace with screenshot of your Supabase dashboard showing real rows' },
              { label: 'GitHub commit history', note: 'Replace with screenshot of the commit timeline showing 2-night build' },
              { label: 'The live product', note: 'Replace with a browser screenshot of vibestack.in' },
            ].map(({ label, note }) => (
              <div key={label} className="rounded-xl overflow-hidden border border-black/8 bg-white aspect-video relative flex flex-col items-center justify-center gap-2 p-4">
                {/* TODO: replace this div with: <img src="/proof/..." alt={label} className="w-full h-full object-cover absolute inset-0" /> */}
                <svg className="w-6 h-6 text-black/15" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <p className="font-sans text-xs font-medium text-black/40 text-center">{label}</p>
                <p className="font-sans text-[10px] text-black/25 text-center leading-relaxed">{note}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════
          SECTION 5 — WHAT'S INSIDE (outcome language)
      ══════════════════════════════════════════════════ */}
      <section className="bg-white py-20 sm:py-28 px-6 border-y border-black/6">
        <div className="max-w-3xl mx-auto">
          <h2 className="font-serif font-normal text-[clamp(24px,3.5vw,48px)] leading-[1.15] tracking-[-0.03em] text-black mb-3">
            Here&apos;s exactly what you get:
          </h2>
          <p className="font-sans text-base text-black/40 mb-12">
            Not topics. Outcomes — things you&apos;ll actually be able to do.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              {
                tag: 'Tool Stack',
                headline: 'The exact 6 tools — in the order you use them — that take you from idea to deployed URL',
                body: 'Not a list of AI tools. A sequence. Tool A hands off to Tool B. You use each one at the right moment.',
              },
              {
                tag: 'Workflow',
                headline: 'A 48-hour sequence with zero ambiguity — you\'ll know exactly what to do at hour 1, hour 12, and hour 47',
                body: 'No "figure it out as you go." Every stage mapped. Blockers pre-answered. You follow the sequence.',
              },
              {
                tag: 'Prompts',
                headline: 'The prompts that get AI to write production-quality code from a designer\'s description — not a developer\'s',
                body: 'Describing UI in design language. Getting clean, working output. Not wrestling with hallucinations.',
              },
              {
                tag: 'MCP Servers',
                headline: '5 MCP servers that give AI the ability to actually build — not just suggest',
                body: 'AI that can read your files, run commands, check for errors, and iterate without you copy-pasting anything.',
              },
              {
                tag: 'Mental Model',
                headline: 'How to think about your product like a builder — without ever needing to read code',
                body: 'Components, state, data — explained in the spatial language designers already think in.',
              },
              {
                tag: 'Quick Wins',
                headline: '3 project ideas you can ship in a weekend — chosen specifically because they reward design thinking',
                body: 'Scoped, achievable, and impressive. Each one ships in under 48 hours and shows your design skills.',
              },
            ].map(({ tag, headline, body }) => (
              <div key={tag} className="p-6 rounded-2xl border border-black/8 bg-white hover:border-black/15 transition-colors">
                <span className="inline-block px-2.5 py-0.5 rounded-full bg-black/5 text-xs font-sans text-black/40 mb-3">
                  {tag}
                </span>
                <h3 className="font-serif font-normal text-base sm:text-[17px] text-black mb-2 leading-snug">
                  {headline}
                </h3>
                <p className="font-sans text-sm leading-relaxed text-black/45">
                  {body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════
          SECTION 6 — OBJECTION CRUSH
      ══════════════════════════════════════════════════ */}
      <section className="bg-zinc-50 py-20 sm:py-28 px-6">
        <div className="max-w-3xl mx-auto">
          <h2 className="font-serif font-normal text-[clamp(24px,3.5vw,48px)] leading-[1.15] tracking-[-0.03em] text-black mb-12">
            &ldquo;But I&apos;m not sure this
            <br />
            <em>is for me…&rdquo;</em>
          </h2>

          <div className="divide-y divide-black/8">
            {[
              {
                objection: '"But I\'m not technical."',
                rebuttal: "You don't need to be. You need to describe what you want clearly — which designers do better than anyone. The tools handle the rest. Technical knowledge helps zero percent with getting your first product shipped.",
              },
              {
                objection: '"I\'ve tried AI before. It didn\'t work."',
                rebuttal: "That was before the right tooling existed. Six months ago, the workflow genuinely didn't work well. The combination of tools and the prompt patterns in this kit are what changed — they didn't exist in the form you need until recently.",
              },
              {
                objection: '"I don\'t have time for this."',
                rebuttal: "You need one weekend. That's it. Not a course. Not months of learning. The kit is designed to get you to a shipped product in 48 focused hours. If you have a weekend, you have time.",
              },
            ].map(({ objection, rebuttal }) => (
              <div key={objection} className="py-8 grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-10 items-start">
                <p className="font-serif font-normal text-lg sm:text-xl text-black leading-snug">
                  {objection}
                </p>
                <p className="font-sans text-base leading-relaxed text-black/55">
                  {rebuttal}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════
          SECTION 6b — WHO THIS IS / IS NOT FOR
      ══════════════════════════════════════════════════ */}
      <section className="bg-white py-20 sm:py-28 px-6 border-y border-black/6">
        <div className="max-w-3xl mx-auto">
          <h2 className="font-serif font-normal text-[clamp(24px,3.5vw,48px)] leading-[1.15] tracking-[-0.03em] text-black mb-12">
            Is this for you?
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 sm:gap-16">
            <div>
              <p className="font-sans text-xs font-semibold uppercase tracking-widest text-black/30 mb-5">
                This is for you if…
              </p>
              <ul className="space-y-4">
                {[
                  "You're a designer with ideas you've never been able to ship.",
                  "You're comfortable describing what you want — you just can't build it yet.",
                  "You have a weekend free and want to have a live product by Sunday.",
                  "You've watched non-designers ship things and wondered how.",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3 font-sans text-sm sm:text-base leading-relaxed text-black/65">
                    <span className="text-emerald-500 mt-0.5 flex-shrink-0 font-bold">✓</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <p className="font-sans text-xs font-semibold uppercase tracking-widest text-black/30 mb-5">
                This is NOT for you if…
              </p>
              <ul className="space-y-4">
                {[
                  "You're looking for a shortcut that requires learning absolutely nothing.",
                  "You want someone else to build it for you.",
                  "You're already shipping products with code.",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3 font-sans text-sm sm:text-base leading-relaxed text-black/50">
                    <span className="text-black/25 mt-0.5 flex-shrink-0 font-bold">✗</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════
          SECTION 7 — THE OFFER (dark, climax)
      ══════════════════════════════════════════════════ */}
      <section id="offer" className="bg-zinc-950 py-20 sm:py-28 px-6">
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
              'The 6-tool stack in order of use',
              '48-hour workflow — hour by hour',
              'Prompt patterns for production code',
              '5 MCP servers that replace whole dev workflows',
              "Designer's mental model for building",
              '3 weekend projects to start with',
            ].map((item) => (
              <li key={item} className="flex items-start gap-3 font-sans text-sm text-white/65">
                <svg className="w-4 h-4 mt-0.5 flex-shrink-0 text-white/35" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                {item}
              </li>
            ))}
          </ul>

          <div className="max-w-md mx-auto">
            <InlineEmailForm {...formProps} theme="dark" buttonLabel="Get the kit — it's free" />
            <p className="mt-4 text-xs text-white/25 font-sans">Unsubscribe anytime. No spam.</p>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════
          SECTION 8 — FINAL CTA
      ══════════════════════════════════════════════════ */}
      <section className="bg-white py-20 sm:py-28 px-6 border-t border-black/6">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="font-serif font-normal text-[clamp(24px,3.5vw,48px)] leading-[1.15] tracking-[-0.03em] text-black mb-4">
            Don&apos;t wait another quarter
            <br />
            <em>for your idea to ship.</em>
          </h2>

          <p className="font-sans text-base text-black/50 max-w-md mx-auto leading-relaxed mb-10">
            The designers shipping products right now aren&apos;t more talented than you. They just found the right tools first.
          </p>

          <div className="max-w-md mx-auto">
            <InlineEmailForm {...formProps} theme="light" buttonLabel="Get the free kit →" />
            <p className="mt-4 text-xs text-black/25 font-sans">
              Be one of the first designers to get this.
            </p>
          </div>
        </div>
      </section>

      {/* ── Minimal Footer ── */}
      <footer className="border-t border-black/8 px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-3">
        <p className="font-sans text-sm text-black/30">
          © 2026 VibeStack
        </p>
        <Link
          href="/"
          className="font-sans text-sm text-black/45 hover:text-black transition-colors"
        >
          ← Browse the directory
        </Link>
      </footer>

      {/* ══════════════════════════════════════════════════
          MOBILE BOTTOM SHEET MODAL
      ══════════════════════════════════════════════════ */}
      {isMobileCtaOpen && (
        <div className="fixed inset-0 z-50 sm:hidden flex flex-col justify-end">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setIsMobileCtaOpen(false)}
          />
          {/* Sheet */}
          <div className="relative bg-white rounded-t-2xl px-6 pt-6 pb-10">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-serif text-xl text-black">Get the free kit</h3>
              <button
                onClick={() => setIsMobileCtaOpen(false)}
                className="w-8 h-8 flex items-center justify-center rounded-full bg-black/6 text-black/50 text-sm leading-none"
              >
                ✕
              </button>
            </div>
            <InlineEmailForm {...formProps} theme="light" buttonLabel="Get the kit — it's free" />
            <p className="mt-3 text-xs text-black/30 font-sans">Free. Instant. No credit card.</p>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════
          MOBILE STICKY CTA BAR
      ══════════════════════════════════════════════════ */}
      <div className="fixed bottom-0 left-0 right-0 z-40 sm:hidden px-4 py-3 bg-white border-t border-black/8 shadow-[0_-4px_20px_rgba(0,0,0,0.06)]">
        {subStatus === 'success' ? (
          <div className="flex items-center justify-center gap-2 py-3 text-sm font-sans text-black/60">
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
            Get the free kit — it&apos;s free
          </button>
        )}
      </div>

    </div>
  );
}
