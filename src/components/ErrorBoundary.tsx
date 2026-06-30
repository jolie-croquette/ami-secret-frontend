import { Component, type ReactNode } from 'react';
import { Campfire, CampScene } from '@/components/visuals/CampVisuals';

interface State {
  hasError: boolean;
}

/** Capture les erreurs de rendu React et affiche un écran de secours thématisé. */
export class ErrorBoundary extends Component<{ children: ReactNode }, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: unknown) {
    console.error('[ErrorBoundary]', error);
    // Chunk introuvable après un déploiement (SW cache périmé) → rechargement forcé
    const msg = error instanceof Error ? error.message : String(error);
    if (msg.includes('Failed to fetch dynamically imported module') || msg.includes('Importing a module script failed')) {
      window.location.reload();
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-camp-sand bg-topo px-6 pb-24 pt-12 text-center">
          {/* Feu de camp animé */}
          <Campfire className="mx-auto mb-6 h-24 w-24 drop-shadow-lg" />

          <h1 className="mb-3 font-display text-4xl font-black text-camp-pine-dark">
            Le feu s'est éteint&nbsp;!
          </h1>
          <p className="mb-2 max-w-xs text-base text-camp-bark">
            Une erreur inattendue a interrompu la veillée.
          </p>
          <p className="mb-8 max-w-xs text-sm text-camp-bark/60">
            Recharge la page — ça devrait suffire à rallumer les braises.
          </p>

          <button
            onClick={() => window.location.reload()}
            className="btn-primary px-8 py-3 text-base"
          >
            Recharger la page
          </button>

          <a
            href="/dashboard"
            className="mt-3 text-sm text-camp-bark/60 underline-offset-2 hover:text-camp-ink hover:underline"
          >
            Retour au tableau de bord
          </a>

          {/* Scène de camp en bas */}
          <CampScene className="pointer-events-none absolute bottom-0 left-0 h-28 w-full opacity-60" />
        </div>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
