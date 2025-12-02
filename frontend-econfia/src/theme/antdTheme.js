export const antdTheme = {
  token: {
    // Colores principales
    colorPrimary: '#007AFF',
    colorSuccess: '#34C759',
    colorWarning: '#FF9500',
    colorError: '#FF3B30',
    colorInfo: '#5856D6',
    
    // Fondos
    colorBgContainer: '#FFFFFF',
    colorBgElevated: '#F9FAFB',
    colorBgLayout: '#FFFFFF',
    
    // Texto
    colorText: '#1D1D1F',
    colorTextSecondary: '#6E6E73',
    colorTextTertiary: '#86868B',
    colorTextQuaternary: '#C7C7CC',
    
    // Bordes
    colorBorder: 'rgba(0, 0, 0, 0.08)',
    colorBorderSecondary: 'rgba(0, 0, 0, 0.04)',
    
    // Geometría
    borderRadius: 12,
    borderRadiusLG: 16,
    borderRadiusSM: 8,
    borderRadiusXS: 4,
    
    // Tipografía
    fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Segoe UI', system-ui, sans-serif",
    fontSize: 16,
    fontSizeHeading1: 48,
    fontSizeHeading2: 36,
    fontSizeHeading3: 28,
    fontWeightStrong: 600,
    
    // Sombras
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08), 0 1px 4px rgba(0, 0, 0, 0.04)',
    boxShadowSecondary: '0 4px 16px rgba(0, 0, 0, 0.1), 0 2px 8px rgba(0, 0, 0, 0.06)',
    
    // Animaciones (Apple-style timing)
    motionDurationFast: '0.2s',
    motionDurationMid: '0.35s',
    motionDurationSlow: '0.5s',
    motionEaseInOut: 'cubic-bezier(0.4, 0.0, 0.2, 1)',
    motionEaseOut: 'cubic-bezier(0.0, 0.0, 0.2, 1)',
    motionEaseIn: 'cubic-bezier(0.4, 0.0, 1, 1)',
    
    // Espaciado
    padding: 16,
    paddingLG: 24,
    paddingSM: 12,
    paddingXS: 8,
    
    // Control Heights
    controlHeight: 40,
    controlHeightLG: 48,
    controlHeightSM: 32,
  },
  
  components: {
    Button: {
      primaryShadow: '0 2px 8px rgba(0, 122, 255, 0.2)',
      controlHeight: 40,
      fontWeight: 500,
      algorithm: true,
    },
    
    Card: {
      boxShadowTertiary: '0 4px 16px rgba(0, 0, 0, 0.08)',
      paddingLG: 24,
    },
    
    Table: {
      headerBg: '#F9FAFB',
      headerColor: '#6E6E73',
      rowHoverBg: 'rgba(0, 122, 255, 0.04)',
    },
    
    Input: {
      activeBorderColor: '#007AFF',
      activeShadow: '0 0 0 4px rgba(0, 122, 255, 0.2)',
      hoverBorderColor: '#007AFF',
    },
    
    Menu: {
      itemBg: 'transparent',
      itemHoverBg: 'rgba(0, 122, 255, 0.06)',
      itemSelectedBg: 'rgba(0, 122, 255, 0.1)',
      itemSelectedColor: '#007AFF',
    },
    
    Layout: {
      headerBg: 'rgba(255, 255, 255, 0.8)',
      bodyBg: '#FFFFFF',
      siderBg: '#F9FAFB',
    },
  },
  
  algorithm: [], // Puedes usar theme.defaultAlgorithm
};
