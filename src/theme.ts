export const colors = {
  yellow: '#FFC928',
  yellowLight: '#FFE38A',
  yellowPale: '#FFF6D6',
  navy: '#0B2D6F',
  navySoft: '#5A7FC2',
  live: '#FF3B5C',
  white: '#FFFFFF',
  background: '#FFFFFF',
  surface: '#F4F6FA',
  border: '#DCE3EE',
  text: '#0B2D6F',
  textMuted: '#6B7A99',
  success: '#1DB954',
};

export const radius = {
  sm: 12,
  md: 18,
  lg: 28,
  pill: 999,
};

export const shadow = {
  shadowColor: '#0B2D6F',
  shadowOpacity: 0.12,
  shadowRadius: 16,
  shadowOffset: { width: 0, height: 6 },
  elevation: 6,
};

export function formatFcfa(amount: number) {
  return `${amount.toLocaleString('fr-FR').replace(/ | /g, ' ')} FCFA`;
}
