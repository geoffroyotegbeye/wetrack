import { Check } from "lucide-react";
import { api } from "@/api/client";
import DateField from "@/components/commandes/DateField";
import { ETAPE_COMMANDE, ETAPE_FOURNISSEUR, formatDateCourt } from "@/lib/logistics";
import { panelClass } from "@/lib/uiClasses";

const plusAncienne = (dates) => dates.filter(Boolean).sort()[0] || null;

// Avancement d'une commande, de l'achat en Chine jusqu'à la livraison.
// L'équipe (droit d'écriture sur les commandes) renseigne la date fournisseur et la date d'arrivée prévue.
export default function SuiviCommande({ commande, colis, editable, onChange }) {
  const partis = colis.filter((c) => c.statut && c.statut !== "En entrepôt Chine");
  const etapes = [
    { label: ETAPE_COMMANDE, fait: true, date: commande.date_commande },
    { label: ETAPE_FOURNISSEUR, fait: Boolean(commande.date_commande_fournisseur), date: commande.date_commande_fournisseur },
    { label: "Reçue en entrepôt Chine", fait: colis.length > 0, date: plusAncienne(colis.map((c) => c.created_date)) },
    { label: "Expédiée", fait: partis.length > 0, date: null },
    { label: "Livrée", fait: commande.statut === "Livrée", date: null },
  ];
  const courante = etapes.findIndex((e) => !e.fait);

  const enregistrerFournisseur = async (date) => {
    const maj = { date_commande_fournisseur: date };
    // Achat passé chez le fournisseur : la commande est au minimum « En préparation ».
    if (date && ["En attente", "Validée"].includes(commande.statut)) maj.statut = "En préparation";
    await api.entities.Commande.update(commande.id, maj);
    await onChange?.();
  };

  const enregistrerArrivee = async (date, { option }) => {
    await api.entities.Commande.update(commande.id, { date_arrivee_prevue: date });
    if (option && colis.length) {
      await Promise.all(colis.map((c) => api.entities.Colis.update(c.id, { eta: date })));
    }
    await onChange?.();
  };

  return (
    <section className={`${panelClass} p-4 sm:p-5`}>
      <h2 className="mb-4 font-display text-[14px] font-semibold text-white">Suivi de la commande</h2>

      <ol className="grid gap-3 md:grid-cols-5 md:gap-2">
        {etapes.map((e, i) => {
          const active = i === courante;
          return (
            <li key={e.label} className="flex items-start gap-3 md:flex-col md:items-center md:text-center">
              <span
                className={`grid h-7 w-7 shrink-0 place-items-center rounded-full text-[11px] font-semibold ${
                  e.fait ? "bg-[#22C55E] text-white" : active ? "border-2 border-[#FF4500] text-[#FF7A3D]" : "border border-white/15 text-white/35"
                }`}
              >
                {e.fait ? <Check className="h-4 w-4" /> : i + 1}
              </span>
              <div className="min-w-0">
                <p className={`text-[12.5px] leading-snug ${e.fait ? "text-white/90" : active ? "text-white" : "text-white/40"}`}>{e.label}</p>
                <p className="text-[11px] text-white/35">{e.date ? formatDateCourt(e.date) : e.fait ? "" : active ? "En cours" : "À venir"}</p>
              </div>
            </li>
          );
        })}
      </ol>

      <div className="mt-5 grid grid-cols-1 gap-4 border-t border-white/[0.05] pt-4 sm:grid-cols-2">
        <DateField
          label="Commandé auprès du fournisseur le"
          value={commande.date_commande_fournisseur}
          editable={editable}
          onSave={enregistrerFournisseur}
          placeholder="Pas encore commandé"
        />
        <DateField
          label="Arrivée prévue"
          value={commande.date_arrivee_prevue}
          editable={editable}
          onSave={enregistrerArrivee}
          option={colis.length ? `Appliquer aussi aux ${colis.length} colis de la commande` : null}
          placeholder="À définir"
        />
      </div>
    </section>
  );
}
