import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { resources, defaultNS } from './resources';
import { DEFAULT_LANG, LANGS, langFromPath } from './lang';

/**
 * Initialisation i18next. Toutes les traductions sont embarquées dans le bundle
 * (deux langues, peu de texte) : pas de chargement asynchrone ni de flash.
 * La langue initiale vient de l'URL ; `LangSync` la garde alignée ensuite.
 */
void i18n.use(initReactI18next).init({
  resources,
  lng: typeof window !== 'undefined' ? langFromPath(window.location.pathname) : DEFAULT_LANG,
  fallbackLng: DEFAULT_LANG,
  supportedLngs: [...LANGS],
  defaultNS,
  ns: Object.keys(resources.fr),
  interpolation: { escapeValue: false }, // React échappe déjà
  returnNull: false,
});

const syncHtmlLang = (lng: string) => {
  if (typeof document !== 'undefined') document.documentElement.lang = lng === 'en' ? 'en' : 'fr-CA';
};
syncHtmlLang(i18n.language);
i18n.on('languageChanged', syncHtmlLang);

export default i18n;
