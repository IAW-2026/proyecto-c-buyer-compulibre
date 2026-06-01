"use client";

import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { useDebouncedCallback } from "use-debounce";
import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";

export default function BuyerSearchBar({ defaultValue }: { defaultValue: string }) {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { replace } = useRouter();

  const handleSearch = useDebouncedCallback((term: string) => {
    const params = new URLSearchParams(searchParams);
    // Reset to page 1 when searching
    params.set("page", "1");
    if (term) {
      params.set("search", term);
    } else {
      params.delete("search");
    }
    // Update the URL without reloading the page
    replace(`${pathname}?${params.toString()}`);
  }, 300);

  return (
    <div className="relative flex items-center w-full sm:max-w-xs group">
      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
        <MagnifyingGlassIcon className="h-4 w-4 text-gray-400 group-focus-within:text-[#485696] transition-colors" />
      </div>
      <input
        type="text"
        defaultValue={defaultValue}
        onChange={(e) => handleSearch(e.target.value)}
        placeholder="Buscar por nombre..."
        className="block w-full rounded-xl border border-gray-300 py-2.5 pl-9 pr-4 text-sm text-gray-900 focus:border-[#485696] focus:ring-1 focus:ring-[#485696] focus:outline-none transition-all shadow-sm hover:border-gray-400"
      />
    </div>
  );
}
