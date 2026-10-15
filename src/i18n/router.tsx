/**
 * Versions « conscientes de la langue » des primitives de react-router :
 * les chemins absolus reçoivent automatiquement le préfixe `/en` quand le site
 * est affiché en anglais. À importer à la place de `react-router-dom` dans les
 * pages côté joueur.
 */
import { forwardRef, useCallback } from 'react';
import {
  Link as RRLink,
  NavLink as RRNavLink,
  Navigate as RRNavigate,
  useNavigate as useRRNavigate,
  type LinkProps,
  type NavLinkProps,
  type NavigateProps,
  type NavigateOptions,
  type To,
} from 'react-router-dom';
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

export const Link = forwardRef<HTMLAnchorElement, LinkProps>(function Link({ to, ...rest }, ref) {
  const lang = useLang();
  return <RRLink ref={ref} to={localizeTo(to, lang)} {...rest} />;
});

export const NavLink = forwardRef<HTMLAnchorElement, NavLinkProps>(function NavLink({ to, ...rest }, ref) {
  const lang = useLang();
  return <RRNavLink ref={ref} to={localizeTo(to, lang)} {...rest} />;
});

export function Navigate({ to, ...rest }: NavigateProps) {
  const lang = useLang();
  return <RRNavigate to={localizeTo(to, lang)} {...rest} />;
}

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
