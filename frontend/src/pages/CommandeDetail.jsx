import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, Plus, Package } from "lucide-react";
import { api } from "@/api/client";
import StatutBadge from "@/components/common/StatutBadge";
import EmptyState from "@/components/common/EmptyState";
import ScinderColisDialog from "@/components/commandes/ScinderColisDialog";
import { formatDate, formatFCFA, formatNombre, formatDateCourt } from "@/lib/logistics";
import { btnPrimary, panelClass } from "@/lib/uiClasses";
import { usePermissions } from "@/lib/permissions";

export default function CommandeDetail() {
  const { canWrite } = usePermissions();
  const { id } = useParams();
  const [commande, setCommande] = useState(null);
  const [colis, setColis] = useState([]);
  const [open, setOpen] = useState(false);
  const [erreur, setErreur] = useState("");

  const load = async () => {
    const c = await api.entities.Commande.get(id).catch(() => null);
    if (!c) {
      setErreur("Commande introuvable.");
      return;
    }
    setCommande(c);
    const page = await api.entities.Colis.filter({ commande_id: id }, { sort: "-created_date", limit: 100 });
    setColis(page?.items || []);
  };

  useEffect(() => {
    setErreur("");
    load();
  }, [id]);

  if (erreur) {
    return (
      <div className={`${panelClass} p-10 text-center`}>
        <p className="text-[13px] text-white/60">{erreur}</p>
        <Link to="/commandes" className="mt-3 inline-block text-[12.5px] text-[#FF7A3D]">Retour aux commandes</Link>
      </div>
    );
  }

  if (!commande) {
    return <div className={`${panelClass} p-10 text-center text-[13px] text-white/35`}>Chargement…</div>;
  }

  const infos = [
    { label: "Client", value: commande.client_nom || "—" },
    { label: "Téléphone", value: commande.client_telephone || "—" },
    { label: "Marchandise", value: commande.description || "—" },
    { label: "Valeur déclarée", value: commande.montant_marchandise ? formatFCFA(commande.montant_marchandise) : "—" },
    { label: "Poids total", value: `${formatNombre(commande.poids_total)} kg` },
    { label: "Volume total", value: commande.cbm_total ? `${commande.cbm_total} m³` : "—" },
    { label: "Date de commande", value: formatDate(commande.date_commande) },
  ];

  return (
    <div className="space-y-5">
      <div className="wsc-rise flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <Link to="/commandes" className="mb-2 inline-flex items-center gap-1.5 text-[12px] text-white/40 hover:text-white/70">
            <ArrowLeft className="h-3.5 w-3.5" /> Commandes
          </Link>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="font-display text-[21px] font-bold tracking-tight text-white sm:text-[25px]">{commande.reference}</h1>
            <StatutBadge statut={commande.statut} />
          </div>
        </div>
        {canWrite("Colis") ? (
          <button className={`${btnPrimary} w-full sm:w-auto`} onClick={() => setOpen(true)}>
            <Plus className="h-4 w-4" /> Scinder en colis
          </button>
        ) : null}
      </div>

      <div className={`${panelClass} p-5`}>
        <h2 className="mb-4 font-display text-[14px] font-semibold text-white">Informations</h2>
        <dl className="grid grid-cols-2 gap-x-4 gap-y-4 lg:grid-cols-4">
          {infos.map((i) => (
            <div key={i.label}>
              <dt className="text-[10.5px] uppercase tracking-wider text-white/35">{i.label}</dt>
              <dd className="mt-0.5 break-words text-[12.5px] text-white/85">{i.value}</dd>
            </div>
          ))}
        </dl>
      </div>

      <div className={panelClass}>
        <div className="flex items-center justify-between px-5 py-4">
          <h2 className="font-display text-[14px] font-semibold text-white">Colis liés ({colis.length})</h2>
        </div>
        {colis.length === 0 ? (
          <EmptyState message="Aucun colis pour cette commande. Utilisez « Scinder en colis » pour créer les sous-colis." />
        ) : (
          <div className="divide-y divide-white/[0.05] border-t border-white/[0.05]">
            {colis.map((c) => (
              <Link
                key={c.id}
                to={`/suivi/${c.id}`}
                className="grid grid-cols-[auto_1fr] items-center gap-x-3 gap-y-2 px-4 py-3.5 transition-colors hover:bg-white/[0.025] sm:flex sm:px-5"
              >
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-[#FF4500]/10">
                  <Package className="h-4 w-4 text-[#FF7A3D]" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="whitespace-nowrap text-[12.5px] font-medium text-white/90">{c.reference}</p>
                  <p className="truncate text-[11px] text-white/40">{c.description || "—"} · {c.mode}</p>
                </div>
                <div className="col-start-2 flex flex-wrap items-center justify-between gap-2 sm:contents">
                  <StatutBadge statut={c.statut} />
                  <div className="shrink-0 text-[11px] text-white/45 sm:w-24 sm:text-right">ETA {formatDateCourt(c.eta)}</div>
                  <div className="shrink-0 text-[11.5px] font-medium text-[#38A6DE] sm:w-24 sm:text-right">{formatFCFA(c.cout_fret)}</div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      <ScinderColisDialog open={open} onOpenChange={setOpen} commande={commande} colisExistants={colis} onCreated={load} />
    </div>
  );
}