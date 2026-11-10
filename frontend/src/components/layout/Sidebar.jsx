import { NavLink } from "react-router-dom";
import {
  LayoutDashboard, ShoppingBag, PackageSearch, Ship, Bell, Users,
  Calculator, BarChart3, Settings, LifeBuoy, Plane, LogOut, X, UserCog, PackageOpen, ReceiptText, MessageSquareText, CircleUser,
} from "lucide-react";
import { api } from "@/api/client";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { usePermissions } from "@/lib/permissions";
import WebCargoMark from "@/components/WebCargoMark";

const NAV = [
  { label: "Mes colis", path: "/mes-colis", icon: PackageOpen, page: "espace_client" },
  { label: "Mes commandes", path: "/mes-commandes", icon: ReceiptText, page: "mes_commandes" },
  { label: "Mes notifications", path: "/mes-notifications", icon: MessageSquareText, page: "mes_notifications" },
  { label: "Tableau de bord", path: "/", icon: LayoutDashboard, page: "dashboard" },
  { label: "Commandes", path: "/commandes", icon: ShoppingBag, page: "commandes" },
  { label: "Suivi des colis", path: "/suivi", icon: PackageSearch, page: "suivi" },
  { label: "Cargaisons", path: "/cargaisons", icon: Ship, page: "cargaisons" },
  { label: "Notifications", path: "/notifications", icon: Bell, page: "notifications" },
  { label: "Clients", path: "/clients", icon: Users, page: "clients" },
  { label: "Tarifs & Calculateur", path: "/tarifs", icon: Calculator, page: "tarifs" },
  { label: "Rapports & Analyses", path: "/rapports", icon: BarChart3, page: "rapports" },
  { label: "Utilisateurs", path: "/utilisateurs", icon: UserCog, page: "utilisateurs" },
  { label: "Paramètres", path: "/parametres", icon: Settings, page: "parametres" },
  { label: "Mon compte", path: "/mon-compte", icon: CircleUser, page: "compte" },
];

export default function Sidebar({ open, onClose }) {
  const user = useCurrentUser();
  const { canPage, roleLabel } = usePermissions();
  const initiales = (user?.full_name || "WC")
    .split(" ")
    .slice(0, 2)
    .map((p) => p[0])
    .join("")
    .toUpperCase();

  return (
    <>
      {open ? (
        <div className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm lg:hidden" onClick={onClose} aria-hidden="true" />
      ) : null}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-[264px] flex-col border-r border-white/[0.06] bg-[#0D0E11] transition-transform duration-300 lg:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between px-5 pb-6 pt-6">
          <div className="flex items-center gap-2.5">
            <WebCargoMark className="h-9 w-9 shrink-0" />
            <div className="leading-tight">
              <p className="font-display text-[17px] font-bold tracking-tight text-white">Wetrack</p>
              <p className="text-[10px] uppercase tracking-[0.18em] text-white/35">by Webdadd</p>
            </div>
          </div>
          <button onClick={onClose} className="rounded-lg p-1.5 text-white/50 hover:bg-white/5 hover:text-white lg:hidden" aria-label="Fermer le menu">
            <X className="h-4 w-4" />
          </button>
        </div>

        <nav className="flex-1 space-y-0.5 overflow-y-auto px-3">
          {NAV.filter((item) => canPage(item.page)).map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === "/"}
                onClick={onClose}
                className={({ isActive }) =>
                  `group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-[13.5px] transition-colors ${
                    isActive
                      ? "bg-[#FF4500]/12 font-medium text-white"
                      : "text-white/55 hover:bg-white/[0.04] hover:text-white/90"
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <span
                      className={`absolute left-0 top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-r-full bg-[#FF4500] transition-opacity ${
                        isActive ? "opacity-100" : "opacity-0"
                      }`}
                    />
                    <Icon className={`h-[17px] w-[17px] shrink-0 ${isActive ? "text-[#FF7A3D]" : "text-white/40 group-hover:text-white/70"}`} strokeWidth={1.9} />
                    <span className="truncate">{item.label}</span>
                  </>
                )}
              </NavLink>
            );
          })}
        </nav>

        <div className="space-y-3 px-3 pb-4 pt-3">
          <a
            href="mailto:support@webdadd.com"
            className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-[13.5px] text-white/55 transition-colors hover:bg-white/[0.04] hover:text-white/90"
          >
            <LifeBuoy className="h-[17px] w-[17px] text-white/40" strokeWidth={1.9} />
            Aide &amp; Support
          </a>

          <div className="relative overflow-hidden rounded-2xl border border-[#FF4500]/20 bg-[radial-gradient(120%_120%_at_0%_0%,rgba(255,69,0,0.28),rgba(255,69,0,0.04)_60%,transparent)] p-4">
            <Plane className="absolute -right-2 -top-1 h-14 w-14 rotate-12 text-[#FF4500]/20" strokeWidth={1.2} />
            <Ship className="absolute -bottom-3 right-6 h-14 w-14 -rotate-6 text-[#38A6DE]/15" strokeWidth={1.2} />
            <p className="font-display text-[13px] font-semibold text-white">Wetrack</p>
            <p className="mt-1 max-w-[9rem] text-[11.5px] leading-snug text-white/55">Votre colis, notre priorité !</p>
          </div>

          <div className="flex items-center gap-3 rounded-2xl border border-white/[0.06] bg-white/[0.02] p-2.5">
            <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-gradient-to-br from-[#FF4500]/80 to-[#A855F7]/70 text-[11px] font-semibold text-white">
              {initiales}
            </div>
            <div className="min-w-0 flex-1 leading-tight">
              <p className="truncate text-[12.5px] font-medium text-white">{user?.full_name || "Chargement…"}</p>
              <p className="truncate text-[10.5px] text-white/40">{roleLabel || "—"}</p>
            </div>
            <button
              onClick={() => api.auth.logout()}
              className="rounded-lg p-1.5 text-white/35 transition-colors hover:bg-white/5 hover:text-[#FF7A3D]"
              aria-label="Se déconnecter"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}