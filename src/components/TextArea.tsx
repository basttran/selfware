import type { TextareaHTMLAttributes } from "react";

export function TextArea({
  className = "",
  ...props
}: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className={`min-h-32 w-full resize-y rounded-control border border-border bg-surface-raised p-3 text-sm leading-relaxed outline-none placeholder:text-text-muted focus:border-primary ${className}`}
      {...props}
    />
  );
}
