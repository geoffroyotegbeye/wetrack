import { ChevronLeft, ChevronRight } from "lucide-react";

// Numéros de page à afficher : 1 … 4 5 6 … 12
function pagesVisibles(page, pageCount) {
  if (pageCount <= 7) return Array.from({ length: pageCount }, (_, i) => i + 1);
  const pages = new Set([1, pageCount, page - 1, page, page + 1]);
  const liste = [...pages].filter((p) => p >= 1 && p <= pageCount).sort((a, b) => a - b);
  const result = [];
  liste.forEach((p, i) => {
    if (i > 0 && p - liste[i - 1] > 1) result.push(`gap-${p}`);
    result.push(p);
  });
  return result;
}

const btn =
  "grid h-9 min-w-9 place-items-center rounded-lg border px-2.5 text-[12.5px] transition-colors disabled:pointer-events-none disabled:opacity-35";

export default function Pagination({ page, pageCount, total, pageSize, onPageChange, className = "" }) {
  if (!total) return null;
  const debut = (page - 1) * pageSize + 1;
  const fin = Math.min(page * pageSize, total);
  const aller = (p) => {
    onPageChange(Math.min(Math.max(p, 1), pageCount));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <nav
      className={`flex flex-col items-center gap-3 sm:flex-row sm:justify-between ${className}`}
      aria-label="Pagination"
    >
      <p className="text-[12px] text-white/40">
        <span className="text-white/70">{debut}–{fin}</span> sur <span className="text-white/70">{total}</span>
      </p>

      {pageCount > 1 ? (
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => aller(page - 1)}
            disabled={page === 1}
            className={`${btn} border-white/[0.08] text-white/60 hover:border-white/20 hover:text-white`}
            aria-label="Page précédente"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>

          {/* Mobile : indicateur compact */}
          <span className="px-2 text-[12.5px] text-white/60 sm:hidden">
            Page <span className="text-white">{page}</span> / {pageCount}
          </span>

          {/* Écran large : numéros de page */}
          <div className="hidden items-center gap-1.5 sm:flex">
            {pagesVisibles(page, pageCount).map((p) =>
              typeof p === "string" ? (
                <span key={p} className="px-1 text-white/30">…</span>
              ) : (
                <button
                  key={p}
                  type="button"
                  onClick={() => aller(p)}
                  aria-current={p === page ? "page" : undefined}
                  className={`${btn} ${
                    p === page
                      ? "border-[#FF4500] bg-[#FF4500] font-medium text-white"
                      : "border-white/[0.08] text-white/60 hover:border-white/20 hover:text-white"
                  }`}
                >
                  {p}
                </button>
              )
            )}
          </div>

          <button
            type="button"
            onClick={() => aller(page + 1)}
            disabled={page === pageCount}
            className={`${btn} border-white/[0.08] text-white/60 hover:border-white/20 hover:text-white`}
            aria-label="Page suivante"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      ) : null}
    </nav>
  );
}
