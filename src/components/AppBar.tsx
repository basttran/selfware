import type { ReactNode } from "react";
import { useNavigate } from "react-router-dom";

interface Props {
  title: string;
  /** Show a back chevron that navigates to -1 (or `back` route). */
  onBack?: () => void;
  back?: string;
  right?: ReactNode;
}

export function AppBar({ title, onBack, back, right }: Props) {
  const navigate = useNavigate();
  const handleBack = onBack ?? (() => (back ? navigate(back) : navigate(-1)));
  const showBack = Boolean(onBack || back);

  return (
    <header className="sticky top-0 z-10 flex items-center gap-2 border-border border-b bg-surface/85 px-3 py-3 backdrop-blur">
      {showBack && (
        <button
          type="button"
          aria-label="Retour"
          onClick={handleBack}
          className="-ml-2 min-h-11 min-w-11 rounded-control px-3 py-2 text-text-muted text-xl hover:text-text"
        >
          ‹
        </button>
      )}
      <h1 className="flex-1 truncate font-semibold text-base">{title}</h1>
      {right}
    </header>
  );
}
