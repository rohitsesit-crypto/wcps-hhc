
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

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL?.trim() ||
  "https://wcps-ses.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),

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
    url: "/",
    title,
    description,
    images: [
      {
        url: "/wcps.png",
        width: 486,
        height: 405,
        alt: "WCPS | Wealth Creation Potential Score",
      },
    ],
  },

  twitter: {
    card: "summary",
    title,
    description,
    images: ["/wcps.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full">{children}</body>
    </html>
  );
}
