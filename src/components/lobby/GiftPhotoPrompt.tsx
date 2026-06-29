import { useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Camera, Loader2, X } from 'lucide-react';
import { toast } from 'react-toastify';
import { giftPhotoApi } from '@/api/giftPhoto';

/**
 * Prompt optionnel affiché après qu'un membre ait marqué une semaine comme
 * reçue. Propose un selfie avec le cadeau, partagé dans le fil de la partie.
 * Fermable sans action (« Plus tard ») — ne bloque jamais le suivi du cadeau.
 */
export default function GiftPhotoPrompt({
  code,
  week,
  onClose,
  onUploaded,
}: {
  code: string;
  week: number;
  onClose: () => void;
  onUploaded: () => void;
}) {
  const [busy, setBusy] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File) => {
    setBusy(true);
    try {
      await giftPhotoApi.upload(code, { week, photo: file });
      onUploaded();
      onClose();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Échec de l'envoi de la photo.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-[120] flex items-center justify-center p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <div className="absolute inset-0 bg-camp-ink/40 backdrop-blur-sm" onClick={busy ? undefined : onClose} />
        <motion.div
          role="dialog"
          aria-modal="true"
          initial={{ opacity: 0, y: 16, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 16, scale: 0.97 }}
          transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
          className="card-sign relative z-10 w-full max-w-sm p-6 text-center"
        >
          <button
            type="button"
            onClick={busy ? undefined : onClose}
            disabled={busy}
            aria-label="Fermer"
            className="absolute right-4 top-4 text-camp-bark/50 transition hover:text-camp-ink"
          >
            <X className="h-5 w-5" />
          </button>

          <span className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-camp-ember/15 text-camp-ember">
            <Camera className="h-6 w-6" />
          </span>
          <h2 className="mb-2 font-display text-lg font-black text-camp-pine-dark">
            Prendre un selfie avec ton cadeau ?
          </h2>
          <p className="mb-5 text-sm text-camp-bark">
            Partage le moment dans le fil de la partie — tout le monde pourra le voir.
          </p>

          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            capture="user"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) void handleFile(file);
            }}
          />

          <div className="flex flex-col gap-2">
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              disabled={busy}
              className="btn-primary"
            >
              {busy ? <Loader2 className="h-5 w-5 animate-spin" /> : <Camera className="h-5 w-5" />}
              Prendre une photo
            </button>
            <button type="button" onClick={onClose} disabled={busy} className="btn-ghost">
              Plus tard
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
