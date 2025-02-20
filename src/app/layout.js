"use client";

import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Layout from "../components/Layout";
import { usePathname } from "next/navigation";
import { Toaster } from "react-hot-toast";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const metadata = {
  title: "Socialsssss",
  description: "abcd........",
};

export default function RootLayout({ children }) {
  const pathname = usePathname(); // ✅ Get current route

  return (
    <html lang="en">
      <head>
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />

        {/* Apple Touch Icon for iOS */}
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />

        {/* Android home screen icon */}
        <link rel="icon" type="image/png" sizes="192x192" href="/android-chrome-192x192.png" />

        <link rel="icon" type="image/png" sizes="512x512" href="/android-chrome-512x512.png" />

        {/* Manifest for PWA */}
      </head>
      <body>
        <Toaster position="top-right" reverseOrder={false} />
        {pathname === "/" ? children : <Layout>{children}</Layout>}
      </body>
    </html>
  );
}
