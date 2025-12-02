// ...new file...
const env = process.env;
const get = (k, fb) => (env[k] && env[k] !== '' ? env[k] : fb);

export const tokens = {
  mode: get('REACT_APP_THEME_MODE', 'light'),
  colors: {
    primary: get('REACT_APP_COLOR_PRIMARY', '#007AFF'),
    accent: get('REACT_APP_COLOR_ACCENT', '#5856D6'),
    warning: get('REACT_APP_COLOR_WARNING', '#FF9500'),
    success: get('REACT_APP_COLOR_SUCCESS', '#34C759'),
    error: get('REACT_APP_COLOR_ERROR', '#FF3B30'),
    surface: get('REACT_APP_COLOR_SURFACE', '#FFFFFF'),
    surfaceElevated: get('REACT_APP_COLOR_SURFACE_ELEVATED', '#F9FAFB'),
    surfaceGlass: get('REACT_APP_COLOR_SURFACE_GLASS', 'rgba(255,255,255,0.8)'),
    surfaceFrosted: get('REACT_APP_COLOR_SURFACE_FROSTED', 'rgba(249,250,251,0.72)'),
    textPrimary: get('REACT_APP_COLOR_TEXT_PRIMARY', '#1D1D1F'),
    textSecondary: get('REACT_APP_COLOR_TEXT_SECONDARY', '#6E6E73'),
    textTertiary: get('REACT_APP_COLOR_TEXT_TERTIARY', '#86868B'),
    border: get('REACT_APP_COLOR_BORDER', 'rgba(0,0,0,0.08)'),
    borderLight: get('REACT_APP_COLOR_BORDER_LIGHT', 'rgba(0,0,0,0.04)'),
  },
  radii: {
    base: Number(get('REACT_APP_RADIUS', '12')),
    card: Number(get('REACT_APP_CARD_RADIUS', '16')),
  },
  shadows: {
    xs: get('REACT_APP_SHADOW_XS', '0 1px 2px rgba(0,0,0,0.04)'),
    sm: get(
      'REACT_APP_SHADOW_SM',
      '0 2px 8px rgba(0,0,0,0.08), 0 1px 4px rgba(0,0,0,0.04)'
    ),
    md: get(
      'REACT_APP_SHADOW_MD',
      '0 4px 16px rgba(0,0,0,0.1), 0 2px 8px rgba(0,0,0,0.06)'
    ),
    lg: get(
      'REACT_APP_SHADOW_LG',
      '0 8px 32px rgba(0,0,0,0.12), 0 4px 16px rgba(0,0,0,0.08)'
    ),
    focus: get('REACT_APP_SHADOW_FOCUS', '0 0 0 4px rgba(0,122,255,0.2)'),
  },
  anim: {
    fast: Number(get('REACT_APP_ANIM_FAST_MS', '200')),
    base: Number(get('REACT_APP_ANIM_BASE_MS', '350')),
    slow: Number(get('REACT_APP_ANIM_SLOW_MS', '500')),
  },
  easing: {
    standard: get('REACT_APP_EASING_STANDARD', 'cubic-bezier(0.4, 0.0, 0.2, 1)'),
    decelerate: get('REACT_APP_EASING_DECELERATE', 'cubic-bezier(0.0, 0.0, 0.2, 1)'),
    accelerate: get('REACT_APP_EASING_ACCELERATE', 'cubic-bezier(0.4, 0.0, 1, 1)'),
    spring: get('REACT_APP_EASING_SPRING', 'cubic-bezier(0.34, 1.56, 0.64, 1)'),
  },
  gradients: {
    primary: get(
      'REACT_APP_GRADIENT_PRIMARY',
      'linear-gradient(135deg, #007AFF 0%, #5856D6 100%)'
    ),
    mesh: get(
      'REACT_APP_GRADIENT_MESH',
      'radial-gradient(at 0% 0%, rgba(0,122,255,0.08) 0%, transparent 50%), radial-gradient(at 100% 100%, rgba(88,86,214,0.08) 0%, transparent 50%)'
    ),
  },
};
