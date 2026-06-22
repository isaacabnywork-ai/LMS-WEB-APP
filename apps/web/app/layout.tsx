import type { Metadata } from "next";
import { Inter, Outfit } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "../components/ThemeProvider";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });
const outfit = Outfit({ subsets: ["latin"], variable: "--font-outfit", display: "swap" });

export const metadata: Metadata = {
  metadataBase: new URL("https://edunova.app"),
  title: {
    default: "Avia Tech | Next-Generation Learning Platform",
    template: "%s | Avia Tech",
  },
  description: "A premium learning management system built for modern education.",
  keywords: ["LMS", "Education", "E-learning", "Courses", "Platform", "EdTech"],
  openGraph: {
    title: "Avia Tech | Next-Generation Learning Platform",
    description: "A premium learning management system built for modern education.",
    url: "https://edunova.com",
    siteName: "Avia Tech",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Avia Tech Platform Preview",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Avia Tech",
    description: "A premium learning management system built for modern education.",
    images: ["/og-image.png"],
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning className={`${inter.variable} ${outfit.variable} font-sans bg-[var(--background)] text-foreground`}>
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
