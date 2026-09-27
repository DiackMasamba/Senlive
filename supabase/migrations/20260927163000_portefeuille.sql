-- Portefeuille : pièces achetées par les fans, diamants gagnés par les créateurs,
-- commissions agences et parrains, retraits vers Wave / Orange Money.
-- 1 pièce = 1 diamant = 10 FCFA. Les soldes ne sont modifiés que par les fonctions ci-dessous.

-- Parrainage et agences -----------------------------------------------------
alter table public.profiles
  add column referral_code text unique,
  add column referred_by uuid references public.profiles (id) on delete set null,
  add column agency_id uuid references public.profiles (id) on delete set null;
create index profiles_referred_by_idx on public.profiles (referred_by);
create index profiles_agency_idx on public.profiles (agency_id);
grant select (referral_code) on public.profiles to anon, authenticated;

create function private.new_referral_code()
returns text
language plpgsql
set search_path = ''
as $$
declare
  v_code text;
begin
  loop
    v_code := upper(substr(md5(gen_random_uuid()::text), 1, 6));
    exit when not exists (select 1 from public.profiles where referral_code = v_code);
  end loop;
  return v_code;
end;
$$;

update public.profiles set referral_code = private.new_referral_code() where referral_code is null;

-- Catalogue ---------------------------------------------------------------
alter table public.gifts add column price_coins integer;
update public.gifts set price_coins = price_fcfa / 10;
alter table public.gifts alter column price_coins set not null;
alter table public.gifts add constraint gifts_price_coins_check check (price_coins > 0);

create table public.coin_packs (
  id text primary key,
  price_fcfa integer not null check (price_fcfa > 0),
  coins integer not null check (coins > 0),
  position smallint not null default 0,
  active boolean not null default true
);
insert into public.coin_packs (id, price_fcfa, coins, position) values
  ('p500', 500, 50, 1),
  ('p1000', 1000, 100, 2),
  ('p5000', 5000, 520, 3),
  ('p10000', 10000, 1050, 4),
  ('p25000', 25000, 2700, 5);

-- Soldes et grand livre -----------------------------------------------------
create table public.wallets (
  user_id uuid primary key references public.profiles (id) on delete cascade,
  coins integer not null default 0 check (coins >= 0),
  diamonds integer not null default 0 check (diamonds >= 0),
  updated_at timestamptz not null default now()
);
insert into public.wallets (user_id) select id from public.profiles on conflict do nothing;

create type public.withdrawal_status as enum ('pending', 'paid', 'rejected');

create table public.withdrawals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  diamonds integer not null check (diamonds >= 500),
  amount_fcfa integer not null check (amount_fcfa > 0),
  method public.payment_method not null check (method in ('wave', 'orange_money')),
  phone text not null check (phone ~ '^\+2217[05678][0-9]{7}$'),
  status public.withdrawal_status not null default 'pending',
  provider_ref text unique,
  created_at timestamptz not null default now(),
  processed_at timestamptz
);
create index withdrawals_user_idx on public.withdrawals (user_id, created_at);
create unique index withdrawals_one_pending on public.withdrawals (user_id) where status = 'pending';

alter table public.payments add column coin_pack_id text references public.coin_packs (id);
create index payments_coin_pack_idx on public.payments (coin_pack_id);

create type public.wallet_entry as enum (
  'coin_purchase', 'gift_sent', 'gift_received', 'agency_commission',
  'referral_commission', 'withdrawal', 'withdrawal_refund', 'bonus'
);

create table public.wallet_transactions (
  id bigint generated always as identity primary key,
  user_id uuid not null references public.profiles (id) on delete cascade,
  kind public.wallet_entry not null,
  coins integer not null default 0,
  diamonds integer not null default 0,
  gift_send_id uuid references public.gift_sends (id) on delete set null,
  payment_id uuid references public.payments (id) on delete set null,
  withdrawal_id uuid references public.withdrawals (id) on delete set null,
  created_at timestamptz not null default now()
);
create index wallet_tx_user_idx on public.wallet_transactions (user_id, created_at desc);
create index wallet_tx_gift_idx on public.wallet_transactions (gift_send_id);
create index wallet_tx_payment_idx on public.wallet_transactions (payment_id);
create index wallet_tx_withdrawal_idx on public.wallet_transactions (withdrawal_id);
-- Un paiement ne crédite des pièces qu'une seule fois.
create unique index wallet_tx_one_purchase on public.wallet_transactions (payment_id) where kind = 'coin_purchase';

alter table public.coin_packs enable row level security;
alter table public.wallets enable row level security;
alter table public.withdrawals enable row level security;
alter table public.wallet_transactions enable row level security;

create policy "Packs visibles par tous" on public.coin_packs for select to anon, authenticated using (active);
create policy "Voir son portefeuille" on public.wallets for select to authenticated using (user_id = (select auth.uid()));
create policy "Voir ses retraits" on public.withdrawals for select to authenticated using (user_id = (select auth.uid()));
create policy "Voir son historique" on public.wallet_transactions for select to authenticated using (user_id = (select auth.uid()));

-- Inscription : profil, code de parrainage, parrain éventuel et portefeuille vide.
create or replace function private.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_phone text := nullif(new.phone, '');
  v_referrer uuid;
begin
  if v_phone is not null and left(v_phone, 1) <> '+' then
    v_phone := '+' || v_phone;
  end if;
  select id into v_referrer from public.profiles
  where referral_code = upper(nullif(new.raw_user_meta_data ->> 'ref', ''));
  insert into public.profiles (id, phone, referral_code, referred_by)
  values (new.id, v_phone, private.new_referral_code(), v_referrer);
  insert into public.wallets (user_id) values (new.id);
  return new;
end;
$$;

-- Envoi d'un cadeau : débite les pièces du fan, crédite le créateur (50 %, 55 % s'il est certifié)
-- et son agence (5 %, pris sur la part Senlive). Renvoie le nouveau solde de pièces.
create function private.send_gift(p_live uuid, p_gift text)
returns integer
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_uid uuid := auth.uid();
  v_host uuid;
  v_status public.live_status;
  v_price integer;
  v_balance integer;
  v_verified boolean;
  v_agency uuid;
  v_share integer;
  v_agency_share integer;
  v_send uuid;
begin
  if v_uid is null then raise exception 'not_authenticated'; end if;

  select l.host_id, l.status into v_host, v_status from public.lives l where l.id = p_live;
  if v_host is null or v_status <> 'live' then raise exception 'live_not_found'; end if;
  if v_host = v_uid then raise exception 'cannot_gift_self'; end if;

  select g.price_coins into v_price from public.gifts g where g.id = p_gift and g.active;
  if v_price is null then raise exception 'gift_not_found'; end if;

  update public.wallets set coins = coins - v_price, updated_at = now()
  where user_id = v_uid and coins >= v_price
  returning coins into v_balance;
  if not found then raise exception 'insufficient_coins'; end if;

  select p.verified, p.agency_id into v_verified, v_agency from public.profiles p where p.id = v_host;
  v_share := floor(v_price * case when v_verified then 0.55 else 0.50 end);
  v_agency_share := case when v_agency is not null then floor(v_price * 0.05) else 0 end;

  insert into public.gift_sends (live_id, sender_id, recipient_id, gift_id, amount_fcfa)
  values (p_live, v_uid, v_host, p_gift, v_price * 10)
  returning id into v_send;

  insert into public.wallets (user_id) values (v_host) on conflict do nothing;
  update public.wallets set diamonds = diamonds + v_share, updated_at = now() where user_id = v_host;

  insert into public.wallet_transactions (user_id, kind, coins, gift_send_id) values (v_uid, 'gift_sent', -v_price, v_send);
  insert into public.wallet_transactions (user_id, kind, diamonds, gift_send_id) values (v_host, 'gift_received', v_share, v_send);

  if v_agency_share > 0 then
    insert into public.wallets (user_id) values (v_agency) on conflict do nothing;
    update public.wallets set diamonds = diamonds + v_agency_share, updated_at = now() where user_id = v_agency;
    insert into public.wallet_transactions (user_id, kind, diamonds, gift_send_id)
    values (v_agency, 'agency_commission', v_agency_share, v_send);
  end if;

  return v_balance;
end;
$$;

-- Demande de retrait : minimum 500 diamants (5 000 FCFA), une demande en attente à la fois.
-- Le virement est fait par le serveur, qui passe la demande à « paid » ou la rembourse.
create function private.request_withdrawal(p_diamonds integer, p_method public.payment_method, p_phone text)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_uid uuid := auth.uid();
  v_id uuid;
begin
  if v_uid is null then raise exception 'not_authenticated'; end if;
  if p_diamonds < 500 then raise exception 'minimum_500_diamonds'; end if;

  update public.wallets set diamonds = diamonds - p_diamonds, updated_at = now()
  where user_id = v_uid and diamonds >= p_diamonds;
  if not found then raise exception 'insufficient_diamonds'; end if;

  insert into public.withdrawals (user_id, diamonds, amount_fcfa, method, phone)
  values (v_uid, p_diamonds, p_diamonds * 10, p_method, p_phone)
  returning id into v_id;

  insert into public.wallet_transactions (user_id, kind, diamonds, withdrawal_id)
  values (v_uid, 'withdrawal', -p_diamonds, v_id);
  return v_id;
end;
$$;

-- Paiement de pack confirmé (appelé par le serveur après le webhook PayDunya / CinetPay) :
-- crédite les pièces une seule fois, et 3 % au parrain pendant les 6 premiers mois du filleul.
create function private.credit_coin_purchase(p_payment uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user uuid;
  v_coins integer;
  v_price integer;
  v_referrer uuid;
  v_joined timestamptz;
  v_commission integer;
begin
  select pay.user_id, pack.coins, pack.price_fcfa into v_user, v_coins, v_price
  from public.payments pay join public.coin_packs pack on pack.id = pay.coin_pack_id
  where pay.id = p_payment and pay.status = 'succeeded';
  if v_user is null then raise exception 'payment_not_eligible'; end if;

  insert into public.wallet_transactions (user_id, kind, coins, payment_id)
  values (v_user, 'coin_purchase', v_coins, p_payment)
  on conflict do nothing;
  if not found then return; end if;

  insert into public.wallets (user_id) values (v_user) on conflict do nothing;
  update public.wallets set coins = coins + v_coins, updated_at = now() where user_id = v_user;

  select p.referred_by, p.created_at into v_referrer, v_joined from public.profiles p where p.id = v_user;
  if v_referrer is not null and v_joined > now() - interval '6 months' then
    v_commission := floor(v_price * 0.03 / 10);
    if v_commission > 0 then
      insert into public.wallets (user_id) values (v_referrer) on conflict do nothing;
      update public.wallets set diamonds = diamonds + v_commission, updated_at = now() where user_id = v_referrer;
      insert into public.wallet_transactions (user_id, kind, diamonds, payment_id)
      values (v_referrer, 'referral_commission', v_commission, p_payment);
    end if;
  end if;
end;
$$;

revoke execute on function private.new_referral_code() from anon, authenticated, public;
revoke execute on function private.send_gift(uuid, text) from anon, public;
revoke execute on function private.request_withdrawal(integer, public.payment_method, text) from anon, public;
revoke execute on function private.credit_coin_purchase(uuid) from anon, authenticated, public;
grant execute on function private.send_gift(uuid, text) to authenticated;
grant execute on function private.request_withdrawal(integer, public.payment_method, text) to authenticated;

-- Points d'entrée appelables par l'app (supabase.rpc), qui s'exécutent avec les droits de l'utilisateur.
create function public.send_gift(p_live uuid, p_gift text)
returns integer
language sql
security invoker
set search_path = ''
as $$ select private.send_gift(p_live, p_gift) $$;

create function public.request_withdrawal(p_diamonds integer, p_method public.payment_method, p_phone text)
returns uuid
language sql
security invoker
set search_path = ''
as $$ select private.request_withdrawal(p_diamonds, p_method, p_phone) $$;

revoke execute on function public.send_gift(uuid, text) from anon, public;
revoke execute on function public.request_withdrawal(integer, public.payment_method, text) from anon, public;
grant execute on function public.send_gift(uuid, text) to authenticated;
grant execute on function public.request_withdrawal(integer, public.payment_method, text) to authenticated;
