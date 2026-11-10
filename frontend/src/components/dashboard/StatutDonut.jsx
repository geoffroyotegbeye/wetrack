import { Cell, Pie, PieChart, ResponsiveContainer } from "recharts";
import { formatNombre } from "@/lib/logistics";

export default function StatutDonut({ statuts = [], total = 0 }) {
  return (
    <section className="h-full rounded-2xl border border-white/[0.06] bg-[#1E1F24] p-5">
      <div className="mb-1 flex items-center justify-between gap-2">
        <h2 className="font-display text-[15px] font-semibold text-white">Statut des colis</h2>
        <span className="rounded-lg border border-white/[0.06] bg-[#121316] px-2.5 py-1 text-[11px] text-white/50">Cette semaine</span>
      </div>

      <div className="relative mx-auto mt-2 h-[190px] w-full max-w-[220px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={statuts}
              dataKey="value"
              nameKey="name"
              innerRadius={62}
              outerRadius={86}
              paddingAngle={3}
              cornerRadius={6}
              stroke="none"
              startAngle={90}
              endAngle={-270}
            >
              {statuts.map((s) => (
                <Cell key={s.name} fill={s.color} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <span className="font-display text-xl font-bold text-white">{formatNombre(total)}</span>
          <span className="text-[10.5px] uppercase tracking-wider text-white/40">Total colis</span>
        </div>
      </div>

      <ul className="mt-3 space-y-2">
        {statuts.map((s) => (
          <li key={s.name} className="flex items-center gap-2 text-[12px]">
            <span className="h-2 w-2 shrink-0 rounded-full" style={{ background: s.color }} />
            <span className="flex-1 truncate text-white/65">{s.name}</span>
            <span className="font-medium text-white/90">{s.value}%</span>
          </li>
        ))}
      </ul>
    </section>
  );
}