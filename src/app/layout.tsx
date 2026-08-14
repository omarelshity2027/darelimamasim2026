import type { Metadata } from "next";
import { Cairo } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

const cairo = Cairo({
  variable: "--font-cairo",
  subsets: ["arabic", "latin"],
});

export const metadata: Metadata = {
  title: {
    default: "دار الإمام عاصم",
    template: "%s | دار الإمام عاصم",
  },
  description: "نظام إدارة دار تحفيظ القرآن الكريم",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ar" dir="rtl" className={`${cairo.variable} h-full antialiased`}>
      <body className="min-h-svh font-sans">
        {children}
        <Toaster richColors position="top-center" />
      </body>
    </html>
  );
}
