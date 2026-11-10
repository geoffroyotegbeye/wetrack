import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { api } from "@/api/client";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { STATUTS_COLIS, calculerFretAerien, calculerFretMaritime } from "@/lib/logistics";
import { btnPrimary, inputClass, labelClass } from "@/lib/uiClasses";

const initial = { description: "", mode: "Aérien", poids: "", longueur: "", largeur: "", hauteur: "", cbm: "", eta: "", cargo_code: "" };

export default function ScinderColisDialog({ open, onOpenChange, commande, colisExistants = [], onCreated }) {
  const [form, setForm] = useState(initial);
  const [saving, setSaving] = useState(false);
  const [erreur, setErreur] = useState("");
  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  useEffect(() => {
    if (open) {
      setForm({ ...initial, description: commande?.description || "" });
      setErreur("");
    }
  }, [open, commande]);

  const submit = async (e) => {
    e.preventDefault();
    if (saving || !commande) return;
    setSaving(true);
    setErreur("");
    try {
      const lettre = String.fromCharCode(65 + colisExistants.length);
      const suffixe = colisExistants.length >= 26 ? `${colisExistants.length + 1}` : lettre;
      const reference = `${commande.reference.replace(/^WD/, "WBD")}-${suffixe}`;

      const aerien = form.mode === "Aérien";
      const calcul = aerien
        ? calculerFretAerien({ poidsReel: form.poids, longueur: form.longueur, largeur: form.largeur, hauteur: form.hauteur, service: "standard" })
        : calculerFretMaritime({ cbm: form.cbm, service: "standard" });

      await api.entities.Colis.create({
        reference,
        commande_id: commande.id,
        commande_reference: commande.reference,
        client_id: commande.client_id || "",
        client_nom: commande.client_nom || "",
        client_telephone: commande.client_telephone || "",
        description: form.description,
        mode: form.mode,
        poids_reel: Number(form.poids) || 0,
        longueur: Number(form.longueur) || 0,
        largeur: Number(form.largeur) || 0,
        hauteur: Number(form.hauteur) || 0,
        poids_volumetrique: aerien ? Number(calcul.poidsVolumetrique.toFixed(2)) : 0,
        cbm: Number(form.cbm) || 0,
        statut: STATUTS_COLIS[0],
        progression: 0,
        eta: form.eta,
        cargo_code: form.cargo_code,
        cout_fret: Math.round(calcul.cout),
      });

      await onCreated?.();
      onOpenChange(false);
    } catch (err) {
      setErreur("Impossible de créer le colis.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg border-white/10 bg-[#1E1F24] text-white">
        <DialogHeader>
          <DialogTitle className="font-display text-[16px]">Scinder en colis</DialogTitle>
        </DialogHeader>
        <form onSubmit={submit} className="space-y-3">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <label className="block">
              <span className={labelClass}>Description</span>
              <input value={form.description} onChange={set("description")} className={inputClass} />
            </label>
            <label className="block">
              <span className={labelClass}>Mode de transport</span>
              <select value={form.mode} onChange={set("mode")} className={inputClass}>
                <option value="Aérien">Aérien</option>
                <option value="Maritime">Maritime</option>
              </select>
            </label>
          </div>

          {form.mode === "Aérien" ? (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <label className="block">
                <span className={labelClass}>Poids (kg)</span>
                <input type="number" min="0" step="0.1" value={form.poids} onChange={set("poids")} className={inputClass} />
              </label>
              <label className="block">
                <span className={labelClass}>Long. (cm)</span>
                <input type="number" min="0" value={form.longueur} onChange={set("longueur")} className={inputClass} />
              </label>
              <label className="block">
                <span className={labelClass}>Larg. (cm)</span>
                <input type="number" min="0" value={form.largeur} onChange={set("largeur")} className={inputClass} />
              </label>
              <label className="block">
                <span className={labelClass}>Haut. (cm)</span>
                <input type="number" min="0" value={form.hauteur} onChange={set("hauteur")} className={inputClass} />
              </label>
            </div>
          ) : (
            <label className="block">
              <span className={labelClass}>Volume (CBM)</span>
              <input type="number" min="0" step="0.01" value={form.cbm} onChange={set("cbm")} className={inputClass} />
            </label>
          )}

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <label className="block">
              <span className={labelClass}>ETA</span>
              <input type="date" value={form.eta} onChange={set("eta")} className={inputClass} />
            </label>
            <label className="block">
              <span className={labelClass}>Cargo</span>
              <input value={form.cargo_code} onChange={set("cargo_code")} placeholder="CA-1787" className={inputClass} />
            </label>
          </div>

          {erreur ? <p className="text-[12px] text-[#F87171]">{erreur}</p> : null}

          <div className="flex justify-end gap-2 pt-1">
            <button type="button" onClick={() => onOpenChange(false)} className="rounded-xl px-4 py-2.5 text-[12.5px] text-white/50 hover:text-white">
              Annuler
            </button>
            <button type="submit" className={btnPrimary} disabled={saving}>
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              Créer le colis
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}