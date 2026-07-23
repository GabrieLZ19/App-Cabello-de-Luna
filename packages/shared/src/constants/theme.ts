export const DESIGN_TOKENS = {
  colors: {
    bgDark: '#0C0A07',
    bgDark2: '#15100A',
    glass: '#211A12',
    glassBorder: 'rgba(255, 255, 255, 0.08)',
    accent: '#B08756',
    gold: '#C9A45C',
    goldLight: '#E9D6AE',
    textMain: '#FFFFFF',
    textSec: '#B0A894',
    textMuted: '#897F6B',
    green: '#22c55e',
    red: '#f87171',
    iaPurpleRing: '#6B46C1',
    userGoldRing: '#C9A45C',
  },
  typography: {
    fontFamily: 'Inter',
  },
  pricing: {
    enrollmentMXN: 12000,
    enrollmentUSD: 600,
    tuitionMXN: 22000,
    tuitionUSD: 1200,
  },
  brand: {
    name: 'ILTCT',
    subtitle: 'by Método Cabello de Luna',
  }
} as const;

export type SupportedLanguage = 'es' | 'en' | 'pt';
