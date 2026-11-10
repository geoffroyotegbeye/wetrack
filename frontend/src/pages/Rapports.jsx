import { useEffect, useState } from "react";
import { Bar, BarChart, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Truck, PackageCheck, Wallet, Boxes } from "lucide-react";
import { api } from "@/api/client";
import PageHeader from "@/components/common/PageHeader";
import { formatFCFA, formatNombre } from "@/lib/logistics";
import { panelClass } from "@/lib/uiClasses";

const COULEURS = ["#FF4500", "#38A6DE", "#22C55E", "#A855F7", "#F59E0B", "#64748B", "#EF4444"];

function Kpi({ icon: Icon, label, value, color }) {
  return (
    <div className="min-w-0 rounded-2xl border border-white/[0.06] bg-[#1E1F24] p-3.5 sm:p-4">
      <div className="flex items-center gap-2">
        <span className="grid h-8 w-8 place-items-center rounded-lg" style={{ background: `${color}1A` }}>
          <Icon className="h-4 w-4" style={{ color }} />
        </span>
        <span className="text-[11px] leading-tight text-white/45 sm:text-[11.5px]">{label}</span>
      </div>
      <p className="mt-2 break-words font-display text-[16px] font-bold leading-tight text-white sm:text-[19px]">{value}</p>
    </div>
  );
}

export default function Rapports() {
  const [statuts, setStatuts] = useState([]);
  const [modes, setModes] = useState([]);
  const [topClients, setTopClients] = useState([]);

  useEffect(() => {
    Promise.all([
      api.entities.Colis.aggregate({ groupBy: "statut" }),
      api.entities.Colis.aggregate({ groupBy: "mode", sum: ["cout_fret", "poids_reel"] }),
      api.entities.Colis.aggregate({ groupBy: "client_nom", sum: ["cout_fret"] }),
    ]).then(([s, m, c]) => {
      setStatuts((s?.rows || []).map((r) => ({ name: r.statut, value: r.count || 0 })));
      setModes(m?.rows || []);
      setTopClients(
        (c?.rows || [])
          .filter((r) => r.client_nom)
          .sort((a, b) => (b.sum_cout_fret || 0) - (a.sum_cout_fret || 0))
          .slice(0, 5)
      );
    });
  }, []);

  const fretTotal = modes.reduce((acc, m) => acc + (m.sum_cout_fret || 0), 0);
  const colisTotal = modes.reduce((acc, m) => acc + (m.count || 0), 0);
  const poidsTotal = modes.reduce((acc, m) => acc + (m.sum_poids_reel || 0), 0);
  const livres = statuts.filter((s) => s.name === "Livré" || s.name === "Retiré").reduce((a, s) => a + s.value, 0);
  const taux = colisTotal ? Math.round((livres / colisTotal) * 100) : 0;

  return (
    <div className="space-y-5">
      <PageHeader title="Rapports & Analyses" subtitle="Volumes, revenus de fret et performance de livraison." />

      <div className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
        <Kpi icon={Truck} label="Fret facturé" value={formatFCFA(fretTotal)} color="#FF4500" />
        <Kpi icon={Boxes} label="Colis traités" value={formatNombre(colisTotal)} color="#38A6DE" />
        <Kpi icon={PackageCheck} label="Taux de livraison" value={`${taux} %`} color="#22C55E" />
        <Kpi icon={Wallet} label="Poids total" value={`${formatNombre(poidsTotal)} kg`} color="#A855F7" />
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <section className={`${panelClass} p-5 xl:col-span-2`}>
          <h2 className="mb-4 font-display text-[15px] font-semibold text-white">Colis par statut</h2>
          <div className="h-[280px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={statuts} layout="vertical" margin={{ top: 0, right: 16, left: 8, bottom: 0 }}>
                <XAxis type="number" hide />
                <YAxis
                  type="category"
                  dataKey="name"
                  width={140}
                  tick={{ fill: "rgba(255,255,255,0.45)", fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  cursor={{ fill: "rgba(255,255,255,0.04)" }}
                  contentStyle={{ background: "#121316", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 12, fontSize: 12 }}
                  labelStyle={{ color: "rgba(255,255,255,0.6)" }}
                />
                <Bar dataKey="value" name="Colis" radius={[0, 6, 6, 0]} barSize={16}>
                  {statuts.map((s, i) => (
                    <Cell key={s.name} fill={COULEURS[i % COULEURS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>

        <section className={`${panelClass} p-5`}>
          <h2 className="mb-2 font-display text-[15px] font-semibold text-white">Répartition par mode</h2>
          <div className="h-[200px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={modes} dataKey="count" nameKey="mode" innerRadius={54} outerRadius={82} paddingAngle={3} cornerRadius={6} stroke="none">
                  {modes.map((m, i) => (
                    <Cell key={m.mode} fill={i === 0 ? "#FF4500" : "#38A6DE"} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>
          <ul className="mt-2 space-y-2">
            {modes.map((m, i) => (
              <li key={m.mode} className="flex items-center gap-2 text-[12px]">
                <span className="h-2 w-2 rounded-full" style={{ background: i === 0 ? "#FF4500" : "#38A6DE" }} />
                <span className="flex-1 text-white/60">{m.mode}</span>
                <span className="text-white/85">{m.count} colis</span>
              </li>
            ))}
          </ul>
        </section>
      </div>

      <section className={panelClass}>
        <h2 className="px-5 py-4 font-display text-[15px] font-semibold text-white">Top clients par fret</h2>
        <div className="divide-y divide-white/[0.05] border-t border-white/[0.05]">
          {topClients.length === 0 ? (
            <p className="px-5 py-8 text-center text-[12.5px] text-white/35">Pas encore de données de fret.</p>
          ) : (
            topClients.map((c, i) => (
              <div key={c.client_nom} className="flex items-center gap-3 px-5 py-3">
                <span className="w-4 text-[11px] text-white/30">{i + 1}</span>
                <span className="flex-1 truncate text-[12.5px] text-white/85">{c.client_nom}</span>
                <span className="text-[11.5px] text-white/40">{c.count} colis</span>
                <span className="w-28 text-right text-[12.5px] font-medium text-[#38A6DE]">{formatFCFA(c.sum_cout_fret)}</span>
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  );
}