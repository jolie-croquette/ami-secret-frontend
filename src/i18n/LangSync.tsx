import { useContext, useLayoutEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Languages, X } from 'lucide-react';
import { AuthContext } from '@/context/AuthContext';
import { userApi } from '@/api/user';
import { browserLang, getStoredLang, langFromPath, localizePath, storeLang, stripLang, type Lang } from './lang';
import { useSwitchLang } from './useSwitchLang';

const isAdminPath = (bare: string) => bare === '/admin' || bare.startsWith('/admin/');

/**
 * Garde la langue d'affichage alignée sur l'URL (`/en/...` = anglais) et
 * respecte la préférence de la personne :
 * - préférence anglaise (compte ou choix mémorisé) sur une URL française
 *   → redirection vers la même page en anglais ;
 * - URL anglaise visitée explicitement → elle devient la préférence.
 * L'espace admin reste toujours en français.
 * Affiche aussi, une seule fois, une suggestion de langue aux nouveaux
 * visiteurs dont le navigateur est dans l'autre langue (sans redirection
 * forcée, pour ne pas gêner l'indexation).
 */
export default function LangSync() {
  const auth = useContext(AuthContext);
  const { i18n, t } = useTranslation();
  const navigate = useNavigate();
  const switchLang = useSwitchLang();
  const { pathname, search, hash } = useLocation();
  const [suggestDismissed, setSuggestDismissed] = useState(false);

  const bare = stripLang(pathname);
  const admin = isAdminPath(bare);
  const urlLang: Lang = admin ? 'fr' : langFromPath(pathname);
  const user = auth?.user;
  const preferred: Lang | null = user ? (user.locale ?? 'fr') : getStoredLang();

  useLayoutEffect(() => {
    if (admin) {
      if (i18n.language !== 'fr') void i18n.changeLanguage('fr');
      return;
    }

    if (urlLang === 'fr' && preferred === 'en') {
      navigate(`${localizePath(bare, 'en')}${search}${hash}`, { replace: true });
      return;
    }

    if (urlLang === 'en' && preferred !== 'en') {
      storeLang('en');
      if (user) {
        auth?.setUser((u) => (u ? { ...u, locale: 'en' } : u));
        userApi.setLocale('en').catch(() => {});
      }
    }

    if (i18n.language !== urlLang) void i18n.changeLanguage(urlLang);
  }, [admin, urlLang, preferred, bare, search, hash, navigate, i18n, user, auth]);

  const other: Lang = urlLang === 'en' ? 'fr' : 'en';
  const showSuggestion =
    !admin && !suggestDismissed && preferred === null && browserLang() === other && other === 'en';

  if (!showSuggestion) return null;

  const dismiss = () => {
    storeLang(urlLang);
    setSuggestDismissed(true);
  };

  return (
    <div
      role="region"
      aria-label={t('language.label')}
      lang={other}
      className="flex items-center justify-center gap-3 bg-camp-pine-dark px-4 py-2 text-sm text-camp-cream"
    >
      <Languages className="h-4 w-4 shrink-0" aria-hidden />
      <span>{t('language.suggestion')}</span>
      <button
        type="button"
        onClick={() => switchLang(other)}
        className="rounded-full bg-camp-cream px-3 py-0.5 text-xs font-extrabold text-camp-pine-dark transition hover:bg-white"
      >
        {t('language.suggestionCta')}
      </button>
      <button
        type="button"
        onClick={dismiss}
        aria-label={t('actions.close')}
        className="text-camp-cream/70 transition hover:text-camp-cream"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}
