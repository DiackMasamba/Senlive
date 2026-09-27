import { createClient } from 'npm:@supabase/supabase-js@2';

// Mode test par défaut : mettre PAYTECH_ENV=prod dans les secrets pour encaisser pour de vrai.
export const PAYTECH_ENV = Deno.env.get('PAYTECH_ENV') === 'prod' ? 'prod' : 'test';
export const PAYTECH_API = 'https://paytech.sn/api/payment/request-payment';

export function paytechKeys() {
  const key = Deno.env.get('PAYTECH_API_KEY');
  const secret = Deno.env.get('PAYTECH_API_SECRET');
  if (!key || !secret) throw new Error('paytech_keys_missing');
  return { key, secret };
}

export async function sha256(text: string) {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text));
  return Array.from(new Uint8Array(digest), (b) => b.toString(16).padStart(2, '0')).join('');
}

export const admin = () =>
  createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!, {
    auth: { persistSession: false },
  });

export const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

export const json = (data: unknown, status = 200) =>
  new Response(JSON.stringify(data), { status, headers: { ...cors, 'Content-Type': 'application/json' } });
