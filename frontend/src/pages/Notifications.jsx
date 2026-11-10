import { useState } from "react";
import { MessageCircle, Mail, Smartphone, Bell, Copy, Check } from "lucide-react";
import { api } from "@/api/client";
import PageHeader from "@/components/common/PageHeader";
import EmptyState from "@/components/common/EmptyState";
import { formatDate } from "@/lib/logistics";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { panelClass } from "@/lib/uiClasses";
import FilterChips from "@/components/common/FilterChips";
import Pagination from "@/components/common/Pagination";
import { usePaginatedList } from "@/hooks/usePaginatedList";
import { usePermissions } from "@/lib/permissions";

const CANAUX = {
  SMS: { Icon: Smartphone, color: "#38A6DE" },
  WhatsApp: { Icon: MessageCircle, color: "#22C55E" },
  Email: { Icon: Mail, color: "#A855F7" },
  Système: { Icon: Bell, color: "#9CA3AF" },
};

const FILTRES = ["Toutes", "SMS", "WhatsApp", "Email", "Système"];

export default function Notifications() {
  const { canWrite } = usePermissions();
  const [filtre, setFiltre] = useState("Toutes");
  const [selected, setSelected] = useState(null);
  const [copie, setCopie] = useState(false);

  const liste = usePaginatedList({
    entity: "NotificationLog",
    filter: filtre === "Toutes" ? {} : { canal: filtre },
    sort: "-created_date",
    pageSize: 10,
  });
  const { items, loading } = liste;

  const marquerEnvoyee = async (n) => {
    await api.entities.NotificationLog.update(n.id, { statut: "Envoyée" });
    setSelected((s) => (s ? { ...s, statut: "Envoyée" } : s));
    liste.reload();
  };

  const copier = async (texte) => {
    await navigator.clipboard.writeText(texte);
    setCopie(true);
    setTimeout(() => setCopie(false), 2000);
  };

  return (
    <div className="space-y-5">
      <PageHeader
        title="Notifications"
        subtitle="Messages générés lors du passage au statut « Disponible à l'agence », avec rappel de la pièce d'identité."
      />

      <FilterChips options={FILTRES} value={filtre} onChange={setFiltre} />

      {loading ? (
        <div className={`${panelClass} px-5 py-14 text-center text-[12.5px] text-white/35`}>Chargement…</div>
      ) : items.length === 0 ? (
        <div className={panelClass}><EmptyState message="Aucune notification. Passez un colis au statut « Disponible à l'agence » pour en générer une." /></div>
      ) : (
        <div className={`divide-y divide-white/[0.05] ${panelClass}`}>
          {items.map((n) => {
            const { Icon, color } = CANAUX[n.canal] || CANAUX["Système"];
            return (
              <button key={n.id} onClick={() => { setSelected(n); setCopie(false); }} className="flex w-full items-start gap-3 px-5 py-4 text-left transition-colors hover:bg-white/[0.025]">
                <span className="mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-xl" style={{ background: `${color}1F` }}>
                  <Icon className="h-[16px] w-[16px]" style={{ color }} />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-[12.5px] font-medium text-white/90">{n.colis_reference}</p>
                    <span className="text-[11px] text-white/35">{n.client_nom}</span>
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ring-1 ring-inset ${
                      n.statut === "Envoyée" ? "bg-[#22C55E]/15 text-[#4ADE80] ring-[#22C55E]/25" : "bg-[#F59E0B]/15 text-[#FBBF24] ring-[#F59E0B]/25"
                    }`}>
                      {n.statut}
                    </span>
                  </div>
                  <p className="mt-1 line-clamp-2 text-[11.5px] leading-snug text-white/50">{n.message}</p>
                  <p className="mt-1 text-[10.5px] text-white/30">{n.canal} · {formatDate(n.date_envoi)}</p>
                </div>
              </button>
            );
          })}
        </div>
      )}

      <Pagination page={liste.page} pageCount={liste.pageCount} total={liste.total} pageSize={liste.pageSize} onPageChange={liste.setPage} />

      <Dialog open={!!selected} onOpenChange={(o) => !o && setSelected(null)}>
        <DialogContent className="max-w-lg border-white/10 bg-[#1E1F24] text-white">
          <DialogHeader>
            <DialogTitle className="font-display text-[15px]">Notification — {selected?.colis_reference}</DialogTitle>
          </DialogHeader>
          <p className="whitespace-pre-wrap rounded-xl border border-white/[0.06] bg-[#121316] p-4 text-[12.5px] leading-relaxed text-white/75">
            {selected?.message}
          </p>
          <div className="flex flex-wrap gap-2">
            {selected?.destinataire ? (
              <a
                href={`https://wa.me/${selected.destinataire.replace(/[^\d]/g, "")}?text=${encodeURIComponent(selected.message)}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 rounded-xl bg-[#22C55E] px-3 py-2 text-[11.5px] font-medium text-white hover:bg-[#16a34a]"
              >
                <MessageCircle className="h-3.5 w-3.5" /> Ouvrir WhatsApp
              </a>
            ) : null}
            <button onClick={() => copier(selected?.message || "")} className="inline-flex items-center gap-1.5 rounded-xl border border-white/[0.12] px-3 py-2 text-[11.5px] text-white/75 hover:text-white">
              {copie ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />} {copie ? "Copié" : "Copier"}
            </button>
            {selected?.statut !== "Envoyée" && canWrite("NotificationLog") ? (
              <button onClick={() => marquerEnvoyee(selected)} className="inline-flex items-center gap-1.5 rounded-xl border border-white/[0.12] px-3 py-2 text-[11.5px] text-white/75 hover:text-white">
                Marquer comme envoyée
              </button>
            ) : null}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}