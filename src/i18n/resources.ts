import frCommon from './locales/fr/common';
import frAuth from './locales/fr/auth';
import frComponents from './locales/fr/components';
import frGames from './locales/fr/games';
import frLanding from './locales/fr/landing';
import enCommon from './locales/en/common';
import enAuth from './locales/en/auth';
import enComponents from './locales/en/components';
import enGames from './locales/en/games';
import enLanding from './locales/en/landing';

/** Toutes les traductions, regroupées par langue puis par espace de noms. */
export const resources = {
  fr: {
    common: frCommon,
    auth: frAuth,
    components: frComponents,
    games: frGames,
    landing: frLanding,
  },
  en: {
    common: enCommon,
    auth: enAuth,
    components: enComponents,
    games: enGames,
    landing: enLanding,
  },
};

export const defaultNS = 'common' as const;
