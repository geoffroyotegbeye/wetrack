import { Router } from 'express';
import { query } from './db.js';
import { HttpError, ah } from './http.js';
import { can } from './permissions.js';

// Modèle de message imposé par le CDC §2.4 (rappel obligatoire de la pièce d'identité).
export function messageNotification(colis) {
  const nom = colis.client_nom || 'cher client';
  const description = colis.description || 'vos marchandises';
  return `Bonjour ${nom}, votre colis WebCargo N° ${colis.reference} (${description}) est arrivé et disponible à l'agence Webdadd. Merci de vous munir obligatoirement de votre PIÈCE D'IDENTITÉ pour le retrait.`;
}

const CANAUX = new Set(['WhatsApp', 'SMS', 'Email']);

const functions = {
  // Prépare la notification « colis disponible » et l'enregistre (statut « En attente »).
  // L'envoi effectif (Twilio / WhatsApp Business) se branchera ici.
  async notifierColis({ colisId, canal = 'WhatsApp' }, user) {
    if (!colisId) throw new HttpError(400, 'colisId requis.');
    if (!CANAUX.has(canal)) throw new HttpError(400, 'Canal invalide.');
    const { rows } = await query('SELECT id, data FROM colis WHERE id = $1', [colisId]);
    if (!rows[0]) throw new HttpError(404, 'Colis introuvable.');
    const colis = rows[0].data;
    const message = messageNotification(colis);
    const destinataire = colis.client_telephone || colis.client_email || null;
    const notif = await query(
      `INSERT INTO notification_logs (data, created_by) VALUES ($1, $2) RETURNING *`,
      [{
        colis_id: colisId,
        colis_reference: colis.reference,
        client_nom: colis.client_nom,
        canal,
        destinataire,
        message,
        statut: 'En attente',
      }, user.id],
    );
    const n = notif.rows[0];
    return { message, destinataire, notification: { ...n.data, id: n.id, created_date: n.created_date } };
  },
};

export const functionsRouter = Router();

functionsRouter.post('/:name', ah(async (req, res) => {
  const fn = functions[req.params.name];
  if (!fn) throw new HttpError(404, `Fonction inconnue : ${req.params.name}`);
  if (!can.fn(req.user.role, req.params.name)) throw new HttpError(403, "Vous n'avez pas les droits pour cette action.");
  const data = await fn(req.body || {}, req.user);
  res.json({ data });
}));
