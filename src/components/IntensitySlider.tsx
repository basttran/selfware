interface Props {
  value: number;
  onChange: (value: number) => void;
  /** Track/thumb accent color (e.g. the emotion color). */
  color?: string;
  label?: string;
}

/** A 1–10 slider with a visible current value. */
export function IntensitySlider({ value, onChange, color = "var(--color-primary)", label }: Props) {
  return (
    <div>
      <div className="mb-1 flex items-center justify-between text-text-muted text-xs">
        <span>{label}</span>
        <span className="font-semibold text-sm text-text tabular-nums">{value}/10</span>
      </div>
      <input
        type="range"
        min={1}
        max={10}
        step={1}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="h-2 w-full cursor-pointer appearance-none rounded-full bg-border accent-(--accent)"
        style={{ "--accent": color } as React.CSSProperties}
      />
    </div>
  );
}
