import { createClient } from 'npm:@supabase/supabase-js@2';

// Mode test par défaut : passer PAYDUNYA_MODE=live dans les secrets pour encaisser pour de vrai.
const live = Deno.env.get('PAYDUNYA_MODE') === 'live';
export const PAYDUNYA_API = live ? 'https://app.paydunya.com/api/v1' : 'https://app.paydunya.com/sandbox-api/v1';

export function paydunyaHeaders() {
  const master = Deno.env.get('PAYDUNYA_MASTER_KEY');
  const priv = Deno.env.get('PAYDUNYA_PRIVATE_KEY');
  const token = Deno.env.get('PAYDUNYA_TOKEN');
  if (!master || !priv || !token) throw new Error('paydunya_keys_missing');
  return {
    'Content-Type': 'application/json',
    'PAYDUNYA-MASTER-KEY': master,
    'PAYDUNYA-PRIVATE-KEY': priv,
    'PAYDUNYA-TOKEN': token,
  };
}

export const admin = () =>
  createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!, {
    auth: { persistSession: false },
  });

// Demande à PayDunya l'état réel d'une facture, puis crédite les pièces si elle est payée.
// On ne fait jamais confiance au contenu de la notification elle-même.
export async function settleInvoice(token: string): Promise<'completed' | 'pending' | 'failed'> {
  const res = await fetch(`${PAYDUNYA_API}/checkout-invoice/confirm/${encodeURIComponent(token)}`, {
    headers: paydunyaHeaders(),
  });
  const body = await res.json();
  const status = String(body?.status ?? '');
  const db = admin();
  if (status === 'completed') {
    const amount = Number(body?.invoice?.total_amount);
    const { error } = await db.rpc('complete_coin_payment', { p_provider_ref: token, p_amount: amount });
    if (error) throw new Error(error.message);
    return 'completed';
  }
  if (status === 'cancelled' || status === 'failed') {
    await db.from('payments').update({ status: 'failed' }).eq('provider_ref', token).eq('status', 'pending');
    return 'failed';
  }
  return 'pending';
}

export const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

export const json = (data: unknown, status = 200) =>
  new Response(JSON.stringify(data), { status, headers: { ...cors, 'Content-Type': 'application/json' } });
