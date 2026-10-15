import type { Translation } from '../../types';
import type fr from '../fr/landing';

const landing: Translation<typeof fr> = {
  badgeTitle: 'Secret Santa',
  kicker: 'shh… it’s a secret',
  title: 'Run your <accent>Secret Santa</accent> gift exchange, minus the hassle',
  intro:
    'We draw the names, keep the mystery alive and run your gift exchange from start to finish: wishlists, anonymous messages, photos and reminders. Free, ad-free, in English and French.',
  ctaSignup: 'Start my exchange for free',
  ctaDashboard: 'Go to my games',
  ctaLogin: 'I already have an account',
  audiences: {
    friends: 'With friends',
    family: 'With family',
    office: 'At the office',
    school: 'At school',
    camp: 'At camp',
    team: 'With your team',
  },
  how: {
    kicker: 'it’s that easy',
    title: 'How does it work?',
    steps: {
      create: {
        title: 'Start a game',
        text: 'Give it a name, pick how long it runs (1 to 52 weeks) and get a unique 6-letter code.',
      },
      invite: {
        title: 'Invite your group',
        text: 'Share the code or link: everyone joins in seconds and fills in their preferences.',
      },
      draw: {
        title: 'Draw names',
        text: 'Everyone finds out who they’re gifting, and it stays secret until the big reveal.',
      },
      enjoy: {
        title: 'Start gifting!',
        text: 'Gifts, anonymous hints, photos and week-by-week tracking, all the way to the final reveal.',
      },
    },
  },
  tour: {
    kicker: 'take a peek',
    title: 'The app at a glance',
    shots: {
      dashboard: { alt: 'Dashboard: your current games', caption: 'All your games in one place' },
      lobby: {
        alt: 'Game: the person you’re gifting and their preferences',
        caption: 'See who you’re gifting and what they love',
      },
      chat: { alt: 'Anonymous messages between players', caption: 'Chat anonymously with your Secret Santa' },
      profile: { alt: 'Profile: your details and gift preferences', caption: 'Your profile and wishlist' },
    },
  },
  features: {
    kicker: 'everything’s included',
    title: 'Built to make the magic happen',
    items: {
      draw: {
        title: 'Fair, secret draw',
        text: 'One click and everyone gets someone to gift. Nobody draws their own name, and nobody can peek.',
      },
      wishlist: {
        title: 'Preferences and wishlists',
        text: 'Likes, allergies, gift ideas with links and prices: everyone fills in their profile to help their Secret Santa.',
      },
      messages: {
        title: 'Anonymous messages',
        text: 'Drop hints to the person you’re gifting and reply to whoever is gifting you, without ever giving yourself away.',
      },
      photos: {
        title: 'Gift photos',
        text: 'Share a photo when a surprise arrives so the whole group can enjoy it in the game feed.',
      },
      reminders: {
        title: 'Notifications and reminders',
        text: 'Get notified when names are drawn or a message comes in, plus a reminder before each exchange, right on your phone.',
      },
      install: {
        title: 'Installs like an app',
        text: 'Add Secret Santa to your home screen and open it just like a regular app, on iPhone or Android.',
      },
    },
  },
  trust:
    '<strong>Your data stays yours.</strong> Secret Santa is free, ad-free, and we never sell your data. You can view, export or delete your information at any time, in line with Québec’s privacy law (Law 25).',
  final: {
    title: 'Your group deserves an exchange to remember',
    text: 'Two minutes to set up your game, one code to share… and let the magic begin.',
  },
};

export default landing;
