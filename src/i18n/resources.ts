import frCommon from './locales/fr/common';
import frComponents from './locales/fr/components';
import enCommon from './locales/en/common';
import enComponents from './locales/en/components';

/** Toutes les traductions, regroupées par langue puis par espace de noms. */
export const resources = {
  fr: {
    common: frCommon,
    components: frComponents,
  },
  en: {
    common: enCommon,
    components: enComponents,
  },
};

export const defaultNS = 'common' as const;
