import { admin, json, paytechKeys, sha256 } from '../_shared/paytech.ts';

// Notification de paiement (ipn_url) envoyée par PayTech. Pas de JWT : l'appel est authentifié
// en comparant les empreintes SHA-256 de nos clés, puis le montant est contrôlé en base.
Deno.serve(async (req) => {
  if (req.method !== 'POST') return json({ error: 'method_not_allowed' }, 405);
  const type = req.headers.get('content-type') ?? '';
  let data: Record<string, string> = {};
  if (type.includes('application/json')) {
    data = await req.json().catch(() => ({}));
  } else {
    const form = await req.formData().catch(() => null);
    form?.forEach((v, k) => (data[k] = String(v)));
  }

  try {
    const { key, secret } = paytechKeys();
    if (data.api_key_sha256 !== (await sha256(key)) || data.api_secret_sha256 !== (await sha256(secret))) {
      return json({ error: 'forbidden' }, 403);
    }
    const ref = String(data.ref_command ?? '');
    if (!ref) return json({ error: 'missing_ref' }, 400);
    const db = admin();

    if (data.type_event === 'sale_complete') {
      const { error } = await db.rpc('complete_coin_payment', { p_provider_ref: ref, p_amount: Number(data.item_price) });
      if (error) throw new Error(error.message);
      return json({ status: 'completed' });
    }
    if (data.type_event === 'sale_canceled') {
      await db.from('payments').update({ status: 'failed' }).eq('provider_ref', ref).eq('status', 'pending');
      return json({ status: 'failed' });
    }
    return json({ status: 'ignored' });
  } catch (e) {
    console.error('ipn', e);
    return json({ error: 'server_error' }, 500);
  }
});
