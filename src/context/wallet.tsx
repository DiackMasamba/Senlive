import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { COIN_FCFA, CREATOR_SHARE, MIN_WITHDRAW_DIAMONDS, type CoinPack } from '../data/coins';
import { gifts, type Gift } from '../data/gifts';
import { type PaymentMethod, useSession } from './session';

export type WalletEntry = { id: string; label: string; coins?: number; diamonds?: number; at: Date };

type WalletValue = {
  coins: number;
  diamonds: number;
  history: WalletEntry[];
  referralCode: string | null;
  buyPack: (pack: CoinPack, method: PaymentMethod) => void;
  sendGift: (gift: Gift, host: string) => boolean;
  withdraw: (method: 'wave' | 'orange-money') => boolean;
};

const WalletContext = createContext<WalletValue | null>(null);
const methodLabel: Record<PaymentMethod, string> = { wave: 'Wave', 'orange-money': 'Orange Money', carte: 'carte' };

// Portefeuille de démonstration. En production, les soldes viennent des tables wallets et
// wallet_transactions, et chaque opération passe par les fonctions Supabase (send_gift, request_withdrawal).
export function WalletProvider({ children }: { children: ReactNode }) {
  const { user, myLive } = useSession();
  const [coins, setCoins] = useState(0);
  const [diamonds, setDiamonds] = useState(0);
  const [history, setHistory] = useState<WalletEntry[]>([]);

  const add = (entry: Omit<WalletEntry, 'id' | 'at'>) =>
    setHistory((h) => [{ ...entry, id: `${Date.now()}-${Math.random()}`, at: new Date() }, ...h].slice(0, 50));

  // Déconnexion : le portefeuille de démo repart de zéro.
  useEffect(() => {
    if (user) return;
    setCoins(0);
    setDiamonds(0);
    setHistory([]);
  }, [user]);

  // Pendant ton live, des spectateurs de démo t'envoient des cadeaux : tu gagnes 50 % en diamants.
  useEffect(() => {
    if (!myLive) return;
    const fans = ['Modou', 'Aïssatou', 'Cheikh', 'Binta', 'Pape'];
    const timer = setInterval(() => {
      const gift = gifts[Math.floor(Math.random() * 5)];
      const earned = Math.floor(gift.coins * CREATOR_SHARE);
      const fan = fans[Math.floor(Math.random() * fans.length)];
      setDiamonds((d) => d + earned);
      add({ label: `${gift.emoji} ${gift.label} de ${fan}`, diamonds: earned });
    }, 5000);
    return () => clearInterval(timer);
  }, [myLive]);

  // Code de démo stable par compte ; le vrai code vient de profiles.referral_code.
  const referralCode = user
    ? `SEN${String([...user.contact].reduce((h, c) => (h * 31 + c.charCodeAt(0)) % 10000, 7)).padStart(4, '0')}`
    : null;

  const value = useMemo<WalletValue>(
    () => ({
      coins,
      diamonds,
      history,
      referralCode,
      buyPack: (pack, method) => {
        setCoins((c) => c + pack.coins);
        add({ label: `Recharge ${pack.price.toLocaleString('fr-FR')} FCFA · ${methodLabel[method]}`, coins: pack.coins });
      },
      sendGift: (gift, host) => {
        if (coins < gift.coins) return false;
        setCoins((c) => c - gift.coins);
        add({ label: `${gift.emoji} ${gift.label} pour ${host}`, coins: -gift.coins });
        return true;
      },
      withdraw: (method) => {
        if (diamonds < MIN_WITHDRAW_DIAMONDS) return false;
        add({ label: `Retrait ${(diamonds * COIN_FCFA).toLocaleString('fr-FR')} FCFA vers ${methodLabel[method]}`, diamonds: -diamonds });
        setDiamonds(0);
        return true;
      },
    }),
    [coins, diamonds, history, referralCode],
  );

  return <WalletContext.Provider value={value}>{children}</WalletContext.Provider>;
}

export function useWallet() {
  const ctx = useContext(WalletContext);
  if (!ctx) throw new Error('useWallet must be used inside WalletProvider');
  return ctx;
}
