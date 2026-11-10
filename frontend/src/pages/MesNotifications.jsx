import { Link } from "react-router-dom";
import { Bell, Mail, MessageCircle, Smartphone } from "lucide-react";
import PageHeader from "@/components/common/PageHeader";
import EmptyState from "@/components/common/EmptyState";
import Pagination from "@/components/common/Pagination";
import { usePaginatedList } from "@/hooks/usePaginatedList";
import { formatDate } from "@/lib/logistics";
import { panelClass } from "@/lib/uiClasses";

const CANAUX = {
  WhatsApp: { Icon: MessageCircle, color: "#22C55E" },
  SMS: { Icon: Smartphone, color: "#38A6DE" },
  Email: { Icon: Mail, color: "#A855F7" },
};

// Messages réellement envoyés au client (les brouillons « En attente » restent internes).
export default function MesNotifications() {
  const liste = usePaginatedList({
    entity: "NotificationLog",
    filter: { statut: "Envoyée" },
    sort: "-created_date",
    pageSize: 10,
  });

  return (
    <div className="space-y-5">
      <PageHeader title="Mes notifications" subtitle="Les messages qui vous ont été envoyés au sujet de vos colis." />

      {liste.loading ? (
        <div className={`${panelClass} px-5 py-14 text-center text-[12.5px] text-white/35`}>Chargement…</div>
      ) : liste.items.length === 0 ? (
        <div className={panelClass}><EmptyState message="Aucune notification pour le moment." /></div>
      ) : (
        <div className={`${panelClass} divide-y divide-white/[0.05]`}>
          {liste.items.map((n) => {
            const { Icon, color } = CANAUX[n.canal] || { Icon: Bell, color: "#9CA3AF" };
            return (
              <div key={n.id} className="flex items-start gap-3 p-4 sm:px-5">
                <span className="mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-xl" style={{ background: `${color}1F` }}>
                  <Icon className="h-4 w-4" style={{ color }} />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-0.5">
                    {n.colis_id ? (
                      <Link to={`/suivi/${n.colis_id}`} className="text-[13px] font-medium text-white hover:text-[#FF7A3D]">{n.colis_reference}</Link>
                    ) : (
                      <span className="text-[13px] font-medium text-white">{n.colis_reference || "Information"}</span>
                    )}
                    <span className="text-[11px] text-white/35">{n.canal} · {formatDate(n.date_envoi || n.created_date)}</span>
                  </div>
                  <p className="mt-1 text-[12.5px] leading-relaxed text-white/65">{n.message}</p>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <Pagination page={liste.page} pageCount={liste.pageCount} total={liste.total} pageSize={liste.pageSize} onPageChange={liste.setPage} />
    </div>
  );
}
