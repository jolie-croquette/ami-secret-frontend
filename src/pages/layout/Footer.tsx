import { Heart, TreePine } from 'lucide-react';
import { Trans, useTranslation } from 'react-i18next';
import { Link } from '@/i18n/router';
import LanguageSwitcher from '@/components/LanguageSwitcher';

export default function Footer() {
  const { t } = useTranslation();
  const year = new Date().getFullYear();
  return (
    <footer
      role="contentinfo"
      className="w-full border-t-2 border-camp-bark/15 bg-camp-pine text-camp-cream"
    >
      <div className="mx-auto flex max-w-screen-xl flex-col items-center gap-4 px-6 py-7 text-center md:flex-row md:justify-between md:text-left">
        <div className="flex items-center gap-2">
          <TreePine className="h-5 w-5 text-camp-sun" />
          <h2 className="font-display text-lg font-black tracking-tight">{t('brand')}</h2>
        </div>
        <p className="flex items-center gap-1.5 text-sm text-camp-cream/85">
          <Trans
            i18nKey="footer.madeWith"
            components={{ heart: <Heart className="h-4 w-4 fill-camp-ember text-camp-ember" /> }}
          />
        </p>
        <div className="flex flex-col items-center gap-1 md:items-end">
          <p className="text-xs text-camp-cream/70">{t('footer.rights', { year })}</p>
          <div className="flex items-center gap-3 text-xs text-camp-cream/60">
            <Link to="/privacy" className="hover:text-camp-cream transition-colors">
              {t('footer.privacy')}
            </Link>
            <span aria-hidden>·</span>
            <Link to="/terms" className="hover:text-camp-cream transition-colors">
              {t('footer.terms')}
            </Link>
            <span aria-hidden>·</span>
            <LanguageSwitcher tone="dark" />
          </div>
        </div>
      </div>
    </footer>
  );
}
