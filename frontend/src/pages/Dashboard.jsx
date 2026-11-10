import { ShoppingBag, Truck, PackageCheck, Users } from "lucide-react";
import { useDashboardData } from "@/hooks/useDashboardData";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import StatCard from "@/components/dashboard/StatCard";
import CommandesChart from "@/components/dashboard/CommandesChart";
import StatutDonut from "@/components/dashboard/StatutDonut";
import DernieresCommandes from "@/components/dashboard/DernieresCommandes";
import ProchainsCargos from "@/components/dashboard/ProchainsCargos";
import NotificationsRecentes from "@/components/dashboard/NotificationsRecentes";
import ActionsRapides from "@/components/dashboard/ActionsRapides";
import CalculateurCout from "@/components/CalculateurCout";
import { formatNombre } from "@/lib/logistics";

export default function Dashboard() {
  const { stats, series, statuts, totalStatuts, commandes, cargos, notifications } = useDashboardData();
  const user = useCurrentUser();
  const prenom = (user?.full_name || "").split(" ")[0];

  return (
    <div className="space-y-5">
      <div className="wsc-rise">
        <h1 className="font-display text-[22px] font-bold tracking-tight text-white sm:text-[26px]">
          Bonjour {prenom || "à vous"} 👋
        </h1>
        <p className="mt-1 text-[13px] text-muted-foreground">Voici un aperçu de vos opérations logistiques aujourd'hui.</p>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
        <StatCard
          title="Commandes totales"
          value={stats.commandes}
          icon={ShoppingBag}
          accentRgb="255,69,0"
          details={[
            { label: "En cours d'achat", value: formatNombre(stats.enAchat) },
            { label: "En entrepôt", value: formatNombre(stats.enEntrepot) },
          ]}
        />
        <StatCard
          title="Colis en transit"
          value={stats.enTransit}
          icon={Truck}
          accentRgb="56,166,222"
          details={[
            { label: "En douane", value: formatNombre(stats.douane) },
            { label: "Chargement", value: formatNombre(stats.chargement) },
          ]}
        />
        <StatCard
          title="Colis disponibles"
          value={stats.disponibles}
          icon={PackageCheck}
          accentRgb="34,197,94"
          details={[
            { label: "À l'agence", value: formatNombre(stats.disponibles) },
            { label: "Retirés", value: formatNombre(stats.retires) },
          ]}
        />
        <StatCard
          title="Clients actifs"
          value={stats.clients}
          icon={Users}
          accentRgb="168,85,247"
          details={[
            { label: "Fiches clients", value: formatNombre(stats.clients) },
            { label: "Colis livrés", value: formatNombre(stats.livres) },
          ]}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <div className="xl:col-span-2">
          <CommandesChart series={series} />
        </div>
        <StatutDonut statuts={statuts} total={totalStatuts} />
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <div className="space-y-4 xl:col-span-2">
          <DernieresCommandes commandes={commandes} />
          <CalculateurCout />
        </div>
        <div className="space-y-4">
          <ProchainsCargos cargos={cargos} />
          <NotificationsRecentes notifications={notifications} />
        </div>
      </div>

      <ActionsRapides />
    </div>
  );
}