import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const title = "WCPS | Wealth Creation Potential Score";
const description =
  "Discover your wealth creation potential with a 27-question assessment of your mindset, habits and life circumstances. Receive your personalised report by email.";

// Set NEXT_PUBLIC_SITE_URL to your actual public HTTPS origin before building.
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim();

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl || "http://localhost:3000"),
  title,
  description,
  applicationName: "WCPS",
  icons: {
    icon: [{ url: "/favicon.ico", type: "image/x-icon" }],
    shortcut: "/favicon.ico",
  },
  openGraph: {
    type: "website",
    siteName: "WCPS",
    locale: "en_US",
    title,
    description,
    images: [{
      url: "/wcps-share.png",
      width: 1200,
      height: 630,
      alt: "WCPS — Wealth Creation Potential Score. Discover your potential through a 27-question assessment.",
    }],
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    images: ["/wcps-share.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="min-h-full">{children}</body>
    </html>
  );
}
 