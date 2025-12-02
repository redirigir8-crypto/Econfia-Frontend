// ...new file...
import { tokens } from './tokens';

function setVar(name, value) {
  if (value != null) document.documentElement.style.setProperty(name, String(value));
}

export function applyTheme() {
  const root = document.documentElement;
  root.dataset.theme = tokens.mode;

  // Colors
  Object.entries(tokens.colors).forEach(([key, value]) => {
    const cssKey = key.replace(/([A-Z])/g, '-$1').toLowerCase();
    setVar(`--color-${cssKey}`, value);
  });

  // Radii
  setVar('--radius', `${tokens.radii.base}px`);
  setVar('--card-radius', `${tokens.radii.card}px`);

  // Shadows
  Object.entries(tokens.shadows).forEach(([key, value]) => {
    setVar(`--shadow-${key}`, value);
  });

  // Animations
  setVar('--anim-fast', `${tokens.anim.fast}ms`);
  setVar('--anim-base', `${tokens.anim.base}ms`);
  setVar('--anim-slow', `${tokens.anim.slow}ms`);

  // Easing
  Object.entries(tokens.easing).forEach(([key, value]) => {
    setVar(`--ease-${key}`, value);
  });

  // Gradients
  Object.entries(tokens.gradients).forEach(([key, value]) => {
    setVar(`--gradient-${key}`, value);
  });
}

export function initTheme() {
  applyTheme();
}

if (typeof document !== 'undefined') {
  initTheme();
}
