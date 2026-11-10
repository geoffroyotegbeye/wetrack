export class HttpError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

// Enveloppe un handler async pour transmettre les erreurs à Express.
export const ah = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

export function errorHandler(err, req, res, _next) {
  if (err.code === '23505') {
    return res.status(409).json({ message: 'Cette référence existe déjà.' });
  }
  if (err.code === '22P02') {
    return res.status(400).json({ message: 'Identifiant ou valeur invalide.' });
  }
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ message: 'Corps de requête JSON invalide.' });
  }
  const status = err.status || 500;
  if (status >= 500) console.error(err);
  res.status(status).json({ message: status >= 500 ? 'Erreur interne du serveur.' : err.message });
}
