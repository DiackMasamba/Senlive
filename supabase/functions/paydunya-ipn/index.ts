import { json, settleInvoice } from '../_shared/paydunya.ts';

// Notification de paiement envoyée par PayDunya (callback_url). Pas de JWT : on revérifie
// chaque facture auprès de l'API PayDunya avant de créditer quoi que ce soit.
Deno.serve(async (req) => {
  if (req.method !== 'POST') return json({ error: 'method_not_allowed' }, 405);
  let token = '';
  const type = req.headers.get('content-type') ?? '';
  if (type.includes('application/json')) {
    const body = await req.json().catch(() => ({}));
    token = String(body?.data?.invoice?.token ?? body?.invoice?.token ?? body?.token ?? '');
  } else {
    const form = await req.formData().catch(() => null);
    token = String(form?.get('data[invoice][token]') ?? form?.get('token') ?? '');
  }
  if (!token) return json({ error: 'missing_token' }, 400);
  try {
    return json({ status: await settleInvoice(token) });
  } catch (e) {
    console.error('ipn', e);
    return json({ error: 'server_error' }, 500);
  }
});
