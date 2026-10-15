/** Textes partagés : navigation, pied de page, modales et petits composants. */
const common = {
  brand: 'Ami Secret',
  actions: {
    close: 'Fermer',
    cancel: 'Annuler',
    confirm: 'Confirmer',
    save: 'Enregistrer',
    retry: 'Réessayer',
    later: 'Plus tard',
  },
  loading: 'Chargement…',
  errors: {
    generic: 'Une erreur est survenue.',
  },
  nav: {
    myAccount: 'Mon compte',
    profile: 'Mon profil',
    games: 'Mes parties',
    joinGame: 'Rejoindre une partie',
    createGame: 'Créer une partie',
    admin: 'Espace admin',
    login: 'Se connecter',
    logout: 'Se déconnecter',
    help: 'Aide',
    helpLabel: 'Aide — revoir le tutoriel',
  },
  language: {
    label: 'Langue',
    switchTo: 'Switch to English',
    suggestion: 'This site is also available in English.',
    suggestionCta: 'View in English',
  },
  footer: {
    madeWith: 'Fait avec <heart/> par Splash (Xavier Samson)',
    rights: '© {{year}} Tous droits réservés',
    privacy: 'Confidentialité',
    terms: "Conditions d'utilisation",
  },
  notFound: {
    title: 'Page introuvable',
    body: "Le lien est peut-être expiré ou l'adresse incorrecte.",
    cta: 'Retour au tableau de bord',
  },
  errorBoundary: {
    title: 'Une erreur est survenue',
    body: 'Le camp a rencontré un pépin. Recharge la page pour réessayer.',
    reload: 'Recharger',
  },
  install: {
    title: "Installer l'app",
    body: "Accède à Ami Secret directement depuis ton écran d'accueil.",
    cta: 'Installer',
  },
  pushPrompt: {
    title: 'Activer les notifications',
    body: "Reçois une alerte quand quelqu'un t'envoie un message ou que le tirage est fait.",
    cta: 'Activer',
    busy: 'Activation…',
  },
  notifications: {
    title: 'Notifications',
    empty: 'Aucune notification.',
    justNow: "à l'instant",
    minutesAgo: 'il y a {{count}} min',
    hoursAgo: 'il y a {{count}} h',
    daysAgo: 'il y a {{count}} j',
  },
  updateNote: {
    installTitle: 'Comment l’installer sur ton téléphone ?',
    iphone: 'iPhone (Safari)',
    android: 'Android (Chrome)',
    gotIt: 'Compris, merci !',
  },
};

export default common;
