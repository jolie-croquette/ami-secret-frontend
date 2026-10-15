/** Page d'accueil publique (promotion de l'app). */
const landing = {
  badgeTitle: 'Ami Secret',
  kicker: 'chut… c’est un secret',
  title: 'Organise ton échange de cadeaux <accent>anonyme</accent>, sans casse-tête',
  intro:
    'Ami Secret pige les noms, garde le mystère et anime ton échange du début à la fin : préférences, messages anonymes, photos et rappels. Gratuit, en français, sans pub.',
  ctaSignup: 'Créer mon échange gratuitement',
  ctaDashboard: 'Ouvrir mes parties',
  ctaLogin: 'J’ai déjà un compte',
  audiences: {
    friends: 'Entre amis',
    family: 'En famille',
    office: 'Au bureau',
    school: 'À l’école',
    camp: 'Au camp',
    team: 'Dans ton équipe',
  },
  how: {
    kicker: 'aussi simple que ça',
    title: 'Comment ça marche ?',
    steps: {
      create: {
        title: 'Crée ta partie',
        text: 'Donne-lui un nom, choisis la durée (1 à 52 semaines) et obtiens un code unique à 6 lettres.',
      },
      invite: {
        title: 'Invite ton groupe',
        text: 'Partage le code ou le lien : chacun se joint en quelques secondes et remplit ses préférences.',
      },
      draw: {
        title: 'Lance le tirage',
        text: 'Chaque personne découvre qui elle gâte, et ça reste secret jusqu’à la grande révélation.',
      },
      enjoy: {
        title: 'Gâtez-vous !',
        text: 'Cadeaux, indices anonymes, photos et suivi semaine par semaine, jusqu’au dévoilement final.',
      },
    },
  },
  tour: {
    kicker: 'jette un œil',
    title: 'L’app en un coup d’œil',
    shots: {
      dashboard: { alt: 'Tableau de bord : tes parties en cours', caption: 'Toutes tes parties au même endroit' },
      lobby: {
        alt: 'Partie : la personne que tu gâtes et ses préférences',
        caption: 'Découvre qui tu gâtes et ses goûts',
      },
      chat: { alt: 'Messages anonymes entre participants', caption: 'Jase anonymement avec ton ami secret' },
      profile: { alt: 'Profil : identité et préférences cadeaux', caption: 'Ton profil et ta liste de souhaits' },
    },
  },
  features: {
    kicker: 'tout est inclus',
    title: 'Pensé pour que la magie opère',
    items: {
      draw: {
        title: 'Tirage secret et équitable',
        text: 'Un clic et chaque participant reçoit une personne à gâter : personne ne pige son propre nom, et personne ne peut tricher.',
      },
      wishlist: {
        title: 'Préférences et liste de souhaits',
        text: 'Goûts, allergies, idées de cadeaux avec liens et prix : chacun remplit son profil pour aider sa bonne fée.',
      },
      messages: {
        title: 'Messages anonymes',
        text: 'Envoie des indices à la personne que tu gâtes et réponds à celle qui te gâte, sans jamais dévoiler qui tu es.',
      },
      photos: {
        title: 'Photos des cadeaux reçus',
        text: 'Partage une photo quand tu reçois une surprise : tout le groupe en profite dans le fil de la partie.',
      },
      reminders: {
        title: 'Notifications et rappels',
        text: 'Alertes de tirage, messages reçus et rappels avant chaque échange, directement sur ton téléphone.',
      },
      install: {
        title: 'Installable comme une app',
        text: 'Ajoute Ami Secret à ton écran d’accueil et ouvre-le comme une vraie application, sur iPhone comme sur Android.',
      },
    },
  },
  trust:
    '<strong>Tes données restent les tiennes.</strong> Ami Secret est gratuit, sans publicité et sans revente de données. Tu peux consulter, exporter ou supprimer tes informations en tout temps, conformément à la Loi 25.',
  final: {
    title: 'Ton groupe mérite un échange mémorable',
    text: 'Deux minutes pour créer ta partie, un code à partager… et que la magie commence.',
  },
};

export default landing;
