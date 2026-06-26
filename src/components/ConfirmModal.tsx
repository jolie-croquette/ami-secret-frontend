import { type ReactNode } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { AlertTriangle, Loader2, X } from 'lucide-react';

interface ConfirmModalProps {
  open: boolean;
  title: string;
  message?: ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  /** `danger` colore le bouton de confirmation en baie (actions destructrices). */
  tone?: 'default' | 'danger';
  loading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  children?: ReactNode;
}

/** Modale de confirmation thématisée « camp », pour les actions sensibles. */
export default function ConfirmModal({
  open,
  title,
  message,
  confirmLabel = 'Confirmer',
  cancelLabel = 'Annuler',
  tone = 'default',
  loading = false,
  onConfirm,
  onCancel,
  children,
}: ConfirmModalProps) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div
            className="absolute inset-0 bg-camp-ink/40 backdrop-blur-sm"
            onClick={loading ? undefined : onCancel}
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
              onClick={onCancel}
              disabled={loading}
              aria-label="Fermer"
              className="absolute right-4 top-4 text-camp-bark/50 transition hover:text-camp-ink"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="mb-3 flex items-center gap-3">
              <span
                className={`flex h-10 w-10 items-center justify-center rounded-full ${
                  tone === 'danger' ? 'bg-camp-berry/15 text-camp-berry' : 'bg-camp-sand text-camp-pine'
                }`}
              >
                <AlertTriangle className="h-5 w-5" />
              </span>
              <h2 className="font-display text-xl font-black text-camp-pine-dark">{title}</h2>
            </div>

            {message && <div className="mb-4 text-sm text-camp-bark">{message}</div>}
            {children}

            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button type="button" className="btn-ghost" onClick={onCancel} disabled={loading}>
                {cancelLabel}
              </button>
              <button
                type="button"
                className={tone === 'danger' ? 'btn btn-danger' : 'btn-primary'}
                onClick={onConfirm}
                disabled={loading}
              >
                {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : confirmLabel}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
