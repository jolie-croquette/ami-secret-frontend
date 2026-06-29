import { useContext, useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Bell, X } from 'lucide-react';
import { AuthContext } from '@/context/AuthContext';
import { pushApi } from '@/api/push';
import { urlBase64ToUint8Array } from '@/lib/push';

const DISMISS_KEY = 'push-prompt-dismissed';

/**
 * Bannière proposant d'activer les notifications push natives. N'apparaît que
 * si le navigateur supporte le push, qu'aucune décision n'a encore été prise
 * (`Notification.permission === 'default'`) et que l'utilisateur a complété
 * son profil. Ignorée silencieusement pour la session si l'utilisateur la ferme.
 */
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
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 24 }}
          transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
          className="card-sign fixed bottom-4 left-4 right-4 z-[110] mx-auto flex max-w-md items-center gap-3 p-4 sm:left-auto sm:right-4"
        >
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-camp-pine/15 text-camp-pine">
            <Bell className="h-5 w-5" />
          </span>
          <div className="flex-1">
            <p className="font-display text-sm font-bold text-camp-pine-dark">
              Activer les notifications ?
            </p>
            <p className="text-xs text-camp-bark/70">
              Reçois une alerte quand quelqu’un t’envoie un message ou que le tirage est fait.
            </p>
          </div>
          <button
            type="button"
            onClick={() => void enable()}
            disabled={busy}
            className="btn-primary px-4 py-2 text-sm"
          >
            Activer
          </button>
          <button
            type="button"
            onClick={dismiss}
            disabled={busy}
            aria-label="Fermer"
            className="text-camp-bark/50 transition hover:text-camp-ink"
          >
            <X className="h-4 w-4" />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
