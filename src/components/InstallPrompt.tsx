import { useEffect, useState } from 'react';
import { Download, X, ChevronDown } from 'lucide-react';
import { isMobileDevice, isStandalone, isIos, canPromptInstall, promptInstall } from '@/lib/pwa';
import { PWA_INSTALL_INSTRUCTIONS } from '@/content/updateNote';

/**
 * Bannière d'installation PWA, proposée à chaque connexion / rechargement de
 * page sur mobile tant que l'app n'est pas installée. La fermer ne vaut que
 * pour le chargement en cours : elle revient à la prochaine visite.
 * Jamais affichée sur ordinateur ni dans l'app installée.
 */
export default function InstallPrompt() {
  const [visible, setVisible] = useState(false);
  const [showSteps, setShowSteps] = useState(false);

  useEffect(() => {
    if (!isMobileDevice() || isStandalone()) return;
    setVisible(true);

    // Si l'utilisateur installe l'app pendant la session, on retire la bannière.
    const onInstalled = () => setVisible(false);
    window.addEventListener('appinstalled', onInstalled);
    return () => window.removeEventListener('appinstalled', onInstalled);
  }, []);

  const handleInstall = async () => {
    // Invite native (Chrome/Edge Android) si disponible, sinon instructions.
    const outcome = await promptInstall();
    if (outcome === 'accepted') setVisible(false);
    else if (outcome === null) setShowSteps((s) => !s);
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-4 left-1/2 z-[140] w-[calc(100%-2rem)] max-w-sm -translate-x-1/2 rounded-2xl border-2 border-camp-pine/20 bg-camp-cream shadow-xl">
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
            {!canPromptInstall() && (
              <ChevronDown
                className={`h-3.5 w-3.5 transition-transform ${showSteps ? 'rotate-180' : ''}`}
              />
            )}
          </button>
        </div>
        <button
          type="button"
          onClick={() => setVisible(false)}
          aria-label="Fermer"
          className="flex-shrink-0 text-camp-bark/50 hover:text-camp-ink"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {showSteps && (
        <ol className="mx-4 mb-4 list-decimal space-y-1 rounded-xl bg-white/60 p-3 pl-8 text-xs text-camp-ink">
          {(isIos() ? PWA_INSTALL_INSTRUCTIONS.ios : PWA_INSTALL_INSTRUCTIONS.android).map(
            (line, i) => (
              <li key={i}>{line}</li>
            )
          )}
        </ol>
      )}
    </div>
  );
}
