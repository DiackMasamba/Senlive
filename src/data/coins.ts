// Portefeuille : 1 pièce = 1 diamant = 10 FCFA (mêmes valeurs que la table coin_packs).
export const COIN_FCFA = 10;
export const CREATOR_SHARE = 0.5;
export const MIN_WITHDRAW_DIAMONDS = 500;
export const REFERRAL_RATE = 0.03;

export type CoinPack = { id: string; price: number; coins: number };

export const coinPacks: CoinPack[] = [
  { id: 'p500', price: 500, coins: 50 },
  { id: 'p1000', price: 1000, coins: 100 },
  { id: 'p5000', price: 5000, coins: 520 },
  { id: 'p10000', price: 10000, coins: 1050 },
  { id: 'p25000', price: 25000, coins: 2700 },
];

// Pièces offertes en plus du prix de base (10 FCFA la pièce).
export const packBonus = (p: CoinPack) => Math.round((p.coins / (p.price / COIN_FCFA) - 1) * 100);
