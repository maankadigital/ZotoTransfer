import { useState, useEffect } from 'react';

// ─── Apply dark class immediately (before React renders) ──────────────────
// This runs synchronously when the module first loads, preventing flash.
function applyInitialTheme() {
  try {
    const saved = localStorage.getItem('zt-dark-mode');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const shouldBeDark = saved !== null ? saved === 'true' : prefersDark;
    if (shouldBeDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  } catch (_) {}
}
applyInitialTheme();

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
    const html = document.documentElement;
    if (dark) {
      html.classList.add('dark');
    } else {
      html.classList.remove('dark');
    }
    try {
      localStorage.setItem('zt-dark-mode', String(dark));
    } catch (_) {}
  }, [dark]);

  const toggle = () => setDark(d => !d);
  return { dark, toggle };
}
