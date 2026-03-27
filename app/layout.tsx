import type { Metadata } from "next";
import { Sarabun, Noto_Sans_Thai } from "next/font/google";
import "./globals.css";
import { AppProvider } from "@/context/AppContext";

const sarabun = Sarabun({
  subsets: ["thai", "latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-sarabun",
});

const notoSansThai = Noto_Sans_Thai({
  subsets: ["thai", "latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-noto-sans-thai",
});

export const metadata: Metadata = {
  title: "ระบบจัดการการเบิกจ่าย สว.ยะลา",
  description: "ระบบจัดการและติดตามการเบิกจ่าย โรงเรียนสิรินธรวรานุสรณ์ ยะลา",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="th"
      className={`${sarabun.variable} ${notoSansThai.variable} h-full`}
    >
      <body
        className="h-full bg-[#0f0f23] text-gray-100 overflow-auto font-thai"
        suppressHydrationWarning
      >
        <AppProvider>{children}</AppProvider>
      </body>
    </html>
  );
}
