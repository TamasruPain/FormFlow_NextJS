import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { SplashScreenProvider } from "@/components/shared/SplashScreenProvider";
import { ToastContainer } from "@/components/shared/ToastContainer";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "FormKyte — Serverless AI Form Builder",
  description:
    "Design beautiful, responsive forms with drag-and-drop actions. Analyze submissions in real time with our background AI insights pipeline.",
  keywords: ["form builder", "AI insights", "survey tool", "Next.js", "serverless form", "FormKyte"],
  authors: [{ name: "FormKyte team" }],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased dark`}
    >
      <body className="min-h-full flex flex-col">
        <SplashScreenProvider>
          {children}
          <ToastContainer />
        </SplashScreenProvider>
      </body>
    </html>
  );
}
