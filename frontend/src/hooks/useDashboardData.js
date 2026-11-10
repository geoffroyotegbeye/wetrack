import { useEffect, useState } from "react";
import { api } from "@/api/client";

const EMPTY_STATS = {
  commandes: 0, enTransit: 0, disponibles: 0, clients: 0,
  douane: 0, chargement: 0, enAchat: 0, enEntrepot: 0, livres: 0, retires: 0,
};

function toMap(rows) {
  const map = {};
  (rows || []).forEach((r) => {
    map[r.statut] = r.count ?? 0;
  });
  return map;
}

function buildSeries(commandes, colis) {
  const map = {};
  const today = new Date();
  for (let i = 89; i >= 0; i -= 1) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    map[key] = { date: key, commandes: 0, livres: 0 };
  }
  commandes.forEach((c) => {
    const key = String(c.date_commande || c.created_date || "").slice(0, 10);
    if (map[key]) map[key].commandes += 1;
  });
  colis.forEach((c) => {
    const key = String(c.eta || c.created_date || "").slice(0, 10);
    if (map[key]) map[key].livres += 1;
  });
  return Object.values(map).sort((a, b) => a.date.localeCompare(b.date));
}

export function useDashboardData() {
  const [state, setState] = useState({
    isLoading: true,
    stats: EMPTY_STATS,
    series: [],
    statuts: [],
    totalStatuts: 0,
    commandes: [],
    cargos: { aeriens: [], maritimes: [] },
    notifications: [],
    nonLues: 0,
  });

  useEffect(() => {
    let active = true;

    const load = async () => {
      const [dernieres, cmdAgg, colisAgg, clients, cargos, notifs, toutesCmd, colisLivres, enAttente] = await Promise.all([
        api.entities.Commande.list({ sort: "-created_date", limit: 5 }),
        api.entities.Commande.aggregate({ groupBy: "statut" }),
        api.entities.Colis.aggregate({ groupBy: "statut" }),
        api.entities.Client.count(),
        api.entities.Cargaison.list({ sort: "date_depart", limit: 20 }),
        api.entities.NotificationLog.list({ sort: "-created_date", limit: 4 }),
        api.entities.Commande.list({ sort: "date_commande", limit: 300 }),
        api.entities.Colis.filter({ statut: { $in: ["Livré", "Retiré"] } }, { limit: 300 }),
        api.entities.NotificationLog.count({ statut: "En attente" }),
      ]);

      if (!active) return;

      const colis = toMap(colisAgg?.rows);
      const cmd = toMap(cmdAgg?.rows);

      const transit = (colis["Chargement"] || 0) + (colis["En transit"] || 0);
      const douane = colis["En dédouanement"] || 0;
      const agence = colis["Disponible à l'agence"] || 0;
      const livres = (colis["Livré"] || 0) + (colis["Retiré"] || 0);
      const retires = colis["Retiré"] || 0;
      const totalColis = Object.values(colis).reduce((a, b) => a + b, 0);

      const parts = [
        { name: "En transit", value: transit + douane, color: "#38A6DE" },
        { name: "En douane", value: douane, color: "#FF4500" },
        { name: "À l'agence", value: agence, color: "#22C55E" },
        { name: "Livrés", value: livres, color: "#A855F7" },
      ].filter((p) => p.value > 0);

      const statuts = totalColis
        ? parts.map((p) => ({ ...p, valueMath: p.value, value: Math.round((p.value / totalColis) * 100) }))
        : [];

      const cargosList = cargos?.items || [];
      const allCommandes = toutesCmd?.items || [];
      const livresList = colisLivres?.items || [];

      setState({
        isLoading: false,
        stats: {
          commandes: Object.values(cmd).reduce((a, b) => a + b, 0),
          enTransit: transit + douane,
          disponibles: agence,
          clients,
          douane,
          chargement: colis["Chargement"] || 0,
          enAchat: (cmd["Commande en cours"] || 0) + (cmd["Commandée auprès du fournisseur"] || 0),
          enEntrepot: cmd["Reçue en entrepôt"] || 0,
          livres,
          retires,
        },
        series: buildSeries(allCommandes, livresList),
        statuts: statuts.map(({ name, value, color }) => ({ name, value, color })),
        totalStatuts: totalColis,
        commandes: (dernieres?.items || []).map((c) => ({
          id: c.id,
          reference: c.reference,
          client_nom: c.client_nom,
          poids: c.poids_total,
          cbm: c.cbm_total,
          statut: c.statut,
          eta: c.date_commande,
        })),
        cargos: {
          aeriens: cargosList.filter((c) => c.type === "Aérien").map((c) => ({ ...c, date: c.date_depart, etat: c.statut })),
          maritimes: cargosList.filter((c) => c.type === "Maritime").map((c) => ({ ...c, date: c.date_depart, etat: c.statut })),
        },
        notifications: (notifs?.items || []).map((n) => ({
          id: n.id,
          type: n.canal === "WhatsApp" || n.canal === "SMS" ? "disponible" : "info",
          texte: n.message,
          date: n.date_envoi || n.created_date,
          canal: n.canal,
        })),
        nonLues: enAttente || 0,
      });
    };

    load().catch(() => {
      if (active) setState((s) => ({ ...s, isLoading: false }));
    });

    return () => {
      active = false;
    };
  }, []);

  return state;
}