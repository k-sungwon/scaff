import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { QueryProvider } from "@/lib/query/query-provider";

// 🎯 [핵심 패턴] Next.js 폰트 최적화
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Scaff - 수능 기출 사고회로 해설",
  description: "킬러 문제의 사고 회로를 배우는 수능 기출 해설 서비스",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-gray-50`}
      >
        <QueryProvider>{children}</QueryProvider>
      </body>
    </html>
  );
}
