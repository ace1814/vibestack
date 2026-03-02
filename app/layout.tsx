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
  title: "VibeStack — Curated tools & resources for builders",
  description:
    "A curated image-forward directory of tools, learning resources, and projects for non-coder builders.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${inter.variable} ${ibmPlexSerif.variable} font-sans antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
