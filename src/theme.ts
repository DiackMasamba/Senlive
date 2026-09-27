export const colors = {
  yellow: '#FFFFFF',
  yellowLight: '#E6E6E6',
  yellowPale: '#F2F2F2',
  navy: '#000000',
  navySoft: '#6E6E6E',
  live: '#FF3B5C',
  white: '#FFFFFF',
  background: '#FFFFFF',
  surface: '#F5F5F5',
  border: '#DADADA',
  text: '#000000',
  textMuted: '#707070',
  success: '#1DB954',
};

export const radius = {
  sm: 12,
  md: 18,
  lg: 28,
  pill: 999,
};

export const shadow = {
  shadowColor: '#000000',
  shadowOpacity: 0.12,
  shadowRadius: 16,
  shadowOffset: { width: 0, height: 6 },
  elevation: 6,
};

export function formatFcfa(amount: number) {
  return `${amount.toLocaleString('fr-FR').replace(/ | /g, ' ')} FCFA`;
}
