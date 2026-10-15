/** Composants globaux : tutoriel mobile, profil incomplet, liste de souhaits. */
const components = {
  tutorial: {
    dialogLabel: 'Tutoriel Ami Secret',
    skipLabel: 'Passer le tutoriel',
    steps: {
      welcome: {
        title: 'Bienvenue au camp !',
        body: [
          'Ton tableau de bord regroupe toutes tes parties d’ami secret.',
          'Rejoins une partie avec le code à 6 lettres fourni par l’organisateur, ou crée la tienne.',
        ],
      },
      friend: {
        title: 'Ton ami secret',
        body: [
          'Après le tirage, découvre à qui tu offres des cadeaux. Chut, c’est secret !',
          'Remplis tes préférences (j’aime, allergies, liste de souhaits) pour aider ton propre ami secret.',
        ],
      },
      messages: {
        title: 'Messages et photos',
        body: [
          'Écris des messages anonymes à ton ami secret directement dans la partie.',
          'Partage une photo quand tu reçois un cadeau : tout le camp en profite !',
        ],
      },
      install: {
        title: 'Installe l’app !',
        body: [
          'Ajoute Ami Secret à ton écran d’accueil pour l’ouvrir comme une vraie application et recevoir les notifications.',
        ],
      },
    },
    installCta: 'Installer l’application',
    back: 'Retour',
    skip: 'Passer',
    next: 'Suivant',
    done: 'C’est parti !',
  },
  completeProfile: {
    title: 'Complète ton profil',
    intro:
      'L’app affiche maintenant les joueurs par leur <strong>nom de camp</strong> (ou leur prénom) dans les parties. Pour que tout le monde te reconnaisse et que tes parties s’affichent correctement, ton prénom et ton nom sont désormais requis.',
    onceOnly: 'Cette étape est obligatoire et ne te sera demandée qu’une seule fois.',
    firstName: 'Prénom',
    firstNamePlaceholder: 'Ton prénom',
    lastName: 'Nom',
    lastNamePlaceholder: 'Ton nom',
    campName: 'Nom de camp (optionnel)',
    campNamePlaceholder: 'Ex : Castor',
    campNameHint: 'S’il est renseigné, c’est lui qui sera affiché dans les parties.',
    firstNameRequired: 'Le prénom est requis.',
    lastNameRequired: 'Le nom est requis.',
    saveError: 'Erreur de sauvegarde. Réessaie.',
    submit: 'Enregistrer et continuer',
  },
  wishlist: {
    titlePlaceholder: 'Idée de cadeau (ex : tasse à café)',
    remove: 'Retirer',
    urlPlaceholder: 'Lien (facultatif)',
    pricePlaceholder: 'Prix indicatif (ex : ~25 $)',
    add: 'Ajouter une idée',
  },
};

export default components;
