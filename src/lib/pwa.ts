/**
 * Utilitaires PWA : détection mobile / mode installé, et capture de
 * l'événement `beforeinstallprompt` (déclenché très tôt par Chrome —
 * on le retient au niveau du module pour pouvoir le rejouer plus tard).
 */

export interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

let deferredInstallPrompt: BeforeInstallPromptEvent | null = null;

if (typeof window !== 'undefined') {
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredInstallPrompt = e as BeforeInstallPromptEvent;
  });
  window.addEventListener('appinstalled', () => {
    deferredInstallPrompt = null;
  });
}

/** true si l'app tourne déjà en mode installé (écran d'accueil). */
export function isStandalone(): boolean {
  if (typeof window === 'undefined') return false;
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    // Safari iOS expose `navigator.standalone` hors spécification.
    (navigator as Navigator & { standalone?: boolean }).standalone === true
  );
}

/** true sur téléphone / tablette (là où l'installation PWA a du sens). */
export function isMobileDevice(): boolean {
  if (typeof navigator === 'undefined') return false;
  const ua = navigator.userAgent;
  const iPadOS = navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1;
  return /android|iphone|ipad|ipod|mobile/i.test(ua) || iPadOS;
}

/** true sur iOS/iPadOS, où l'installation passe par le menu partager de Safari. */
export function isIos(): boolean {
  if (typeof navigator === 'undefined') return false;
  const iPadOS = navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1;
  return /iphone|ipad|ipod/i.test(navigator.userAgent) || iPadOS;
}

/** L'invite d'installation native est-elle disponible (Chrome/Edge Android) ? */
export function canPromptInstall(): boolean {
  return deferredInstallPrompt !== null;
}

/**
 * Rejoue l'invite d'installation native si elle a été capturée.
 * Renvoie le choix de l'utilisateur, ou null si l'invite n'est pas disponible.
 */
export async function promptInstall(): Promise<'accepted' | 'dismissed' | null> {
  if (!deferredInstallPrompt) return null;
  const evt = deferredInstallPrompt;
  await evt.prompt();
  const { outcome } = await evt.userChoice;
  if (outcome === 'accepted') deferredInstallPrompt = null;
  return outcome;
}
