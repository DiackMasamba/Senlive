import * as Linking from 'expo-linking';
import * as WebBrowser from 'expo-web-browser';
import type { PaymentMethod } from '../context/session';
import { supabase } from './supabase';

export type PayResult = 'completed' | 'pending' | 'failed' | 'demo';

const dbMethod: Record<PaymentMethod, string> = { wave: 'wave', 'orange-money': 'orange_money', carte: 'card' };
const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

// Paiement réel d'un pack de pièces via PayTech (fonction Supabase paytech-checkout).
// Sans Supabase configuré ni utilisateur connecté pour de vrai, on reste en mode démo.
export async function payCoinPack(packId: string, method: PaymentMethod): Promise<PayResult> {
  if (!supabase) return 'demo';
  const { data: session } = await supabase.auth.getSession();
  if (!session.session) return 'demo';

  const returnUrl = Linking.createURL('portefeuille');
  const { data, error } = await supabase.functions.invoke<{ url: string; ref: string }>('paytech-checkout', {
    body: { pack_id: packId, method: dbMethod[method], return_url: returnUrl },
  });
  if (error || !data?.url) return 'failed';

  await WebBrowser.openAuthSessionAsync(data.url, returnUrl);

  // La notification PayTech crédite les pièces côté serveur ; on attend sa confirmation quelques secondes.
  for (let i = 0; i < 5; i++) {
    const check = await supabase.functions.invoke<{ status: PayResult }>('paytech-checkout', { body: { ref: data.ref } });
    const status = check.data?.status ?? 'pending';
    if (status !== 'pending') return status;
    await wait(2000);
  }
  return 'pending';
}
