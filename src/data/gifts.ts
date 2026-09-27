// Cadeaux virtuels envoyés pendant un live. Les prix sont en FCFA ;
// le paiement réel (Wave, Orange Money) passera par l'agrégateur au lot 3.
export type Gift = { id: string; label: string; emoji: string; price: number };

export const gifts: Gift[] = [
  { id: 'rose', label: 'Rose', emoji: '🌹', price: 100 },
  { id: 'attaya', label: 'Attaya', emoji: '🍵', price: 250 },
  { id: 'thieb', label: 'Thiéb', emoji: '🍲', price: 500 },
  { id: 'djembe', label: 'Djembé', emoji: '🥁', price: 1000 },
  { id: 'lion', label: 'Lion', emoji: '🦁', price: 2500 },
  { id: 'couronne', label: 'Couronne', emoji: '👑', price: 5000 },
];
