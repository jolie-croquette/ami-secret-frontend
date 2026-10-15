import { useTranslation } from 'react-i18next';
import { useSwitchLang } from '@/i18n/useSwitchLang';
import { useLang } from '@/i18n/navigation';

/**
 * Bascule FR / EN : affiche la même page dans l'autre langue et mémorise le
 * choix. `tone="dark"` pour les fonds foncés (pied de page).
 */
export default function LanguageSwitcher({
  tone = 'light',
  className = '',
}: {
  tone?: 'light' | 'dark';
  className?: string;
}) {
  const { t } = useTranslation();
  const lang = useLang();
  const switchLang = useSwitchLang();
  const other = lang === 'en' ? 'fr' : 'en';

  const styles =
    tone === 'dark'
      ? 'border-camp-cream/30 text-camp-cream/80 hover:border-camp-cream hover:text-camp-cream'
      : 'border-camp-bark/15 bg-white/60 text-camp-pine hover:border-camp-pine/40';

  return (
    <button
      type="button"
      onClick={() => switchLang(other)}
      lang={other}
      aria-label={t('language.switchTo')}
      title={t('language.switchTo')}
      className={`flex h-9 min-w-9 items-center justify-center rounded-full border-2 px-2 text-xs font-extrabold tracking-wide transition ${styles} ${className}`}
    >
      {other.toUpperCase()}
    </button>
  );
}
