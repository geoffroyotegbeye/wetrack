import { cn } from "@/lib/utils";

/**
 * Icône Wetrack : le « W » orange avec l'avion (sans texte).
 * Fichier : public/images/logo/wetrack-icon.png
 */
export default function WebCargoMark({ className = "h-10 w-10" }) {
  return (
    <img
      src="/images/logo/wetrack-icon.png"
      alt="Wetrack"
      className={cn("rounded-xl object-cover", className)}
      draggable={false}
    />
  );
}

/**
 * Logo complet : « W » + Wetrack + slogan « Achetez - Suivez - Recevez ».
 * Fichier : public/images/logo/wetrack-logo.png
 */
export function WebCargoLogo({ className = "h-16 w-auto" }) {
  return (
    <img
      src="/images/logo/wetrack-logo.png"
      alt="Wetrack — Achetez, Suivez, Recevez"
      className={cn("rounded-lg object-contain", className)}
      draggable={false}
    />
  );
}
