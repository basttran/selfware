import type { ButtonHTMLAttributes } from "react";

type Variant = "primary" | "ghost" | "danger" | "soft";

const VARIANTS: Record<Variant, string> = {
  primary: "bg-primary text-primary-contrast hover:opacity-90",
  soft: "bg-accent-soft text-text hover:opacity-80",
  ghost: "bg-transparent text-text-muted hover:text-text",
  danger: "bg-transparent text-danger hover:opacity-80",
};

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
}

export function Button({ variant = "primary", className = "", ...props }: Props) {
  return (
    <button
      type="button"
      className={`inline-flex items-center justify-center gap-2 rounded-control px-4 py-3 text-sm font-medium transition-opacity disabled:cursor-not-allowed disabled:opacity-40 ${VARIANTS[variant]} ${className}`}
      {...props}
    />
  );
}
