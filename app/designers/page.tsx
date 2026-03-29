import type { Metadata } from 'next';
import DesignersLanding from './DesignersLanding';

export const metadata: Metadata = {
  title:
    'How Designers Are Shipping Real Products in 48 Hours — Without Writing a Single Line of Code',
  description:
    'Get the free kit: the exact AI tool stack, 48-hour workflow, and prompt patterns a designer used to ship VibeStack in 2 nights. No code required.',
  openGraph: {
    title: 'How Designers Are Shipping Real Products in 48 Hours',
    description:
      'The exact tools, workflow, and prompt patterns a designer used to ship a real product in 48 hours without writing code. Free kit inside.',
    type: 'website',
    images: [{ url: '/og-image.png', width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'How Designers Are Shipping Real Products in 48 Hours',
    description:
      'Free kit: AI tool stack + 48-hour workflow for designers who want to build without code.',
    images: ['/og-image.png'],
  },
  alternates: {
    canonical: 'https://www.vibestack.in/designers',
  },
};

export default function DesignersPage() {
  return <DesignersLanding />;
}
