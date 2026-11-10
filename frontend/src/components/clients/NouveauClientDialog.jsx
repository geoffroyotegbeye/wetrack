import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { api } from "@/api/client";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { btnPrimary, inputClass, labelClass } from "@/lib/uiClasses";

const initial = { nom: "", telephone: "", email: "", ville: "", pays: "Bénin" };

export default function NouveauClientDialog({ open, onOpenChange, onCreated }) {
  const [form, setForm] = useState(initial);
  const [saving, setSaving] = useState(false);
  const [erreur, setErreur] = useState("");
  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  useEffect(() => {
    if (open) {
      setForm(initial);
      setErreur("");
    }
  }, [open]);

  const submit = async (e) => {
    e.preventDefault();
    if (saving || !form.nom.trim()) return;
    setSaving(true);
    setErreur("");
    try {
      const total = await api.entities.Client.count();
      const created = await api.entities.Client.create({
        ...form,
        nom: form.nom.trim(),
        code_client: `CLI-${String(total + 1).padStart(4, "0")}`,
      });
      await onCreated?.(created);
      onOpenChange(false);
    } catch (err) {
      setErreur("Impossible d'enregistrer le client.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md border-white/10 bg-[#1E1F24] text-white">
        <DialogHeader>
          <DialogTitle className="font-display text-[16px]">Nouveau client</DialogTitle>
        </DialogHeader>
        <form onSubmit={submit} className="space-y-3">
          <label className="block">
            <span className={labelClass}>Nom complet</span>
            <input value={form.nom} onChange={set("nom")} className={inputClass} required />
          </label>
          <label className="block">
            <span className={labelClass}>Téléphone (WhatsApp)</span>
            <input value={form.telephone} onChange={set("telephone")} placeholder="+229 97 00 00 00" className={inputClass} />
          </label>
          <label className="block">
            <span className={labelClass}>Email</span>
            <input type="email" value={form.email} onChange={set("email")} className={inputClass} />
          </label>
          <div className="grid grid-cols-2 gap-3">
            <label className="block">
              <span className={labelClass}>Ville</span>
              <input value={form.ville} onChange={set("ville")} className={inputClass} />
            </label>
            <label className="block">
              <span className={labelClass}>Pays</span>
              <input value={form.pays} onChange={set("pays")} className={inputClass} />
            </label>
          </div>

          {erreur ? <p className="text-[12px] text-[#F87171]">{erreur}</p> : null}

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