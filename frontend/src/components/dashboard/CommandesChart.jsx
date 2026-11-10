import { useState } from "react";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { formatDateCourt } from "@/lib/logistics";

const RANGES = [
  { label: "7J", days: 7 },
  { label: "30J", days: 30 },
  { label: "90J", days: 90 },
];

function ChartTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border border-white/10 bg-[#121316]/95 px-3 py-2 shadow-xl backdrop-blur">
      <p className="mb-1 text-[11px] uppercase tracking-wider text-white/40">{label}</p>
      {payload.map((p) => (
        <p key={p.name} className="flex items-center gap-2 text-[12px] text-white/80">
          <span className="h-1.5 w-1.5 rounded-full" style={{ background: p.color }} />
          {p.name} : <span className="font-medium text-white">{new Intl.NumberFormat("fr-FR").format(p.value)}</span>
        </p>
      ))}
    </div>
  );
}

export default function CommandesChart({ series = [] }) {
  const [range, setRange] = useState(30);
  const data = series.slice(-range).map((s) => ({ ...s, label: formatDateCourt(s.date) }));

  return (
    <section className="h-full rounded-2xl border border-white/[0.06] bg-[#1E1F24] p-5">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-display text-[15px] font-semibold text-white">Évolution des commandes</h2>
          <p className="mt-0.5 text-[11.5px] text-muted-foreground">Commandes créées et colis livrés</p>
        </div>
        <div className="flex rounded-xl border border-white/[0.06] bg-[#121316] p-0.5">
          {RANGES.map((r) => (
            <button
              key={r.label}
              onClick={() => setRange(r.days)}
              className={`rounded-[9px] px-3 py-1.5 text-[11.5px] font-medium transition-colors ${
                range === r.days ? "bg-[#FF4500] text-white shadow-sm shadow-[#FF4500]/30" : "text-white/50 hover:text-white/80"
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      <div className="mb-2 flex items-center gap-4 text-[11.5px] text-white/55">
        <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-[#FF4500]" /> Commandes</span>
        <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-[#38A6DE]" /> Colis livrés</span>
      </div>

      <div className="h-[248px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 8, right: 6, left: -18, bottom: 0 }}>
            <defs>
              <linearGradient id="gradOrange" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#FF4500" stopOpacity={0.35} />
                <stop offset="100%" stopColor="#FF4500" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="gradCyan" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#38A6DE" stopOpacity={0.28} />
                <stop offset="100%" stopColor="#38A6DE" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke="rgba(255,255,255,0.05)" vertical={false} />
            <XAxis
              dataKey="label"
              tick={{ fill: "rgba(255,255,255,0.35)", fontSize: 11 }}
              axisLine={false}
              tickLine={false}
              minTickGap={28}
            />
            <YAxis
              tick={{ fill: "rgba(255,255,255,0.35)", fontSize: 11 }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v) => (v >= 1000 ? `${v / 1000}k` : v)}
            />
            <Tooltip content={<ChartTooltip />} cursor={{ stroke: "rgba(255,255,255,0.12)" }} />
            <Area type="monotone" dataKey="commandes" name="Commandes" stroke="#FF4500" strokeWidth={2} fill="url(#gradOrange)" dot={false} />
            <Area type="monotone" dataKey="livres" name="Colis livrés" stroke="#38A6DE" strokeWidth={2} fill="url(#gradCyan)" dot={false} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}