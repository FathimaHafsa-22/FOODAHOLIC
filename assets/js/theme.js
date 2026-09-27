(function () {
  const STORAGE_KEY = 'foodaholic-theme';
  const html = document.documentElement;

  /* Get the theme to apply on initial load.
    Priority: saved preference → system preference → light*/
  function getInitialTheme() {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === 'light' || saved === 'dark') return saved;

    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    return systemPrefersDark ? 'dark' : 'light';
  }

  /* Apply theme to <html data-theme="...">*/
  function applyTheme(theme) {
    html.setAttribute('data-theme', theme);
    localStorage.setItem(STORAGE_KEY, theme);
    updateToggleButton(theme);
  }

  /* Update the toggle button's icon + aria-label*/
  function updateToggleButton(theme) {
    const btn = document.getElementById('theme-toggle');
    if (!btn) return;

    const isDark = theme === 'dark';
    btn.setAttribute('aria-label', isDark ? 'Switch to light mode' : 'Switch to dark mode');
    btn.setAttribute('aria-pressed', String(isDark));
    btn.innerHTML = isDark
      ? '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"/></svg>'
      : '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>';
  }

  /*Toggle between light and dark*/
  function toggleTheme() {
    const current = html.getAttribute('data-theme') || 'light';
    const next = current === 'dark' ? 'light' : 'dark';
    applyTheme(next);
  }


  
  html.setAttribute('data-theme', getInitialTheme());

  
  document.addEventListener('DOMContentLoaded', () => {
    updateToggleButton(html.getAttribute('data-theme'));

    const btn = document.getElementById('theme-toggle');
    if (btn) btn.addEventListener('click', toggleTheme);

    // Listen for OS-level changes if user hasn't explicitly chosen
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
      if (!localStorage.getItem(STORAGE_KEY)) {
        applyTheme(e.matches ? 'dark' : 'light');
      }
    });
  });

  
  window.FoodaholicTheme = { toggle: toggleTheme, apply: applyTheme };
})();