/**
 * Note de mise à jour affichée une fois par utilisateur à sa prochaine connexion.
 *
 * Pour publier une nouvelle note : change `version` (chaîne unique, ex. une date)
 * et mets à jour `title` / `date` / `items` dans les deux langues. Tous les
 * utilisateurs la reverront une seule fois. Garde la même `version` pour ne
 * rien réafficher.
 */
export interface UpdateNote {
  version: string;
  date: string;
  title: string;
  items: string[];
}

type Lang = 'fr' | 'en';

const VERSION = '2026-07-08';

const UPDATE_NOTES: Record<Lang, UpdateNote> = {
  fr: {
    version: VERSION,
    date: '8 juillet 2026',
    title: 'Quoi de neuf',
    items: [
      'Prénom, nom et nom de camp : ton profil se précise ! Si tu renseignes ton nom de camp, c’est lui qui s’affiche dans les parties (sinon, ton prénom). Une petite fenêtre te demandera de compléter ces infos, une seule fois.',
      'Messagerie repensée : deux conversations anonymes bien séparées : « J’offre à… » pour envoyer des indices à la personne que tu gâtes, et « Je reçois de… » pour répondre à la personne qui t’offre des cadeaux, sans jamais savoir qui c’est.',
      'Tutoriel de bienvenue sur mobile : un petit guide de l’app s’affiche à ta première visite, et tu peux le revoir quand tu veux avec le bouton « ? » en haut de l’écran.',
      'Installation sur ton téléphone : l’app te propose maintenant de s’ajouter à ton écran d’accueil pour l’ouvrir comme une vraie application (voir « Comment l’installer » ci-dessous).',
    ],
  },
  en: {
    version: VERSION,
    date: 'July 8, 2026',
    title: 'What’s new',
    items: [
      'First name, last name and nickname: your profile just got more personal! If you add a nickname, that’s what other players will see in your games (otherwise, your first name). A quick pop-up will ask you to fill these in, just once.',
      'Chat, reimagined: two separate anonymous conversations. “My giftee” lets you send hints to the person you’re shopping for, and “My Secret Santa” lets you reply to whoever is gifting you, without ever finding out who it is.',
      'Welcome tutorial on mobile: a quick tour of the app pops up on your first visit, and you can replay it anytime with the “?” button at the top of the screen.',
      'Install it on your phone: the app now offers to add itself to your home screen so it opens just like a regular app (see “How do I install it” below).',
    ],
  },
};

/** Version courante, identique dans toutes les langues (suivi en base). */
export const UPDATE_NOTE_VERSION = VERSION;

export const getUpdateNote = (lang: string): UpdateNote =>
  UPDATE_NOTES[lang === 'en' ? 'en' : 'fr'];

/**
 * Instructions d'installation « Ajouter à l'écran d'accueil » (PWA légère, sans
 * mode hors-ligne). Affichées dans l'aide / le pied de page plutôt que dans la
 * modale de mise à jour, pour rester accessibles en tout temps.
 */
const PWA_INSTALL_INSTRUCTIONS: Record<Lang, { ios: string[]; android: string[] }> = {
  fr: {
    ios: [
      'Ouvre amisecret.xyz dans Safari.',
      'Touche l’icône de partage (carré avec une flèche vers le haut).',
      'Choisis « Sur l’écran d’accueil ».',
      'Touche « Ajouter » : l’icône Ami Secret apparaît sur ton écran d’accueil.',
    ],
    android: [
      'Ouvre amisecret.xyz dans Chrome.',
      'Touche le menu (⋮) en haut à droite.',
      'Choisis « Ajouter à l’écran d’accueil » (ou « Installer l’application »).',
      'Confirme : l’icône Ami Secret apparaît sur ton écran d’accueil.',
    ],
  },
  en: {
    ios: [
      'Open amisecret.xyz in Safari.',
      'Tap the Share icon (the square with an arrow pointing up).',
      'Choose “Add to Home Screen”.',
      'Tap “Add”: the app icon now appears on your home screen.',
    ],
    android: [
      'Open amisecret.xyz in Chrome.',
      'Tap the menu (⋮) in the top-right corner.',
      'Choose “Add to Home screen” (or “Install app”).',
      'Confirm: the app icon now appears on your home screen.',
    ],
  },
};

export const getInstallInstructions = (lang: string) =>
  PWA_INSTALL_INSTRUCTIONS[lang === 'en' ? 'en' : 'fr'];
