// Informations de l'agence de retrait, affichées dans l'espace client.
// À compléter avec les vraies coordonnées : un champ vide (null) n'est simplement pas affiché.
export const AGENCE = {
  nom: "Agence Webdadd Cotonou",
  adresse: null, // ex. "Quartier …, Cotonou, Bénin"
  horaires: [
    // ex. { jours: "Lundi – Vendredi", heures: "8h00 – 18h00" },
  ],
  telephone: null, // ex. "+229 01 00 00 00 00"
  whatsapp: null, // numéro au format international sans espaces, ex. "22901000000"
  carte: null, // lien Google Maps
};

export const RAPPEL_PIECE_IDENTITE = "Munissez-vous obligatoirement de votre pièce d'identité pour le retrait.";
