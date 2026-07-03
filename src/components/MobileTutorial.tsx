import { useContext, useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import {
  Tent,
  Gift,
  MessageSquareHeart,
  Smartphone,
  Download,
  ChevronRight,
  ChevronLeft,
  X,
} from 'lucide-react';
import { AuthContext } from '@/context/AuthContext';
import { isMobileDevice, isStandalone, isIos, canPromptInstall, promptInstall } from '@/lib/pwa';
import { PWA_INSTALL_INSTRUCTIONS } from '@/content/updateNote';

/**
 * Clé de session : le tutoriel se réaffiche à chaque nouvelle connexion
 * (nouvel onglet / nouvelle session, ou login explicite qui efface la clé
 * via AuthContext), mais pas à chaque navigation dans la même session.
 */
export const MOBILE_TUTORIAL_SEEN_KEY = 'ami-secret:mobile-tutorial-seen';

interface Step {
  icon: typeof Tent;
  title: string;
  body: string[];
}

const STEPS: Step[] = [
  {
    icon: Tent,
    title: 'Bienvenue au camp !',
    body: [
      'Ton tableau de bord regroupe toutes tes parties d’ami secret.',
      'Rejoins une partie avec le code à 6 lettres fourni par l’organisateur, ou crée la tienne.',
    ],
  },
  {
    icon: Gift,
    title: 'Ton ami secret',
    body: [
      'Après le tirage, découvre à qui tu offres des cadeaux — chut, c’est secret !',
      'Remplis tes préférences (j’aime, allergies, liste de souhaits) pour aider ton propre ami secret.',
    ],
  },
  {
    icon: MessageSquareHeart,
    title: 'Messages et photos',
    body: [
      'Écris des messages anonymes à ton ami secret directement dans la partie.',
      'Partage une photo quand tu reçois un cadeau : tout le camp en profite !',
    ],
  },
  {
    icon: Smartphone,
    title: 'Installe l’app !',
    body: [
      'Ajoute Ami Secret à ton écran d’accueil pour l’ouvrir comme une vraie application et recevoir les notifications.',
    ],
  },
];

/**
 * Tutoriel affiché à chaque connexion détectée sur mobile (hors app installée),
 * qui présente l’app et incite à installer la PWA. Monté dans le Layout.
 */
export default function MobileTutorial() {
  const auth = useContext(AuthContext);
  const user = auth?.user;
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(0);
  const [installing, setInstalling] = useState(false);

  useEffect(() => {
    // Après l'onboarding seulement (pour ne pas chevaucher le wizard),
    // sur mobile, et pas si l'app est déjà installée.
    if (!user || !user.onBoarded) return;
    if (!isMobileDevice() || isStandalone()) return;
    if (sessionStorage.getItem(MOBILE_TUTORIAL_SEEN_KEY)) return;
    setStep(0);
    setOpen(true);
  }, [user]);

  const close = () => {
    sessionStorage.setItem(MOBILE_TUTORIAL_SEEN_KEY, '1');
    setOpen(false);
  };

  const handleInstall = async () => {
    setInstalling(true);
    try {
      const outcome = await promptInstall();
      if (outcome === 'accepted') close();
    } finally {
      setInstalling(false);
    }
  };

  if (!open) return null;

  const isLast = step === STEPS.length - 1;
  const current = STEPS[step];
  const Icon = current.icon;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-[150] flex items-end justify-center sm:items-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <div className="absolute inset-0 bg-camp-ink/50 backdrop-blur-sm" onClick={close} />
        <motion.div
          role="dialog"
          aria-modal="true"
          aria-label="Tutoriel Ami Secret"
          initial={{ opacity: 0, y: 32 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 32 }}
          transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
          className="card-sign relative z-10 m-4 w-full max-w-md p-6 sm:p-7"
        >
          <button
            type="button"
            onClick={close}
            aria-label="Passer le tutoriel"
            className="absolute right-4 top-4 text-camp-bark/50 transition hover:text-camp-ink"
          >
            <X className="h-5 w-5" />
          </button>

          {/* Points d'étape */}
          <div className="mb-5 flex justify-center gap-2">
            {STEPS.map((_, i) => (
              <span
                key={i}
                className={`h-2 rounded-full transition-all ${
                  i === step ? 'w-6 bg-camp-pine' : 'w-2 bg-camp-bark/25'
                }`}
              />
            ))}
          </div>

          <div className="mb-4 flex flex-col items-center text-center">
            <span className="mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-camp-pine/10 text-camp-pine">
              <Icon className="h-7 w-7" />
            </span>
            <h2 className="font-display text-2xl font-black text-camp-pine-dark">{current.title}</h2>
          </div>

          <div className="mb-6 space-y-2.5">
            {current.body.map((line, i) => (
              <p key={i} className="text-center text-sm text-camp-ink">
                {line}
              </p>
            ))}

            {isLast &&
              (canPromptInstall() ? (
                <button
                  type="button"
                  onClick={() => void handleInstall()}
                  disabled={installing}
                  className="btn-primary mx-auto !mt-4 flex items-center gap-2"
                >
                  <Download className="h-4 w-4" />
                  Installer l’application
                </button>
              ) : (
                <ol className="!mt-4 list-decimal space-y-1 rounded-2xl border-2 border-camp-bark/15 bg-white/50 p-4 pl-8 text-left text-sm text-camp-ink">
                  {(isIos() ? PWA_INSTALL_INSTRUCTIONS.ios : PWA_INSTALL_INSTRUCTIONS.android).map(
                    (line, i) => (
                      <li key={i}>{line}</li>
                    )
                  )}
                </ol>
              ))}
          </div>

          <div className="flex items-center justify-between gap-3">
            {step > 0 ? (
              <button type="button" onClick={() => setStep((s) => s - 1)} className="btn-ghost">
                <ChevronLeft className="h-4 w-4" /> Retour
              </button>
            ) : (
              <button type="button" onClick={close} className="btn-ghost text-camp-bark/70">
                Passer
              </button>
            )}
            {isLast ? (
              <button type="button" onClick={close} className="btn-primary flex-1">
                C’est parti !
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setStep((s) => s + 1)}
                className="btn-primary flex-1"
              >
                Suivant <ChevronRight className="h-4 w-4" />
              </button>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
