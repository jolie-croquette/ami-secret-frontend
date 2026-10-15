import frCommon from './locales/fr/common';
import frAuth from './locales/fr/auth';
import frComponents from './locales/fr/components';
import frGames from './locales/fr/games';
import frLanding from './locales/fr/landing';
import frLobby from './locales/fr/lobby';
import frProfile from './locales/fr/profile';
import frSeo from './locales/fr/seo';
import enCommon from './locales/en/common';
import enAuth from './locales/en/auth';
import enComponents from './locales/en/components';
import enGames from './locales/en/games';
import enLanding from './locales/en/landing';
import enLobby from './locales/en/lobby';
import enProfile from './locales/en/profile';
import enSeo from './locales/en/seo';

/** Toutes les traductions, regroupées par langue puis par espace de noms. */
export const resources = {
  fr: {
    common: frCommon,
    auth: frAuth,
    components: frComponents,
    games: frGames,
    landing: frLanding,
    lobby: frLobby,
    profile: frProfile,
    seo: frSeo,
  },
  en: {
    common: enCommon,
    auth: enAuth,
    components: enComponents,
    games: enGames,
    landing: enLanding,
    lobby: enLobby,
    profile: enProfile,
    seo: enSeo,
  },
};

export const defaultNS = 'common' as const;
