import { useEffect, useState } from "react";
import { KeyRound, Loader2, Plus, Search, UserCheck, UserX } from "lucide-react";
import { api } from "@/api/client";
import PageHeader from "@/components/common/PageHeader";
import EmptyState from "@/components/common/EmptyState";
import Pagination from "@/components/common/Pagination";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { PasswordInput } from "@/components/ui/password-input";
import SearchSelect from "@/components/common/SearchSelect";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { ROLE_COULEURS } from "@/lib/permissions";
import { formatDateCourt } from "@/lib/logistics";
import { btnGhost, btnPrimary, inputClass, labelClass, panelClass } from "@/lib/uiClasses";

const VIDE = { full_name: "", email: "", role: "lecteur", password: "", client_id: "" };

const PAGES_LABELS = {
  dashboard: "Tableau de bord", commandes: "Commandes", suivi: "Suivi", cargaisons: "Cargaisons",
  notifications: "Notifications", clients: "Clients", tarifs: "Tarifs", rapports: "Rapports",
  parametres: "Paramètres", utilisateurs: "Utilisateurs",
  espace_client: "Mes colis", suivi_detail: "Détail colis",
};

function RoleBadge({ role, label }) {
  return (
    <span className={`inline-flex whitespace-nowrap rounded-full px-2 py-0.5 text-[10.5px] font-medium ring-1 ring-inset ${ROLE_COULEURS[role] || ROLE_COULEURS.lecteur}`}>
      {label}
    </span>
  );
}

const initiales = (u) => (u.full_name || u.email).split(/[\s@.]/).filter(Boolean).slice(0, 2).map((p) => p[0]).join("").toUpperCase();

export default function Utilisateurs() {
  const moi = useCurrentUser();
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [fiches, setFiches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [erreur, setErreur] = useState("");
  const [enCours, setEnCours] = useState(null);
  const [creation, setCreation] = useState(false);
  const [resetPour, setResetPour] = useState(null);
  const [page, setPage] = useState(1);
  const PAR_PAGE = 10;

  const roleLabel = (key) => roles.find((r) => r.key === key)?.label || key;

  const load = async () => {
    setLoading(true);
    try {
      const [u, r, c] = await Promise.all([
        api.users.list(),
        api.users.roles(),
        api.entities.Client.list({ sort: "nom", limit: 1000 }),
      ]);
      setUsers(u.items || []);
      setRoles(r.roles || []);
      setFiches(c.items || []);
    } catch (err) {
      setErreur(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const modifier = async (u, data) => {
    setErreur("");
    setEnCours(u.id);
    try {
      const maj = await api.users.update(u.id, data);
      setUsers((list) => list.map((x) => (x.id === u.id ? maj : x)));
    } catch (err) {
      setErreur(err.message);
    } finally {
      setEnCours(null);
    }
  };

  const terme = q.trim().toLowerCase();
  const filtres = users.filter((u) => !terme || u.email.includes(terme) || u.full_name?.toLowerCase().includes(terme));
  const pageCount = Math.max(1, Math.ceil(filtres.length / PAR_PAGE));
  const pageCourante = Math.min(page, pageCount);
  const visibles = filtres.slice((pageCourante - 1) * PAR_PAGE, pageCourante * PAR_PAGE);

  const RoleSelect = ({ u }) => (
    <select
      value={u.role}
      disabled={enCours === u.id || u.id === moi?.id}
      onChange={(e) => modifier(u, { role: e.target.value })}
      className={`${inputClass} h-9 sm:w-[170px]`}
      aria-label={`Rôle de ${u.full_name || u.email}`}
    >
      {roles.filter((r) => r.key !== "client" || u.role === "client").map((r) => <option key={r.key} value={r.key}>{r.label}</option>)}
    </select>
  );

  const Actions = ({ u }) => (
    <div className="flex items-center gap-1.5">
      <button onClick={() => setResetPour(u)} className={`${btnGhost} h-9 px-2.5`} title="Réinitialiser le mot de passe" aria-label="Réinitialiser le mot de passe">
        <KeyRound className="h-4 w-4" />
      </button>
      {u.id !== moi?.id ? (
        <button
          onClick={() => modifier(u, { actif: !u.actif })}
          disabled={enCours === u.id}
          className={`${btnGhost} h-9 px-2.5 ${u.actif ? "hover:text-[#F87171]" : "hover:text-[#4ADE80]"}`}
          title={u.actif ? "Désactiver le compte" : "Réactiver le compte"}
          aria-label={u.actif ? "Désactiver le compte" : "Réactiver le compte"}
        >
          {enCours === u.id ? <Loader2 className="h-4 w-4 animate-spin" /> : u.actif ? <UserX className="h-4 w-4" /> : <UserCheck className="h-4 w-4" />}
        </button>
      ) : null}
    </div>
  );

  const Identite = ({ u }) => (
    <div className="flex min-w-0 items-center gap-3">
      <span className={`grid h-9 w-9 shrink-0 place-items-center rounded-full bg-gradient-to-br from-[#FF4500]/70 to-[#A855F7]/60 text-[11px] font-semibold text-white ${u.actif ? "" : "opacity-40"}`}>
        {initiales(u)}
      </span>
      <div className="min-w-0">
        <p className="truncate text-[13px] font-medium text-white/90">
          {u.full_name || "—"} {u.id === moi?.id ? <span className="text-[11px] font-normal text-white/35">(vous)</span> : null}
        </p>
        <p className="truncate text-[11.5px] text-white/45">{u.email}</p>
        {u.role === "client" ? (
          <p className="truncate text-[11px] text-[#C084FC]">Fiche : {fiches.find((f) => f.id === u.client_id)?.nom || "—"}</p>
        ) : null}
      </div>
    </div>
  );

  return (
    <div className="space-y-5">
      <PageHeader
        title="Utilisateurs"
        subtitle="Comptes de l'équipe, rôles et accès."
        action={
          <button className={btnPrimary} onClick={() => setCreation(true)}>
            <Plus className="h-4 w-4" /> Nouvel utilisateur
          </button>
        }
      />

      {erreur ? <div role="alert" className="rounded-xl bg-[#EF4444]/10 px-4 py-3 text-[12.5px] text-[#F87171]">{erreur}</div> : null}

      <div className="relative max-w-md">
        <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-white/30" />
        <input value={q} onChange={(e) => { setQ(e.target.value); setPage(1); }} placeholder="Nom ou email…" className={`${inputClass} pl-10`} />
      </div>

      {loading ? (
        <div className={`${panelClass} px-5 py-12 text-center text-[12.5px] text-white/35`}>Chargement…</div>
      ) : visibles.length === 0 ? (
        <div className={panelClass}><EmptyState message="Aucun utilisateur." /></div>
      ) : (
        <>
          {/* Mobile : cartes */}
          <div className="space-y-2.5 md:hidden">
            {visibles.map((u) => (
              <div key={u.id} className={`${panelClass} p-4 ${u.actif ? "" : "opacity-60"}`}>
                <div className="flex items-start justify-between gap-3">
                  <Identite u={u} />
                  {u.actif ? null : <span className="shrink-0 rounded-full bg-[#EF4444]/15 px-2 py-0.5 text-[10.5px] text-[#F87171]">Désactivé</span>}
                </div>
                <div className="mt-3 flex items-center gap-2 border-t border-white/[0.05] pt-3">
                  <div className="flex-1"><RoleSelect u={u} /></div>
                  <Actions u={u} />
                </div>
              </div>
            ))}
          </div>

          {/* Écran large : tableau */}
          <div className={`hidden overflow-hidden md:block ${panelClass}`}>
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-white/[0.05] bg-white/[0.015] text-[10.5px] uppercase tracking-wider text-white/40">
                  <th className="px-5 py-3 font-medium">Utilisateur</th>
                  <th className="px-3 py-3 font-medium">Rôle</th>
                  <th className="px-3 py-3 font-medium">Statut</th>
                  <th className="px-3 py-3 font-medium">Dernière connexion</th>
                  <th className="px-5 py-3 text-right font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {visibles.map((u) => (
                  <tr key={u.id} className={`border-b border-white/[0.04] text-[12.5px] last:border-0 ${u.actif ? "" : "opacity-60"}`}>
                    <td className="px-5 py-3"><Identite u={u} /></td>
                    <td className="px-3 py-3"><RoleSelect u={u} /></td>
                    <td className="px-3 py-3">
                      {u.actif
                        ? <span className="rounded-full bg-[#22C55E]/15 px-2 py-0.5 text-[10.5px] text-[#4ADE80]">Actif</span>
                        : <span className="rounded-full bg-[#EF4444]/15 px-2 py-0.5 text-[10.5px] text-[#F87171]">Désactivé</span>}
                    </td>
                    <td className="px-3 py-3 text-white/45">{u.last_login ? formatDateCourt(u.last_login) : "Jamais"}</td>
                    <td className="px-5 py-3"><div className="flex justify-end"><Actions u={u} /></div></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      <Pagination page={pageCourante} pageCount={pageCount} total={filtres.length} pageSize={PAR_PAGE} onPageChange={setPage} />

      {/* Référence des rôles */}
      <section>
        <h2 className="mb-3 font-display text-[15px] font-semibold text-white">Rôles et accès</h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {roles.map((r) => (
            <div key={r.key} className={`${panelClass} p-4`}>
              <div className="flex items-center justify-between gap-2">
                <RoleBadge role={r.key} label={r.label} />
                <span className="text-[11px] text-white/35">{users.filter((u) => u.role === r.key).length} compte(s)</span>
              </div>
              <p className="mt-2 text-[12.5px] leading-snug text-white/65">{r.description}</p>
              <p className="mt-2 text-[11px] leading-snug text-white/40">
                Pages : {r.pages.map((p) => PAGES_LABELS[p] || p).join(", ")}
              </p>
              {r.statuts_colis && r.statuts_colis.length ? (
                <p className="mt-1 text-[11px] leading-snug text-white/40">Statuts colis : {r.statuts_colis.join(", ")}</p>
              ) : null}
            </div>
          ))}
        </div>
      </section>

      <CreationDialog
        open={creation}
        onOpenChange={setCreation}
        roles={roles}
        fiches={fiches}
        onCreated={(u) => { setUsers((list) => [...list, u]); setCreation(false); }}
      />
      <ResetDialog user={resetPour} onClose={() => setResetPour(null)} roleLabel={roleLabel} />
    </div>
  );
}

function CreationDialog({ open, onOpenChange, roles, fiches, onCreated }) {
  const [form, setForm] = useState(VIDE);
  const [erreur, setErreur] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => { if (open) { setForm(VIDE); setErreur(""); } }, [open]);
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setErreur("");
    setSaving(true);
    try {
      if (form.role === "client" && !form.client_id) {
        setErreur("Choisissez la fiche client à relier à ce compte.");
        setSaving(false);
        return;
      }
      onCreated(await api.users.create({
        ...form,
        full_name: form.full_name.trim() || undefined,
        client_id: form.role === "client" ? form.client_id : undefined,
      }));
    } catch (err) {
      setErreur(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md border-white/10 bg-[#1E1F24] text-white">
        <DialogHeader>
          <DialogTitle className="font-display text-[16px]">Nouvel utilisateur</DialogTitle>
        </DialogHeader>
        <form onSubmit={submit} className="space-y-3">
          <label className="block">
            <span className={labelClass}>Nom complet</span>
            <input value={form.full_name} onChange={set("full_name")} className={inputClass} autoComplete="off" />
          </label>
          <label className="block">
            <span className={labelClass}>Email</span>
            <input type="email" required value={form.email} onChange={set("email")} className={inputClass} autoComplete="off" />
          </label>
          <label className="block">
            <span className={labelClass}>Rôle</span>
            <select value={form.role} onChange={set("role")} className={inputClass}>
              {roles.map((r) => <option key={r.key} value={r.key}>{r.label}</option>)}
            </select>
            <span className="mt-1 block text-[11px] text-white/40">{roles.find((r) => r.key === form.role)?.description}</span>
          </label>
          {form.role === "client" ? (
            <div className="block">
              <span className={labelClass}>Fiche client</span>
              <SearchSelect
                ariaLabel="Fiche client"
                options={fiches.map((f) => ({
                  value: f.id,
                  label: f.nom,
                  hint: [f.ville || f.pays, f.code_client].filter(Boolean).join(" · "),
                  keywords: [f.telephone, f.email].filter(Boolean).join(" "),
                }))}
                value={form.client_id}
                onChange={(id) => {
                  const fiche = fiches.find((f) => f.id === id);
                  setForm((f) => ({
                    ...f,
                    client_id: id,
                    full_name: f.full_name || fiche?.nom || "",
                    email: f.email || fiche?.email || "",
                  }));
                }}
                placeholder="Choisir un client…"
                searchPlaceholder="Nom, ville, téléphone, n° client…"
                emptyText="Aucun client trouvé."
              />
              <span className="mt-1 block text-[11px] text-white/40">Le client ne verra que les commandes et colis de cette fiche.</span>
            </div>
          ) : null}
          <label className="block">
            <span className={labelClass}>Mot de passe provisoire</span>
            <PasswordInput required minLength={8} value={form.password} onChange={set("password")} className={inputClass} autoComplete="new-password" placeholder="8 caractères minimum" />
          </label>
          {erreur ? <p className="text-[12px] text-[#F87171]">{erreur}</p> : null}
          <div className="flex flex-col-reverse gap-2 pt-1 sm:flex-row sm:justify-end">
            <button type="button" onClick={() => onOpenChange(false)} className={btnGhost}>Annuler</button>
            <button type="submit" disabled={saving} className={btnPrimary}>
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : null} Créer le compte
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function ResetDialog({ user, onClose, roleLabel }) {
  const [password, setPassword] = useState("");
  const [erreur, setErreur] = useState("");
  const [ok, setOk] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => { setPassword(""); setErreur(""); setOk(false); }, [user]);

  const submit = async (e) => {
    e.preventDefault();
    setErreur("");
    setSaving(true);
    try {
      await api.users.update(user.id, { password });
      setOk(true);
    } catch (err) {
      setErreur(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={Boolean(user)} onOpenChange={(o) => { if (!o) onClose(); }}>
      <DialogContent className="max-w-md border-white/10 bg-[#1E1F24] text-white">
        <DialogHeader>
          <DialogTitle className="font-display text-[16px]">Réinitialiser le mot de passe</DialogTitle>
        </DialogHeader>
        {user ? (
          <p className="text-[12.5px] text-white/55">
            {user.full_name || user.email} · {roleLabel(user.role)}
          </p>
        ) : null}
        {ok ? (
          <div className="space-y-3">
            <p className="rounded-xl bg-[#22C55E]/10 px-3 py-2.5 text-[12.5px] text-[#4ADE80]">
              Mot de passe mis à jour. Communiquez-le à l'utilisateur de façon sécurisée.
            </p>
            <div className="flex justify-end"><button onClick={onClose} className={btnPrimary}>Fermer</button></div>
          </div>
        ) : (
          <form onSubmit={submit} className="space-y-3">
            <label className="block">
              <span className={labelClass}>Nouveau mot de passe</span>
              <PasswordInput required minLength={8} value={password} onChange={(e) => setPassword(e.target.value)} className={inputClass} autoComplete="new-password" placeholder="8 caractères minimum" />
            </label>
            {erreur ? <p className="text-[12px] text-[#F87171]">{erreur}</p> : null}
            <div className="flex flex-col-reverse gap-2 pt-1 sm:flex-row sm:justify-end">
              <button type="button" onClick={onClose} className={btnGhost}>Annuler</button>
              <button type="submit" disabled={saving} className={btnPrimary}>
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : null} Enregistrer
              </button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
