import { useContext, useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Bell, X } from 'lucide-react';
import { AuthContext } from '@/context/AuthContext';
import { pushApi } from '@/api/push';
import { urlBase64ToUint8Array } from '@/lib/push';

const DISMISS_KEY = 'push-prompt-dismissed';

export default function EnableNotificationsPrompt() {
  const auth = useContext(AuthContext);
  const user = auth?.user;
  const [visible, setVisible] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const supported = 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window;
    if (!supported || !user?.onBoarded) {
      setVisible(false);
      return;
    }
    if (sessionStorage.getItem(DISMISS_KEY)) {
      setVisible(false);
      return;
    }
    setVisible(Notification.permission === 'default');
  }, [user]);

  const dismiss = () => {
    sessionStorage.setItem(DISMISS_KEY, '1');
    setVisible(false);
  };

  const enable = async () => {
    setBusy(true);
    try {
      const permission = await Notification.requestPermission();
      if (permission !== 'granted') {
        dismiss();
        return;
      }
      const { publicKey } = await pushApi.getPublicKey();
      if (!publicKey) {
        dismiss();
        return;
      }
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(publicKey),
      });
      const raw = subscription.toJSON();
      await pushApi.subscribe({
        endpoint: subscription.endpoint,
        keys: { p256dh: raw.keys!.p256dh, auth: raw.keys!.auth },
      });
    } catch {
      /* on ferme quand même : pas bloquant */
    } finally {
      dismiss();
      setBusy(false);
    }
  };

  return (
    <AnimatePresence>
      {visible && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[109] bg-black/40 backdrop-blur-sm"
            onClick={dismiss}
          />
          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 16 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="card-sign fixed left-1/2 top-1/2 z-[110] w-full max-w-sm -translate-x-1/2 -translate-y-1/2 p-8"
          >
            <button
              type="button"
              onClick={dismiss}
              disabled={busy}
              aria-label="Fermer"
              className="absolute right-4 top-4 text-camp-bark/40 transition hover:text-camp-ink"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-camp-pine/15 text-camp-pine">
              <Bell className="h-8 w-8" />
            </div>

            <h2 className="mb-2 text-center font-display text-xl font-black text-camp-pine-dark">
              Activer les notifications ?
            </h2>
            <p className="mb-6 text-center text-sm text-camp-bark/70">
              Reçois une alerte directement sur ton appareil quand quelqu'un t'envoie un message ou que le tirage est fait.
            </p>

            <div className="flex flex-col gap-3">
              <button
                type="button"
                onClick={() => void enable()}
                disabled={busy}
                className="btn-primary w-full py-3 text-base"
              >
                {busy ? 'Activation…' : 'Activer les notifications'}
              </button>
              <button
                type="button"
                onClick={dismiss}
                disabled={busy}
                className="w-full py-2 text-sm text-camp-bark/60 transition hover:text-camp-ink"
              >
                Plus tard
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
