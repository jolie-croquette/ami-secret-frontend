import { useContext, useEffect, useState } from 'react';
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
    if (!supported || !user?.onBoarded) { setVisible(false); return; }
    if (sessionStorage.getItem(DISMISS_KEY)) { setVisible(false); return; }
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
      if (permission !== 'granted') { dismiss(); return; }
      const { publicKey } = await pushApi.getPublicKey();
      if (!publicKey) { dismiss(); return; }
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
      /* pas bloquant */
    } finally {
      dismiss();
      setBusy(false);
    }
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-4 left-1/2 z-[150] w-[calc(100%-2rem)] max-w-sm -translate-x-1/2 rounded-2xl border-2 border-camp-pine/20 bg-camp-cream shadow-xl">
      <div className="flex items-start gap-3 p-4">
        <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-camp-pine/15 text-camp-pine">
          <Bell className="h-5 w-5" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-display font-bold text-camp-pine-dark text-sm">Activer les notifications</p>
          <p className="text-xs text-camp-bark mt-0.5">
            Reçois une alerte quand quelqu'un t'envoie un message ou que le tirage est fait.
          </p>
          <button
            type="button"
            onClick={() => void enable()}
            disabled={busy}
            className="mt-2 rounded-lg bg-camp-pine px-3 py-1.5 text-xs font-bold text-camp-cream disabled:opacity-60"
          >
            {busy ? 'Activation…' : 'Activer'}
          </button>
        </div>
        <button
          type="button"
          onClick={dismiss}
          disabled={busy}
          aria-label="Fermer"
          className="flex-shrink-0 text-camp-bark/50 hover:text-camp-ink"
        >
          <X className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
}
