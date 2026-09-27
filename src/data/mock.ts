// Données de démonstration, remplacées par l'API Senlive au lot 1.

export type Category = { id: string; label: string; icon: string };

export type Live = {
  id: string;
  title: string;
  host: string;
  handle: string;
  category: string;
  viewers: number;
  premium: boolean;
  color: string;
};

export const SUBSCRIPTION_PRICE = 2000;

export const categories: Category[] = [
  { id: 'musique', label: 'Musique', icon: 'musical-notes-outline' },
  { id: 'humour', label: 'Humour', icon: 'happy-outline' },
  { id: 'cuisine', label: 'Cuisine', icon: 'restaurant-outline' },
  { id: 'sport', label: 'Sport', icon: 'football-outline' },
  { id: 'religion', label: 'Religion', icon: 'book-outline' },
  { id: 'business', label: 'Business', icon: 'briefcase-outline' },
  { id: 'lifestyle', label: 'Lifestyle', icon: 'sparkles-outline' },
  { id: 'jeux', label: 'Jeux', icon: 'game-controller-outline' },
];

export const lives: Live[] = [
  { id: '1', title: 'Sabar night en direct de Dakar', host: 'Awa Ndiaye', handle: '@awa.sabar', category: 'musique', viewers: 1240, premium: false, color: '#2B2B2B' },
  { id: '2', title: 'Thiéboudienne de A à Z', host: 'Chef Mamadou', handle: '@chefmamadou', category: 'cuisine', viewers: 860, premium: true, color: '#4A4A4A' },
  { id: '3', title: 'Débrief Lions du Sénégal', host: 'Ibou Sport', handle: '@ibousport', category: 'sport', viewers: 2310, premium: false, color: '#1A1A1A' },
  { id: '4', title: 'Sketchs et questions du public', host: 'Fatou Rire', handle: '@fatourire', category: 'humour', viewers: 540, premium: true, color: '#5C5C5C' },
  { id: '5', title: 'Lancer son business à 0 FCFA', host: 'Moussa Pro', handle: '@moussapro', category: 'business', viewers: 390, premium: true, color: '#333333' },
  { id: '6', title: 'Routine beauté du soir', host: 'Khady Glow', handle: '@khadyglow', category: 'lifestyle', viewers: 715, premium: false, color: '#3D3D3D' },
];

export const chatSeed = [
  { id: 'c1', user: 'Modou', text: 'Salut tout le monde 👋' },
  { id: 'c2', user: 'Aïssatou', text: 'Magnifique ce soir !' },
  { id: 'c3', user: 'Cheikh', text: 'Depuis Thiès 🔥' },
  { id: 'c4', user: 'Binta', text: 'Tu peux refaire la dernière ?' },
];

export function formatViewers(n: number) {
  return n >= 1000 ? `${(n / 1000).toFixed(1).replace('.', ',')} k` : String(n);
}
