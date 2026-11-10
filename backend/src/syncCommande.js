import { query } from './db.js';

// Statut d'une commande déduit de ses colis :
//   - tous les colis livrés ou retirés            → « Livrée »
//   - au moins un colis a quitté l'entrepôt Chine → « Expédiée »
//   - colis tous encore en entrepôt Chine         → « Reçue en entrepôt »
// Sans colis, ou si la commande est « Annulée », le statut reste celui choisi par l'équipe.
// Même règle dans les migrations 004 et 005.
const SQL = `
  WITH etat AS (
    SELECT count(*) AS total,
           count(*) FILTER (WHERE data->>'statut' IN ('Livré', 'Retiré')) AS termines,
           count(*) FILTER (WHERE data->>'statut' <> 'En entrepôt Chine') AS partis
    FROM colis
    WHERE data->>'commande_id' = $1
  ),
  cible AS (
    SELECT CASE
             WHEN termines = total THEN 'Livrée'
             WHEN partis > 0 THEN 'Expédiée'
             ELSE 'Reçue en entrepôt'
           END AS statut
    FROM etat
    WHERE total > 0
  )
  UPDATE commandes
     SET data = jsonb_set(data, '{statut}', to_jsonb(cible.statut)), updated_date = now()
    FROM cible
   WHERE commandes.id::text = $1
     AND commandes.data->>'statut' IS DISTINCT FROM 'Annulée'
     AND commandes.data->>'statut' IS DISTINCT FROM cible.statut
  RETURNING commandes.data->>'statut' AS statut`;

export async function syncCommande(commandeId) {
  if (!commandeId) return null;
  const { rows } = await query(SQL, [String(commandeId)]);
  return rows[0]?.statut || null;
}
