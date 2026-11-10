import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { ArrowRight, IdCard, MapPin, PackageCheck, Search, Ship, Truck } from "lucide-react";
import { api } from "@/api/client";
import StatutBadge from "@/components/common/StatutBadge";
import EmptyState from "@/components/common/EmptyState";
import FilterChips from "@/components/common/FilterChips";
import Pagination from "@/components/common/Pagination";
import { usePaginatedList } from "@/hooks/usePaginatedList";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { formatDateCourt, formatFCFA } from "@/lib/logistics";
import { inputClass, panelClass } from "@/lib/uiClasses";

// Regroupement des statuts pour le client (vocabulaire simple).
const FILTRES = {
  Tous: null,
  "En route": ["En entrepôt Chine", "Chargement", "En transit", "En dédouanement"],
  "À retirer": ["Disponible à l'agence"],
  Terminés: ["Livré", "Retiré"],
};

function Kpi({ icon: Icon, label, value, color }) {
  return (
    <div className={`${panelClass} min-w-0 p-3.5 sm:p-4`}>
      <span className="grid h-8 w-8 place-items-center rounded-lg" style={{ background: `${color}1A` }}>
        <Icon className="h-4 w-4" style={{ color }} />
      </span>
      <p className="mt-2 font-display text-[22px] font-bold leading-none text-white">{value}</p>
      <p className="mt-1 text-[11.5px] leading-tight text-white/45">{label}</p>
    </div>
  );
}

export default function EspaceClient() {
  const user = useCurrentUser();
  const [searchParams] = useSearchParams();
  const [filtre, setFiltre] = useState("Tous");
  const [q, setQ] = useState(searchParams.get("q") || "");
  const [stats, setStats] = useState({});
  const [aRetirer, setARetirer] = useState([]);

  const statuts = FILTRES[filtre];
  const liste = usePaginatedList({
    entity: "Colis",
    filter: statuts ? { statut: { $in: statuts } } : {},
    search: q,
    sort: "-created_date",
    pageSize: 6,
  });

  useEffect(() => {
    // Compteurs par statut + colis prêts au retrait (l'API ne renvoie que les colis du client).
    api.entities.Colis.aggregate({ groupBy: "statut" }).then((r) => {
      const m = {};
      (r?.rows || []).forEach((row) => { m[row.statut] = row.count; });
      setStats(m);
    }).catch(() => {});
    api.entities.Colis.filter({ statut: "Disponible à l'agence" }, { limit: 20 })
      .then((r) => setARetirer(r?.items || []))
      .catch(() => {});
  }, []);

  const somme = (liste) => liste.reduce((t, s) => t + (stats[s] || 0), 0);
  const prenom = (user?.client?.nom || user?.full_name || "").split(" ")[0];

  return (
    <div className="space-y-5">
      <div className="wsc-rise">
        <h1 className="font-display text-[21px] font-bold tracking-tight text-white sm:text-[25px]">
          Bonjour {prenom} 👋
        </h1>
        <p className="mt-1 text-[13px] text-muted-foreground">Suivez vos commandes et vos colis, de la Chine jusqu'à l'agence.</p>
      </div>

      {aRetirer.length > 0 ? (
        <div className="rounded-2xl border border-[#22C55E]/30 bg-[#22C55E]/[0.07] p-4 sm:p-5">
          <div className="flex items-start gap-3">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[#22C55E]/15">
              <PackageCheck className="h-5 w-5 text-[#4ADE80]" />
            </span>
            <div className="min-w-0">
              <p className="font-display text-[15px] font-semibold text-white">
                {aRetirer.length === 1 ? "Un colis vous attend à l'agence" : `${aRetirer.length} colis vous attendent à l'agence`}
              </p>
              <p className="mt-1 flex items-center gap-1.5 text-[12.5px] text-white/70">
                <MapPin className="h-3.5 w-3.5 shrink-0" /> Agence Webdadd Cotonou
              </p>
              <p className="mt-1 flex items-start gap-1.5 text-[12.5px] font-medium text-[#FBBF24]">
                <IdCard className="mt-0.5 h-3.5 w-3.5 shrink-0" /> Munissez-vous obligatoirement de votre pièce d'identité pour le retrait.
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                {aRetirer.map((c) => (
                  <Link key={c.id} to={`/suivi/${c.id}`} className="rounded-lg border border-[#22C55E]/30 px-2.5 py-1 text-[12px] text-[#4ADE80] hover:bg-[#22C55E]/10">
                    {c.reference}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      ) : null}

      <div className="grid grid-cols-3 gap-3 sm:gap-4">
        <Kpi icon={Ship} label="En route" value={somme(FILTRES["En route"])} color="#38A6DE" />
        <Kpi icon={PackageCheck} label="À retirer" value={somme(FILTRES["À retirer"])} color="#22C55E" />
        <Kpi icon={Truck} label="Terminés" value={somme(FILTRES.Terminés)} color="#A855F7" />
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative min-w-[220px] flex-1">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-white/30" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="N° de colis ou de commande…" className={`${inputClass} pl-10`} />
        </div>
        <FilterChips options={Object.keys(FILTRES)} value={filtre} onChange={setFiltre} className="w-full sm:w-auto" />
      </div>

      {liste.loading ? (
        <div className={`${panelClass} px-5 py-14 text-center text-[12.5px] text-white/35`}>Chargement de vos colis…</div>
      ) : liste.items.length === 0 ? (
        <div className={panelClass}><EmptyState message="Aucun colis pour le moment." /></div>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:gap-4 md:grid-cols-2 xl:grid-cols-3">
          {liste.items.map((c) => (
            <Link
              key={c.id}
              to={`/suivi/${c.id}`}
              className="group rounded-2xl border border-white/[0.06] bg-[#1E1F24] p-4 transition-all hover:-translate-y-0.5 hover:border-white/[0.14]"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="truncate font-display text-[14px] font-semibold text-white">{c.reference}</p>
                  <p className="truncate text-[11.5px] text-white/40">Commande {c.commande_reference}</p>
                </div>
                <StatutBadge statut={c.statut} />
              </div>
              <p className="mt-3 line-clamp-2 text-[12.5px] text-white/65">{c.description || "—"}</p>
              <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-white/[0.06]">
                <div className="h-full rounded-full bg-gradient-to-r from-[#38A6DE] to-[#22C55E]" style={{ width: `${Math.min(100, Number(c.progression) || 0)}%` }} />
              </div>
              <div className="mt-2 flex items-center justify-between text-[11px] text-white/40">
                <span>{c.mode}</span>
                <span>Arrivée prévue {formatDateCourt(c.eta)}</span>
              </div>
              <div className="mt-3 flex items-center justify-between border-t border-white/[0.05] pt-3">
                <span className="text-[12px] font-medium text-[#38A6DE]">{formatFCFA(c.cout_fret)}</span>
                <span className="flex items-center gap-1 text-[11.5px] text-white/40 group-hover:text-[#FF7A3D]">
                  Suivre <ArrowRight className="h-3 w-3" />
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
