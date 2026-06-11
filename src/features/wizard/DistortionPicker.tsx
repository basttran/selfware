import { useState } from "react";
import { useTranslation } from "react-i18next";
import { HintToggleIcon } from "@/components/HintToggleIcon.tsx";
import { DISTORTION_IDS } from "@/data/distortions.ts";

interface Props {
  selected: string[];
  onToggle: (id: string) => void;
}

export function DistortionPicker({ selected, onToggle }: Props) {
  const { t } = useTranslation();
  const [expanded, setExpanded] = useState<string | null>(null);

  return (
    <ul className="grid grid-cols-2 gap-2">
      {DISTORTION_IDS.map((id) => {
        const isSelected = selected.includes(id);
        const isOpen = expanded === id;
        return (
          <li
            key={id}
            className={`rounded-card border bg-surface-raised ${
              isSelected ? "border-primary" : "border-border"
            }`}
          >
            <div className="flex items-center gap-2 p-2">
              <input
                type="checkbox"
                checked={isSelected}
                onChange={() => onToggle(id)}
                className="size-4 accent-primary"
                id={`distortion-${id}`}
              />
              <label
                htmlFor={`distortion-${id}`}
                className="flex min-h-[2lh] flex-1 items-center text-sm leading-snug"
              >
                {t(`distortion.${id}.name`)}
              </label>
              <button
                type="button"
                aria-label="Définition"
                aria-expanded={isOpen}
                onClick={() => setExpanded(isOpen ? null : id)}
                className="flex size-6 shrink-0 items-center justify-center rounded-full bg-accent-soft text-text-muted"
              >
                <HintToggleIcon open={isOpen} />
              </button>
            </div>
            {isOpen && (
              <div className="space-y-2 border-border border-t px-3 py-2 text-text-muted text-xs leading-relaxed">
                <p>{t(`distortion.${id}.definition`)}</p>
                <p className="italic">{t(`distortion.${id}.example`)}</p>
              </div>
            )}
          </li>
        );
      })}
    </ul>
  );
}
