import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import Navbar from "@/components/Navbar";
import GlobalNotificationSystem from "@/components/GlobalNotificationSystem";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "CompuLibre — Marketplace de Hardware",
  description:
    "Comprá hardware de computadora de los mejores vendedores de Argentina.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html
        lang="es"
        className={`${inter.variable} font-sans h-full antialiased`}>
        <body className="min-h-full flex flex-col bg-[#E7E7E7] text-[#1F2937]">
          <Navbar />
          {children}
          <GlobalNotificationSystem />
        </body>
      </html>
    </ClerkProvider>
  );
}
