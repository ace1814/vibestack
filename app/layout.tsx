import type { Metadata } from "next";
import { Inter, IBM_Plex_Serif } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const ibmPlexSerif = IBM_Plex_Serif({
  subsets: ["latin"],
  weight: ["400"],
  style: ["normal", "italic"],
  variable: "--font-ibm-plex-serif",
});

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ?? 'https://vibestack.vercel.app'
  ),
  title: "VibeStack — Curated tools & resources for builders",
  description:
    "A curated image-forward directory of tools, learning resources, and projects for non-coder builders.",
  openGraph: {
    title: "VibeStack — Curated tools & resources for builders",
    description:
      "Handpicked tools, learning resources & projects from vibe-coders.",
    siteName: "VibeStack",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "VibeStack — Curated tools & resources for builders",
    description:
      "Handpicked tools, learning resources & projects from vibe-coders.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${ibmPlexSerif.variable}`}>
      <body className="font-sans antialiased">
        {children}
      </body>
    </html>
  );
}
