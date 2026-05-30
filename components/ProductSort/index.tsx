"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useTransition } from "react";

const SORT_OPTIONS = [
  { value: "", label: "Más relevantes" },
  { value: "ascendingPrice", label: "Menor precio" },
  { value: "descendingPrice", label: "Mayor precio" },
];

export default function ProductSort() {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { replace } = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleSort = (value: string) => {
    const params = new URLSearchParams(searchParams);
    if (value) {
      params.set("sort", value);
    } else {
      params.delete("sort");
    }
    // Always reset page to 1 when sorting
    params.delete("page");

    startTransition(() => {
      replace(`${pathname}?${params.toString()}`);
    });
  };

  return (
    <div className="flex items-center gap-2">
      <label htmlFor="sort-filter" className="text-sm font-medium text-gray-700 hidden sm:block">
        Ordenar por:
      </label>
      <div className="relative">
        <select
          id="sort-filter"
          defaultValue={searchParams.get("sort") || ""}
          onChange={(e) => handleSort(e.target.value)}
          disabled={isPending}
          className="appearance-none h-10 rounded-lg border border-gray-200 bg-white px-4 py-2 pr-8 text-sm font-medium text-[#1F2937] outline-none transition hover:border-[#485696]/50 focus:border-[#485696] focus:ring-1 focus:ring-[#485696] disabled:opacity-50"
        >
          {SORT_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-500">
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>
    </div>
  );
}
