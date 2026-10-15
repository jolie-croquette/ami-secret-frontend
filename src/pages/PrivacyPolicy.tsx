import { ArrowLeft, ShieldCheck } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Link } from '@/i18n/router';
import { useLang } from '@/i18n/navigation';
import PrivacyFr from '@/content/legal/PrivacyFr';
import PrivacyEn from '@/content/legal/PrivacyEn';

export default function PrivacyPolicy() {
  const { t } = useTranslation();
  const lang = useLang();
  const Body = lang === 'en' ? PrivacyEn : PrivacyFr;

  return (
    <div className="min-h-screen bg-camp-cream bg-topo px-4 py-10">
      <div className="mx-auto max-w-3xl">
        <Link
          to="/"
          className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-camp-pine hover:text-camp-pine-dark"
        >
          <ArrowLeft className="h-4 w-4" /> {t('legal.back')}
        </Link>

        <div className="card-sign p-8 sm:p-10">
          <div className="mb-6 flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-camp-pine/15 text-camp-pine">
              <ShieldCheck className="h-5 w-5" />
            </span>
            <div>
              <h1 className="font-display text-3xl font-black text-camp-pine-dark">
                {t('legal.privacyTitle')}
              </h1>
              <p className="text-xs text-camp-bark/70">
                {t('legal.lastUpdated', { date: t('legal.updatedOn') })}
              </p>
            </div>
          </div>

          {lang === 'en' && (
            <p className="mb-6 rounded-xl bg-camp-sand/50 px-4 py-3 text-xs text-camp-bark">
              {t('legal.translationNotice')}
            </p>
          )}

          <div className="prose prose-sm max-w-none space-y-6 text-camp-ink [&_h2]:mb-2 [&_h2]:mt-6 [&_h2]:font-display [&_h2]:text-lg [&_h2]:font-bold [&_h2]:text-camp-pine-dark [&_li]:mb-1 [&_li]:ml-4 [&_p]:leading-relaxed [&_ul]:list-disc">
            <Body />
          </div>
        </div>
      </div>
    </div>
  );
}
