import { useState } from "react";
import { Link } from "react-router-dom";
import { Plane, Ship, ArrowRight } from "lucide-react";
import { formatDate } from "@/lib/logistics";

export default function ProchainsCargos({ cargos = { aeriens: [], maritimes: [] } }) {
  const [tab, setTab] = useState("aerien");
  const list = tab === "aerien" ? cargos.aeriens || [] : cargos.maritimes || [];
  const Icon = tab === "aerien" ? Plane : Ship;

  return (
    <section className="rounded-2xl border border-white/[0.06] bg-[#1E1F24] p-5">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="font-display text-[15px] font-semibold text-white">Prochains cargos</h2>
        <Link to="/cargaisons" className="flex items-center gap-1 text-[11.5px] text-[#FF7A3D] hover:text-[#FF9A6B]">
          Planning <ArrowRight className="h-3 w-3" />
        </Link>
      </div>

      <div className="mb-4 flex gap-1 rounded-xl border border-white/[0.06] bg-[#121316] p-0.5">
        {[
          { key: "aerien", label: "Aériens" },
          { key: "maritime", label: "Maritimes" },
        ].map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`flex-1 rounded-[9px] px-3 py-1.5 text-[11.5px] font-medium transition-colors ${
              tab === t.key ? "bg-white/[0.07] text-white" : "text-white/45 hover:text-white/75"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {list.length === 0 ? (
        <p className="py-6 text-center text-[12.5px] text-white/35">Aucun cargo programmé.</p>
      ) : (
        <ul className="space-y-3">
          {list.slice(0, 3).map((c) => (
            <li key={c.code} className="flex items-center gap-3 rounded-xl border border-white/[0.05] bg-white/[0.02] p-3">
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-[#FF4500]/10">
                <Icon className="h-4 w-4 text-[#FF7A3D]" strokeWidth={1.8} />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-[12.5px] font-medium text-white/90">{c.code}</p>
                <p className="truncate text-[11px] text-white/40">
                  {c.origine} → {c.destination}
                </p>
              </div>
              <div className="shrink-0 text-right">
                <p className="text-[11px] text-white/60">{formatDate(c.date)}</p>
                <p
                  className={`text-[10.5px] ${
                    c.etat === "En transit"
                      ? "text-[#5FBBEC]"
                      : c.etat === "Arrivé"
                        ? "text-[#4ADE80]"
                        : "text-white/35"
                  }`}
                >
                  {c.etat}
                </p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}