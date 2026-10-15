import i18n from './index';

const LOCALE_TAG = { fr: 'fr-CA', en: 'en' } as const;

/** Balise BCP 47 utilisée par `Intl` pour la langue courante. */
export const intlLocale = (): string => (i18n.language === 'en' ? LOCALE_TAG.en : LOCALE_TAG.fr);

/** Date courte dans la langue courante (ex. « 15 oct. 2026 » / « Oct 15, 2026 »). */
export function formatDate(iso: string | Date, options: Intl.DateTimeFormatOptions = { dateStyle: 'medium' }): string {
  return new Date(iso).toLocaleDateString(intlLocale(), options);
}

/** Date + heure dans la langue courante. */
export function formatDateTime(
  iso: string | Date,
  options: Intl.DateTimeFormatOptions = { dateStyle: 'medium', timeStyle: 'short' },
): string {
  return new Date(iso).toLocaleString(intlLocale(), options);
}
