import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import type { Live } from '../data/mock';
import { profileName, signOutRemote } from '../lib/auth';
import { supabase } from '../lib/supabase';

export type PaymentMethod = 'wave' | 'orange-money' | 'carte';

type User = { contact: string; name: string };

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
  signIn: (contact: string, name?: string) => void;
  signOut: () => void;
  subscribe: (method: PaymentMethod) => void;
  cancelSubscription: () => void;
};

const SessionContext = createContext<SessionValue | null>(null);

// Session de l'app : connexion par code e-mail via Supabase quand il est configuré, sinon état local de démo.
export function SessionProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [subscription, setSubscription] = useState<Subscription>(null);
  const [loginVisible, setLoginVisible] = useState(false);
  const [menuVisible, setMenuVisible] = useState(false);
  const [avatar, setAvatar] = useState<string | null>(null);
  const [myLive, setMyLive] = useState<Live | null>(null);

  // Avec Supabase, on reprend la session enregistrée au démarrage de l'app.
  useEffect(() => {
    supabase?.auth.getSession().then(async ({ data }) => {
      const u = data.session?.user;
      const contact = u?.email || u?.phone;
      if (!u || !contact) return;
      const name = await profileName(u.id);
      if (name) setUser({ contact, name });
    });
  }, []);

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
      signIn: (contact, name) => {
        setUser({ contact, name: name || 'Membre Senlive' });
        setLoginVisible(false);
      },
      signOut: () => {
        signOutRemote();
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
