import { useContext } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { Link } from '@/i18n/router';
import { motion } from 'motion/react';
import {
  Gift,
  Shuffle,
  MessageSquareHeart,
  Camera,
  BellRing,
  Smartphone,
  ListChecks,
  ShieldCheck,
  Sparkles,
  KeyRound,
  ArrowRight,
  Users,
  House,
  Briefcase,
  GraduationCap,
  Tent,
  Trophy,
} from 'lucide-react';
import { AuthContext } from '@/context/AuthContext';
import { Pennants, PineTree, CampScene, MeritBadge } from '@/components/visuals/CampVisuals';

const AUDIENCES = [
  { icon: Users, key: 'friends' },
  { icon: House, key: 'family' },
  { icon: Briefcase, key: 'office' },
  { icon: GraduationCap, key: 'school' },
  { icon: Tent, key: 'camp' },
  { icon: Trophy, key: 'team' },
] as const;

const FEATURES = [
  { icon: Shuffle, key: 'draw' },
  { icon: ListChecks, key: 'wishlist' },
  { icon: MessageSquareHeart, key: 'messages' },
  { icon: Camera, key: 'photos' },
  { icon: BellRing, key: 'reminders' },
  { icon: Smartphone, key: 'install' },
] as const;

const STEPS = [
  { icon: Sparkles, key: 'create' },
  { icon: KeyRound, key: 'invite' },
  { icon: Shuffle, key: 'draw' },
  { icon: Gift, key: 'enjoy' },
] as const;

const SCREENSHOTS = [
  { src: '/screenshots/app-dashboard.png', key: 'dashboard' },
  { src: '/screenshots/app-lobby.png', key: 'lobby' },
  { src: '/screenshots/app-chat.png', key: 'chat' },
  { src: '/screenshots/app-profil.png', key: 'profile' },
] as const;

function PhoneFrame({ src, alt }: { src: string; alt: string }) {
  return (
    <div className="mx-auto w-full max-w-[260px] rounded-[2rem] border-[6px] border-camp-ink/85 bg-camp-ink/85 shadow-xl">
      <div className="overflow-hidden rounded-[1.6rem]">
        <img src={src} alt={alt} loading="lazy" className="block w-full" />
      </div>
    </div>
  );
}

export default function LandingPage() {
  const { t } = useTranslation('landing');
  const auth = useContext(AuthContext);
  const user = auth?.user;

  const primaryCta = user
    ? { to: '/dashboard', label: t('ctaDashboard') }
    : { to: '/login?mode=signup', label: t('ctaSignup') };

  return (
    <div className="relative overflow-hidden bg-camp-cream bg-topo">
      {/* ── Héros ─────────────────────────────────────────────── */}
      <section className="relative px-4 pb-20 pt-14 sm:pt-20">
        <Pennants className="absolute top-0 left-1/2 h-12 w-[min(680px,95vw)] -translate-x-1/2" />
        <PineTree className="absolute bottom-8 left-6 hidden w-16 opacity-70 md:block animate-sway" />
        <PineTree className="absolute bottom-10 right-8 hidden w-20 opacity-70 md:block animate-sway" />

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          className="relative z-10 mx-auto max-w-3xl text-center"
        >
          <MeritBadge label={t('badge', { ns: 'auth' })} tone="#2f5d50" className="mx-auto h-24 w-24 drop-shadow-md" title={t('badgeTitle')} />
          <p className="label-hand mt-2 text-2xl -rotate-1">{t('kicker')}</p>

          <h1 className="mt-4 font-display text-4xl font-black leading-tight text-camp-pine-dark sm:text-5xl">
            <Trans t={t} i18nKey="title" components={{ accent: <span className="text-camp-ember" /> }} />
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-lg text-camp-bark">
            {t('intro')}
          </p>

          <div className="mt-7 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link to={primaryCta.to} className="btn-primary !px-7 !py-3 text-lg">
              {primaryCta.label} <ArrowRight className="h-5 w-5" />
            </Link>
            {!user && (
              <Link to="/login" className="btn-ghost !px-6 !py-3">
                {t('ctaLogin')}
              </Link>
            )}
          </div>

          <ul className="mt-8 flex flex-wrap justify-center gap-2">
            {AUDIENCES.map(({ icon: Icon, key }) => (
              <li
                key={key}
                className="inline-flex items-center gap-1.5 rounded-full border-2 border-camp-bark/15 bg-white/60 px-3.5 py-1.5 text-sm font-bold text-camp-pine-dark"
              >
                <Icon aria-hidden className="h-4 w-4 text-camp-pine" />
                {t(`audiences.${key}`)}
              </li>
            ))}
          </ul>
        </motion.div>
      </section>

      {/* ── Comment ça marche ─────────────────────────────────── */}
      <section className="relative px-4 py-16" aria-labelledby="how-title">
        <div className="mx-auto max-w-5xl">
          <p className="label-hand text-center text-2xl -rotate-1">{t('how.kicker')}</p>
          <h2 id="how-title" className="text-center font-display text-3xl font-black text-camp-pine-dark">
            {t('how.title')}
          </h2>

          <ol className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {STEPS.map(({ icon: Icon, key }, i) => (
              <motion.li
                key={key}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ duration: 0.4, delay: i * 0.08 }}
                className="card-sign relative p-6"
              >
                <span className="absolute -top-3 left-5 flex h-8 w-8 items-center justify-center rounded-full bg-camp-ember font-display text-sm font-black text-white shadow-sign-sm">
                  {i + 1}
                </span>
                <Icon className="h-7 w-7 text-camp-pine" />
                <h3 className="mt-3 font-display text-lg font-bold text-camp-pine-dark">{t(`how.steps.${key}.title`)}</h3>
                <p className="mt-1.5 text-sm text-camp-bark">{t(`how.steps.${key}.text`)}</p>
              </motion.li>
            ))}
          </ol>
        </div>
      </section>

      {/* ── Captures d'écran ──────────────────────────────────── */}
      <section className="relative px-4 py-16" aria-labelledby="tour-title">
        <div className="mx-auto max-w-5xl">
          <p className="label-hand text-center text-2xl rotate-1">{t('tour.kicker')}</p>
          <h2 id="tour-title" className="text-center font-display text-3xl font-black text-camp-pine-dark">
            {t('tour.title')}
          </h2>

          <div className="mt-10 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {SCREENSHOTS.map(({ src, key }, i) => (
              <motion.figure
                key={src}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ duration: 0.45, delay: i * 0.08 }}
              >
                <PhoneFrame src={src} alt={t(`tour.shots.${key}.alt`)} />
                <figcaption className="mt-3 text-center text-sm font-semibold text-camp-bark">
                  {t(`tour.shots.${key}.caption`)}
                </figcaption>
              </motion.figure>
            ))}
          </div>
        </div>
      </section>

      {/* ── Fonctionnalités ───────────────────────────────────── */}
      <section className="relative px-4 py-16" aria-labelledby="features-title">
        <div className="mx-auto max-w-5xl">
          <p className="label-hand text-center text-2xl -rotate-1">{t('features.kicker')}</p>
          <h2 id="features-title" className="text-center font-display text-3xl font-black text-camp-pine-dark">
            {t('features.title')}
          </h2>

          <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map(({ icon: Icon, key }, i) => (
              <motion.div
                key={key}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ duration: 0.4, delay: i * 0.06 }}
                className="card-sign p-6"
              >
                <span className="flex h-11 w-11 items-center justify-center rounded-full bg-camp-pine/10 text-camp-pine">
                  <Icon className="h-5 w-5" />
                </span>
                <h3 className="mt-3 font-display text-lg font-bold text-camp-pine-dark">{t(`features.items.${key}.title`)}</h3>
                <p className="mt-1.5 text-sm text-camp-bark">{t(`features.items.${key}.text`)}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Confiance ─────────────────────────────────────────── */}
      <section className="relative px-4 py-10">
        <div className="card-sign mx-auto flex max-w-3xl flex-col items-center gap-4 p-7 text-center sm:flex-row sm:text-left">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-camp-pine/10 text-camp-pine">
            <ShieldCheck className="h-6 w-6" />
          </span>
          <p className="text-sm text-camp-bark">
            <Trans t={t} i18nKey="trust" components={{ strong: <strong className="text-camp-pine-dark" /> }} />
          </p>
        </div>
      </section>

      {/* ── Appel final ───────────────────────────────────────── */}
      <section className="relative px-4 pb-40 pt-10 text-center">
        <div className="relative z-10 mx-auto max-w-2xl">
          <Users className="mx-auto h-8 w-8 text-camp-ember" />
          <h2 className="mt-3 font-display text-3xl font-black text-camp-pine-dark">
            {t('final.title')}
          </h2>
          <p className="mt-3 text-camp-bark">
            {t('final.text')}
          </p>
          <Link to={primaryCta.to} className="btn-primary mt-6 inline-flex !px-7 !py-3 text-lg">
            {primaryCta.label} <ArrowRight className="h-5 w-5" />
          </Link>
        </div>
        <CampScene className="pointer-events-none absolute bottom-0 left-0 h-32 w-full" />
      </section>
    </div>
  );
}
