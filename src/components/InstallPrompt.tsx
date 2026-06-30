import { useEffect, useState } from 'react';
import { Download, X } from 'lucide-react';

const DISMISS_KEY = 'ami-secret:install-prompt-dismissed';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export default function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (localStorage.getItem(DISMISS_KEY)) return;

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setVisible(true);
    };

    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setVisible(false);
    }
    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    localStorage.setItem(DISMISS_KEY, '1');
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-4 left-1/2 z-[150] w-[calc(100%-2rem)] max-w-sm -translate-x-1/2 rounded-2xl border-2 border-camp-pine/20 bg-camp-cream shadow-xl">
      <div className="flex items-start gap-3 p-4">
        <img src="/icon-192.png" alt="" className="h-12 w-12 flex-shrink-0 rounded-xl" />
        <div className="flex-1 min-w-0">
          <p className="font-display font-bold text-camp-pine-dark text-sm">Installer l'app</p>
          <p className="text-xs text-camp-bark mt-0.5">
            Accède à Ami Secret directement depuis ton écran d'accueil.
          </p>
          <button
            type="button"
            onClick={() => void handleInstall()}
            className="mt-2 flex items-center gap-1.5 rounded-lg bg-camp-pine px-3 py-1.5 text-xs font-bold text-camp-cream"
          >
            <Download className="h-3.5 w-3.5" />
            Installer
          </button>
        </div>
        <button
          type="button"
          onClick={handleDismiss}
          aria-label="Fermer"
          className="flex-shrink-0 text-camp-bark/50 hover:text-camp-ink"
        >
          <X className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
}
