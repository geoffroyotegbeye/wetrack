import { useNavigate } from "react-router-dom";
import { CircleUser, LogOut } from "lucide-react";
import { api } from "@/api/client";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { usePermissions } from "@/lib/permissions";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// Avatar en haut à droite : accès au compte et déconnexion.
export default function UserMenu() {
  const user = useCurrentUser();
  const { roleLabel } = usePermissions();
  const navigate = useNavigate();
  const initiales = (user?.full_name || user?.email || "?").split(/[\s@.]/).filter(Boolean).slice(0, 2).map((p) => p[0]).join("").toUpperCase();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-white/[0.06] bg-[#121316] text-[11px] font-semibold text-white transition-colors hover:border-white/20"
          aria-label="Mon compte et déconnexion"
        >
          <span className="grid h-7 w-7 place-items-center rounded-full bg-gradient-to-br from-[#FF4500]/80 to-[#A855F7]/70">{initiales}</span>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-60 border-white/10 bg-[#1E1F24] text-white">
        <DropdownMenuLabel className="font-normal">
          <p className="truncate text-[13px] font-medium text-white">{user?.full_name || "—"}</p>
          <p className="truncate text-[11.5px] text-white/45">{user?.email}</p>
          <p className="mt-0.5 text-[11px] text-white/35">{roleLabel}</p>
        </DropdownMenuLabel>
        <DropdownMenuSeparator className="bg-white/10" />
        <DropdownMenuItem onSelect={() => navigate("/mon-compte")} className="cursor-pointer gap-2 text-[13px] focus:bg-white/5 focus:text-white">
          <CircleUser className="h-4 w-4" /> Mon compte
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={() => api.auth.logout()} className="cursor-pointer gap-2 text-[13px] text-[#FF7A3D] focus:bg-[#FF4500]/10 focus:text-[#FF7A3D]">
          <LogOut className="h-4 w-4" /> Se déconnecter
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
