'use client';

import { useState } from 'react';
import { Terminal, Copy, Check } from '@phosphor-icons/react';

export default function CopyCodeBlock({
  children,
  label = 'Prompt',
}: {
  children: string;
  label?: string;
}) {
  const [copied, setCopied] = useState(false);

  function handleCopy() {
    navigator.clipboard.writeText(children).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  return (
    <div className="my-4">
      <div className="flex items-center justify-between mb-1.5">
        <p className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-black/30 dark:text-white/30">
          <Terminal size={11} weight="bold" />
          {label}
        </p>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wider text-black/30 dark:text-white/30 hover:text-black/60 dark:hover:text-white/60 transition-colors cursor-pointer"
        >
          {copied ? (
            <>
              <Check size={11} weight="bold" className="text-emerald-500" />
              <span className="text-emerald-500">Copied!</span>
            </>
          ) : (
            <>
              <Copy size={11} weight="bold" />
              Copy
            </>
          )}
        </button>
      </div>
      <pre className="bg-zinc-950 dark:bg-zinc-900 text-zinc-100 rounded-xl px-5 py-4 overflow-x-auto text-sm leading-relaxed font-mono whitespace-pre-wrap">
        {children}
      </pre>
    </div>
  );
}
