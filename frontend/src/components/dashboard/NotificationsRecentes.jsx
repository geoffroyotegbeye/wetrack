import { Link } from "react-router-dom";
import { CheckCircle2, Plane, Info, MessageSquare, ArrowRight } from "lucide-react";
import { formatDateCourt } from "@/lib/logistics";

const ICONS = {
  disponible: { Icon: CheckCircle2, color: "#22C55E" },
  transit: { Icon: Plane, color: "#38A6DE" },
  info: { Icon: Info, color: "#FF4500" },
  message: { Icon: MessageSquare, color: "#A855F7" },
};

export default function NotificationsRecentes({ notifications = [] }) {
  return (
    <section className="rounded-2xl border border-white/[0.06] bg-[#1E1F24] p-5">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="font-display text-[15px] font-semibold text-white">Notifications récentes</h2>
        <Link to="/notifications" className="flex items-center gap-1 text-[11.5px] text-[#FF7A3D] hover:text-[#FF9A6B]">
          Voir tout <ArrowRight className="h-3 w-3" />
        </Link>
      </div>

      {notifications.length === 0 ? (
        <p className="py-6 text-center text-[12.5px] text-white/35">Aucune notification pour le moment.</p>
      ) : (
        <ul className="space-y-3">
          {notifications.slice(0, 4).map((n) => {
            const { Icon, color } = ICONS[n.type] || ICONS.info;
            return (
              <li key={n.id} className="flex gap-3">
                <span className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-lg" style={{ background: `${color}1F` }}>
                  <Icon className="h-[15px] w-[15px]" style={{ color }} />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="line-clamp-2 text-[12.5px] leading-snug text-white/80">{n.texte}</p>
                  <p className="mt-0.5 text-[10.5px] text-white/35">
                    {formatDateCourt(n.date)} · {n.canal}
                  </p>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}