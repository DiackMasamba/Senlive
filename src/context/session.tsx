import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';
import type { Live } from '../data/mock';

export type PaymentMethod = 'wave' | 'orange-money' | 'carte';

type User = { phone: string; name: string };

type Subscription = { method: PaymentMethod; renewsOn: Date } | null;

type SessionValue = {
  user: User | null;
  subscription: Subscription;
  loginVisible: boolean;
  menuVisible: boolean;
  avatar: string | null;
  setAvatar: (uri: string | null) => void;
  myLive: Live | null;
  startLive: (live: Live) => void;
  endLive: () => void;
  openLogin: () => void;
  closeLogin: () => void;
  openMenu: () => void;
  closeMenu: () => void;
  signIn: (phone: string, name?: string) => void;
  signOut: () => void;
  subscribe: (method: PaymentMethod) => void;
  cancelSubscription: () => void;
};

const SessionContext = createContext<SessionValue | null>(null);

// État local de démonstration : l'OTP et le paiement seront branchés sur l'API au lot 1 et au lot 3.
export function SessionProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [subscription, setSubscription] = useState<Subscription>(null);
  const [loginVisible, setLoginVisible] = useState(false);
  const [menuVisible, setMenuVisible] = useState(false);
  const [avatar, setAvatar] = useState<string | null>(null);
  const [myLive, setMyLive] = useState<Live | null>(null);

  const value = useMemo<SessionValue>(
    () => ({
      user,
      subscription,
      loginVisible,
      menuVisible,
      avatar,
      setAvatar,
      myLive,
      startLive: setMyLive,
      endLive: () => setMyLive(null),
      openLogin: () => {
        setMenuVisible(false);
        setLoginVisible(true);
      },
      closeLogin: () => setLoginVisible(false),
      openMenu: () => setMenuVisible(true),
      closeMenu: () => setMenuVisible(false),
      signIn: (phone, name) => {
        setUser({ phone, name: name || 'Membre Senlive' });
        setLoginVisible(false);
      },
      signOut: () => {
        setUser(null);
        setSubscription(null);
        setAvatar(null);
        setMyLive(null);
        setMenuVisible(false);
      },
      subscribe: (method) => {
        const renewsOn = new Date();
        renewsOn.setDate(renewsOn.getDate() + 30);
        setSubscription({ method, renewsOn });
      },
      cancelSubscription: () => setSubscription(null),
    }),
    [user, subscription, loginVisible, menuVisible, avatar, myLive],
  );

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useSession() {
  const ctx = useContext(SessionContext);
  if (!ctx) throw new Error('useSession must be used inside SessionProvider');
  return ctx;
}
