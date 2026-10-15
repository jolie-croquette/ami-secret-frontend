/**
 * Langues du site et gestion du préfixe d'URL.
 * Le français est servi à la racine (`/dashboard`), l'anglais sous `/en`
 * (`/en/dashboard`) : l'URL est la source de vérité de la langue affichée.
 */

export const LANGS = ['fr', 'en'] as const;
export type Lang = (typeof LANGS)[number];
export const DEFAULT_LANG: Lang = 'fr';

/** Préfixe d'URL des langues autres que la langue par défaut. */
const PREFIX: Record<Lang, string> = { fr: '', en: '/en' };

export const isLang = (v: unknown): v is Lang =>
  typeof v === 'string' && (LANGS as readonly string[]).includes(v);

/** Langue déduite d'un chemin (`/en/...` → en, sinon fr). */
export function langFromPath(pathname: string): Lang {
  return pathname === '/en' || pathname.startsWith('/en/') ? 'en' : 'fr';
}

/** Retire le préfixe de langue : `/en/lobby/ABC` → `/lobby/ABC`. */
export function stripLang(pathname: string): string {
  if (pathname === '/en') return '/';
  return pathname.startsWith('/en/') ? pathname.slice(3) : pathname;
}

/**
 * Ajoute le préfixe de langue à un chemin absolu (`/profile` → `/en/profile`).
 * Les chemins relatifs, les URL externes et l'espace admin (toujours en
 * français) sont laissés tels quels.
 */
export function localizePath(path: string, lang: Lang): string {
  if (!path.startsWith('/') || path.startsWith('//')) return path;
  const bare = stripLang(path);
  if (bare === '/admin' || bare.startsWith('/admin/')) return bare;
  const prefix = PREFIX[lang];
  if (!prefix) return bare;
  return bare === '/' ? prefix : `${prefix}${bare}`;
}

/** Choix explicite de langue mémorisé dans le navigateur (sélecteur FR/EN). */
const STORAGE_KEY = 'lang';

export function getStoredLang(): Lang | null {
  try {
    const v = localStorage.getItem(STORAGE_KEY);
    return isLang(v) ? v : null;
  } catch {
    return null;
  }
}

export function storeLang(lang: Lang): void {
  try {
    localStorage.setItem(STORAGE_KEY, lang);
  } catch {
    /* stockage indisponible (navigation privée) : sans conséquence */
  }
}

/** Langue préférée du navigateur parmi celles supportées. */
export function browserLang(): Lang {
  const langs = typeof navigator !== 'undefined' ? navigator.languages ?? [navigator.language] : [];
  for (const l of langs) {
    const base = l?.toLowerCase().split('-')[0];
    if (isLang(base)) return base;
  }
  return DEFAULT_LANG;
}
