import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/db/prisma";
import Navbar from "@/components/Navbar";
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

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Global Suspension Check
  const { userId } = await auth();
  let isSuspended = false;

  if (userId) {
    const profile = await prisma.buyerProfile.findUnique({
      where: { id: userId },
      select: { isActive: true },
    });
    if (profile && profile.isActive === false) {
      isSuspended = true;
    }
  }

  return (
    <ClerkProvider>
      <html
        lang="es"
        className={`${inter.variable} font-sans h-full antialiased`}>
        <body className="min-h-full flex flex-col bg-[#E6E6E6] text-[#1F2937]">
          <Navbar />
          {isSuspended ? (
            <main className="flex-1 flex flex-col items-center justify-center p-6 text-center">
              <div className="bg-white p-8 rounded-2xl shadow-sm border border-red-200 max-w-md w-full">
                <div className="h-16 w-16 bg-red-50 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4 border border-red-100">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                  </svg>
                </div>
                <h1 className="text-2xl font-bold text-gray-900 mb-2">Cuenta Suspendida</h1>
                <p className="text-gray-500 mb-6 text-sm">
                  El acceso a tu cuenta ha sido temporalmente revocado por un administrador de CompuLibre. No puedes realizar compras ni navegar el catálogo.
                </p>
                <div className="text-xs text-gray-400">Si crees que esto es un error, contacta a soporte.</div>
              </div>
            </main>
          ) : (
            children
          )}
        </body>
      </html>
    </ClerkProvider>
  );
}
