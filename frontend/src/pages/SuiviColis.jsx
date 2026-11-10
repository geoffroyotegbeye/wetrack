import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Search, ArrowRight } from "lucide-react";
import PageHeader from "@/components/common/PageHeader";
import StatutBadge from "@/components/common/StatutBadge";
import EmptyState from "@/components/common/EmptyState";
import { STATUTS_COLIS, formatDateCourt, formatFCFA } from "@/lib/logistics";
import { inputClass, panelClass } from "@/lib/uiClasses";
import FilterChips from "@/components/common/FilterChips";
import Pagination from "@/components/common/Pagination";
import { usePaginatedList } from "@/hooks/usePaginatedList";

const FILTRES = ["Tous", ...STATUTS_COLIS];

export default function SuiviColis() {
  const [statut, setStatut] = useState("Tous");
  const [searchParams, setSearchParams] = useSearchParams();
  const [q, setQ] = useState(searchParams.get("q") || "");
  const navigate = useNavigate();

  // La recherche de la barre du haut arrive par l'URL (?q=...).
  const qUrl = searchParams.get("q") || "";
  useEffect(() => {
    setQ(qUrl);
  }, [qUrl]);

  const liste = usePaginatedList({
    entity: "Colis",
    filter: statut === "Tous" ? {} : { statut },
    search: q,
    sort: "-created_date",
    pageSize: 6,
  });
  const { items: visibles, loading } = liste;

  return (
    <div className="space-y-5">
      <PageHeader title="Suivi des colis" subtitle="Traçabilité étape par étape, de l'entrepôt en Chine jusqu'à l'agence." />

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative min-w-[220px] flex-1">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-white/30" />
          <input
            value={q}
            onChange={(e) => {
              setQ(e.target.value);
              setSearchParams(e.target.value ? { q: e.target.value } : {});
            }}
            placeholder="Rechercher un colis, un client, une commande…"
            className={`${inputClass} pl-10`}
          />
        </div>
        <FilterChips options={FILTRES} value={statut} onChange={setStatut} className="w-full sm:w-auto" />
      </div>

      {loading ? (
        <div className={`${panelClass} px-5 py-14 text-center text-[12.5px] text-white/35`}>Chargement des colis…</div>
      ) : visibles.length === 0 ? (
        <div className={panelClass}><EmptyState message="Aucun colis ne correspond à cette recherche." /></div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {visibles.map((c) => (
            <button
              key={c.id}
              onClick={() => navigate(`/suivi/${c.id}`)}
              className="group rounded-2xl border border-white/[0.06] bg-[#1E1F24] p-4 text-left transition-all hover:-translate-y-0.5 hover:border-white/[0.14]"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="truncate font-display text-[13.5px] font-semibold text-white">{c.reference}</p>
                  <p className="truncate text-[11.5px] text-white/40">{c.client_nom}</p>
                </div>
                <StatutBadge statut={c.statut} />
              </div>

              <p className="mt-3 truncate text-[12px] text-white/60">{c.description || "—"}</p>

              <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-white/[0.06]">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-[#38A6DE] to-[#22C55E] transition-all"
                  style={{ width: `${Math.min(100, Number(c.progression) || 0)}%` }}
                />
              </div>

              <div className="mt-2 flex items-center justify-between text-[10.5px] text-white/35">
                <span>{c.mode} · {c.cargo_code || "—"}</span>
                <span>ETA {formatDateCourt(c.eta)}</span>
              </div>

              <div className="mt-3 flex items-center justify-between border-t border-white/[0.05] pt-3">
                <span className="text-[11px] font-medium text-[#38A6DE]">{formatFCFA(c.cout_fret)}</span>
                <span className="flex items-center gap-1 text-[11px] text-white/35 group-hover:text-[#FF7A3D]">
                  Détail <ArrowRight className="h-3 w-3" />
                </span>
              </div>
            </button>
          ))}
        </div>
      )}

      <Pagination page={liste.page} pageCount={liste.pageCount} total={liste.total} pageSize={liste.pageSize} onPageChange={liste.setPage} />
    </div>
  );
}