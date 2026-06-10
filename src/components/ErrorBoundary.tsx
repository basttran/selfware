import { Component, type ErrorInfo, type ReactNode } from "react";

interface Props {
  children: ReactNode;
}

interface State {
  error: Error | null;
}

/** Last-resort guard: a thrown render/effect error shows a message instead of a blank page. */
export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("Selfware error:", error, info);
  }

  render() {
    if (!this.state.error) return this.props.children;
    return (
      <div className="flex min-h-full flex-col items-center justify-center gap-4 p-8 text-center">
        <h1 className="font-semibold text-lg">Une erreur est survenue</h1>
        <p className="max-w-sm text-sm text-text-muted leading-relaxed">
          L'application a rencontré un problème. Vos données sont conservées sur l'appareil.
        </p>
        <button
          type="button"
          onClick={() => window.location.reload()}
          className="rounded-control bg-primary px-4 py-2.5 font-medium text-primary-contrast text-sm"
        >
          Recharger
        </button>
        <pre className="max-w-full overflow-auto text-text-muted text-xs opacity-60">
          {this.state.error.message}
        </pre>
      </div>
    );
  }
}
