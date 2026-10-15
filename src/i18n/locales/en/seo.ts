import type { Translation } from '../../types';
import type fr from '../fr/seo';

const seo: Translation<typeof fr> = {
  ogLocale: 'en_US',
  ogImageAlt: 'Secret Santa: the anonymous gift exchange app',
  home: {
    title: 'Secret Santa Generator: Free Online Gift Exchange for Friends, Family & Work',
    description:
      'Set up your Secret Santa in 2 minutes: secret name draw, wishlists, anonymous messages, photos and reminders. Free and ad-free, for friends, family, the office or school.',
    ogTitle: 'Secret Santa: your gift exchange, minus the hassle',
    ogDescription:
      'Secret draw, wishlists, anonymous messages, photos and reminders: everything you need for a gift exchange to remember. Free and ad-free.',
  },
  login: {
    title: 'Log in or sign up | Secret Santa',
    description: 'Log in or create your Secret Santa account to start or join a gift exchange.',
  },
  terms: {
    title: 'Terms of Use | Secret Santa',
    description: 'The terms of use for the Secret Santa gift exchange app.',
  },
  privacy: {
    title: 'Privacy Policy | Secret Santa',
    description: 'How Secret Santa collects, uses and protects your personal information.',
  },
  app: {
    title: 'Secret Santa',
  },
};

export default seo;
