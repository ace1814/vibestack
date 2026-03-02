'use client';

import { useState } from 'react';
import { Resource } from '@/lib/types';

interface ResourceCardProps {
  resource: Resource;
}

const PLACEHOLDER_IMAGE = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='250' viewBox='0 0 400 250'%3E%3Crect width='400' height='250' fill='%23f8f8f8'/%3E%3Ctext x='200' y='130' text-anchor='middle' fill='%23ccc' font-size='48' font-family='system-ui'%3E🔗%3C/text%3E%3C/svg%3E";

export default function ResourceCard({ resource }: ResourceCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [imgError, setImgError] = useState(false);

  function handleClick() {
    const url = new URL(resource.url);
    url.searchParams.set('ref', 'vibestack');
    window.open(url.toString(), '_blank', 'noopener,noreferrer');
  }

  return (
    <div
      className="group relative flex flex-col rounded-2xl overflow-hidden bg-white border border-black/8 shadow-sm cursor-pointer transition-all duration-200 hover:shadow-md hover:-translate-y-0.5"
      onClick={handleClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onKeyDown={(e) => e.key === 'Enter' && handleClick()}
      tabIndex={0}
      role="link"
      aria-label={`Open ${resource.name}`}
    >
      {/* Image */}
      <div className="relative w-full aspect-[16/9] overflow-hidden bg-slate-50">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={(!imgError && resource.preview_image_url) ? resource.preview_image_url : PLACEHOLDER_IMAGE}
          alt={resource.name}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          onError={() => setImgError(true)}
          loading="lazy"
        />

        {/* Hover overlay */}
        <div
          className={`absolute inset-0 bg-black/50 flex items-center justify-center transition-opacity duration-200 ${
            isHovered ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <span className="flex items-center gap-2 bg-white text-black font-semibold px-4 py-2 rounded-full text-sm shadow-lg">
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
                d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
              />
            </svg>
            Open
          </span>
        </div>

        {/* Type badge — glass effect */}
        <div className="absolute top-3 left-3">
          <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-black/20 backdrop-blur-md text-white border border-white/20">
            {resource.type}
          </span>
        </div>
      </div>

      {/* Card body */}
      <div className="flex flex-col flex-1 p-4 gap-1.5">
        <h3 className="font-semibold text-black text-base leading-snug line-clamp-1">
          {resource.name}
        </h3>
        <p className="text-black/50 text-sm leading-relaxed line-clamp-2 flex-1">
          {resource.description || 'No description available.'}
        </p>
        <div className="flex items-center gap-1.5 mt-2 pt-2 border-t border-black/5">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={`https://www.google.com/s2/favicons?domain=${resource.domain}&sz=16`}
            alt=""
            className="w-4 h-4 rounded"
            loading="lazy"
          />
          <span className="text-xs text-black/35 truncate">{resource.domain}</span>
        </div>
      </div>
    </div>
  );
}
