import { useState } from "react";
import { Check, KeyRound, Loader2, LogOut, Mail, MapPin, Phone, User } from "lucide-react";
import { api } from "@/api/client";
import PageHeader from "@/components/common/PageHeader";
import { PasswordInput } from "@/components/ui/password-input";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { usePermissions } from "@/lib/permissions";
import { btnGhost, btnPrimary, inputClass, labelClass, panelClass } from "@/lib/uiClasses";

function Ligne({ icon: Icon, label, value }) {
  return (
    <div className="flex items-start gap-3">
      <Icon className="mt-0.5 h-4 w-4 shrink-0 text-white/35" />
      <div className="min-w-0">
        <p className="text-[10.5px] uppercase tracking-wider text-white/35">{label}</p>
        <p className="break-words text-[13px] text-white/85">{value || "—"}</p>
      </div>
    </div>
  );
}

export default function MonCompte() {
  const user = useCurrentUser();
  const { roleLabel, isClient } = usePermissions();
  const fiche = user?.client;
  const [form, setForm] = useState({ actuel: "", nouveau: "", confirmation: "" });
  const [erreur, setErreur] = useState("");
  const [ok, setOk] = useState(false);
  const [saving, setSaving] = useState(false);
  const set = (k) => (e) => { setForm((f) => ({ ...f, [k]: e.target.value })); setOk(false); };

  const submit = async (e) => {
    e.preventDefault();
    setErreur("");
    setOk(false);
    if (form.nouveau.length < 8) return setErreur("Le nouveau mot de passe doit contenir au moins 8 caractères.");
    if (form.nouveau !== form.confirmation) return setErreur("Les deux mots de passe ne correspondent pas.");
    setSaving(true);
    try {
      await api.auth.changePassword(form.actuel, form.nouveau);
      setForm({ actuel: "", nouveau: "", confirmation: "" });
      setOk(true);
    } catch (err) {
      setErreur(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-5">
      <PageHeader
        title="Mon compte"
        subtitle="Vos informations et votre mot de passe."
        action={
          <button onClick={() => api.auth.logout()} className={`${btnGhost} hover:border-[#FF4500]/40 hover:text-[#FF7A3D]`}>
            <LogOut className="h-4 w-4" /> Se déconnecter
          </button>
        }
      />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <section className={`${panelClass} p-5`}>
          <h2 className="mb-4 font-display text-[14px] font-semibold text-white">Mes informations</h2>
          <div className="space-y-4">
            <Ligne icon={User} label="Nom" value={fiche?.nom || user?.full_name} />
            <Ligne icon={Mail} label="Email de connexion" value={user?.email} />
            {isClient ? (
              <>
                <Ligne icon={Phone} label="Téléphone (notifications)" value={fiche?.telephone} />
                <Ligne icon={MapPin} label="Ville" value={[fiche?.ville, fiche?.pays].filter(Boolean).join(", ")} />
                {fiche?.code_client ? <Ligne icon={User} label="N° client" value={fiche.code_client} /> : null}
              </>
            ) : (
              <Ligne icon={User} label="Rôle" value={roleLabel} />
            )}
          </div>
          {isClient ? (
            <p className="mt-5 rounded-xl bg-white/[0.03] px-3 py-2.5 text-[11.5px] leading-snug text-white/45">
              Une information est incorrecte ? Contactez l'agence pour la mettre à jour : votre numéro de téléphone sert aux notifications d'arrivée de vos colis.
            </p>
          ) : null}
        </section>

        <section className={`${panelClass} p-5`}>
          <h2 className="mb-4 flex items-center gap-2 font-display text-[14px] font-semibold text-white">
            <KeyRound className="h-4 w-4 text-[#FF7A3D]" /> Changer mon mot de passe
          </h2>
          <form onSubmit={submit} className="space-y-3">
            <label className="block">
              <span className={labelClass}>Mot de passe actuel</span>
              <PasswordInput required value={form.actuel} onChange={set("actuel")} autoComplete="current-password" className={inputClass} />
            </label>
            <label className="block">
              <span className={labelClass}>Nouveau mot de passe</span>
              <PasswordInput required minLength={8} value={form.nouveau} onChange={set("nouveau")} autoComplete="new-password" placeholder="8 caractères minimum" className={inputClass} />
            </label>
            <label className="block">
              <span className={labelClass}>Confirmer le nouveau mot de passe</span>
              <PasswordInput required value={form.confirmation} onChange={set("confirmation")} autoComplete="new-password" className={inputClass} />
            </label>
            {erreur ? <p role="alert" className="text-[12px] text-[#F87171]">{erreur}</p> : null}
            {ok ? (
              <p className="flex items-center gap-1.5 text-[12.5px] text-[#4ADE80]"><Check className="h-4 w-4" /> Mot de passe modifié.</p>
            ) : null}
            <button type="submit" disabled={saving} className={`${btnPrimary} w-full sm:w-auto`}>
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : null} Enregistrer
            </button>
          </form>
        </section>
      </div>
    </div>
  );
}
