import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Search } from "lucide-react";
import PageHeader from "@/components/common/PageHeader";
import StatutBadge from "@/components/common/StatutBadge";
import EmptyState from "@/components/common/EmptyState";
import Pagination from "@/components/common/Pagination";
import { usePaginatedList } from "@/hooks/usePaginatedList";
import { formatDate, formatFCFA, formatNombre } from "@/lib/logistics";
import { inputClass, panelClass } from "@/lib/uiClasses";

// Commandes du client connecté (l'API ne renvoie que les siennes).
export default function MesCommandes() {
  const [q, setQ] = useState("");
  const liste = usePaginatedList({ entity: "Commande", search: q, sort: "-date_commande", pageSize: 10 });

  return (
    <div className="space-y-5">
      <PageHeader title="Mes commandes" subtitle="Vos achats Webdadd et les colis qui les composent." />

      <div className="relative max-w-md">
        <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-white/30" />
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="N° de commande ou article…" className={`${inputClass} pl-10`} />
      </div>

      {liste.loading ? (
        <div className={`${panelClass} px-5 py-14 text-center text-[12.5px] text-white/35`}>Chargement…</div>
      ) : liste.items.length === 0 ? (
        <div className={panelClass}><EmptyState message="Aucune commande pour le moment." /></div>
      ) : (
        <div className="space-y-2.5">
          {liste.items.map((c) => (
            <Link
              key={c.id}
              to={`/commandes/${c.id}`}
              className={`${panelClass} group block p-4 transition-colors hover:border-white/[0.14] sm:p-5`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-display text-[14.5px] font-semibold text-white">{c.reference}</p>
                  <p className="text-[11.5px] text-white/40">Passée le {formatDate(c.date_commande)}</p>
                </div>
                <StatutBadge statut={c.statut} />
              </div>
              <p className="mt-2 line-clamp-2 text-[13px] text-white/70">{c.description || "—"}</p>
              <div className="mt-3 flex flex-wrap items-center justify-between gap-x-4 gap-y-1 border-t border-white/[0.05] pt-3 text-[12px]">
                <span className="text-white/50">
                  Valeur <span className="text-[#38A6DE]">{c.montant_marchandise ? formatFCFA(c.montant_marchandise) : "—"}</span>
                </span>
                <span className="text-white/50">
                  {c.poids_total ? `${formatNombre(c.poids_total)} kg` : ""}{c.poids_total && c.cbm_total ? " · " : ""}{c.cbm_total ? `${c.cbm_total} m³` : ""}
                </span>
                <span className="flex items-center gap-1 text-white/40 group-hover:text-[#FF7A3D]">
                  Voir les colis <ArrowRight className="h-3 w-3" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}

      <Pagination page={liste.page} pageCount={liste.pageCount} total={liste.total} pageSize={liste.pageSize} onPageChange={liste.setPage} />
    </div>
  );
}
