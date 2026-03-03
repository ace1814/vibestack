import type { Metadata } from "next";
import { Inter, IBM_Plex_Serif } from "next/font/google";
import Script from "next/script";
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
  metadataBase: new URL('https://www.vibestack.in'),
  title: "VibeStack — Curated tools & resources for builders",
  description:
    "A curated image-forward directory of tools, learning resources, and projects for non-coder builders.",
  openGraph: {
    title: "VibeStack — Curated tools & resources for builders",
    description:
      "Handpicked tools, learning resources & projects from vibe-coders.",
    siteName: "VibeStack",
    type: "website",
    images: [{ url: '/og-image.png', width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "VibeStack — Curated tools & resources for builders",
    description:
      "Handpicked tools, learning resources & projects from vibe-coders.",
    images: ['/og-image.png'],
  },
};

const GA_ID = "G-H4KBZ0QKX4";

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

      {/* Google Analytics */}
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
        strategy="afterInteractive"
      />
      <Script id="google-analytics" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${GA_ID}');
        `}
      </Script>
    </html>
  );
}
