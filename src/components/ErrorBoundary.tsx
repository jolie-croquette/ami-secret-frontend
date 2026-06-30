import { Component, type ReactNode } from 'react';

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
        <div className="grid min-h-screen place-items-center bg-camp-cream bg-topo p-6 text-center">
          <div className="card-sign max-w-md p-10">
            <h1 className="mb-2 font-display text-3xl font-black text-camp-berry">Une erreur est survenue</h1>
            <p className="mb-6 text-camp-bark">Le camp a rencontré un pépin. Recharge la page pour réessayer.</p>
            <button onClick={() => window.location.reload()} className="btn-primary inline-flex">
              Recharger
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
