import type { Metadata } from "next";
import { Inter, Geist_Mono } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "CEREBRO — Your AI Second Brain",
  description:
    "A personal AI operating system that remembers, organizes, and assists your digital life through intelligent memory, tasks, voice, and automation.",
  keywords: ["AI", "second brain", "personal assistant", "memory", "tasks", "Gemini"],
  openGraph: {
    title: "CEREBRO — Your AI Second Brain",
    description: "Your personal AI OS — intelligent memory, tasks, and automation.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${geistMono.variable} h-full`}
    >
      <body className="min-h-full flex flex-col antialiased">
        {/* Global animated background mesh */}
        <div className="bg-mesh" aria-hidden="true" />
        {children}
      </body>
    </html>
  );
}
