-- Aligne le statut des commandes existantes sur leurs colis (même règle que src/syncCommande.js).
WITH etat AS (
  SELECT data->>'commande_id' AS commande_id,
         count(*) AS total,
         count(*) FILTER (WHERE data->>'statut' IN ('Livré', 'Retiré')) AS termines,
         count(*) FILTER (WHERE data->>'statut' <> 'En entrepôt Chine') AS partis
  FROM colis
  WHERE data ? 'commande_id'
  GROUP BY 1
),
cible AS (
  SELECT commande_id,
         CASE
           WHEN termines = total THEN 'Livrée'
           WHEN partis > 0 THEN 'Expédiée'
           ELSE 'En préparation'
         END AS statut
  FROM etat
)
UPDATE commandes
   SET data = jsonb_set(data, '{statut}', to_jsonb(cible.statut)), updated_date = now()
  FROM cible
 WHERE commandes.id::text = cible.commande_id
   AND commandes.data->>'statut' IS DISTINCT FROM 'Annulée'
   AND commandes.data->>'statut' IS DISTINCT FROM cible.statut;
