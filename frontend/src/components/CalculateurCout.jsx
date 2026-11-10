import { useState } from "react";
import { Calculator, Loader2 } from "lucide-react";
import { TARIFS, calculerFretAerien, calculerFretMaritime, formatFCFA, poidsVolumetrique } from "@/lib/logistics";

const vide = { poids: "", longueur: "", largeur: "", hauteur: "", cbm: "" };

export default function CalculateurCout({ compact = false }) {
  const [mode, setMode] = useState("aerien");
  const [service, setService] = useState("standard");
  const [form, setForm] = useState(vide);
  const [resultat, setResultat] = useState(null);
  const [calcul, setCalcul] = useState(false);

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const calculer = () => {
    setCalcul(true);
    setTimeout(() => {
      if (mode === "aerien") {
        setResultat(calculerFretAerien({ ...form, service }));
      } else {
        setResultat(calculerFretMaritime({ ...form, service }));
      }
      setCalcul(false);
    }, 380);
  };

  const champ = "h-10 w-full rounded-xl border border-white/[0.07] bg-[#121316] px-3 text-base sm:text-[13px] text-white placeholder:text-white/25 focus:border-[#FF4500]/50 focus:outline-none focus:ring-2 focus:ring-[#FF4500]/15";

  return (
    <section className="rounded-2xl border border-white/[0.06] bg-[#1E1F24] p-5">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-display text-[15px] font-semibold text-white">Calculateur de coût</h2>
          <p className="mt-0.5 text-[11.5px] text-muted-foreground">Estimation instantanée du fret Chine → Afrique</p>
        </div>
        <div className="flex rounded-xl border border-white/[0.06] bg-[#121316] p-0.5">
          {[
            { key: "aerien", label: "Aérien" },
            { key: "maritime", label: "Maritime" },
          ].map((t) => (
            <button
              key={t.key}
              onClick={() => {
                setMode(t.key);
                setResultat(null);
              }}
              className={`rounded-[9px] px-3 py-1.5 text-[11.5px] font-medium transition-colors ${
                mode === t.key ? "bg-[#FF4500] text-white" : "text-white/50 hover:text-white/80"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {mode === "aerien" ? (
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <label className="block">
            <span className="mb-1 block text-[10.5px] uppercase tracking-wider text-white/40">Poids réel (kg)</span>
            <input type="number" min="0" value={form.poids} onChange={set("poids")} placeholder="0" className={champ} />
          </label>
          <label className="block">
            <span className="mb-1 block text-[10.5px] uppercase tracking-wider text-white/40">Long. (cm)</span>
            <input type="number" min="0" value={form.longueur} onChange={set("longueur")} placeholder="0" className={champ} />
          </label>
          <label className="block">
            <span className="mb-1 block text-[10.5px] uppercase tracking-wider text-white/40">Larg. (cm)</span>
            <input type="number" min="0" value={form.largeur} onChange={set("largeur")} placeholder="0" className={champ} />
          </label>
          <label className="block">
            <span className="mb-1 block text-[10.5px] uppercase tracking-wider text-white/40">Haut. (cm)</span>
            <input type="number" min="0" value={form.hauteur} onChange={set("hauteur")} placeholder="0" className={champ} />
          </label>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          <label className="block">
            <span className="mb-1 block text-[10.5px] uppercase tracking-wider text-white/40">Volume (CBM)</span>
            <input type="number" min="0" step="0.01" value={form.cbm} onChange={set("cbm")} placeholder="0.00" className={champ} />
          </label>
          <label className="block">
            <span className="mb-1 block text-[10.5px] uppercase tracking-wider text-white/40">Service</span>
            <select value={service} onChange={(e) => setService(e.target.value)} className={champ}>
              <option value="standard">Standard — {formatFCFA(TARIFS.maritime.standard)}/CBM</option>
              <option value="express">Express — {formatFCFA(TARIFS.maritime.express)}/CBM</option>
            </select>
          </label>
        </div>
      )}

      {mode === "aerien" ? (
        <div className="mt-3 flex flex-wrap items-center gap-3">
          <select value={service} onChange={(e) => setService(e.target.value)} className={`${champ} w-full sm:max-w-[260px]`}>
            <option value="standard">Standard — {formatFCFA(TARIFS.aerien.standard)}/kg</option>
            <option value="express">Priority Express — {formatFCFA(TARIFS.aerien.express)}/kg</option>
          </select>
          <span className="text-[11px] text-white/35">
            Poids vol. : {poidsVolumetrique(form.longueur, form.largeur, form.hauteur).toFixed(2)} kg (÷ 5000)
          </span>
        </div>
      ) : null}

      <div className="mt-4 flex flex-wrap items-end justify-between gap-4 border-t border-white/[0.06] pt-4">
        <button
          onClick={calculer}
          disabled={calcul}
          className="inline-flex items-center gap-2 rounded-xl bg-[#FF4500] px-4 py-2.5 text-[12.5px] font-medium text-white transition-colors hover:bg-[#FF5E1F] disabled:opacity-60"
        >
          {calcul ? <Loader2 className="h-4 w-4 animate-spin" /> : <Calculator className="h-4 w-4" />}
          Calculer
        </button>

        <div className="text-right">
          <p className="text-[10.5px] uppercase tracking-wider text-white/40">Coût estimé</p>
          <p className={`font-display text-xl font-bold ${resultat ? "text-[#38A6DE]" : "text-white/25"}`}>
            {resultat ? formatFCFA(resultat.cout) : "— FCFA"}
          </p>
          {resultat && mode === "aerien" ? (
            <p className="text-[10.5px] text-white/35">
              {resultat.poidsTaxable.toFixed(2)} kg taxables × {formatFCFA(resultat.tarif)}
            </p>
          ) : null}
          {resultat && mode === "maritime" ? (
            <p className="text-[10.5px] text-white/35">
              {resultat.volume} CBM × {formatFCFA(resultat.tarif)}
            </p>
          ) : null}
        </div>
      </div>
    </section>
  );
}