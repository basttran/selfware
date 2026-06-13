import { PALETTES } from "@/theme/palettes.ts";

interface Props {
  value: string;
  onChange: (id: string) => void;
}

export function PaletteSelector({ value, onChange }: Props) {
  return (
    <div className="flex items-center gap-2 pr-1" role="group" aria-label="Palette de couleurs">
      {PALETTES.map((p) => (
        <button
          key={p.id}
          type="button"
          aria-label={p.label}
          aria-pressed={value === p.id}
          onClick={() => onChange(p.id)}
          className="size-5 rounded-full transition-[outline-offset] duration-150"
          style={{
            background: p.dot,
            outline: `2px solid ${value === p.id ? p.dot : "transparent"}`,
            outlineOffset: value === p.id ? "2px" : "0px",
          }}
        />
      ))}
    </div>
  );
}
