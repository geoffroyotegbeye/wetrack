import { useState } from "react";
import { Mail, MapPin, Phone, Plus, Search } from "lucide-react";
import PageHeader from "@/components/common/PageHeader";
import EmptyState from "@/components/common/EmptyState";
import NouveauClientDialog from "@/components/clients/NouveauClientDialog";
import { btnPrimary, inputClass, panelClass } from "@/lib/uiClasses";
import { usePermissions } from "@/lib/permissions";
import Pagination from "@/components/common/Pagination";
import { usePaginatedList } from "@/hooks/usePaginatedList";

export default function Clients() {
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const { canWrite } = usePermissions();

  const liste = usePaginatedList({ entity: "Client", search: q, sort: "nom", pageSize: 10 });
  const { items: visibles, loading } = liste;

  return (
    <div className="space-y-5">
      <PageHeader
        title="Clients"
        subtitle="Carnet des destinataires Webdadd et leurs coordonnées de retrait."
        action={
          canWrite("Client") ? (
            <button className={btnPrimary} onClick={() => setOpen(true)}>
              <Plus className="h-4 w-4" /> Nouveau client
            </button>
          ) : null
        }
      />

      <div className="relative max-w-md">
        <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-white/30" />
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Nom, ville ou téléphone…" className={`${inputClass} pl-10`} />
      </div>

      {/* Mobile : cartes */}
      <div className="space-y-2.5 md:hidden">
        {loading ? (
          <div className={`${panelClass} px-5 py-12 text-center text-[12.5px] text-white/35`}>Chargement…</div>
        ) : visibles.length === 0 ? (
          <div className={panelClass}><EmptyState message="Aucun client enregistré." /></div>
        ) : (
          visibles.map((c) => (
            <div key={c.id} className={`${panelClass} p-4`}>
              <div className="flex items-center gap-3">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-gradient-to-br from-[#FF4500]/70 to-[#A855F7]/60 text-[11px] font-semibold text-white">
                  {c.nom?.split(" ").slice(0, 2).map((p) => p[0]).join("")}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium text-white/90">{c.nom}</p>
                  <p className="text-[11px] text-white/40">{c.code_client || "—"}</p>
                </div>
              </div>
              <div className="mt-3 space-y-1.5 border-t border-white/[0.05] pt-3 text-[12.5px]">
                {c.telephone && (
                  <a href={`tel:${c.telephone.replace(/\s/g, "")}`} className="flex items-center gap-2 text-white/70">
                    <Phone className="h-3.5 w-3.5 text-white/35" /> {c.telephone}
                  </a>
                )}
                {c.email && (
                  <a href={`mailto:${c.email}`} className="flex min-w-0 items-center gap-2 text-white/60">
                    <Mail className="h-3.5 w-3.5 shrink-0 text-white/35" /> <span className="truncate">{c.email}</span>
                  </a>
                )}
                {(c.ville || c.pays) && (
                  <p className="flex items-center gap-2 text-white/55">
                    <MapPin className="h-3.5 w-3.5 text-white/35" /> {[c.ville, c.pays].filter(Boolean).join(", ")}
                  </p>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Écran large : tableau */}
      <div className={`hidden overflow-hidden md:block ${panelClass}`}>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[680px] text-left">
            <thead>
              <tr className="border-b border-white/[0.05] bg-white/[0.015] text-[10.5px] uppercase tracking-wider text-white/40">
                <th className="px-5 py-3 font-medium">Client</th>
                <th className="px-3 py-3 font-medium">Code</th>
                <th className="px-3 py-3 font-medium">Téléphone</th>
                <th className="px-3 py-3 font-medium">Email</th>
                <th className="px-5 py-3 font-medium">Localisation</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={5} className="px-5 py-12 text-center text-[12.5px] text-white/35">Chargement…</td></tr>
              ) : visibles.length === 0 ? (
                <tr><td colSpan={5}><EmptyState message="Aucun client enregistré." /></td></tr>
              ) : (
                visibles.map((c) => (
                  <tr key={c.id} className="border-b border-white/[0.04] text-[12.5px] last:border-0 hover:bg-white/[0.025]">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2.5">
                        <span className="grid h-8 w-8 place-items-center rounded-full bg-gradient-to-br from-[#FF4500]/70 to-[#A855F7]/60 text-[10px] font-semibold text-white">
                          {c.nom?.split(" ").slice(0, 2).map((p) => p[0]).join("")}
                        </span>
                        <span className="font-medium text-white/90">{c.nom}</span>
                      </div>
                    </td>
                    <td className="px-3 py-3 text-white/45">{c.code_client || "—"}</td>
                    <td className="px-3 py-3 text-white/65">{c.telephone || "—"}</td>
                    <td className="px-3 py-3 text-white/55">{c.email || "—"}</td>
                    <td className="px-5 py-3 text-white/55">{[c.ville, c.pays].filter(Boolean).join(", ") || "—"}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Pagination page={liste.page} pageCount={liste.pageCount} total={liste.total} pageSize={liste.pageSize} onPageChange={liste.setPage} />

      <NouveauClientDialog open={open} onOpenChange={setOpen} onCreated={liste.reload} />

    </div>
  );
}