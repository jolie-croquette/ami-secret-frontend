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
  version: '2026-06-26',
  date: '26 juin 2026',
  title: 'Quoi de neuf',
  items: [
    'Liste de souhaits : ajoute des idées de cadeaux précises (titre, lien, prix) dans ton profil — ton ami secret les verra.',
    'Notifications : une cloche dans l’en-tête te prévient des messages, du tirage et des révélations.',
    'Messagerie : tes échanges anonymes s’affichent maintenant en fil de discussion (« Moi » / « Ami secret »).',
    'Suivi des cadeaux : c’est désormais la personne qui reçoit qui confirme la réception.',
  ],
};
