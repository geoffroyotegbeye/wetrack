import { useAuth } from "@/lib/AuthContext";

// Les permissions viennent du backend (GET /api/auth/me) : aucune règle n'est dupliquée ici.
// Le backend reste le garde-fou ; côté interface on se contente de masquer ce qui est interdit.
export function usePermissions() {
  const { user } = useAuth();
  const p = user?.permissions;
  return {
    role: p?.role,
    roleLabel: p?.role_label || "",
    isAdmin: p?.role === "admin",
    canPage: (page) => Boolean(p?.pages?.includes(page)),
    canWrite: (entity) => Boolean(p?.write?.includes(entity)),
    canDelete: Boolean(p?.delete),
    canFunction: (name) => Boolean(p?.functions?.includes(name)),
    // null = tous les statuts autorisés
    statutsColis: (tous) => (p?.statuts_colis === null || p?.statuts_colis === undefined ? tous : tous.filter((s) => p.statuts_colis.includes(s))),
  };
}

export const ROLE_COULEURS = {
  admin: "bg-[#FF4500]/15 text-[#FF7A3D] ring-[#FF4500]/30",
  gestionnaire: "bg-[#38A6DE]/15 text-[#5FBBEC] ring-[#38A6DE]/30",
  agent_chine: "bg-[#F59E0B]/15 text-[#FBBF24] ring-[#F59E0B]/30",
  agent_agence: "bg-[#22C55E]/15 text-[#4ADE80] ring-[#22C55E]/30",
  lecteur: "bg-white/5 text-[#94A3B8] ring-white/10",
};
