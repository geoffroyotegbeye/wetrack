# Cahier des Charges Fonctionnel (CDC)

**Projet :** Application de Suivi Logistique & Gestion de Colis **WebCargo**  
**Entreprise Mère :** Webdadd  
**Version :** 3.0 (Version Finale)  
**Date :** 9 Novembre 2026  
**Statut :** Validé pour Développement  

---

## 1. Présentation de l'Écosystème & Objectifs

### 1.1 Présentation de l'Écosystème
* **Webdadd :** L'entreprise mère et la plateforme d'achat e-commerce d'origine sur laquelle les clients passent leurs commandes.
* **WebCargo :** La solution logicielle dédiée à la logistique, au calcul de fret (aérien et maritime Chine $\rightarrow$ Afrique) et au suivi en temps réel des colis jusqu'à leur retrait en agence.

### 1.2 Objectifs du Projet WebCargo
* **Automatiser l'interconnexion :** Récupération automatique des commandes validées sur la plateforme e-commerce Webdadd vers WebCargo via API sans double saisie.
* **Calculateur Fret & Transparence :** Estimation exacte des coûts de transport (Poids réel/volumétrique pour l'Aérien et volume CBM pour le Maritime).
* **Traçabilité en temps réel :** Suivi étape par étape des cargaisons depuis les entrepôts en Chine (Guangzhou, Ningbo) jusqu'à la mise à disposition en agence.
* **Notifications Automatiques :** Déclenchement d'alertes SMS/WhatsApp informant le client de l'arrivée de son colis avec rappel obligatoire de la pièce d'identité.

---

## 2. Spécifications Fonctionnelles & Règles Métiers

### 2.1 Calculateur de Tarifs & Simulation de Fret
* **Modes de Transport & Grilles Tarifaires :**
  * **Fret Aérien :** Facturation au kilo ($kg$)  
    * *Standard :* $8\ 500\text{ FCFA/kg}$  
    * *Priority Express :* $11\ 000\text{ FCFA/kg}$
  * **Fret Maritime :** Facturation au volume CBM ($m^3$)  
    * *Standard :* $180\ 000\text{ FCFA/CBM}$  
    * *Express :* $220\ 000\text{ FCFA/CBM}$
* **Calcul Volumétrique vs Poids Réel :** Application du calcul standard ($\frac{L \times l \times h}{5000}$ en $cm$) si le poids volumétrique dépasse le poids réel.
* **Calculateur Dynamique :** Module d'estimation incluant le fret et les frais de dédouanement.

### 2.2 Synchronisation BDD & Gestion Multi-Colis
* **Flux d'API / Webhook :** Dès qu'un achat est validé sur la plateforme Webdadd, l'ordre d'expédition est automatiquement créé dans WebCargo avec toutes les coordonnées du destinataire.
* **Fractionnement (Multi-Colis / Split Shipping) :** Une commande unique Webdadd peut être scindée en plusieurs sous-colis WebCargo (ex: `WBD-8921-A`, `WBD-8921-B`) avec un suivi indépendant.
* **Gestion des Saisies Manuelles & Doublons :** Module permettant d'ajouter manuellement un colis hors-plateforme tout en vérifiant l'unicité des numéros de tracking pour éviter les bugs et doublons.

### 2.3 Cycle de Vie des Expéditions (Statuts WebCargo)
1. `En Entrepôt Chine` (Reçu à Guangzhou / Ningbo)
2. `Chargement / Embarquement`
3. `En Transit` (Vol Aérien ou Cargo Maritime avec progression %)
4. `En Dédouanement` (Inspection Port/Aéroport)
5. `Agence (Prêt)` (Disponible pour enlèvement)
6. `Livré / Retiré` (Archivé)

### 2.4 Notifications Automatiques (SMS & WhatsApp)
* **Déclencheur :** Modification du statut d'un colis vers `Agence (Prêt)`.
* **Mention Obligatoire :** Rappel systématique d'apporter une pièce d'identité originale lors de la récupération.
* **Modèle de Message :**
  > *"Bonjour [Nom Client], votre colis WebCargo N° [Réf] ([Description]) est arrivé et disponible à l'agence Webdadd. Merci de vous munir obligatoirement de votre PIÈCE D'IDENTITÉ pour le retrait."*

---

## 3. Charte Graphique & UI/UX (Webdadd / WebCargo)

WebCargo réutilise le Design System officiel de Webdadd :

| Élément UI | Code Hex / Style | Usage dans l'application WebCargo |
| :--- | :--- | :--- |
| **Orange (Primaire)** | `#FF4500` / `#FF3B00` | Boutons d'action principale, badges "Prêt en Agence", KPI phares |
| **Bleu Cyan (Accent)** | `#38A6DE` / `#29A9E0` | Montants en FCFA, barres de progression de transit, sous-titres |
| **Background Dark** | `#16171B` | Arrière-plan global de l'application (Dark mode natif) |
| **Card Background** | `#1E1F24` | Cartes KPI, conteneurs de tableau, modals de notification |
| **Input Background** | `#121316` | Champs de formulaire et filtres de recherche |
| **Typographie** | `Inter` / `Montserrat` | Sans-serif géométrique, moderne et épurée |

---

## 4. Spécifications Techniques & Architecture

* **Frontend :** React.js avec Tailwind CSS (Interface réactive Dark Mode).
* **Backend :** Node.js (Express) avec API REST & Webhooks de synchronisation.
* **Base de Données :** PostgreSQL (Tables : `Users`, `Orders_Webdadd`, `Shipments_WebCargo`, `Cargo_Batches`, `Tracking_Logs`).
* **Services Tiers :** API Twilio / WhatsApp Business API pour l'envoi automatisé des messages.