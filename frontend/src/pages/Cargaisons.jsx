import { useState } from "react";
import { Plane, Ship, MapPin } from "lucide-react";
import PageHeader from "@/components/common/PageHeader";
import StatutBadge from "@/components/common/StatutBadge";
import EmptyState from "@/components/common/EmptyState";
import { formatDate, formatNombre } from "@/lib/logistics";
import { panelClass } from "@/lib/uiClasses";
import FilterChips from "@/components/common/FilterChips";
import Pagination from "@/components/common/Pagination";
import { usePaginatedList } from "@/hooks/usePaginatedList";

export default function Cargaisons() {
  const [type, setType] = useState("Tous");

  const liste = usePaginatedList({
    entity: "Cargaison",
    filter: type === "Tous" ? {} : { type },
    sort: "-date_depart",
    pageSize: 6,
  });
  const { items, loading } = liste;

  return (
    <div className="space-y-5">
      <PageHeader title="Cargaisons" subtitle="Vols aériens et départs maritimes depuis la Chine vers l'Afrique." />

      <FilterChips options={["Tous", "Aérien", "Maritime"]} value={type} onChange={setType} />

      {loading ? (
        <div className={`${panelClass} px-5 py-14 text-center text-[12.5px] text-white/35`}>Chargement…</div>
      ) : items.length === 0 ? (
        <div className={panelClass}><EmptyState message="Aucune cargaison programmée." /></div>
      ) : (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {items.map((c) => {
            const Icon = c.type === "Aérien" ? Plane : Ship;
            const capacite = Number(c.capacite) || 0;
            const charge = Number(c.charge) || 0;
            const remplissage = capacite ? Math.min(100, Math.round((charge / capacite) * 100)) : 0;
            return (
              <article key={c.id} className="rounded-2xl border border-white/[0.06] bg-[#1E1F24] p-5">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span className="grid h-10 w-10 place-items-center rounded-xl bg-[#FF4500]/10">
                      <Icon className="h-[18px] w-[18px] text-[#FF7A3D]" strokeWidth={1.8} />
                    </span>
                    <div>
                      <p className="font-display text-[14px] font-semibold text-white">{c.code}</p>
                      <p className="text-[11px] text-white/40">{c.transporteur || c.type}</p>
                    </div>
                  </div>
                  <StatutBadge statut={c.statut} />
                </div>

                <div className="mt-4 flex items-center gap-2 text-[12px] text-white/65">
                  <MapPin className="h-3.5 w-3.5 text-white/30" />
                  {c.origine} <span className="text-white/25">→</span> {c.destination}
                </div>

                <div className="mt-3 flex items-center justify-between text-[11px] text-white/40">
                  <span>Départ {formatDate(c.date_depart)}</span>
                  <span>Arrivée {formatDate(c.date_arrivee)}</span>
                </div>

                <div className="mt-4">
                  <div className="mb-1.5 flex items-center justify-between text-[11px]">
                    <span className="text-white/40">Chargement</span>
                    <span className="text-white/70">
                      {formatNombre(charge)} / {formatNombre(capacite)} {c.type === "Aérien" ? "kg" : "CBM"}
                    </span>
                  </div>
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/[0.06]">
                    <div className="h-full rounded-full bg-gradient-to-r from-[#FF4500] to-[#38A6DE]" style={{ width: `${remplissage}%` }} />
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}

      <Pagination page={liste.page} pageCount={liste.pageCount} total={liste.total} pageSize={liste.pageSize} onPageChange={liste.setPage} />
    </div>
  );
}