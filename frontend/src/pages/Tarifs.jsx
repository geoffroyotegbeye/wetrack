import { Plane, Ship, Info } from "lucide-react";
import PageHeader from "@/components/common/PageHeader";
import CalculateurCout from "@/components/CalculateurCout";
import { TARIFS, DIVISEUR_AERIEN, formatFCFA } from "@/lib/logistics";
import { panelClass } from "@/lib/uiClasses";

const GRILLE = [
  { mode: "Aérien", service: "Standard", prix: TARIFS.aerien.standard, unite: "/ kg", Icon: Plane, color: "#FF4500" },
  { mode: "Aérien", service: "Priority Express", prix: TARIFS.aerien.express, unite: "/ kg", Icon: Plane, color: "#FF7A3D" },
  { mode: "Maritime", service: "Standard", prix: TARIFS.maritime.standard, unite: "/ CBM", Icon: Ship, color: "#38A6DE" },
  { mode: "Maritime", service: "Express", prix: TARIFS.maritime.express, unite: "/ CBM", Icon: Ship, color: "#A855F7" },
];

export default function Tarifs() {
  return (
    <div className="space-y-5">
      <PageHeader title="Tarifs & Calculateur" subtitle="Grilles officielles du fret Chine → Afrique et simulation instantanée." />

      <div className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
        {GRILLE.map(({ mode, service, prix, unite, Icon, color }) => (
          <article key={`${mode}-${service}`} className="min-w-0 rounded-2xl border border-white/[0.06] bg-[#1E1F24] p-3.5 sm:p-5">
            <div className="flex items-center justify-between">
              <span className="grid h-8 w-8 place-items-center rounded-xl sm:h-9 sm:w-9" style={{ background: `${color}1A` }}>
                <Icon className="h-4 w-4" style={{ color }} strokeWidth={1.9} />
              </span>
              <span className="text-[10px] uppercase tracking-wider text-white/35">{mode}</span>
            </div>
            <p className="mt-2.5 text-[11.5px] text-white/50 sm:mt-3 sm:text-[12px]">{service}</p>
            <p className="font-display text-[15px] font-bold leading-tight text-white sm:text-[19px]">
              {formatFCFA(prix)}
              <span className="ml-1 whitespace-nowrap text-[10.5px] font-normal text-white/35 sm:text-[11px]">{unite}</span>
            </p>
          </article>
        ))}
      </div>

      <CalculateurCout />

      <div className={`${panelClass} p-5`}>
        <div className="mb-3 flex items-center gap-2">
          <Info className="h-4 w-4 text-[#38A6DE]" />
          <h2 className="font-display text-[14px] font-semibold text-white">Règles de calcul</h2>
        </div>
        <ul className="space-y-2 text-[12.5px] leading-relaxed text-white/55">
          <li>• <span className="text-white/80">Fret aérien</span> : facturation au kilo taxable = le plus élevé entre le poids réel et le poids volumétrique.</li>
          <li>• Poids volumétrique = (Longueur × Largeur × Hauteur) ÷ {DIVISEUR_AERIEN}, dimensions en centimètres.</li>
          <li>• <span className="text-white/80">Fret maritime</span> : facturation au volume en CBM (mètre cube), sans conversion de poids.</li>
          <li>• Les frais de dédouanement et d'acheminement sont estimés séparément selon la valeur déclarée des marchandises.</li>
        </ul>
      </div>
    </div>
  );
}