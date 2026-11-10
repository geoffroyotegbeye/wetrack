import { Clock, IdCard, MapPin, MessageCircle, Navigation, Phone } from "lucide-react";
import { AGENCE, RAPPEL_PIECE_IDENTITE } from "@/lib/agence";
import { panelClass } from "@/lib/uiClasses";

// Carte « Où retirer mes colis » : adresse, horaires, contacts (champs vides masqués).
export default function AgenceRetrait({ className = "" }) {
  const lien = "inline-flex items-center gap-1.5 rounded-xl border border-white/[0.1] px-3 py-2 text-[12px] text-white/75 hover:border-white/25 hover:text-white";
  return (
    <section className={`${panelClass} p-4 sm:p-5 ${className}`}>
      <h2 className="font-display text-[14px] font-semibold text-white">Où retirer mes colis</h2>
      <p className="mt-3 flex items-start gap-2 text-[13px] text-white/80">
        <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-[#FF7A3D]" />
        <span>
          {AGENCE.nom}
          {AGENCE.adresse ? <span className="block text-[12px] text-white/50">{AGENCE.adresse}</span> : null}
        </span>
      </p>
      {AGENCE.horaires.length ? (
        <div className="mt-3 flex items-start gap-2 text-[12.5px] text-white/65">
          <Clock className="mt-0.5 h-4 w-4 shrink-0 text-white/40" />
          <ul className="space-y-0.5">
            {AGENCE.horaires.map((h) => (
              <li key={h.jours}><span className="text-white/80">{h.jours}</span> · {h.heures}</li>
            ))}
          </ul>
        </div>
      ) : null}
      <p className="mt-3 flex items-start gap-2 text-[12.5px] font-medium text-[#FBBF24]">
        <IdCard className="mt-0.5 h-4 w-4 shrink-0" /> {RAPPEL_PIECE_IDENTITE}
      </p>
      {AGENCE.telephone || AGENCE.whatsapp || AGENCE.carte ? (
        <div className="mt-4 flex flex-wrap gap-2">
          {AGENCE.telephone ? (
            <a href={`tel:${AGENCE.telephone.replace(/\s/g, "")}`} className={lien}><Phone className="h-3.5 w-3.5" /> Appeler</a>
          ) : null}
          {AGENCE.whatsapp ? (
            <a href={`https://wa.me/${AGENCE.whatsapp}`} target="_blank" rel="noreferrer" className={lien}><MessageCircle className="h-3.5 w-3.5" /> WhatsApp</a>
          ) : null}
          {AGENCE.carte ? (
            <a href={AGENCE.carte} target="_blank" rel="noreferrer" className={lien}><Navigation className="h-3.5 w-3.5" /> Itinéraire</a>
          ) : null}
        </div>
      ) : null}
    </section>
  );
}
