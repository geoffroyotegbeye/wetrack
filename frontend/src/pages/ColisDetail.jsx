import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, Loader2, Check, Copy, MessageCircle } from "lucide-react";
import { api } from "@/api/client";
import StatutBadge from "@/components/common/StatutBadge";
import { STATUTS_COLIS, formatDate, formatDateCourt, formatFCFA, formatNombre } from "@/lib/logistics";
import { btnPrimary, inputClass, labelClass, panelClass } from "@/lib/uiClasses";
import { usePermissions } from "@/lib/permissions";
import AgenceRetrait from "@/components/client/AgenceRetrait";

export default function ColisDetail() {
  const { id } = useParams();
  const [colis, setColis] = useState(null);
  const [logs, setLogs] = useState([]);
  const [nouveauStatut, setNouveauStatut] = useState("");
  const { canWrite, canFunction, statutsColis, isClient } = usePermissions();
  const statutsAutorises = statutsColis(STATUTS_COLIS);
  const peutModifier = canWrite("Colis") && statutsAutorises.length > 0;
  const peutNotifier = canFunction("notifierColis");
  const [lieu, setLieu] = useState("");
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);
  const [notification, setNotification] = useState(null);
  const [copie, setCopie] = useState(false);
  const [erreur, setErreur] = useState("");

  const load = async () => {
    const c = await api.entities.Colis.get(id).catch(() => null);
    if (!c) {
      setErreur("Colis introuvable.");
      return;
    }
    setColis(c);
    setNouveauStatut(c.statut);
    const page = await api.entities.TrackingLog.filter({ colis_id: id }, { sort: "-date_evenement", limit: 50 });
    setLogs(page?.items || []);
  };

  useEffect(() => {
    setErreur("");
    load();
  }, [id]);

  const appliquer = async () => {
    if (!colis || !nouveauStatut || saving) return;
    setSaving(true);
    setErreur("");
    try {
      const index = STATUTS_COLIS.indexOf(nouveauStatut);
      const progression = Math.round((Math.max(0, index) / (STATUTS_COLIS.length - 1)) * 100);

      await api.entities.Colis.update(colis.id, { statut: nouveauStatut, progression });
      await api.entities.TrackingLog.create({
        colis_id: colis.id,
        colis_reference: colis.reference,
        statut: nouveauStatut,
        lieu,
        note,
        date_evenement: new Date().toISOString(),
      });

      if (nouveauStatut === "Disponible à l'agence" && peutNotifier) {
        const res = await api.functions.invoke("notifierColis", { colisId: colis.id, canal: "WhatsApp" });
        setNotification(res?.data || null);
      }

      setLieu("");
      setNote("");
      await load();
    } catch (err) {
      setErreur("La mise à jour a échoué.");
    } finally {
      setSaving(false);
    }
  };

  const copier = async () => {
    if (!notification?.message) return;
    await navigator.clipboard.writeText(notification.message);
    setCopie(true);
    setTimeout(() => setCopie(false), 2000);
  };

  const marquerEnvoyee = async () => {
    if (!notification?.notification?.id) return;
    await api.entities.NotificationLog.update(notification.notification.id, { statut: "Envoyée" });
    setNotification((n) => ({ ...n, notification: { ...n.notification, statut: "Envoyée" } }));
  };

  if (erreur && !colis) {
    return (
      <div className={`${panelClass} p-10 text-center`}>
        <p className="text-[13px] text-white/60">{erreur}</p>
        <Link to="/suivi" className="mt-3 inline-block text-[12.5px] text-[#FF7A3D]">Retour au suivi</Link>
      </div>
    );
  }

  if (!colis) return <div className={`${panelClass} p-10 text-center text-[13px] text-white/35`}>Chargement…</div>;

  const tel = (notification?.destinataire || colis.client_telephone || "").replace(/[^\d]/g, "");
  const infos = [
    { label: "Client", value: colis.client_nom || "—" },
    { label: "Téléphone", value: colis.client_telephone || "—" },
    { label: "Commande", value: colis.commande_reference || "—" },
    { label: "Mode", value: colis.mode },
    { label: "Poids réel", value: `${formatNombre(colis.poids_reel)} kg` },
    { label: "Poids volumétrique", value: `${formatNombre(colis.poids_volumetrique)} kg` },
    { label: "Volume", value: colis.cbm ? `${colis.cbm} m³` : "—" },
    { label: "Cargo", value: colis.cargo_code || "—" },
    { label: "Tracking transporteur", value: colis.tracking_transporteur || "—" },
    { label: "ETA", value: formatDate(colis.eta) },
    { label: "Fret", value: formatFCFA(colis.cout_fret) },
  ];

  return (
    <div className="space-y-5">
      <div className="wsc-rise">
        <Link to={isClient ? "/mes-colis" : "/suivi"} className="mb-2 inline-flex items-center gap-1.5 text-[12px] text-white/40 hover:text-white/70">
          <ArrowLeft className="h-3.5 w-3.5" /> {isClient ? "Mes colis" : "Suivi des colis"}
        </Link>
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="font-display text-[21px] font-bold tracking-tight text-white sm:text-[25px]">{colis.reference}</h1>
          <StatutBadge statut={colis.statut} />
        </div>
        <p className="mt-1 text-[12.5px] text-muted-foreground">{colis.description}</p>
      </div>

      <div className={`${panelClass} p-5`}>
        <div className="mb-2 flex items-center justify-between text-[11.5px]">
          <span className="text-white/45">Avancement du transit</span>
          <span className="font-medium text-white/85">{Number(colis.progression) || 0} %</span>
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-white/[0.06]">
          <div className="h-full rounded-full bg-gradient-to-r from-[#38A6DE] to-[#22C55E]" style={{ width: `${Math.min(100, Number(colis.progression) || 0)}%` }} />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <div className="space-y-4 xl:col-span-2">
          <div className={`${panelClass} p-5`}>
            <h2 className="mb-4 font-display text-[14px] font-semibold text-white">Détails du colis</h2>
            <dl className="grid grid-cols-2 gap-x-4 gap-y-4 lg:grid-cols-3">
              {infos.map((i) => (
                <div key={i.label}>
                  <dt className="text-[10.5px] uppercase tracking-wider text-white/35">{i.label}</dt>
                  <dd className="mt-0.5 break-words text-[12.5px] text-white/85">{i.value}</dd>
                </div>
              ))}
            </dl>
          </div>

          <div className={panelClass}>
            <h2 className="px-5 py-4 font-display text-[14px] font-semibold text-white">Historique de suivi</h2>
            <ol className="space-y-4 border-t border-white/[0.05] px-5 py-5">
              {logs.length === 0 ? (
                <p className="text-[12.5px] text-white/35">Aucun événement enregistré.</p>
              ) : (
                logs.map((l) => (
                  <li key={l.id} className="relative pl-5">
                    <span className="absolute left-0 top-1.5 h-2 w-2 rounded-full bg-[#FF4500]" />
                    <span className="absolute left-[3.5px] top-4 h-full w-px bg-white/[0.07]" />
                    <div className="flex flex-wrap items-center gap-2">
                      <StatutBadge statut={l.statut} />
                      <span className="text-[11px] text-white/35">{formatDateCourt(l.date_evenement)}</span>
                    </div>
                    <p className="mt-1 text-[12px] text-white/60">{l.lieu || "—"}{l.note ? ` · ${l.note}` : ""}</p>
                  </li>
                ))
              )}
            </ol>
          </div>
        </div>

        {/* Sur mobile, la mise à jour du statut (action principale des agents) passe en premier. */}
        <div className="order-first space-y-4 xl:order-none">
          {peutModifier ? (
          <div className={`${panelClass} p-5`}>
            <h2 className="mb-3 font-display text-[14px] font-semibold text-white">Mettre à jour le statut</h2>
            <label className="block">
              <span className={labelClass}>Nouveau statut</span>
              <select value={nouveauStatut} onChange={(e) => setNouveauStatut(e.target.value)} className={inputClass}>
                {!statutsAutorises.includes(colis.statut) ? (
                  <option value={colis.statut} disabled>{colis.statut} (actuel)</option>
                ) : null}
                {statutsAutorises.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </label>
            <label className="mt-3 block">
              <span className={labelClass}>Lieu</span>
              <input value={lieu} onChange={(e) => setLieu(e.target.value)} placeholder="Port de Cotonou" className={inputClass} />
            </label>
            <label className="mt-3 block">
              <span className={labelClass}>Note</span>
              <input value={note} onChange={(e) => setNote(e.target.value)} placeholder="Observation (optionnel)" className={inputClass} />
            </label>

            {erreur ? <p className="mt-3 text-[12px] text-[#F87171]">{erreur}</p> : null}

            <button onClick={appliquer} className={`${btnPrimary} mt-4 w-full`} disabled={saving || nouveauStatut === colis.statut}>
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              Enregistrer l'étape
            </button>
            <p className="mt-2 text-[10.5px] leading-snug text-white/30">
              {peutNotifier
                ? "Passer au statut « Disponible à l'agence » prépare automatiquement la notification client."
                : "Les étapes que vous pouvez appliquer dépendent de votre rôle."}
            </p>
          </div>
          ) : isClient ? (
            colis.statut === "Disponible à l'agence" ? (
              <div className="space-y-3">
                <div className="rounded-2xl border border-[#22C55E]/30 bg-[#22C55E]/[0.07] p-4">
                  <h2 className="font-display text-[14px] font-semibold text-white">Votre colis est prêt</h2>
                  <p className="mt-1 text-[12.5px] text-white/70">Il vous attend à l'agence.</p>
                </div>
                <AgenceRetrait />
              </div>
            ) : null
          ) : (
            <div className={`${panelClass} p-5 text-[12.5px] text-white/50`}>
              Votre rôle permet de consulter ce colis, mais pas de modifier son statut.
            </div>
          )}

          {notification ? (
            <div className="rounded-2xl border border-[#22C55E]/25 bg-[#22C55E]/[0.06] p-5">
              <div className="mb-2 flex items-center justify-between">
                <h3 className="font-display text-[13.5px] font-semibold text-white">Notification préparée</h3>
                <span className="rounded-full bg-[#F59E0B]/15 px-2 py-0.5 text-[10px] font-medium text-[#FBBF24]">
                  {notification.notification?.statut || "En attente"}
                </span>
              </div>
              <p className="whitespace-pre-wrap text-[12px] leading-relaxed text-white/70">{notification.message}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {tel ? (
                  <a
                    href={`https://wa.me/${tel}?text=${encodeURIComponent(notification.message)}`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 rounded-xl bg-[#22C55E] px-3 py-2 text-[11.5px] font-medium text-white hover:bg-[#16a34a]"
                  >
                    <MessageCircle className="h-3.5 w-3.5" /> Ouvrir WhatsApp
                  </a>
                ) : null}
                <button onClick={copier} className="inline-flex items-center gap-1.5 rounded-xl border border-white/[0.12] px-3 py-2 text-[11.5px] text-white/75 hover:text-white">
                  {copie ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />} {copie ? "Copié" : "Copier"}
                </button>
                <button onClick={marquerEnvoyee} className="inline-flex items-center gap-1.5 rounded-xl border border-white/[0.12] px-3 py-2 text-[11.5px] text-white/75 hover:text-white">
                  Marquer comme envoyée
                </button>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}