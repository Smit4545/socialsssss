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
      <body>
      <Toaster position="top-right" reverseOrder={false} />
        {pathname === "/" ? children : <Layout>{children}</Layout>}</body>
    </html>
  );
}
