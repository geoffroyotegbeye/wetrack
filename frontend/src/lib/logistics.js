export const BRAND = {
  orange: "#FF4500",
  cyan: "#38A6DE",
  green: "#22C55E",
  purple: "#A855F7",
  amber: "#F59E0B",
};

export const TARIFS = {
  aerien: { standard: 8500, express: 11000, unite: "/kg" },
  maritime: { standard: 180000, express: 220000, unite: "/CBM" },
};

export const DIVISEUR_AERIEN = 5000;

export const STATUTS_COLIS = [
  "En entrepôt Chine",
  "Chargement",
  "En transit",
  "En dédouanement",
  "Disponible à l'agence",
  "Livré",
  "Retiré",
];

export const STATUTS_COMMANDE = [
  "En attente",
  "Validée",
  "En préparation",
  "Expédiée",
  "Livrée",
  "Annulée",
];

export const STATUTS_CARGAISON = [
  "Planifié",
  "En chargement",
  "En transit",
  "Arrivé",
  "Clôturé",
];

export const STATUT_CLASSES = {
  "En entrepôt Chine": "bg-[#64748B]/15 text-[#A3B1C2] ring-[#64748B]/30",
  Chargement: "bg-[#F59E0B]/15 text-[#FBBF24] ring-[#F59E0B]/30",
  "En transit": "bg-[#38A6DE]/15 text-[#5FBBEC] ring-[#38A6DE]/30",
  "En dédouanement": "bg-[#FF4500]/15 text-[#FF7A3D] ring-[#FF4500]/30",
  "Disponible à l'agence": "bg-[#22C55E]/15 text-[#4ADE80] ring-[#22C55E]/30",
  Livré: "bg-[#A855F7]/15 text-[#C084FC] ring-[#A855F7]/30",
  Retiré: "bg-white/5 text-[#94A3B8] ring-white/10",
  "En attente": "bg-white/5 text-[#94A3B8] ring-white/10",
  Validée: "bg-[#38A6DE]/15 text-[#5FBBEC] ring-[#38A6DE]/30",
  "En préparation": "bg-[#F59E0B]/15 text-[#FBBF24] ring-[#F59E0B]/30",
  Expédiée: "bg-[#FF4500]/15 text-[#FF7A3D] ring-[#FF4500]/30",
  Livrée: "bg-[#22C55E]/15 text-[#4ADE80] ring-[#22C55E]/30",
  Annulée: "bg-[#EF4444]/15 text-[#F87171] ring-[#EF4444]/30",
  Planifié: "bg-white/5 text-[#94A3B8] ring-white/10",
  "En chargement": "bg-[#F59E0B]/15 text-[#FBBF24] ring-[#F59E0B]/30",
  Arrivé: "bg-[#22C55E]/15 text-[#4ADE80] ring-[#22C55E]/30",
  Clôturé: "bg-[#A855F7]/15 text-[#C084FC] ring-[#A855F7]/30",
};

export function statutClasses(statut) {
  return STATUT_CLASSES[statut] || "bg-white/5 text-[#94A3B8] ring-white/10";
}

export function formatNombre(n) {
  return new Intl.NumberFormat("fr-FR").format(Number(n) || 0);
}

export function formatFCFA(n) {
  return `${formatNombre(Math.round(Number(n) || 0))} FCFA`;
}

export function formatDate(d) {
  if (!d) return "—";
  const date = new Date(d);
  if (Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

export function formatDateCourt(d) {
  if (!d) return "—";
  const date = new Date(d);
  if (Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat("fr-FR", { day: "2-digit", month: "short" }).format(date);
}

export function poidsVolumetrique(longueur, largeur, hauteur) {
  const l = Number(longueur) || 0;
  const w = Number(largeur) || 0;
  const h = Number(hauteur) || 0;
  if (!l || !w || !h) return 0;
  return (l * w * h) / DIVISEUR_AERIEN;
}

export function calculerFretAerien({ poidsReel, longueur, largeur, hauteur, service }) {
  const volumetric = poidsVolumetrique(longueur, largeur, hauteur);
  const taxable = Math.max(Number(poidsReel) || 0, volumetric);
  const tarif = service === "express" ? TARIFS.aerien.express : TARIFS.aerien.standard;
  return {
    poidsVolumetrique: volumetric,
    poidsTaxable: taxable,
    tarif,
    cout: taxable * tarif,
  };
}

export function calculerFretMaritime({ cbm, service }) {
  const volume = Number(cbm) || 0;
  const tarif = service === "express" ? TARIFS.maritime.express : TARIFS.maritime.standard;
  return { volume, tarif, cout: volume * tarif };
}

export function messageNotification(colis) {
  const nom = colis.client_nom || "cher client";
  const description = colis.description || "vos marchandises";
  return `Bonjour ${nom}, votre colis WebCargo N° ${colis.reference} (${description}) est arrivé et disponible à l'agence Webdadd. Merci de vous munir obligatoirement de votre PIÈCE D'IDENTITÉ pour le retrait.`;
}

export const STATUT_DISPONIBLE = "Disponible à l'agence";