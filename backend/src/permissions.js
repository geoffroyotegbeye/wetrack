// Matrice des rôles et permissions Wetrack — source unique de vérité.
// Le frontend reçoit les permissions calculées via GET /api/auth/me.

export const ROLES = {
  admin: { label: 'Administrateur', description: 'Accès complet, gestion des utilisateurs.' },
  gestionnaire: { label: 'Gestionnaire', description: 'Toutes les opérations logistiques, sans la gestion des utilisateurs.' },
  agent_chine: { label: 'Agent Chine', description: 'Réception en entrepôt, scission des colis, cargaisons, statuts jusqu\'au transit.' },
  agent_agence: { label: 'Agent agence', description: 'Dédouanement, mise à disposition, retrait, notifications et clients.' },
  lecteur: { label: 'Lecture seule', description: 'Consultation uniquement.' },
};

export const ROLE_KEYS = Object.keys(ROLES);
export const DEFAULT_ROLE = 'lecteur';

const ALL = ROLE_KEYS;
const GESTION = ['admin', 'gestionnaire'];

// Pages visibles (clé = identifiant de page côté frontend).
export const PAGES = {
  dashboard: ALL,
  commandes: ALL,
  suivi: ALL,
  cargaisons: ALL,
  notifications: ['admin', 'gestionnaire', 'agent_agence', 'lecteur'],
  clients: ALL,
  tarifs: ALL,
  rapports: ['admin', 'gestionnaire', 'lecteur'],
  parametres: ALL,
  utilisateurs: ['admin'],
};

// Lecture / écriture par entité. La suppression est réservée à l'administrateur.
export const ENTITY_PERMS = {
  Client: { read: ALL, write: [...GESTION, 'agent_agence'] },
  Commande: { read: ALL, write: GESTION },
  Colis: { read: ALL, write: [...GESTION, 'agent_chine', 'agent_agence'] },
  Cargaison: { read: ALL, write: [...GESTION, 'agent_chine'] },
  TrackingLog: { read: ALL, write: [...GESTION, 'agent_chine', 'agent_agence'] },
  NotificationLog: { read: ALL, write: [...GESTION, 'agent_agence'] },
};
export const DELETE_ROLES = ['admin'];

export const FUNCTION_PERMS = {
  notifierColis: [...GESTION, 'agent_agence'],
};

// Statuts de colis que chaque rôle peut appliquer (null = tous).
const STATUTS_CHINE = ['En entrepôt Chine', 'Chargement', 'En transit'];
const STATUTS_AGENCE = ['En dédouanement', "Disponible à l'agence", 'Livré', 'Retiré'];
export const COLIS_STATUTS = {
  admin: null,
  gestionnaire: null,
  agent_chine: STATUTS_CHINE,
  agent_agence: STATUTS_AGENCE,
  lecteur: [],
};

export const can = {
  read: (role, entity) => Boolean(ENTITY_PERMS[entity]?.read.includes(role)),
  write: (role, entity) => Boolean(ENTITY_PERMS[entity]?.write.includes(role)),
  delete: (role) => DELETE_ROLES.includes(role),
  fn: (role, name) => Boolean(FUNCTION_PERMS[name]?.includes(role)),
  page: (role, page) => Boolean(PAGES[page]?.includes(role)),
  statutColis: (role, statut) => {
    const allowed = COLIS_STATUTS[role];
    return allowed === null || (allowed || []).includes(statut);
  },
};

// Résumé envoyé au frontend.
export function permissionsFor(role) {
  return {
    role,
    role_label: ROLES[role]?.label || role,
    pages: Object.keys(PAGES).filter((p) => can.page(role, p)),
    read: Object.keys(ENTITY_PERMS).filter((e) => can.read(role, e)),
    write: Object.keys(ENTITY_PERMS).filter((e) => can.write(role, e)),
    delete: can.delete(role),
    functions: Object.keys(FUNCTION_PERMS).filter((f) => can.fn(role, f)),
    statuts_colis: COLIS_STATUTS[role],
  };
}
