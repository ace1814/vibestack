'use client';

import { useState } from 'react';
import { Resource } from '@/lib/types';

const PLACEHOLDER_IMAGE = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='250' viewBox='0 0 400 250'%3E%3Crect width='400' height='250' fill='%23f8f8f8'/%3E%3Ctext x='200' y='130' text-anchor='middle' fill='%23ccc' font-size='48' font-family='system-ui'%3E🔗%3C/text%3E%3C/svg%3E";

export default function ResourceListRow({ resource }: { resource: Resource }) {
  const [imgError, setImgError] = useState(false);

  function handleClick() {
    const url = new URL(resource.url);
    url.searchParams.set('ref', 'vibestack');
    window.open(url.toString(), '_blank', 'noopener,noreferrer');
  }

  return (
    <div
      className="group flex items-center gap-4 py-4 border-b border-black/6 cursor-pointer hover:bg-black/[0.02] transition-colors -mx-4 sm:-mx-14 px-4 sm:px-14"
      onClick={handleClick}
      onKeyDown={(e) => e.key === 'Enter' && handleClick()}
      tabIndex={0}
      role="link"
      aria-label={`Open ${resource.name}`}
    >
      {/* Thumbnail */}
      <div className="relative flex-shrink-0 w-[100px] sm:w-[160px] aspect-[16/9] rounded-xl overflow-hidden bg-slate-50">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={(!imgError && resource.preview_image_url) ? resource.preview_image_url : PLACEHOLDER_IMAGE}
          alt={resource.name}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          onError={() => setImgError(true)}
          loading="lazy"
        />
      </div>

      {/* Content */}
      <div className="flex flex-col flex-1 min-w-0 gap-1">
        {/* Name row + type badge */}
        <div className="flex items-start justify-between gap-3">
          <h3 className="font-semibold text-black text-base leading-snug line-clamp-1">
            {resource.name}
          </h3>
          <span className="flex-shrink-0 text-xs font-medium px-2.5 py-1 rounded-full bg-black/6 text-black/50">
            {resource.type}
          </span>
        </div>

        {/* Description */}
        <p className="text-black/50 text-sm leading-relaxed line-clamp-2">
          {resource.description || 'No description available.'}
        </p>

        {/* Footer: domain + creator + tags */}
        <div className="flex items-center gap-1.5 mt-1 min-w-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={`https://www.google.com/s2/favicons?domain=${resource.domain}&sz=16`}
            alt=""
            className="w-4 h-4 rounded flex-shrink-0"
            loading="lazy"
          />
          <span className="text-xs text-black/35 flex-shrink-0">{resource.domain}</span>

          {resource.created_by && (
            <>
              <span className="text-black/15 text-xs flex-shrink-0">·</span>
              {resource.created_by_url ? (
                <a
                  href={resource.created_by_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="text-xs text-black/40 hover:text-black/70 truncate transition-colors underline underline-offset-2"
                >
                  by {resource.created_by}
                </a>
              ) : (
                <span className="text-xs text-black/35 truncate">by {resource.created_by}</span>
              )}
            </>
          )}

          {resource.tags && resource.tags.length > 0 && (
            <>
              <span className="text-black/15 text-xs flex-shrink-0">·</span>
              <div className="flex items-center gap-1 min-w-0 overflow-hidden">
                {resource.tags.slice(0, 3).map((tag) => (
                  <span
                    key={tag}
                    className="flex-shrink-0 text-[11px] px-2 py-0.5 rounded-full bg-black/5 text-black/40"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Arrow — appears on hover */}
      <svg
        className="w-4 h-4 text-black/20 group-hover:text-black/50 flex-shrink-0 transition-colors hidden sm:block"
        fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
      </svg>
    </div>
  );
}
