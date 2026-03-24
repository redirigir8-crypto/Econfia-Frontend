// informe_usuario_pdf_style.js
// Paleta "Midnight Blue" — Premium Enterprise

export const PDF_STYLE = {
  colors: {
    background:    [4, 11, 28],           // midnight navy profundo
    header:        [15, 45, 120],         // blue-900 rico
    headerEnd:     [30, 64, 175],         // blue-700 para gradiente
    accent:        [59, 130, 246],         // blue-500 — profundo y elegante
    accentDark:    [29, 78, 216],         // blue-700 para botones/badges
    textPrimary:   [226, 232, 240],       // slate-200
    textMuted:     [148, 163, 184],       // slate-400
    textOnAccent:  [239, 246, 255],       // blue-50
    success:       [34, 197, 94],         // green-500
    warning:       [234, 179, 8],         // amber-500
    danger:        [239, 68, 68],         // red-500
    purple:        [167, 139, 250],       // violet-400
    card:          [10, 22, 52],          // card background
    cardBorder:    [30, 58, 138],         // blue-900 border
    divider:       [30, 50, 100],         // separador sutil
    footerBg:      [8, 18, 40],           // footer oscuro
    footerText:    [148, 163, 184],       // slate-400
    footerBorder:  [37, 99, 235],         // blue-600
  },

  layout: {
    marginX: 14,
    pageWidth: 210,
    pageHeight: 297,
    cardRadius: 6,
  },

  fonts: {
    title: 22,
    section: 13,
    metric: 18,
    text: 10,
    small: 8,
  }
};
