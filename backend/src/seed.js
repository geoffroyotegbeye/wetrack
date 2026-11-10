// Données de démonstration Wetrack.
//
//   npm run seed            -> remplit la base si elle est vide (sinon ne fait rien)
//   npm run seed -- --reset -> vide les données métier puis les recrée
//
// Les données sont générées de façon déterministe (mêmes résultats à chaque exécution),
// avec des dates relatives à aujourd'hui pour que le tableau de bord reste vivant.
import { fileURLToPath } from 'node:url';
import bcrypt from 'bcryptjs';
import { pool } from './db.js';
import { migrate } from './migrate.js';
import { messageNotification } from './functions.js';

// ---------- Référentiels (alignés sur frontend/src/lib/logistics.js) ----------

const TARIFS = { aerien: { standard: 8500, express: 11000 }, maritime: { standard: 180000, express: 220000 } };
const DIVISEUR_AERIEN = 5000;

const STATUTS_COLIS = [
  'En entrepôt Chine', 'Chargement', 'En transit', 'En dédouanement', "Disponible à l'agence", 'Livré', 'Retiré',
];

const LIEUX = {
  Aérien: {
    'En entrepôt Chine': 'Entrepôt Guangzhou',
    Chargement: 'Aéroport de Guangzhou Baiyun',
    'En transit': 'Vol cargo CAN → COO',
    'En dédouanement': 'Aéroport de Cotonou Cadjèhoun',
    "Disponible à l'agence": 'Agence Webdadd Cotonou',
    Livré: 'Agence Webdadd Cotonou',
    Retiré: 'Agence Webdadd Cotonou',
  },
  Maritime: {
    'En entrepôt Chine': 'Entrepôt Ningbo',
    Chargement: 'Port de Ningbo-Zhoushan',
    'En transit': 'Navire en mer (Ningbo → Cotonou)',
    'En dédouanement': 'Port autonome de Cotonou',
    "Disponible à l'agence": 'Agence Webdadd Cotonou',
    Livré: 'Agence Webdadd Cotonou',
    Retiré: 'Agence Webdadd Cotonou',
  },
};

const NOTES = {
  'En entrepôt Chine': 'Colis reçu et contrôlé',
  Chargement: 'Colis consolidé et embarqué',
  'En transit': 'Départ confirmé par le transporteur',
  'En dédouanement': 'Inspection douanière en cours',
  "Disponible à l'agence": 'Prêt pour le retrait — pièce d\'identité obligatoire',
  Livré: 'Remis au client',
  Retiré: 'Retiré en agence sur présentation de la pièce d\'identité',
};

const CLIENTS = [
  ['Koffi Adjovi', '+229 97 12 34 56', 'koffi.adjovi@gmail.com', 'Cotonou', 'Bénin'],
  ['Aïcha Bello', '+229 96 45 78 12', 'aicha.bello@yahoo.fr', 'Porto-Novo', 'Bénin'],
  ['Marcellin Hounkpatin', '+229 95 33 21 09', 'm.hounkpatin@outlook.com', 'Abomey-Calavi', 'Bénin'],
  ['Fatoumata Diallo', '+229 61 88 90 11', 'fatou.diallo@gmail.com', 'Parakou', 'Bénin'],
  ['Serge Agbodjan', '+228 90 12 45 67', 's.agbodjan@gmail.com', 'Lomé', 'Togo'],
  ['Nadège Kpossou', '+229 66 20 14 77', 'nadege.kpossou@gmail.com', 'Cotonou', 'Bénin'],
  ['Ibrahim Moussa', '+227 96 11 22 33', 'ibrahim.moussa@yahoo.fr', 'Niamey', 'Niger'],
  ['Christelle Dossou', '+229 97 55 66 44', 'christelle.dossou@gmail.com', 'Cotonou', 'Bénin'],
  ['Yao Kouassi', '+225 07 08 09 10 11', 'yao.kouassi@gmail.com', 'Abidjan', "Côte d'Ivoire"],
  ['Rachidatou Sanni', '+229 94 10 20 30', 'r.sanni@gmail.com', 'Bohicon', 'Bénin'],
  ['Éric Zinsou', '+229 90 87 65 43', 'eric.zinsou@entreprise.bj', 'Cotonou', 'Bénin'],
  ['Mariam Traoré', '+226 70 11 22 33', 'mariam.traore@gmail.com', 'Ouagadougou', 'Burkina Faso'],
  ['Gildas Ahouansou', '+229 67 44 33 22', 'gildas.ahouansou@gmail.com', 'Ouidah', 'Bénin'],
  ['Prisca Tchibozo', '+229 98 76 54 32', 'prisca.tchibozo@gmail.com', 'Cotonou', 'Bénin'],
];

const PRODUITS = [
  ['Lot de chaussures de sport (24 paires)', 'Aérien'],
  ['Smartphones et accessoires', 'Aérien'],
  ['Pièces détachées moto', 'Maritime'],
  ['Tissus wax et pagnes', 'Aérien'],
  ['Panneaux solaires 300 W', 'Maritime'],
  ['Mobilier de bureau', 'Maritime'],
  ['Cosmétiques et soins capillaires', 'Aérien'],
  ['Ordinateurs portables reconditionnés', 'Aérien'],
  ['Groupe électrogène 5 kVA', 'Maritime'],
  ['Vêtements enfants (assortiment)', 'Aérien'],
  ['Électroménager (réfrigérateurs)', 'Maritime'],
  ['Perruques et mèches', 'Aérien'],
  ['Carrelage et sanitaires', 'Maritime'],
  ['Montres et bijoux fantaisie', 'Aérien'],
  ['Matériel de salon de coiffure', 'Maritime'],
];

const UTILISATEURS = [
  ['operations@wetrack.local', 'Responsable Opérations', 'gestionnaire'],
  ['logistique.chine@wetrack.local', 'Logistique Chine', 'agent_chine'],
  ['agent.cotonou@wetrack.local', 'Agent Cotonou', 'agent_agence'],
  ['consultation@wetrack.local', 'Consultation', 'lecteur'],
];
const COMPTE_CLIENT_DEMO = 'client@wetrack.local';
// En ligne, définir SEED_PASSWORD : le mot de passe par défaut est visible dans le dépôt public.
const MOT_DE_PASSE_DEMO = process.env.SEED_PASSWORD || 'Demo-2026!';

// ---------- Outils ----------

// Générateur pseudo-aléatoire déterministe (mulberry32).
function rng(seed) {
  let a = seed;
  return () => {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const rand = rng(20261109);
const between = (min, max) => min + rand() * (max - min);
const int = (min, max) => Math.floor(between(min, max + 1));
const pick = (arr) => arr[Math.floor(rand() * arr.length)];

const DAY = 86_400_000;
const today = new Date();
today.setHours(10, 0, 0, 0);
const daysAgo = (n, hour = 10) => {
  const d = new Date(today.getTime() - n * DAY);
  d.setHours(hour, int(0, 59), 0, 0);
  return d;
};
const isoDay = (d) => d.toISOString().slice(0, 10);

const coutAerien = (poidsReel, l, w, h, service) => {
  const poidsVol = (l * w * h) / DIVISEUR_AERIEN;
  const taxable = Math.max(poidsReel, poidsVol);
  return { poidsVol: Number(poidsVol.toFixed(2)), cout: Math.round(taxable * TARIFS.aerien[service]) };
};
const coutMaritime = (cbm, service) => Math.round(cbm * TARIFS.maritime[service]);

// Statut du colis en fonction de l'ancienneté de la commande (plus ancienne = plus avancée).
function statutSelonAge(age, mode) {
  const rythme = mode === 'Aérien' ? 4 : 11; // jours par étape
  const etape = Math.min(Math.floor(age / rythme), STATUTS_COLIS.length - 1);
  if (etape >= 5) return rand() < 0.5 ? 'Livré' : 'Retiré';
  return STATUTS_COLIS[etape];
}

function statutCommande(statutsColis, age) {
  if (age < 2 && rand() < 0.5) return 'En attente';
  if (statutsColis.every((s) => s === 'Livré' || s === 'Retiré')) return 'Livrée';
  if (statutsColis.every((s) => s === 'En entrepôt Chine')) return age < 4 ? 'Validée' : 'En préparation';
  return 'Expédiée';
}

// ---------- Insertion ----------

async function insert(client, table, data, createdDate, userId) {
  const { rows } = await client.query(
    `INSERT INTO ${table} (data, created_by, created_date, updated_date) VALUES ($1, $2, $3, $3) RETURNING id`,
    [data, userId, createdDate],
  );
  return rows[0].id;
}

const TABLES = ['notification_logs', 'tracking_logs', 'colis', 'commandes', 'cargaisons', 'clients'];

export async function seed({ reset = false } = {}) {
  await migrate();
  const client = await pool.connect();
  try {
    if (!reset) {
      const { rows } = await client.query('SELECT (SELECT count(*) FROM clients) + (SELECT count(*) FROM commandes) AS n');
      if (rows[0].n > 0) {
        console.log('[seed] La base contient déjà des données. Utilisez --reset pour la réinitialiser.');
        return;
      }
    }

    await client.query('BEGIN');
    if (reset) await client.query(`TRUNCATE ${TABLES.join(', ')}`);

    // Utilisateurs de démonstration (l'administrateur est créé par la migration).
    const hash = await bcrypt.hash(MOT_DE_PASSE_DEMO, 12);
    for (const [email, nom, role] of UTILISATEURS) {
      await client.query(
        `INSERT INTO users (email, password_hash, full_name, role) VALUES ($1, $2, $3, $4)
         ON CONFLICT (email) DO UPDATE SET role = EXCLUDED.role, full_name = EXCLUDED.full_name`,
        [email, hash, nom, role],
      );
    }
    const admin = (await client.query(`SELECT id FROM users WHERE role = 'admin' ORDER BY created_date LIMIT 1`)).rows[0];
    const adminId = admin?.id || null;

    // Clients
    const clients = [];
    for (const [i, [nom, telephone, email, ville, pays]] of CLIENTS.entries()) {
      const data = { nom, telephone, email, ville, pays, code_client: `CLI-${String(i + 1).padStart(4, '0')}` };
      const id = await insert(client, 'clients', data, daysAgo(120 - i * 3), adminId);
      clients.push({ id, ...data });
    }

    // Compte de démonstration pour l'espace client, relié à la fiche « Aïcha Bello ».
    const clienteDemo = clients.find((c) => c.nom === 'Aïcha Bello');
    await client.query(
      `INSERT INTO users (email, password_hash, full_name, role, client_id) VALUES ($1, $2, $3, 'client', $4)
       ON CONFLICT (email) DO UPDATE SET role = 'client', client_id = EXCLUDED.client_id, full_name = EXCLUDED.full_name`,
      [COMPTE_CLIENT_DEMO, hash, clienteDemo.nom, clienteDemo.id],
    );

    // Cargaisons (passées, en cours et à venir)
    const cargaisons = [];
    const planCargaisons = [
      ['Aérien', 'CA-AIR-2608', 'Ethiopian Cargo', -70, -64, 'Clôturé', 2000],
      ['Aérien', 'CA-AIR-2609', 'Turkish Cargo', -40, -35, 'Clôturé', 2500],
      ['Aérien', 'CA-AIR-2610', 'Ethiopian Cargo', -12, -6, 'Arrivé', 2000],
      ['Aérien', 'CA-AIR-2611', 'Air France Cargo', -3, 3, 'En transit', 2500],
      ['Aérien', 'CA-AIR-2612', 'Turkish Cargo', 6, 12, 'Planifié', 2000],
      ['Maritime', 'MSC-NGB-2607', 'MSC', -95, -55, 'Clôturé', 67],
      ['Maritime', 'CMA-NGB-2609', 'CMA CGM', -48, -8, 'Arrivé', 67],
      ['Maritime', 'MSK-NGB-2610', 'Maersk', -20, 22, 'En transit', 67],
      ['Maritime', 'MSC-NGB-2612', 'MSC', 9, 50, 'En chargement', 33],
    ];
    for (const [type, code, transporteur, depart, arrivee, statut, capacite] of planCargaisons) {
      const data = {
        code,
        type,
        transporteur,
        origine: type === 'Aérien' ? 'Guangzhou (CAN)' : 'Ningbo (NGB)',
        destination: type === 'Aérien' ? 'Cotonou (COO)' : 'Port de Cotonou',
        date_depart: isoDay(daysAgo(-depart)),
        date_arrivee: isoDay(daysAgo(-arrivee)),
        statut,
        capacite,
        charge: 0,
      };
      const id = await insert(client, 'cargaisons', data, daysAgo(Math.max(-depart + 10, 1)), adminId);
      cargaisons.push({ id, ...data, depart, arrivee });
    }
    const cargaisonPour = (mode, age) => {
      const candidats = cargaisons.filter((c) => c.type === mode && c.depart <= -age + (mode === 'Aérien' ? 8 : 25));
      const proche = candidats.sort((a, b) => b.depart - a.depart)[0];
      return proche || cargaisons.find((c) => c.type === mode && c.statut === 'Planifié') || cargaisons.find((c) => c.type === mode);
    };

    // Commandes, colis (multi-colis), suivi et notifications
    let numero = 8900;
    let nbColis = 0;
    let nbLogs = 0;
    let nbNotifs = 0;
    for (let age = 88; age >= 0; age -= int(1, 3)) {
      numero += int(1, 4);
      const cli = pick(clients);
      const [produit, mode] = pick(PRODUITS);
      const nbSousColis = rand() < 0.35 ? int(2, 3) : 1;
      const reference = `WD-${numero}`;
      const dateCommande = daysAgo(age, int(8, 18));

      const colisData = [];
      for (let k = 0; k < nbSousColis; k += 1) {
        const ageColis = Math.max(age - k * 2, 0);
        const statut = statutSelonAge(ageColis, mode);
        const express = rand() < 0.25 ? 'express' : 'standard';
        const cargo = cargaisonPour(mode, ageColis);
        let poidsReel = 0; let poidsVol = 0; let cbm = 0; let cout; let l = 0; let w = 0; let h = 0;
        if (mode === 'Aérien') {
          poidsReel = Number(between(3, 45).toFixed(1));
          l = int(30, 80); w = int(25, 60); h = int(20, 50);
          ({ poidsVol, cout } = coutAerien(poidsReel, l, w, h, express));
        } else {
          cbm = Number(between(0.3, 4.5).toFixed(2));
          poidsReel = Math.round(cbm * between(120, 260));
          cout = coutMaritime(cbm, express);
        }
        const index = STATUTS_COLIS.indexOf(statut);
        const eta = new Date(dateCommande.getTime() + (mode === 'Aérien' ? 18 : 55) * DAY);
        colisData.push({
          reference: `WBD-${numero}-${String.fromCharCode(65 + k)}`,
          commande_reference: reference,
          client_id: cli.id,
          client_nom: cli.nom,
          client_telephone: cli.telephone,
          description: nbSousColis > 1 ? `${produit} — partie ${k + 1}/${nbSousColis}` : produit,
          mode,
          service: express === 'express' ? (mode === 'Aérien' ? 'Priority Express' : 'Express') : 'Standard',
          poids_reel: poidsReel,
          longueur: l,
          largeur: w,
          hauteur: h,
          poids_volumetrique: poidsVol,
          cbm,
          statut,
          progression: Math.round((index / (STATUTS_COLIS.length - 1)) * 100),
          eta: isoDay(eta),
          cargo_code: index >= 1 ? cargo.code : '',
          tracking_transporteur: index >= 2 ? `${mode === 'Aérien' ? 'AWB' : 'BL'}-${int(100000, 999999)}` : '',
          cout_fret: cout,
          _age: ageColis,
          _cargo: cargo,
        });
      }

      const statutsColis = colisData.map((c) => c.statut);
      const commandeData = {
        reference,
        client_id: cli.id,
        client_nom: cli.nom,
        client_telephone: cli.telephone,
        description: produit,
        montant_marchandise: Math.round(between(150, 4500)) * 1000,
        poids_total: Number(colisData.reduce((s, c) => s + c.poids_reel, 0).toFixed(1)),
        cbm_total: Number(colisData.reduce((s, c) => s + c.cbm, 0).toFixed(2)),
        statut: statutCommande(statutsColis, age),
        date_commande: isoDay(dateCommande),
        source: 'Webdadd',
      };
      if (age > 20 && rand() < 0.04) commandeData.statut = 'Annulée';
      const commandeId = await insert(client, 'commandes', commandeData, dateCommande, adminId);
      if (commandeData.statut === 'Annulée' || commandeData.statut === 'En attente') continue;

      for (const c of colisData) {
        const { _age, _cargo, ...data } = c;
        const colisId = await insert(client, 'colis', { ...data, commande_id: commandeId }, new Date(dateCommande.getTime() + DAY), adminId);
        nbColis += 1;
        const index = STATUTS_COLIS.indexOf(data.statut);
        if (index >= 1 && _cargo) {
          _cargo.charge += data.mode === 'Aérien' ? Math.max(data.poids_reel, data.poids_volumetrique) : data.cbm;
        }

        // Historique de suivi : une entrée par étape franchie.
        const etapes = STATUTS_COLIS.slice(0, index + 1).filter((s) => !(s === 'Retiré' && data.statut === 'Livré') && !(s === 'Livré' && data.statut === 'Retiré'));
        const pas = Math.max(Math.floor(_age / Math.max(etapes.length, 1)), 1);
        for (const [i, statut] of etapes.entries()) {
          const date = daysAgo(Math.max(_age - i * pas, 0), int(7, 19));
          await insert(client, 'tracking_logs', {
            colis_id: colisId,
            colis_reference: data.reference,
            statut,
            lieu: LIEUX[data.mode][statut],
            note: NOTES[statut],
            date_evenement: date.toISOString(),
          }, date, adminId);
          nbLogs += 1;
        }

        // Notification « disponible à l'agence » (CDC §2.4)
        if (index >= 4) {
          const date = daysAgo(Math.max(_age - 4 * pas, 0), int(9, 17));
          const envoyee = index > 4 || rand() < 0.4;
          const canal = rand() < 0.75 ? 'WhatsApp' : 'SMS';
          await insert(client, 'notification_logs', {
            colis_id: colisId,
            colis_reference: data.reference,
            client_nom: data.client_nom,
            canal,
            destinataire: data.client_telephone,
            message: messageNotification(data),
            statut: envoyee ? 'Envoyée' : 'En attente',
            date_envoi: envoyee ? date.toISOString() : null,
          }, date, adminId);
          nbNotifs += 1;
        }
      }
    }

    // Charge des cargaisons (kg ou CBM), plafonnée à la capacité.
    for (const c of cargaisons) {
      const charge = Number(Math.min(c.charge, c.capacite).toFixed(c.type === 'Aérien' ? 0 : 2));
      await client.query(`UPDATE cargaisons SET data = data || jsonb_build_object('charge', $1::numeric) WHERE id = $2`, [charge, c.id]);
    }

    // Quelques notifications système / email.
    const systeme = [
      ['Système', null, `Cargaison ${cargaisons[3].code} partie de Guangzhou.`, 'Envoyée', 3],
      ['Email', 'compta@webdadd.com', 'Rapport hebdomadaire des expéditions disponible.', 'Envoyée', 7],
      ['Système', null, `Cargaison ${cargaisons[8].code} en cours de chargement à Ningbo.`, 'En attente', 1],
    ];
    for (const [canal, destinataire, message, statut, age] of systeme) {
      const date = daysAgo(age);
      await insert(client, 'notification_logs', {
        canal, destinataire, message, statut, client_nom: 'Équipe Wetrack', date_envoi: statut === 'Envoyée' ? date.toISOString() : null,
      }, date, adminId);
      nbNotifs += 1;
    }

    await client.query('COMMIT');
    const nbCommandes = (await client.query('SELECT count(*)::int AS n FROM commandes')).rows[0].n;
    console.log(`[seed] ${clients.length} clients, ${cargaisons.length} cargaisons, ${nbCommandes} commandes, ${nbColis} colis, ${nbLogs} événements de suivi, ${nbNotifs} notifications.`);
    console.log(`[seed] Comptes de démo : ${[...UTILISATEURS.map((u) => u[0]), COMPTE_CLIENT_DEMO].join(', ')} (mot de passe : ${MOT_DE_PASSE_DEMO})`);
  } catch (err) {
    await client.query('ROLLBACK').catch(() => {});
    throw err;
  } finally {
    client.release();
  }
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  seed({ reset: process.argv.includes('--reset') })
    .then(() => pool.end())
    .catch((err) => { console.error(err); process.exit(1); });
}
