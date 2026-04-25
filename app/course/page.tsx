import type { Metadata } from 'next';
import CourseLanding from './CourseLanding';

export const metadata: Metadata = {
  title: "Vibe Coding for People Who've Never Coded — Free Course",
  description:
    "A free step-by-step course for complete beginners. Build and launch a real Kanban app using AI — no coding experience needed.",
  alternates: { canonical: 'https://www.vibestack.in/course' },
  openGraph: {
    title: "Vibe Coding for People Who've Never Coded — Free Course",
    description:
      "A free step-by-step course for complete beginners. Build and launch a real Kanban app using AI — no coding experience needed.",
    type: 'website',
    url: 'https://www.vibestack.in/course',
    images: [{ url: '/og-image.png' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: "Vibe Coding for People Who've Never Coded — Free Course",
    description:
      "A free step-by-step course for complete beginners. Build and launch a real Kanban app using AI — no coding experience needed.",
  },
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Course',
  name: "Vibe Coding for People Who've Never Coded",
  description:
    "A free step-by-step course for complete beginners. Build and launch a real Kanban app using AI — no coding experience needed.",
  url: 'https://www.vibestack.in/course',
  provider: {
    '@type': 'Organization',
    name: 'VibeStack',
    url: 'https://www.vibestack.in',
  },
  isAccessibleForFree: true,
  educationalLevel: 'Beginner',
  teaches: ['Vibe coding', 'Cursor AI', 'Supabase', 'Vercel', 'Building web apps without coding experience'],
};

export default function CoursePage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <CourseLanding />
    </>
  );
}
