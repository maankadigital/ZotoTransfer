import { useState, useEffect } from 'react';

// ─── Hook ─────────────────────────────────────────────────────────────────
export function useDarkMode() {
  const [dark, setDark] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('zt-dark-mode');
      if (saved !== null) return saved === 'true';
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    } catch (_) {
      return false;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('zt-dark-mode', String(dark));
    } catch (_) {}
  }, [dark]);

  const toggle = () => setDark(d => !d);
  return { dark, toggle };
}
