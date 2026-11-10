import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { api } from "@/api/client";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import SearchSelect from "@/components/common/SearchSelect";
import { btnPrimary, inputClass, labelClass } from "@/lib/uiClasses";

function referenceAuto() {
  const d = new Date();
  const ymd = `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, "0")}${String(d.getDate()).padStart(2, "0")}`;
  return `WD${ymd}${String(Math.floor(Math.random() * 900) + 100)}`;
}

const initial = {
  reference: "",
  client_id: "",
  description: "",
  montant_marchandise: "",
  poids_total: "",
  cbm_total: "",
  statut: "Validée",
  date_commande: new Date().toISOString().slice(0, 10),
};

export default function NouvelleCommandeDialog({ open, onOpenChange, clients = [], onCreated, onError }) {
  const [form, setForm] = useState(initial);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (open) {
      setForm({ ...initial, reference: referenceAuto() });
      setError("");
    }
  }, [open]);

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    if (saving) return;
    setError("");
    const client = clients.find((c) => c.id === form.client_id);
    if (!client) {
      setError("Sélectionnez un client.");
      return;
    }
    setSaving(true);
    try {
      const doublon = await api.entities.Commande.filter({ reference: form.reference.trim() }, { limit: 1 });
      if (doublon?.items?.length) {
        setError("Cette référence de commande existe déjà.");
        setSaving(false);
        return;
      }
      const created = await api.entities.Commande.create({
        reference: form.reference.trim(),
        client_id: client.id,
        client_nom: client.nom,
        client_telephone: client.telephone || "",
        description: form.description,
        montant_marchandise: Number(form.montant_marchandise) || 0,
        poids_total: Number(form.poids_total) || 0,
        cbm_total: Number(form.cbm_total) || 0,
        statut: form.statut,
        date_commande: form.date_commande,
      });
      onCreated?.(created);
    } catch (err) {
      setError("Impossible d'enregistrer la commande.");
      onError?.(err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg border-white/10 bg-[#1E1F24] text-white">
        <DialogHeader>
          <DialogTitle className="font-display text-[16px]">Nouvelle commande</DialogTitle>
        </DialogHeader>
        <form onSubmit={submit} className="space-y-3">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <label className="block">
              <span className={labelClass}>Référence</span>
              <input value={form.reference} onChange={set("reference")} className={inputClass} required />
            </label>
            <label className="block">
              <span className={labelClass}>Date</span>
              <input type="date" value={form.date_commande} onChange={set("date_commande")} className={inputClass} required />
            </label>
          </div>

          <div className="block">
            <span className={labelClass}>Client</span>
            <SearchSelect
              ariaLabel="Client"
              options={clients.map((c) => ({
                value: c.id,
                label: c.nom,
                hint: [c.ville || c.pays, c.code_client].filter(Boolean).join(" · "),
                keywords: [c.telephone, c.email].filter(Boolean).join(" "),
              }))}
              value={form.client_id}
              onChange={(id) => setForm((f) => ({ ...f, client_id: id }))}
              placeholder="Sélectionner un client…"
              searchPlaceholder="Nom, ville, téléphone, n° client…"
              emptyText="Aucun client trouvé."
            />
          </div>

          <label className="block">
            <span className={labelClass}>Marchandise</span>
            <input value={form.description} onChange={set("description")} placeholder="Ex : lot de textiles" className={inputClass} />
          </label>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <label className="block">
              <span className={labelClass}>Valeur (FCFA)</span>
              <input type="number" min="0" value={form.montant_marchandise} onChange={set("montant_marchandise")} className={inputClass} />
            </label>
            <label className="block">
              <span className={labelClass}>Poids (kg)</span>
              <input type="number" min="0" step="0.1" value={form.poids_total} onChange={set("poids_total")} className={inputClass} />
            </label>
            <label className="block">
              <span className={labelClass}>Volume (m³)</span>
              <input type="number" min="0" step="0.01" value={form.cbm_total} onChange={set("cbm_total")} className={inputClass} />
            </label>
          </div>

          <label className="block">
            <span className={labelClass}>Statut</span>
            <select value={form.statut} onChange={set("statut")} className={inputClass}>
              {["En attente", "Validée", "En préparation"].map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </label>

          {error ? <p className="text-[12px] text-[#F87171]">{error}</p> : null}

          <div className="flex justify-end gap-2 pt-1">
            <button type="button" onClick={() => onOpenChange(false)} className="rounded-xl px-4 py-2.5 text-[12.5px] text-white/50 hover:text-white">
              Annuler
            </button>
            <button type="submit" className={btnPrimary} disabled={saving}>
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              Enregistrer
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}