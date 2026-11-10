import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Plus, Search, Eye } from "lucide-react";
import { api } from "@/api/client";
import PageHeader from "@/components/common/PageHeader";
import StatutBadge from "@/components/common/StatutBadge";
import EmptyState from "@/components/common/EmptyState";
import NouvelleCommandeDialog from "@/components/commandes/NouvelleCommandeDialog";
import { STATUTS_COMMANDE, formatDate, formatFCFA } from "@/lib/logistics";
import { btnPrimary, inputClass, panelClass } from "@/lib/uiClasses";
import FilterChips from "@/components/common/FilterChips";
import Pagination from "@/components/common/Pagination";
import { usePaginatedList } from "@/hooks/usePaginatedList";
import { usePermissions } from "@/lib/permissions";

export default function Commandes() {
  const [clients, setClients] = useState([]);
  const [statut, setStatut] = useState("Toutes");
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { canWrite } = usePermissions();
  const peutCreer = canWrite("Commande");

  const liste = usePaginatedList({
    entity: "Commande",
    filter: statut === "Toutes" ? {} : { statut },
    search: q,
    sort: "-created_date",
    pageSize: 10,
  });
  const { items: filtrees, loading } = liste;

  useEffect(() => {
    // Liste complète pour le sélecteur du formulaire « Nouvelle commande ».
    api.entities.Client.list({ sort: "nom", limit: 1000 }).then((page) => setClients(page?.items || []));
  }, []);

  useEffect(() => {
    if (searchParams.get("nouvelle") && peutCreer) setOpen(true);
  }, [searchParams]);

  const filtres = ["Toutes", ...STATUTS_COMMANDE];

  return (
    <div className="space-y-5">
      <PageHeader
        title="Commandes"
        subtitle="Toutes les commandes validées sur Webdadd et transférées vers WebCargo."
        action={
          peutCreer ? (
            <button className={btnPrimary} onClick={() => setOpen(true)}>
              <Plus className="h-4 w-4" /> Nouvelle commande
            </button>
          ) : null
        }
      />

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative min-w-[220px] flex-1">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-white/30" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Référence ou client…"
            className={`${inputClass} pl-10`}
          />
        </div>
        <FilterChips options={filtres} value={statut} onChange={setStatut} className="w-full sm:w-auto" />
      </div>

      {/* Mobile : cartes */}
      <div className="space-y-2.5 md:hidden">
        {loading ? (
          <div className={`${panelClass} px-5 py-12 text-center text-[12.5px] text-white/35`}>Chargement…</div>
        ) : filtrees.length === 0 ? (
          <div className={panelClass}><EmptyState message="Aucune commande ne correspond à cette recherche." /></div>
        ) : (
          filtrees.map((c) => (
            <Link
              key={c.id}
              to={`/commandes/${c.id}`}
              className={`${panelClass} block p-4 transition-colors active:bg-white/[0.03]`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-display text-[14px] font-semibold text-white">{c.reference}</p>
                  <p className="truncate text-[12px] text-white/55">{c.client_nom || "—"}</p>
                </div>
                <StatutBadge statut={c.statut} />
              </div>
              <p className="mt-2 line-clamp-2 text-[12.5px] text-white/60">{c.description || "—"}</p>
              <div className="mt-3 flex items-center justify-between border-t border-white/[0.05] pt-3 text-[12px]">
                <span className="text-[#38A6DE]">{c.montant_marchandise ? formatFCFA(c.montant_marchandise) : "—"}</span>
                <span className="text-white/40">{formatDate(c.date_commande)}</span>
              </div>
            </Link>
          ))
        )}
      </div>

      {/* Écran large : tableau */}
      <div className={`hidden overflow-hidden md:block ${panelClass}`}>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-left">
            <thead>
              <tr className="border-b border-white/[0.05] bg-white/[0.015] text-[10.5px] uppercase tracking-wider text-white/40">
                <th className="px-5 py-3 font-medium">Référence</th>
                <th className="px-3 py-3 font-medium">Client</th>
                <th className="px-3 py-3 font-medium">Marchandise</th>
                <th className="px-3 py-3 font-medium">Valeur</th>
                <th className="px-3 py-3 font-medium">Statut</th>
                <th className="px-3 py-3 font-medium">Date</th>
                <th className="px-5 py-3 text-right font-medium">Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={7} className="px-5 py-12 text-center text-[12.5px] text-white/35">Chargement…</td></tr>
              ) : filtrees.length === 0 ? (
                <tr><td colSpan={7}><EmptyState message="Aucune commande ne correspond à cette recherche." /></td></tr>
              ) : (
                filtrees.map((c) => (
                  <tr key={c.id} className="border-b border-white/[0.04] text-[12.5px] last:border-0 hover:bg-white/[0.025]">
                    <td className="px-5 py-3 font-medium text-white/90">{c.reference}</td>
                    <td className="px-3 py-3 text-white/65">{c.client_nom || "—"}</td>
                    <td className="max-w-[220px] truncate px-3 py-3 text-white/55">{c.description || "—"}</td>
                    <td className="px-3 py-3 text-white/65">{c.montant_marchandise ? formatFCFA(c.montant_marchandise) : "—"}</td>
                    <td className="px-3 py-3"><StatutBadge statut={c.statut} /></td>
                    <td className="px-3 py-3 text-white/45">{formatDate(c.date_commande)}</td>
                    <td className="px-5 py-3 text-right">
                      <Link
                        to={`/commandes/${c.id}`}
                        className="inline-flex rounded-lg border border-white/[0.08] p-1.5 text-white/50 hover:border-[#FF4500]/40 hover:text-[#FF7A3D]"
                        aria-label={`Voir ${c.reference}`}
                      >
                        <Eye className="h-[14px] w-[14px]" />
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Pagination
        page={liste.page}
        pageCount={liste.pageCount}
        total={liste.total}
        pageSize={liste.pageSize}
        onPageChange={liste.setPage}
      />

      <NouvelleCommandeDialog
        open={open}
        onOpenChange={setOpen}
        clients={clients}
        onCreated={(commande) => {
          setOpen(false);
          liste.reload();
          navigate(`/commandes/${commande.id}`);
        }}
      />
    </div>
  );
}