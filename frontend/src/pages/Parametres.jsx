import { MessageCircle, Mail, Smartphone, Scale, ShieldCheck } from "lucide-react";
import PageHeader from "@/components/common/PageHeader";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { TARIFS, DIVISEUR_AERIEN, formatFCFA } from "@/lib/logistics";
import { panelClass } from "@/lib/uiClasses";

const CANAUX = [
  { Icon: Mail, nom: "Email", etat: "Disponible", couleur: "#A855F7", note: "Envoi via la plateforme vers les clients enregistrés." },
  { Icon: MessageCircle, nom: "WhatsApp", etat: "Envoi manuel", couleur: "#22C55E", note: "Le message est généré, il s'ouvre dans WhatsApp pour un envoi immédiat." },
  { Icon: Smartphone, nom: "SMS", etat: "Non connecté", couleur: "#38A6DE", note: "Nécessite un compte opérateur SMS pour un envoi automatique." },
];

export default function Parametres() {
  const user = useCurrentUser();

  return (
    <div className="space-y-5">
      <PageHeader title="Paramètres" subtitle="Compte, règles de facturation et canaux de notification." />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <section className={`${panelClass} p-5`}>
          <h2 className="mb-4 font-display text-[14px] font-semibold text-white">Compte connecté</h2>
          <div className="flex items-center gap-3">
            <span className="grid h-11 w-11 place-items-center rounded-full bg-gradient-to-br from-[#FF4500]/80 to-[#A855F7]/70 text-[13px] font-semibold text-white">
              {(user?.full_name || "WC").split(" ").slice(0, 2).map((p) => p[0]).join("")}
            </span>
            <div className="min-w-0">
              <p className="truncate text-[13px] font-medium text-white">{user?.full_name || "—"}</p>
              <p className="truncate text-[11.5px] text-white/40">{user?.email || "—"}</p>
            </div>
          </div>
          <div className="mt-4 flex items-center gap-2 rounded-xl border border-white/[0.06] bg-[#121316] px-3 py-2.5">
            <ShieldCheck className="h-4 w-4 text-[#4ADE80]" />
            <span className="text-[11.5px] text-white/55">
              Rôle : <span className="text-white/85">{user?.permissions?.role_label || "—"}</span>
            </span>
          </div>
        </section>

        <section className={`${panelClass} p-5`}>
          <h2 className="mb-4 font-display text-[14px] font-semibold text-white">Grille tarifaire active</h2>
          <ul className="space-y-2.5 text-[12.5px]">
            <li className="flex items-center justify-between"><span className="text-white/55">Aérien standard</span><span className="text-white/85">{formatFCFA(TARIFS.aerien.standard)} / kg</span></li>
            <li className="flex items-center justify-between"><span className="text-white/55">Aérien Priority Express</span><span className="text-white/85">{formatFCFA(TARIFS.aerien.express)} / kg</span></li>
            <li className="flex items-center justify-between"><span className="text-white/55">Maritime standard</span><span className="text-white/85">{formatFCFA(TARIFS.maritime.standard)} / CBM</span></li>
            <li className="flex items-center justify-between"><span className="text-white/55">Maritime Express</span><span className="text-white/85">{formatFCFA(TARIFS.maritime.express)} / CBM</span></li>
          </ul>
          <div className="mt-4 flex items-center gap-2 rounded-xl border border-white/[0.06] bg-[#121316] px-3 py-2.5">
            <Scale className="h-4 w-4 text-[#38A6DE]" />
            <span className="text-[11.5px] text-white/55">Diviseur volumétrique aérien : {DIVISEUR_AERIEN}</span>
          </div>
        </section>
      </div>

      <section className={`${panelClass} p-5`}>
        <h2 className="mb-1 font-display text-[14px] font-semibold text-white">Canaux de notification</h2>
        <p className="mb-4 text-[11.5px] text-white/35">Déclencheur : passage au statut « Disponible à l'agence ».</p>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          {CANAUX.map(({ Icon, nom, etat, couleur, note }) => (
            <div key={nom} className="rounded-xl border border-white/[0.06] bg-[#121316] p-4">
              <div className="flex items-center justify-between">
                <Icon className="h-4 w-4" style={{ color: couleur }} />
                <span className="rounded-full px-2 py-0.5 text-[10px] text-white/50 ring-1 ring-inset ring-white/10">{etat}</span>
              </div>
              <p className="mt-2 text-[12.5px] font-medium text-white/85">{nom}</p>
              <p className="mt-1 text-[11px] leading-snug text-white/35">{note}</p>
            </div>
          ))}
        </div>
      </section>

      <section className={`${panelClass} p-5`}>
        <h2 className="mb-3 font-display text-[14px] font-semibold text-white">Règles métier appliquées</h2>
        <ul className="space-y-2 text-[12.5px] text-white/55">
          <li>• Une commande Webdadd peut être scindée en plusieurs sous-colis suivis indépendamment.</li>
          <li>• Un colis ne peut pas avoir deux références identiques.</li>
          <li>• Le rappel de la pièce d'identité est inclus dans chaque notification de disponibilité.</li>
          <li>• Sept statuts jalonnent le cycle : entrepôt Chine, chargement, transit, dédouanement, agence, livré, retiré.</li>
        </ul>
      </section>
    </div>
  );
}