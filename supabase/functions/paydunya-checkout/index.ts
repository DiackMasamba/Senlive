import { createClient } from 'npm:@supabase/supabase-js@2';
import { PAYDUNYA_API, admin, cors, json, paydunyaHeaders, settleInvoice } from '../_shared/paydunya.ts';

const channels: Record<string, string[]> = {
  wave: ['wave-senegal'],
  orange_money: ['orange-money-senegal'],
  card: ['card'],
};

// POST { pack_id, method, return_url? } → crée une facture PayDunya et renvoie son lien de paiement.
// POST { token } → vérifie une facture de l'utilisateur (au retour de la page de paiement).
Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors });
  if (req.method !== 'POST') return json({ error: 'method_not_allowed' }, 405);

  const userClient = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_ANON_KEY')!, {
    global: { headers: { Authorization: req.headers.get('Authorization') ?? '' } },
  });
  const { data: auth } = await userClient.auth.getUser();
  const user = auth?.user;
  if (!user) return json({ error: 'unauthorized' }, 401);

  const body = await req.json().catch(() => ({}));
  const db = admin();

  try {
    if (typeof body.token === 'string') {
      const { data: pay } = await db
        .from('payments')
        .select('id')
        .eq('provider_ref', body.token)
        .eq('user_id', user.id)
        .maybeSingle();
      if (!pay) return json({ error: 'not_found' }, 404);
      return json({ status: await settleInvoice(body.token) });
    }

    const method = String(body.method ?? '');
    if (!channels[method]) return json({ error: 'bad_method' }, 400);
    const { data: pack } = await db
      .from('coin_packs')
      .select('id, coins, price_fcfa')
      .eq('id', String(body.pack_id ?? ''))
      .eq('active', true)
      .maybeSingle();
    if (!pack) return json({ error: 'bad_pack' }, 400);

    const returnUrl =
      typeof body.return_url === 'string' && /^(https:\/\/|senlive:\/\/)/.test(body.return_url) ? body.return_url : undefined;
    const res = await fetch(`${PAYDUNYA_API}/checkout-invoice/create`, {
      method: 'POST',
      headers: paydunyaHeaders(),
      body: JSON.stringify({
        invoice: {
          total_amount: pack.price_fcfa,
          description: `${pack.coins} pièces Senlive`,
          channels: channels[method],
        },
        store: { name: 'Senlive' },
        actions: {
          callback_url: `${Deno.env.get('SUPABASE_URL')}/functions/v1/paydunya-ipn`,
          ...(returnUrl ? { return_url: returnUrl, cancel_url: returnUrl } : {}),
        },
        custom_data: { user_id: user.id, pack_id: pack.id },
      }),
    });
    const created = await res.json();
    if (created?.response_code !== '00' || !created?.token) {
      console.error('paydunya create failed', created?.response_code, created?.response_text);
      return json({ error: 'paydunya_error' }, 502);
    }

    const { error } = await db.from('payments').insert({
      user_id: user.id,
      amount_fcfa: pack.price_fcfa,
      method,
      provider_ref: created.token,
      coin_pack_id: pack.id,
    });
    if (error) throw new Error(error.message);

    return json({ url: created.response_text, token: created.token });
  } catch (e) {
    console.error(e);
    return json({ error: e instanceof Error ? e.message : 'server_error' }, 500);
  }
});
