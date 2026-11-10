import { Link, useNavigate } from "react-router-dom";
import { Eye, ArrowRight } from "lucide-react";
import { formatDateCourt, formatNombre, statutClasses } from "@/lib/logistics";

export default function DernieresCommandes({ commandes = [] }) {
  const navigate = useNavigate();

  return (
    <section className="overflow-hidden rounded-2xl border border-white/[0.06] bg-[#1E1F24]">
      <div className="flex items-center justify-between px-5 py-4">
        <h2 className="font-display text-[15px] font-semibold text-white">Mes dernières commandes</h2>
        <Link to="/commandes" className="flex items-center gap-1 text-[11.5px] text-[#FF7A3D] hover:text-[#FF9A6B]">
          Tout voir <ArrowRight className="h-3 w-3" />
        </Link>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[680px] text-left">
          <thead>
            <tr className="border-y border-white/[0.05] bg-white/[0.015] text-[10.5px] uppercase tracking-wider text-white/40">
              <th className="px-5 py-2.5 font-medium">N° Commande</th>
              <th className="px-3 py-2.5 font-medium">Client</th>
              <th className="px-3 py-2.5 font-medium">Poids</th>
              <th className="px-3 py-2.5 font-medium">Volume</th>
              <th className="px-3 py-2.5 font-medium">Statut</th>
              <th className="px-3 py-2.5 font-medium">Date</th>
              <th className="px-5 py-2.5 text-right font-medium">Action</th>
            </tr>
          </thead>
          <tbody>
            {commandes.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-5 py-10 text-center text-[12.5px] text-white/35">
                  Aucune commande enregistrée pour l'instant.
                </td>
              </tr>
            ) : (
              commandes.map((c) => (
                <tr key={c.id} className="border-b border-white/[0.04] text-[12.5px] transition-colors last:border-0 hover:bg-white/[0.025]">
                  <td className="px-5 py-3 font-medium text-white/90">{c.reference}</td>
                  <td className="px-3 py-3 text-white/65">{c.client_nom}</td>
                  <td className="px-3 py-3 text-white/65">{formatNombre(c.poids)} kg</td>
                  <td className="px-3 py-3 text-white/65">{c.cbm ? `${c.cbm} m³` : "—"}</td>
                  <td className="px-3 py-3">
                    <span className={`inline-flex rounded-full px-2.5 py-1 text-[10.5px] font-medium ring-1 ring-inset ${statutClasses(c.statut)}`}>
                      {c.statut}
                    </span>
                  </td>
                  <td className="px-3 py-3 text-white/55">{formatDateCourt(c.eta)}</td>
                  <td className="px-5 py-3 text-right">
                    <button
                      onClick={() => navigate(`/commandes/${c.id}`)}
                      className="rounded-lg border border-white/[0.08] p-1.5 text-white/50 transition-colors hover:border-[#FF4500]/40 hover:text-[#FF7A3D]"
                      aria-label={`Voir la commande ${c.reference}`}
                    >
                      <Eye className="h-[14px] w-[14px]" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}