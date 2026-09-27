-- Schéma initial Senlive (chapitres 3 à 8 du cahier des charges).
-- Les paiements et abonnements ne sont écrits que par le serveur (clé service), jamais par l'app.

create type public.user_role as enum ('member', 'creator', 'moderator', 'admin');
create type public.creator_status as enum ('none', 'pending', 'approved', 'rejected');
create type public.live_status as enum ('scheduled', 'live', 'ended', 'cut');
create type public.payment_method as enum ('wave', 'orange_money', 'card');
create type public.subscription_status as enum ('active', 'grace', 'expired', 'cancelled');
create type public.payment_status as enum ('pending', 'succeeded', 'failed');
create type public.report_target as enum ('live', 'profile', 'message');
create type public.report_status as enum ('open', 'resolved', 'dismissed');

-- Profils ----------------------------------------------------------------
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  phone text unique,
  username text unique check (username ~ '^[a-z0-9._]{3,24}$'),
  display_name text check (char_length(display_name) <= 40),
  bio text check (char_length(bio) <= 150),
  avatar_url text,
  birth_date date,
  role public.user_role not null default 'member',
  creator_status public.creator_status not null default 'none',
  verified boolean not null default false,
  created_at timestamptz not null default now()
);

-- Création automatique du profil à l'inscription (téléphone vérifié par OTP).
create function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, phone) values (new.id, new.phone);
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Catégories -------------------------------------------------------------
create table public.categories (
  id text primary key,
  label text not null,
  icon text not null,
  position smallint not null default 0
);

insert into public.categories (id, label, icon, position) values
  ('musique', 'Musique', 'musical-notes-outline', 1),
  ('humour', 'Humour', 'happy-outline', 2),
  ('cuisine', 'Cuisine', 'restaurant-outline', 3),
  ('sport', 'Sport', 'football-outline', 4),
  ('religion', 'Religion', 'book-outline', 5),
  ('business', 'Business', 'briefcase-outline', 6),
  ('lifestyle', 'Lifestyle', 'sparkles-outline', 7),
  ('jeux', 'Jeux', 'game-controller-outline', 8);

-- Lives ------------------------------------------------------------------
create table public.lives (
  id uuid primary key default gen_random_uuid(),
  host_id uuid not null references public.profiles (id) on delete cascade,
  title text not null check (char_length(title) between 1 and 80),
  category_id text not null references public.categories (id),
  is_premium boolean not null default false,
  status public.live_status not null default 'scheduled',
  viewer_count integer not null default 0,
  scheduled_at timestamptz,
  started_at timestamptz,
  ended_at timestamptz,
  created_at timestamptz not null default now()
);
create index lives_status_idx on public.lives (status);
create index lives_host_idx on public.lives (host_id);
create index lives_category_idx on public.lives (category_id);

create table public.live_messages (
  id bigint generated always as identity primary key,
  live_id uuid not null references public.lives (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  body text not null check (char_length(body) between 1 and 200),
  hidden boolean not null default false,
  created_at timestamptz not null default now()
);
create index live_messages_live_idx on public.live_messages (live_id, created_at);
create index live_messages_user_idx on public.live_messages (user_id);

create table public.follows (
  follower_id uuid not null references public.profiles (id) on delete cascade,
  followed_id uuid not null references public.profiles (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (follower_id, followed_id),
  check (follower_id <> followed_id)
);
create index follows_followed_idx on public.follows (followed_id);

-- Abonnements et paiements -----------------------------------------------
create table public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  status public.subscription_status not null,
  payment_method public.payment_method not null,
  current_period_end timestamptz not null,
  created_at timestamptz not null default now()
);
create index subscriptions_user_idx on public.subscriptions (user_id);

create table public.payments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  subscription_id uuid references public.subscriptions (id) on delete set null,
  amount_fcfa integer not null check (amount_fcfa > 0),
  method public.payment_method not null,
  provider_ref text unique,
  status public.payment_status not null default 'pending',
  created_at timestamptz not null default now()
);
create index payments_user_idx on public.payments (user_id);
create index payments_subscription_idx on public.payments (subscription_id);

-- Modération -------------------------------------------------------------
create table public.reports (
  id uuid primary key default gen_random_uuid(),
  reporter_id uuid not null references public.profiles (id) on delete cascade,
  target_type public.report_target not null,
  target_id text not null,
  reason text not null check (reason in ('nudite', 'violence', 'harcelement', 'haine', 'arnaque', 'mineur', 'autre')),
  details text check (char_length(details) <= 500),
  status public.report_status not null default 'open',
  created_at timestamptz not null default now()
);
create index reports_reporter_idx on public.reports (reporter_id);
create index reports_status_idx on public.reports (status, created_at);

-- Abonné actif, y compris pendant les 3 jours de grâce.
create function public.is_subscriber()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.subscriptions s
    where s.user_id = (select auth.uid())
      and s.status in ('active', 'grace')
      and s.current_period_end + interval '3 days' > now()
  );
$$;

-- Sécurité (RLS) ---------------------------------------------------------
alter table public.profiles enable row level security;
alter table public.categories enable row level security;
alter table public.lives enable row level security;
alter table public.live_messages enable row level security;
alter table public.follows enable row level security;
alter table public.subscriptions enable row level security;
alter table public.payments enable row level security;
alter table public.reports enable row level security;

create policy "Profils visibles par tous" on public.profiles
  for select to anon, authenticated using (true);
create policy "Chacun modifie son profil" on public.profiles
  for update to authenticated
  using ((select auth.uid()) = id) with check ((select auth.uid()) = id);
-- Rôle, statut créateur et badge ne se changent que depuis le back-office.
revoke update on public.profiles from authenticated;
grant update (username, display_name, bio, avatar_url, birth_date) on public.profiles to authenticated;
-- Le téléphone reste privé : il n'est pas dans les colonnes lisibles.
revoke select on public.profiles from anon, authenticated;
grant select (id, username, display_name, bio, avatar_url, role, creator_status, verified, created_at)
  on public.profiles to anon, authenticated;

create policy "Catégories visibles par tous" on public.categories
  for select to anon, authenticated using (true);

create policy "Lives publics visibles" on public.lives
  for select to anon, authenticated
  using (status in ('scheduled', 'live') or host_id = (select auth.uid()));
create policy "Un créateur validé crée ses lives" on public.lives
  for insert to authenticated
  with check (
    host_id = (select auth.uid())
    and exists (
      select 1 from public.profiles p
      where p.id = (select auth.uid()) and p.creator_status = 'approved'
    )
  );
create policy "Le créateur gère ses lives" on public.lives
  for update to authenticated
  using (host_id = (select auth.uid()))
  with check (host_id = (select auth.uid()) and status <> 'cut');

create policy "Messages visibles des membres" on public.live_messages
  for select to authenticated using (not hidden);
create policy "Un membre écrit en son nom" on public.live_messages
  for insert to authenticated
  with check (
    user_id = (select auth.uid())
    and hidden = false
    and exists (
      select 1 from public.lives l
      where l.id = live_id
        and l.status = 'live'
        and (not l.is_premium or public.is_subscriber())
    )
  );

create policy "Abonnements visibles" on public.follows
  for select to anon, authenticated using (true);
create policy "Suivre en son nom" on public.follows
  for insert to authenticated with check (follower_id = (select auth.uid()));
create policy "Ne plus suivre" on public.follows
  for delete to authenticated using (follower_id = (select auth.uid()));

create policy "Voir son abonnement" on public.subscriptions
  for select to authenticated using (user_id = (select auth.uid()));
create policy "Voir ses paiements" on public.payments
  for select to authenticated using (user_id = (select auth.uid()));

create policy "Signaler en son nom" on public.reports
  for insert to authenticated with check (reporter_id = (select auth.uid()) and status = 'open');
create policy "Voir ses signalements" on public.reports
  for select to authenticated using (reporter_id = (select auth.uid()));

revoke execute on function public.handle_new_user() from anon, authenticated, public;
revoke execute on function public.is_subscriber() from anon, public;
grant execute on function public.is_subscriber() to authenticated;
