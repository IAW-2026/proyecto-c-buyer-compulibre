"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { UserButton, useUser } from "@clerk/nextjs";
import { ArchiveBoxIcon, ShoppingCartIcon, MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import NotificationBell from "@/components/NotificationBell";
import { Suspense, useState, useRef, useEffect } from "react";

function GlobalSearch() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentSearch = searchParams?.get("search") || "";

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const search = formData.get("search")?.toString().trim() || "";
    
    if (search) {
      router.push(`/products?search=${encodeURIComponent(search)}`);
    } else {
      router.push(`/products`);
    }
  };

  return (
    <form onSubmit={handleSearch} className="relative w-full max-w-2xl group">
      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5">
        <MagnifyingGlassIcon className="h-4 w-4 text-gray-400 group-focus-within:text-[#FC7A1E] transition-colors" aria-hidden="true" />
      </div>
      <input
        type="search"
        name="search"
        defaultValue={currentSearch}
        placeholder="Buscar productos, marcas y más..."
        className="block w-full rounded-full border-0 py-2.5 pl-10 pr-4 text-sm text-[#1F2937] shadow-inner ring-1 ring-inset ring-white/20 placeholder:text-gray-500 focus:ring-2 focus:ring-inset focus:ring-[#FC7A1E] bg-white/95 focus:bg-white transition-all outline-none"
      />
      <button type="submit" className="hidden">Buscar</button>
    </form>
  );
}

export default function Navbar() {
  const { isLoaded, isSignedIn } = useUser();
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  const searchContainerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setIsMobileSearchOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header ref={searchContainerRef} className="sticky top-0 z-50 w-full bg-[#485696] shadow-md transition-all duration-300">
      <div className="mx-auto max-w-7xl px-2 sm:px-6 lg:px-8 py-3">
        
        {/* Fila principal: Logo, Buscador (Desktop) y Acciones */}
        <div className="flex items-center justify-between gap-2 sm:gap-4 lg:gap-8">
          
          {/* Logo */}
          <Link
            href="/products"
            className="shrink-0 flex items-center transition-transform hover:scale-[1.02] active:scale-[0.98]"
          >
            <Image
              src="/assets/logo.png"
              alt="CompuLibre"
              width={160}
              height={44}
              priority
              unoptimized
              className="h-6 sm:h-10 w-auto object-contain brightness-0 invert"
              style={{ filter: 'brightness(0) invert(1)' }} // Force white logo for dark blue bg if logo is dark
            />
          </Link>

          {/* Buscador - Visible solo en tablet/desktop */}
          <div className="hidden flex-1 md:flex items-center justify-center">
            <Suspense fallback={<div className="h-10 w-full max-w-2xl bg-white/10 rounded-full animate-pulse" />}>
              <GlobalSearch />
            </Suspense>
          </div>

          {/* Acciones del usuario */}
          <div className="flex items-center gap-0.5 sm:gap-3 shrink-0">
            {/* Botón de búsqueda (solo móvil) */}
            <button
              onClick={() => setIsMobileSearchOpen(!isMobileSearchOpen)}
              aria-label="Buscar"
              className="md:hidden flex items-center justify-center rounded-full p-2 text-white transition hover:bg-white/15 active:bg-white/20"
            >
              <MagnifyingGlassIcon className="h-5 w-5 sm:h-4 sm:w-4" aria-hidden="true" />
            </button>

            <Link
              href="/orders"
              aria-label="Ver mis órdenes"
              className="flex items-center gap-1.5 rounded-full md:rounded-lg px-2.5 py-2 sm:px-3 text-sm font-medium text-white transition hover:bg-white/15 active:bg-white/20"
            >
              <ArchiveBoxIcon className="h-5 w-5 sm:h-4 sm:w-4" aria-hidden="true" />
              <span className="hidden md:inline">Mis órdenes</span>
            </Link>
            
            <Link
              href="/cart"
              aria-label="Ver carrito"
              className="flex items-center gap-1.5 rounded-full md:rounded-lg px-2.5 py-2 sm:px-3 text-sm font-medium text-white transition hover:bg-white/15 active:bg-white/20"
            >
              <ShoppingCartIcon className="h-5 w-5 sm:h-4 sm:w-4" aria-hidden="true" />
              <span className="hidden md:inline">Carrito</span>
            </Link>

            {/* Separador */}
            <div className="h-5 w-px bg-white/20 mx-1" />

            {/* Auth / Perfil */}
            <div className="flex items-center gap-2 pl-1 sm:pl-0">
              {!isLoaded ? (
                <div className="h-8 w-8 animate-pulse rounded-full bg-white/25" />
              ) : isSignedIn ? (
                <>
                  <NotificationBell />
                  <UserButton
                    appearance={{
                      elements: { avatarBox: "h-8 w-8 ring-2 ring-white/20 hover:ring-white/50 transition-all" },
                    }}
                  />
                </>
              ) : (
                <Link
                  href="/sign-in"
                  className="rounded-full bg-[#FC7A1E] px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm font-semibold text-white shadow-sm transition hover:brightness-110 active:scale-95"
                >
                  Ingresar
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* Fila secundaria: Buscador - Visible solo en móviles */}
        {isMobileSearchOpen && (
          <div className="mt-3 block md:hidden transition-all duration-300">
            <Suspense fallback={<div className="h-10 w-full bg-white/10 rounded-full animate-pulse" />}>
              <GlobalSearch />
            </Suspense>
          </div>
        )}

      </div>
    </header>
  );
}