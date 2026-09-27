-- Photos (profil et couverture des lives) et cadeaux virtuels.
-- Le bucket « avatars » existe déjà (public, 2 Mo, dossier = id de l'utilisateur).

alter table public.lives add column if not exists thumbnail_url text;

-- Couvertures des lives : lecture publique, chaque créateur écrit dans son propre dossier.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('live-thumbnails', 'live-thumbnails', true, 5242880, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do nothing;

create policy "live_thumbnails_write_own" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'live-thumbnails' and (storage.foldername(name))[1] = (select auth.uid())::text);
create policy "live_thumbnails_update_own" on storage.objects
  for update to authenticated
  using (bucket_id = 'live-thumbnails' and (storage.foldername(name))[1] = (select auth.uid())::text);
create policy "live_thumbnails_delete_own" on storage.objects
  for delete to authenticated
  using (bucket_id = 'live-thumbnails' and (storage.foldername(name))[1] = (select auth.uid())::text);

-- Catalogue des cadeaux ----------------------------------------------------
create table public.gifts (
  id text primary key,
  label text not null,
  emoji text not null,
  price_fcfa integer not null check (price_fcfa > 0),
  position smallint not null default 0,
  active boolean not null default true
);

insert into public.gifts (id, label, emoji, price_fcfa, position) values
  ('rose', 'Rose', '🌹', 100, 1),
  ('attaya', 'Attaya', '🍵', 250, 2),
  ('thieb', 'Thiéb', '🍲', 500, 3),
  ('djembe', 'Djembé', '🥁', 1000, 4),
  ('lion', 'Lion', '🦁', 2500, 5),
  ('couronne', 'Couronne', '👑', 5000, 6);

-- Cadeaux envoyés : écrits uniquement par le serveur après paiement confirmé.
create table public.gift_sends (
  id uuid primary key default gen_random_uuid(),
  live_id uuid not null references public.lives (id) on delete cascade,
  sender_id uuid not null references public.profiles (id) on delete cascade,
  recipient_id uuid not null references public.profiles (id) on delete cascade,
  gift_id text not null references public.gifts (id),
  amount_fcfa integer not null check (amount_fcfa > 0),
  payment_id uuid references public.payments (id) on delete set null,
  created_at timestamptz not null default now()
);
create index gift_sends_live_idx on public.gift_sends (live_id, created_at);
create index gift_sends_sender_idx on public.gift_sends (sender_id);
create index gift_sends_recipient_idx on public.gift_sends (recipient_id);
create index gift_sends_gift_idx on public.gift_sends (gift_id);
create index gift_sends_payment_idx on public.gift_sends (payment_id);

alter table public.gifts enable row level security;
alter table public.gift_sends enable row level security;

create policy "Cadeaux visibles par tous" on public.gifts
  for select to anon, authenticated using (active);

-- Les cadeaux d'un live en cours sont visibles (animation dans le chat) ; l'envoyeur et le créateur voient les leurs.
create policy "Cadeaux envoyés visibles" on public.gift_sends
  for select to authenticated
  using (
    sender_id = (select auth.uid())
    or recipient_id = (select auth.uid())
    or exists (select 1 from public.lives l where l.id = live_id and l.status = 'live')
  );
