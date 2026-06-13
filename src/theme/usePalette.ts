import { useState, useEffect } from "react";

const KEY = "palette";

function applyPalette(id: string) {
  if (id === "default") delete document.documentElement.dataset.palette;
  else document.documentElement.dataset.palette = id;
}

export function usePalette() {
  const [palette, setPaletteState] = useState<string>(
    () => localStorage.getItem(KEY) ?? "default",
  );

  useEffect(() => {
    applyPalette(palette);
  }, [palette]);

  function setPalette(id: string) {
    try { localStorage.setItem(KEY, id); } catch {}
    applyPalette(id);
    setPaletteState(id);
  }

  return { palette, setPalette };
}
