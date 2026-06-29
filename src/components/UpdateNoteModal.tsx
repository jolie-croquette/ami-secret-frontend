import { useContext, useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Sparkles, Check, X, Smartphone } from 'lucide-react';
import { AuthContext } from '@/context/AuthContext';
import { userApi } from '@/api/user';
import { UPDATE_NOTE, PWA_INSTALL_INSTRUCTIONS } from '@/content/updateNote';

/**
 * Affiche la note de mise à jour une seule fois par utilisateur (suivi en base
 * via `lastSeenUpdate`). Monté dans le Layout : visible sur toute page connectée.
 */
export default function UpdateNoteModal() {
  const auth = useContext(AuthContext);
  const user = auth?.user;
  const [open, setOpen] = useState(false);
  const [dismissing, setDismissing] = useState(false);

  useEffect(() => {
    // On n'affiche qu'une fois le profil complété, pour ne pas chevaucher le wizard.
    if (user && user.onBoarded && user.lastSeenUpdate !== UPDATE_NOTE.version) setOpen(true);
    else setOpen(false);
  }, [user]);

  const dismiss = async () => {
    setDismissing(true);
    try {
      await userApi.seenUpdate(UPDATE_NOTE.version);
      await auth?.refresh();
    } catch {
      /* on ferme quand même : pas bloquant */
    } finally {
      setOpen(false);
      setDismissing(false);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[120] flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div
            className="absolute inset-0 bg-camp-ink/40 backdrop-blur-sm"
            onClick={dismissing ? undefined : () => void dismiss()}
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            initial={{ opacity: 0, y: 16, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.97 }}
            transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="card-sign relative z-10 w-full max-w-md p-6 sm:p-7"
          >
            <button
              type="button"
              onClick={() => void dismiss()}
              disabled={dismissing}
              aria-label="Fermer"
              className="absolute right-4 top-4 text-camp-bark/50 transition hover:text-camp-ink"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="mb-3 flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-camp-ember/15 text-camp-ember">
                <Sparkles className="h-5 w-5" />
              </span>
              <div>
                <h2 className="font-display text-xl font-black text-camp-pine-dark">
                  {UPDATE_NOTE.title}
                </h2>
                <p className="text-xs font-semibold text-camp-bark/70">{UPDATE_NOTE.date}</p>
              </div>
            </div>

            <ul className="mb-6 space-y-2.5">
              {UPDATE_NOTE.items.map((item, i) => (
                <li key={i} className="flex items-start gap-2.5 text-sm text-camp-ink">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-camp-pine" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>

            <details className="mb-6 rounded-2xl border-2 border-camp-bark/15 bg-white/50 p-4">
              <summary className="flex cursor-pointer items-center gap-2 font-display text-sm font-bold text-camp-pine-dark">
                <Smartphone className="h-4 w-4" /> Comment l’installer sur ton téléphone ?
              </summary>
              <div className="mt-3 grid gap-4 sm:grid-cols-2">
                <div>
                  <p className="mb-1.5 text-xs font-bold uppercase tracking-wide text-camp-bark/70">
                    iPhone (Safari)
                  </p>
                  <ol className="list-decimal space-y-1 pl-4 text-sm text-camp-ink">
                    {PWA_INSTALL_INSTRUCTIONS.ios.map((step, i) => (
                      <li key={i}>{step}</li>
                    ))}
                  </ol>
                </div>
                <div>
                  <p className="mb-1.5 text-xs font-bold uppercase tracking-wide text-camp-bark/70">
                    Android (Chrome)
                  </p>
                  <ol className="list-decimal space-y-1 pl-4 text-sm text-camp-ink">
                    {PWA_INSTALL_INSTRUCTIONS.android.map((step, i) => (
                      <li key={i}>{step}</li>
                    ))}
                  </ol>
                </div>
              </div>
            </details>

            <button
              type="button"
              onClick={() => void dismiss()}
              disabled={dismissing}
              className="btn-primary w-full"
            >
              Compris, merci !
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
