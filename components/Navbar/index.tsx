"use client";

import Image from "next/image";
import Link from "next/link";
import { UserButton, useUser } from "@clerk/nextjs";

export default function Navbar() {
  const { isLoaded, isSignedIn } = useUser();

  return (
    <header className="sticky top-0 z-50 w-full bg-[#485696] shadow-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-2 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link
          href="/products"
          className="flex items-center gap-2 shrink-0 scale-125 origin-left ml-2"
        >
          <Image
            src="/assets/logo.png"
            alt="CompuLibre"
            width={200}
            height={56}
            priority
            unoptimized
            style={{ width: "auto", height: "56px" }}
          />
        </Link>

        {/* Acciones del usuario */}
        <div className="flex items-center gap-3">
          <Link
            href="/cart"
            aria-label="Ver carrito"
            className="flex items-center gap-1 rounded-lg px-3 py-2 text-sm font-medium text-white transition hover:bg-white/10"
          >
            <span aria-hidden="true">🛒</span>
            <span className="hidden sm:inline">Carrito</span>
          </Link>

          {/* Deterministic reactive rendering based on session loading status */}
          {!isLoaded ? (
            // Placeholder sutil de carga con las mismas dimensiones para evitar saltos visuales
            <div className="h-8 w-8 animate-pulse rounded-full bg-white/25" />
          ) : isSignedIn ? (
            <UserButton
              appearance={{
                elements: { avatarBox: "h-8 w-8" },
              }}
            />
          ) : (
            <Link
              href="/sign-in"
              className="rounded-lg bg-[#FC7A1E] px-4 py-2 text-sm font-semibold text-white transition hover:brightness-90"
            >
              Iniciar sesión
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}