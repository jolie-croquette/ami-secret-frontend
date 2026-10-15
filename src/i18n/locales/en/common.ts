import type { Translation } from '../../types';
import type fr from '../fr/common';

const common: Translation<typeof fr> = {
  brand: 'Secret Santa',
  actions: {
    close: 'Close',
    cancel: 'Cancel',
    confirm: 'Confirm',
    save: 'Save',
    retry: 'Try again',
    later: 'Maybe later',
  },
  loading: 'Loading…',
  errors: {
    generic: 'Something went wrong.',
  },
  nav: {
    myAccount: 'My account',
    profile: 'My profile',
    games: 'My games',
    joinGame: 'Join a game',
    createGame: 'Start a game',
    admin: 'Admin',
    login: 'Log in',
    logout: 'Log out',
    help: 'Help',
    helpLabel: 'Help — replay the tutorial',
  },
  language: {
    label: 'Language',
    switchTo: 'Passer en français',
    suggestion: 'Ce site est aussi offert en français.',
    suggestionCta: 'Voir en français',
  },
  footer: {
    madeWith: 'Made with <heart/> by Splash (Xavier Samson)',
    rights: '© {{year}} All rights reserved',
    privacy: 'Privacy',
    terms: 'Terms of Use',
  },
  notFound: {
    title: 'Page not found',
    body: 'This link may have expired, or the address might be wrong.',
    cta: 'Back to my games',
  },
  errorBoundary: {
    title: 'Something went wrong',
    body: 'We hit a snag. Reload the page to try again.',
    reload: 'Reload',
  },
  install: {
    title: 'Install the app',
    body: 'Open Secret Santa right from your home screen.',
    cta: 'Install',
  },
  pushPrompt: {
    title: 'Turn on notifications',
    body: 'Get notified when someone sends you a message or when names are drawn.',
    cta: 'Turn on',
    busy: 'Turning on…',
  },
  notifications: {
    title: 'Notifications',
    empty: 'No notifications yet.',
    justNow: 'just now',
    minutesAgo: '{{count}} min ago',
    hoursAgo: '{{count}} h ago',
    daysAgo: '{{count}} d ago',
  },
  legal: {
    back: 'Back',
    lastUpdated: 'Last updated: {{date}}',
    updatedOn: 'June 30, 2026',
    termsTitle: 'Terms of Use',
    privacyTitle: 'Privacy Policy',
    translationNotice:
      'This English version is provided for convenience. If there is any discrepancy, the French version prevails.',
  },
  updateNote: {
    installTitle: 'How do I install it on my phone?',
    iphone: 'iPhone (Safari)',
    android: 'Android (Chrome)',
    gotIt: 'Got it, thanks!',
  },
};

export default common;
