-- Les statuts de commande deviennent les étapes de la commande :
--   Commande en cours → Commandée auprès du fournisseur → Reçue en entrepôt → Expédiée → Livrée (+ Annulée)
-- Conversion des anciens statuts (En attente, Validée, En préparation) et des libellés intermédiaires.

-- 1. Commande avec au moins un colis (et non annulée) : la règle automatique s'applique.
WITH etat AS (
  SELECT data->>'commande_id' AS commande_id,
         count(*) AS total,
         count(*) FILTER (WHERE data->>'statut' IN ('Livré', 'Retiré')) AS termines,
         count(*) FILTER (WHERE data->>'statut' <> 'En entrepôt Chine') AS partis
  FROM colis
  WHERE data ? 'commande_id'
  GROUP BY 1
)
UPDATE commandes c
   SET data = jsonb_set(c.data, '{statut}', to_jsonb(
         CASE WHEN e.termines = e.total THEN 'Livrée'
              WHEN e.partis > 0 THEN 'Expédiée'
              ELSE 'Reçue en entrepôt' END)),
       updated_date = now()
  FROM etat e
 WHERE c.id::text = e.commande_id
   AND c.data->>'statut' IS DISTINCT FROM 'Annulée';

-- 2. Commande sans colis : selon que l'achat chez le fournisseur est daté ou non.
UPDATE commandes c
   SET data = jsonb_set(c.data, '{statut}', to_jsonb(
         CASE WHEN c.data->>'date_commande_fournisseur' IS NOT NULL THEN 'Commandée auprès du fournisseur'
              ELSE 'Commande en cours' END)),
       updated_date = now()
 WHERE c.data->>'statut' IN ('En attente', 'Validée', 'En préparation',
                             'Commande en cours en Chine', 'Commandé auprès du fournisseur en Chine')
   AND NOT EXISTS (SELECT 1 FROM colis k WHERE k.data->>'commande_id' = c.id::text);
