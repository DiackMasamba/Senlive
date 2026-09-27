import * as Linking from 'expo-linking';
import * as WebBrowser from 'expo-web-browser';
import type { PaymentMethod } from '../context/session';
import { supabase } from './supabase';

export type PayResult = 'completed' | 'pending' | 'failed' | 'demo';

const dbMethod: Record<PaymentMethod, string> = { wave: 'wave', 'orange-money': 'orange_money', carte: 'card' };

// Paiement réel d'un pack de pièces via PayDunya (fonction Supabase paydunya-checkout).
// Sans Supabase configuré ni utilisateur connecté pour de vrai, on reste en mode démo.
export async function payCoinPack(packId: string, method: PaymentMethod): Promise<PayResult> {
  if (!supabase) return 'demo';
  const { data: session } = await supabase.auth.getSession();
  if (!session.session) return 'demo';

  const returnUrl = Linking.createURL('portefeuille');
  const { data, error } = await supabase.functions.invoke<{ url: string; token: string }>('paydunya-checkout', {
    body: { pack_id: packId, method: dbMethod[method], return_url: returnUrl },
  });
  if (error || !data?.url) return 'failed';

  await WebBrowser.openAuthSessionAsync(data.url, returnUrl);

  // Au retour, le serveur revérifie la facture chez PayDunya et crédite les pièces si elle est payée.
  const check = await supabase.functions.invoke<{ status: PayResult }>('paydunya-checkout', {
    body: { token: data.token },
  });
  return check.data?.status ?? 'pending';
}
