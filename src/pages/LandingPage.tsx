import { useContext } from 'react';
import { Link } from 'react-router-dom';
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
  { icon: Users, label: 'Entre amis' },
  { icon: House, label: 'En famille' },
  { icon: Briefcase, label: 'Au bureau' },
  { icon: GraduationCap, label: 'À l’école' },
  { icon: Tent, label: 'Au camp' },
  { icon: Trophy, label: 'Dans ton équipe' },
];

const FEATURES = [
  {
    icon: Shuffle,
    title: 'Tirage secret et équitable',
    text: 'Un clic et chaque participant reçoit une personne à gâter : personne ne pige son propre nom, et personne ne peut tricher.',
  },
  {
    icon: ListChecks,
    title: 'Préférences et liste de souhaits',
    text: 'Goûts, allergies, idées de cadeaux avec liens et prix : chacun remplit son profil pour aider sa bonne fée.',
  },
  {
    icon: MessageSquareHeart,
    title: 'Messages anonymes',
    text: 'Envoie des indices à la personne que tu gâtes et réponds à celle qui te gâte, sans jamais dévoiler qui tu es.',
  },
  {
    icon: Camera,
    title: 'Photos des cadeaux reçus',
    text: 'Partage une photo quand tu reçois une surprise : tout le groupe en profite dans le fil de la partie.',
  },
  {
    icon: BellRing,
    title: 'Notifications et rappels',
    text: 'Alertes de tirage, messages reçus et rappels avant chaque échange, directement sur ton téléphone.',
  },
  {
    icon: Smartphone,
    title: 'Installable comme une app',
    text: 'Ajoute Ami Secret à ton écran d’accueil et ouvre-le comme une vraie application, sur iPhone comme sur Android.',
  },
];

const STEPS = [
  {
    icon: Sparkles,
    title: 'Crée ta partie',
    text: 'Donne-lui un nom, choisis la durée (1 à 52 semaines) et obtiens un code unique à 6 lettres.',
  },
  {
    icon: KeyRound,
    title: 'Invite ton groupe',
    text: 'Partage le code ou le lien : chacun se joint en quelques secondes et remplit ses préférences.',
  },
  {
    icon: Shuffle,
    title: 'Lance le tirage',
    text: 'Chaque personne découvre qui elle gâte, et ça reste secret jusqu’à la grande révélation.',
  },
  {
    icon: Gift,
    title: 'Gâtez-vous !',
    text: 'Cadeaux, indices anonymes, photos et suivi semaine par semaine, jusqu’au dévoilement final.',
  },
];

const SCREENSHOTS = [
  { src: '/screenshots/app-dashboard.png', alt: 'Tableau de bord : tes parties en cours', caption: 'Toutes tes parties au même endroit' },
  { src: '/screenshots/app-lobby.png', alt: 'Partie : la personne que tu gâtes et ses préférences', caption: 'Découvre qui tu gâtes et ses goûts' },
  { src: '/screenshots/app-chat.png', alt: 'Messages anonymes entre participants', caption: 'Jase anonymement avec ton ami secret' },
  { src: '/screenshots/app-profil.png', alt: 'Profil : identité et préférences cadeaux', caption: 'Ton profil et ta liste de souhaits' },
];

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
  const auth = useContext(AuthContext);
  const user = auth?.user;

  const primaryCta = user
    ? { to: '/dashboard', label: 'Ouvrir mes parties' }
    : { to: '/login?mode=signup', label: 'Créer mon échange gratuitement' };

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
          <MeritBadge label="AS" tone="#2f5d50" className="mx-auto h-24 w-24 drop-shadow-md" title="Ami Secret" />
          <p className="label-hand mt-2 text-2xl -rotate-1">chut… c’est un secret</p>

          <h1 className="mt-4 font-display text-4xl font-black leading-tight text-camp-pine-dark sm:text-5xl">
            Organise ton échange de cadeaux <span className="text-camp-ember">anonyme</span>, sans casse-tête
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-lg text-camp-bark">
            Ami Secret pige les noms, garde le mystère et anime ton échange du début à la fin :
            préférences, messages anonymes, photos et rappels. Gratuit, en français, sans pub.
          </p>

          <div className="mt-7 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link to={primaryCta.to} className="btn-primary !px-7 !py-3 text-lg">
              {primaryCta.label} <ArrowRight className="h-5 w-5" />
            </Link>
            {!user && (
              <Link to="/login" className="btn-ghost !px-6 !py-3">
                J’ai déjà un compte
              </Link>
            )}
          </div>

          <ul className="mt-8 flex flex-wrap justify-center gap-2">
            {AUDIENCES.map(({ icon: Icon, label }) => (
              <li
                key={label}
                className="inline-flex items-center gap-1.5 rounded-full border-2 border-camp-bark/15 bg-white/60 px-3.5 py-1.5 text-sm font-bold text-camp-pine-dark"
              >
                <Icon aria-hidden className="h-4 w-4 text-camp-pine" />
                {label}
              </li>
            ))}
          </ul>
        </motion.div>
      </section>

      {/* ── Comment ça marche ─────────────────────────────────── */}
      <section className="relative px-4 py-16" aria-labelledby="how-title">
        <div className="mx-auto max-w-5xl">
          <p className="label-hand text-center text-2xl -rotate-1">aussi simple que ça</p>
          <h2 id="how-title" className="text-center font-display text-3xl font-black text-camp-pine-dark">
            Comment ça marche ?
          </h2>

          <ol className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {STEPS.map(({ icon: Icon, title, text }, i) => (
              <motion.li
                key={title}
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
                <h3 className="mt-3 font-display text-lg font-bold text-camp-pine-dark">{title}</h3>
                <p className="mt-1.5 text-sm text-camp-bark">{text}</p>
              </motion.li>
            ))}
          </ol>
        </div>
      </section>

      {/* ── Captures d'écran ──────────────────────────────────── */}
      <section className="relative px-4 py-16" aria-labelledby="tour-title">
        <div className="mx-auto max-w-5xl">
          <p className="label-hand text-center text-2xl rotate-1">jette un œil</p>
          <h2 id="tour-title" className="text-center font-display text-3xl font-black text-camp-pine-dark">
            L’app en un coup d’œil
          </h2>

          <div className="mt-10 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {SCREENSHOTS.map(({ src, alt, caption }, i) => (
              <motion.figure
                key={src}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ duration: 0.45, delay: i * 0.08 }}
              >
                <PhoneFrame src={src} alt={alt} />
                <figcaption className="mt-3 text-center text-sm font-semibold text-camp-bark">
                  {caption}
                </figcaption>
              </motion.figure>
            ))}
          </div>
        </div>
      </section>

      {/* ── Fonctionnalités ───────────────────────────────────── */}
      <section className="relative px-4 py-16" aria-labelledby="features-title">
        <div className="mx-auto max-w-5xl">
          <p className="label-hand text-center text-2xl -rotate-1">tout est inclus</p>
          <h2 id="features-title" className="text-center font-display text-3xl font-black text-camp-pine-dark">
            Pensé pour que la magie opère
          </h2>

          <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map(({ icon: Icon, title, text }, i) => (
              <motion.div
                key={title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ duration: 0.4, delay: i * 0.06 }}
                className="card-sign p-6"
              >
                <span className="flex h-11 w-11 items-center justify-center rounded-full bg-camp-pine/10 text-camp-pine">
                  <Icon className="h-5 w-5" />
                </span>
                <h3 className="mt-3 font-display text-lg font-bold text-camp-pine-dark">{title}</h3>
                <p className="mt-1.5 text-sm text-camp-bark">{text}</p>
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
            <strong className="text-camp-pine-dark">Tes données restent les tiennes.</strong> Ami Secret est
            gratuit, sans publicité et sans revente de données. Tu peux consulter, exporter ou supprimer
            tes informations en tout temps, conformément à la Loi 25.
          </p>
        </div>
      </section>

      {/* ── Appel final ───────────────────────────────────────── */}
      <section className="relative px-4 pb-40 pt-10 text-center">
        <div className="relative z-10 mx-auto max-w-2xl">
          <Users className="mx-auto h-8 w-8 text-camp-ember" />
          <h2 className="mt-3 font-display text-3xl font-black text-camp-pine-dark">
            Ton groupe mérite un échange mémorable
          </h2>
          <p className="mt-3 text-camp-bark">
            Deux minutes pour créer ta partie, un code à partager… et que la magie commence.
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
