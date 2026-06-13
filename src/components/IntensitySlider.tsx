interface Props {
  value: number;
  onChange: (value: number) => void;
  /** Track/thumb accent color (e.g. the emotion color). */
  color?: string;
  label?: string;
  /** Accessible label for the range input when no visible label is rendered. */
  ariaLabel?: string;
  /** Lower bound; with min=0, the value 0 renders as "–" (not felt). */
  min?: 0 | 1;
  /** Hide the built-in value readout (when the parent renders it elsewhere). */
  showValue?: boolean;
}

/** A 1–10 slider with a visible current value. */
export function IntensitySlider({
  value,
  onChange,
  color = "var(--color-primary)",
  label,
  ariaLabel,
  min = 1,
  showValue = true,
}: Props) {
  return (
    <div>
      {(label || showValue) && (
        <div className="mb-1 flex items-center justify-between text-text-muted text-xs">
          <span>{label}</span>
          {showValue && (
            <span className="font-semibold text-sm text-text tabular-nums">
              {value === 0 ? "–" : `${value}/10`}
            </span>
          )}
        </div>
      )}
      <input
        type="range"
        min={min}
        max={10}
        step={1}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        aria-label={ariaLabel ?? label}
        aria-valuetext={value === 0 && min === 0 ? "–" : `${value}/10`}
        className="h-2 w-full cursor-pointer appearance-none rounded-full bg-border accent-(--accent)"
        style={{ "--accent": color } as React.CSSProperties}
      />
    </div>
  );
}
