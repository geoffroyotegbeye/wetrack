import { Link } from "react-router-dom";
import { ShieldAlert } from "lucide-react";
import { usePermissions } from "@/lib/permissions";
import { panelClass } from "@/lib/uiClasses";

// Affiche la page seulement si le rôle de l'utilisateur y a accès.
export default function RequirePage({ page, children }) {
  const { canPage, roleLabel } = usePermissions();
  if (canPage(page)) return children;
  return (
    <div className={`${panelClass} mx-auto mt-6 max-w-md p-8 text-center`}>
      <span className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-[#FF4500]/10">
        <ShieldAlert className="h-6 w-6 text-[#FF7A3D]" />
      </span>
      <h1 className="mt-4 font-display text-[18px] font-semibold text-white">Accès non autorisé</h1>
      <p className="mt-2 text-[13px] text-white/55">
        Votre rôle{roleLabel ? ` « ${roleLabel} »` : ""} ne permet pas d'accéder à cette page.
      </p>
      <Link to="/" className="mt-5 inline-block text-[13px] font-medium text-[#FF7A3D] hover:underline">
        Retour au tableau de bord
      </Link>
    </div>
  );
}
