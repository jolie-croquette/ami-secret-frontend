/**
 * Note de mise à jour affichée une fois par utilisateur à sa prochaine connexion.
 *
 * Pour publier une nouvelle note : change `version` (chaîne unique, ex. une date)
 * et mets à jour `title` / `date` / `items`. Tous les utilisateurs la reverront
 * une seule fois. Garde la même `version` pour ne rien réafficher.
 */
export interface UpdateNote {
  version: string;
  date: string;
  title: string;
  items: string[];
}

export const UPDATE_NOTE: UpdateNote = {
  version: '2026-07-08',
  date: '8 juillet 2026',
  title: 'Quoi de neuf',
  items: [
    'Prénom, nom et nom de camp : ton profil se précise ! Si tu renseignes ton nom de camp, c’est lui qui s’affiche dans les parties (sinon, ton prénom). Une petite fenêtre te demandera de compléter ces infos — une seule fois, promis.',
    'Messagerie repensée : deux conversations anonymes bien séparées — « J’offre à… » pour envoyer des indices à la personne que tu gâtes, et « Je reçois de… » pour répondre à la personne qui t’offre des cadeaux, sans jamais savoir qui c’est.',
    'Tutoriel de bienvenue sur mobile : un petit guide de l’app s’affiche à ta première visite, et tu peux le revoir quand tu veux avec le bouton « ? » en haut de l’écran.',
    'Installation sur ton téléphone : l’app te propose maintenant de s’ajouter à ton écran d’accueil pour l’ouvrir comme une vraie application — voir « Comment l’installer » ci-dessous.',
  ],
};

/**
 * Instructions d'installation « Ajouter à l'écran d'accueil » (PWA légère, sans
 * mode hors-ligne). Affichées dans l'aide / le pied de page plutôt que dans la
 * modale de mise à jour, pour rester accessibles en tout temps.
 */
export const PWA_INSTALL_INSTRUCTIONS = {
  ios: [
    'Ouvre amisecret.xyz dans Safari.',
    'Touche l’icône de partage (carré avec une flèche vers le haut).',
    'Choisis « Sur l’écran d’accueil ».',
    'Touche « Ajouter » — l’icône Ami Secret apparaît sur ton écran d’accueil.',
  ],
  android: [
    'Ouvre amisecret.xyz dans Chrome.',
    'Touche le menu (⋮) en haut à droite.',
    'Choisis « Ajouter à l’écran d’accueil » (ou « Installer l’application »).',
    'Confirme — l’icône Ami Secret apparaît sur ton écran d’accueil.',
  ],
};
