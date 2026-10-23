// Runs before hydration so the first paint already has the right theme (no flash).
// Follows prefers-color-scheme on first visit, then the user's remembered choice.
export const THEME_STORAGE_KEY = "deriva-theme";

export const themeInitScript = `(function(){try{var t=localStorage.getItem("${THEME_STORAGE_KEY}");if(t!=="light"&&t!=="dark"){t=matchMedia("(prefers-color-scheme: light)").matches?"light":"dark"}document.documentElement.dataset.theme=t}catch(e){document.documentElement.dataset.theme="dark"}})();`;
