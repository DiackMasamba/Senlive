import { createClient } from 'npm:@supabase/supabase-js@2';
import { PAYTECH_API, PAYTECH_ENV, admin, cors, json, paytechKeys } from '../_shared/paytech.ts';

const targets: Record<string, string> = { wave: 'Wave', orange_money: 'Orange Money', card: 'Carte Bancaire' };

// POST { pack_id, method, return_url? } → crée une demande de paiement PayTech et renvoie son lien.
// POST { ref } → renvoie l'état d'un paiement de l'utilisateur (au retour de la page PayTech).
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
    if (typeof body.ref === 'string') {
      const { data: pay } = await db
        .from('payments')
        .select('status')
        .eq('provider_ref', body.ref)
        .eq('user_id', user.id)
        .maybeSingle();
      if (!pay) return json({ error: 'not_found' }, 404);
      const status = pay.status === 'succeeded' ? 'completed' : pay.status === 'failed' ? 'failed' : 'pending';
      return json({ status });
    }

    const method = String(body.method ?? '');
    if (!targets[method]) return json({ error: 'bad_method' }, 400);
    const { data: pack } = await db
      .from('coin_packs')
      .select('id, coins, price_fcfa')
      .eq('id', String(body.pack_id ?? ''))
      .eq('active', true)
      .maybeSingle();
    if (!pack) return json({ error: 'bad_pack' }, 400);

    const ref = `SEN-${crypto.randomUUID()}`;
    const { error } = await db.from('payments').insert({
      user_id: user.id,
      amount_fcfa: pack.price_fcfa,
      method,
      provider_ref: ref,
      coin_pack_id: pack.id,
    });
    if (error) throw new Error(error.message);

    const { key, secret } = paytechKeys();
    const returnUrl =
      typeof body.return_url === 'string' && /^(https:\/\/|senlive:\/\/)/.test(body.return_url) ? body.return_url : undefined;
    const res = await fetch(PAYTECH_API, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', API_KEY: key, API_SECRET: secret },
      body: JSON.stringify({
        item_name: `${pack.coins} pièces Senlive`,
        item_price: pack.price_fcfa,
        currency: 'XOF',
        ref_command: ref,
        command_name: `Recharge Senlive ${pack.coins} pièces`,
        env: PAYTECH_ENV,
        target_payment: targets[method],
        ipn_url: `${Deno.env.get('SUPABASE_URL')}/functions/v1/paytech-ipn`,
        ...(returnUrl ? { success_url: returnUrl, cancel_url: returnUrl } : {}),
        custom_field: JSON.stringify({ user_id: user.id, pack_id: pack.id }),
      }),
    });
    const created = await res.json().catch(() => ({}));
    const url = created?.redirect_url ?? created?.redirectUrl;
    if (created?.success !== 1 || !url) {
      console.error('paytech request failed', created?.success, created?.message ?? created?.errors);
      await db.from('payments').update({ status: 'failed' }).eq('provider_ref', ref);
      return json({ error: 'paytech_error' }, 502);
    }
    return json({ url, ref });
  } catch (e) {
    console.error(e);
    return json({ error: e instanceof Error ? e.message : 'server_error' }, 500);
  }
});
