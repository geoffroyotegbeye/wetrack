import { useAuth } from "@/lib/AuthContext";

// Utilisateur connecté (chargé une seule fois par AuthContext).
export function useCurrentUser() {
  return useAuth().user;
}
