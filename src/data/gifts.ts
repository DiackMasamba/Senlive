// Cadeaux virtuels envoyés pendant un live, payés en pièces (1 pièce = 10 FCFA).
export type Gift = { id: string; label: string; emoji: string; coins: number };

export const gifts: Gift[] = [
  { id: 'rose', label: 'Rose', emoji: '🌹', coins: 10 },
  { id: 'attaya', label: 'Attaya', emoji: '🍵', coins: 25 },
  { id: 'thieb', label: 'Thiéb', emoji: '🍲', coins: 50 },
  { id: 'djembe', label: 'Djembé', emoji: '🥁', coins: 100 },
  { id: 'lion', label: 'Lion', emoji: '🦁', coins: 250 },
  { id: 'couronne', label: 'Couronne', emoji: '👑', coins: 500 },
];
