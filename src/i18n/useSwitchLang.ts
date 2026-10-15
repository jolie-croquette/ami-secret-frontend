import { useCallback, useContext } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import i18n from './index';
import { localizePath, storeLang, stripLang, type Lang } from './lang';
import { AuthContext } from '@/context/AuthContext';
import { userApi } from '@/api/user';

/**
 * Change la langue du site : mémorise le choix (navigateur + compte si
 * connecté) puis affiche la même page dans l'autre langue.
 */
export function useSwitchLang() {
  const auth = useContext(AuthContext);
  const navigate = useNavigate();
  const { pathname, search, hash } = useLocation();

  return useCallback(
    (lang: Lang) => {
      storeLang(lang);
      if (auth?.user && auth.user.locale !== lang) {
        auth.setUser((u) => (u ? { ...u, locale: lang } : u));
        userApi.setLocale(lang).catch(() => {
          /* préférence non critique : la langue d'affichage change quand même */
        });
      }
      void i18n.changeLanguage(lang);
      navigate(`${localizePath(stripLang(pathname), lang)}${search}${hash}`);
    },
    [auth, navigate, pathname, search, hash],
  );
}
