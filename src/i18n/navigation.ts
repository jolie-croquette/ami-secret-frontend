/**
 * Navigation « consciente de la langue » : les chemins absolus reçoivent
 * automatiquement le préfixe `/en` quand le site est affiché en anglais.
 * Les composants équivalents (Link, NavLink, Navigate) sont dans `./router`.
 */
import { useCallback } from 'react';
import { useNavigate as useRRNavigate, type NavigateOptions, type To } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { localizePath, type Lang } from './lang';

export function localizeTo(to: To, lang: Lang): To {
  if (typeof to === 'string') return localizePath(to, lang);
  return to.pathname ? { ...to, pathname: localizePath(to.pathname, lang) } : to;
}

/** Langue courante, typée. */
export function useLang(): Lang {
  const { i18n } = useTranslation();
  return i18n.language === 'en' ? 'en' : 'fr';
}

/** Renvoie une fonction qui localise un chemin dans la langue courante. */
export function useLocalizePath(): (path: string) => string {
  const lang = useLang();
  return useCallback((path: string) => localizePath(path, lang), [lang]);
}

/** `useNavigate` de react-router, avec préfixe de langue automatique. */
export function useNavigate() {
  const navigate = useRRNavigate();
  const lang = useLang();
  return useCallback(
    (to: To | number, options?: NavigateOptions) => {
      if (typeof to === 'number') return navigate(to);
      return navigate(localizeTo(to, lang), options);
    },
    [navigate, lang],
  );
}
