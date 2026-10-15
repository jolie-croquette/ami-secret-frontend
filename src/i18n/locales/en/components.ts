import type { Translation } from '../../types';
import type fr from '../fr/components';

const components: Translation<typeof fr> = {
  tutorial: {
    dialogLabel: 'Secret Santa tutorial',
    skipLabel: 'Skip the tutorial',
    steps: {
      welcome: {
        title: 'Welcome aboard!',
        body: [
          'Your dashboard brings all your Secret Santa games together in one place.',
          'Join a game with the 6-letter code from the organizer, or start your own.',
        ],
      },
      friend: {
        title: 'Your giftee',
        body: [
          'Once names are drawn, find out who you’re gifting. Shh, it’s a secret!',
          'Fill in your preferences (likes, allergies, wishlist) to help whoever is gifting you.',
        ],
      },
      messages: {
        title: 'Messages and photos',
        body: [
          'Send anonymous messages to your giftee right inside the game.',
          'Share a photo when you get a gift so the whole group can enjoy it!',
        ],
      },
      install: {
        title: 'Get the app!',
        body: [
          'Add Secret Santa to your home screen so it opens like a regular app and you get notifications.',
        ],
      },
    },
    installCta: 'Install the app',
    back: 'Back',
    skip: 'Skip',
    next: 'Next',
    done: 'Let’s go!',
  },
  completeProfile: {
    title: 'Complete your profile',
    intro:
      'Players now show up in games by their <strong>nickname</strong> (or first name). So everyone recognizes you and your games display properly, we now need your first and last name.',
    onceOnly: 'This step is required, and we’ll only ask you once.',
    firstName: 'First name',
    firstNamePlaceholder: 'Your first name',
    lastName: 'Last name',
    lastNamePlaceholder: 'Your last name',
    campName: 'Nickname (optional)',
    campNamePlaceholder: 'e.g. Beaver',
    campNameHint: 'If you add one, it’s what other players will see in your games.',
    firstNameRequired: 'First name is required.',
    lastNameRequired: 'Last name is required.',
    saveError: 'We couldn’t save your changes. Please try again.',
    submit: 'Save and continue',
  },
  wishlist: {
    titlePlaceholder: 'Gift idea (e.g. a coffee mug)',
    remove: 'Remove',
    urlPlaceholder: 'Link (optional)',
    pricePlaceholder: 'Approx. price (e.g. ~$25)',
    add: 'Add an idea',
  },
};

export default components;
