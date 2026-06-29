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
  version: '2026-06-29b',
  date: '29 juin 2026',
  title: 'Quoi de neuf',
  items: [
    'Nouvelle icône : le cadeau a été redessiné pour être plus propre, visible dans l’onglet du navigateur et sur ton écran d’accueil.',
    'Notifications push : tu peux maintenant recevoir une alerte directement sur ton téléphone ou ton ordinateur quand tu reçois un message ou que le tirage est fait — accepte simplement la demande qui s’affiche en bas de l’écran.',
    'Sécurité : la connexion fonctionne maintenant correctement sur tous les téléphones (le bogue qui bloquait certains iPhone est réglé), et les échanges entre le site et le serveur sont mieux protégés contre les abus.',
    'Installation sur ton téléphone : tu peux ajouter Ami Secret à ton écran d’accueil pour l’ouvrir comme une vraie application — voir « Comment l’installer » ci-dessous.',
    'Espace administrateur : section « Notifications » pour suivre les notifications envoyées aux participants.',
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
