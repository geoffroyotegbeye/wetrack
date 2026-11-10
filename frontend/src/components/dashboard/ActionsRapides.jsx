import { Link } from "react-router-dom";
import { PlusCircle, BellRing, BarChart3, Tags, ArrowUpRight } from "lucide-react";
import { usePermissions } from "@/lib/permissions";

const ACTIONS = [
  { label: "Ajouter une commande", hint: "Nouvelle expédition", icon: PlusCircle, to: "/commandes?nouvelle=1", color: "#FF4500", ok: (p) => p.canWrite("Commande") },
  { label: "Envoyer une notification", hint: "SMS / WhatsApp", icon: BellRing, to: "/notifications", color: "#38A6DE", ok: (p) => p.canPage("notifications") },
  { label: "Voir les rapports", hint: "Analyses & volumes", icon: BarChart3, to: "/rapports", color: "#22C55E", ok: (p) => p.canPage("rapports") },
  { label: "Gérer les tarifs", hint: "Aérien & maritime", icon: Tags, to: "/tarifs", color: "#A855F7", ok: (p) => p.canPage("tarifs") },
];

export default function ActionsRapides() {
  const permissions = usePermissions();
  const actions = ACTIONS.filter((a) => a.ok(permissions));
  if (!actions.length) return null;
  return (
    <section>
      <h2 className="mb-3 font-display text-[15px] font-semibold text-white">Actions rapides</h2>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {actions.map(({ label, hint, icon: Icon, to, color }) => (
          <Link
            key={label}
            to={to}
            className="group flex items-center gap-3 rounded-2xl border border-white/[0.06] bg-[#1E1F24] p-4 transition-all hover:-translate-y-0.5 hover:border-white/[0.14]"
          >
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl" style={{ background: `${color}1A` }}>
              <Icon className="h-[18px] w-[18px]" style={{ color }} strokeWidth={1.9} />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-[12.5px] font-medium leading-snug text-white/90">{label}</span>
              <span className="block truncate text-[11px] text-white/35">{hint}</span>
            </span>
            <ArrowUpRight className="h-4 w-4 shrink-0 text-white/20 transition-colors group-hover:text-[#FF7A3D]" />
          </Link>
        ))}
      </div>
    </section>
  );
}