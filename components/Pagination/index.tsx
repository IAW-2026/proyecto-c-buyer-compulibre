import Link from "next/link";

interface PaginationProps {
  page: number;
  totalPages: number;
  /** Todos los search params actuales de la URL (search, category, etc.) */
  searchParams: Record<string, string>;
}

/** Construye la URL preservando los filtros actuales y cambiando solo ?page */
function buildPageUrl(
  searchParams: Record<string, string>,
  targetPage: number
): string {
  const params = new URLSearchParams({ ...searchParams, page: String(targetPage) });
  return `?${params.toString()}`;
}

/**
 * Calcula los números de página a mostrar con ellipsis.
 * Siempre muestra: primera, última, página actual y sus vecinas inmediatas.
 * Ejemplo para 10 páginas en página 5: [1, "...", 4, 5, 6, "...", 10]
 */
function getPageNumbers(current: number, total: number): (number | "...")[] {
  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }

  const pages: (number | "...")[] = [];
  const neighbors = new Set([1, total, current - 1, current, current + 1].filter(
    (n) => n >= 1 && n <= total
  ));

  let prev: number | null = null;
  for (const n of [...neighbors].sort((a, b) => a - b)) {
    if (prev !== null && n - prev > 1) pages.push("...");
    pages.push(n);
    prev = n;
  }
  return pages;
}

export default function Pagination({ page, totalPages, searchParams }: PaginationProps) {
  if (!totalPages || totalPages <= 1) return null;

  const pageNumbers = getPageNumbers(page, totalPages);
  const hasPrev = page > 1;
  const hasNext = page < totalPages;

  const baseClass =
    "inline-flex h-9 min-w-9 items-center justify-center rounded-lg px-3 text-sm font-medium transition-colors";
  const activeClass = "bg-[#485696] text-white shadow-sm";
  const defaultClass = "text-[#1F2937] hover:bg-gray-200";
  const disabledClass = "text-[#6B7280] cursor-not-allowed pointer-events-none";

  return (
    <nav aria-label="Paginación" className="flex items-center justify-center gap-1">
      {/* Botón anterior */}
      {hasPrev ? (
        <Link
          href={buildPageUrl(searchParams, page - 1)}
          className={`${baseClass} ${defaultClass}`}
          aria-label="Página anterior"
        >
          ← Anterior
        </Link>
      ) : (
        <span className={`${baseClass} ${disabledClass}`} aria-disabled="true">
          ← Anterior
        </span>
      )}

      {/* Números de página */}
      {pageNumbers.map((num, i) =>
        num === "..." ? (
          <span key={`ellipsis-${i}-${page}`} className={`${baseClass} text-gray-400`}>
            …
          </span>
        ) : (
          <Link
            key={num}
            href={buildPageUrl(searchParams, num)}
            className={`${baseClass} ${num === page ? activeClass : defaultClass}`}
            aria-current={num === page ? "page" : undefined}
          >
            {num}
          </Link>
        )
      )}

      {/* Botón siguiente */}
      {hasNext ? (
        <Link
          href={buildPageUrl(searchParams, page + 1)}
          className={`${baseClass} ${defaultClass}`}
          aria-label="Página siguiente"
        >
          Siguiente →
        </Link>
      ) : (
        <span className={`${baseClass} ${disabledClass}`} aria-disabled="true">
          Siguiente →
        </span>
      )}
    </nav>
  );
}
