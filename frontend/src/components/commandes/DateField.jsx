import { useEffect, useState } from "react";
import { CalendarDays, Check, Loader2, Pencil, X } from "lucide-react";
import { formatDate } from "@/lib/logistics";
import { inputClass } from "@/lib/uiClasses";

const versInput = (d) => (d ? String(d).slice(0, 10) : "");

// Date affichée, modifiable sur place si `editable`.
//   onSave(date, options) -> Promise ; `option` = libellé d'une case à cocher facultative.
export default function DateField({ label, value, editable, onSave, option, placeholder = "Non renseignée" }) {
  const [edition, setEdition] = useState(false);
  const [date, setDate] = useState(versInput(value));
  const [coche, setCoche] = useState(true);
  const [saving, setSaving] = useState(false);
  const [erreur, setErreur] = useState("");

  useEffect(() => { setDate(versInput(value)); }, [value]);

  const enregistrer = async () => {
    setErreur("");
    setSaving(true);
    try {
      await onSave(date || null, { option: coche });
      setEdition(false);
    } catch (err) {
      setErreur(err.message || "Enregistrement impossible.");
    } finally {
      setSaving(false);
    }
  };

  if (!edition) {
    return (
      <div>
        <p className="text-[10.5px] uppercase tracking-wider text-white/35">{label}</p>
        <div className="mt-0.5 flex items-center gap-2">
          <span className={`text-[12.5px] ${value ? "text-white/85" : "text-white/35"}`}>{value ? formatDate(value) : placeholder}</span>
          {editable ? (
            <button
              type="button"
              onClick={() => setEdition(true)}
              className="inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[11px] text-[#FF7A3D] hover:bg-[#FF4500]/10"
              aria-label={`Modifier : ${label}`}
            >
              <Pencil className="h-3 w-3" /> Modifier
            </button>
          ) : null}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <p className="text-[10.5px] uppercase tracking-wider text-white/35">{label}</p>
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <CalendarDays className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/30" />
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className={`${inputClass} pl-9 [color-scheme:dark]`} />
        </div>
        <button type="button" onClick={enregistrer} disabled={saving} className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[#FF4500] text-white disabled:opacity-60" aria-label="Enregistrer">
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
        </button>
        <button type="button" onClick={() => { setEdition(false); setDate(versInput(value)); }} className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-white/[0.1] text-white/60" aria-label="Annuler">
          <X className="h-4 w-4" />
        </button>
      </div>
      {option ? (
        <label className="flex items-center gap-2 text-[12px] text-white/60">
          <input type="checkbox" checked={coche} onChange={(e) => setCoche(e.target.checked)} className="h-4 w-4 accent-[#FF4500]" />
          {option}
        </label>
      ) : null}
      {erreur ? <p className="text-[12px] text-[#F87171]">{erreur}</p> : null}
    </div>
  );
}
