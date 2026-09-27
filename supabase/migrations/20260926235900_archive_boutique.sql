-- Range l'ancien schéma « boutiques en live » (14 tables vides, 0 utilisateur) dans
-- archive_boutique, sans rien supprimer, pour libérer les noms utilisés par Senlive.
-- Validé par Babacar le 2026-09-27.
-- Retour arrière : ALTER TABLE / TYPE / FUNCTION archive_boutique.x SET SCHEMA public,
-- puis restaurer private.handle_new_user depuis archive_boutique.handle_new_user_boutique.

create schema if not exists archive_boutique;
revoke all on schema archive_boutique from anon, authenticated, public;

alter table public.regions set schema archive_boutique;
alter table public.cities set schema archive_boutique;
alter table public.profiles set schema archive_boutique;
alter table public.shops set schema archive_boutique;
alter table public.categories set schema archive_boutique;
alter table public.listings set schema archive_boutique;
alter table public.listing_images set schema archive_boutique;
alter table public.orders set schema archive_boutique;
alter table public.order_items set schema archive_boutique;
alter table public.reviews set schema archive_boutique;
alter table public.follows set schema archive_boutique;
alter table public.shows set schema archive_boutique;
alter table public.show_listings set schema archive_boutique;
alter table public.show_messages set schema archive_boutique;

alter type public.user_role set schema archive_boutique;
alter type public.verification_status set schema archive_boutique;
alter type public.listing_status set schema archive_boutique;
alter type public.listing_condition set schema archive_boutique;
alter type public.order_status set schema archive_boutique;
alter type public.payment_status set schema archive_boutique;
alter type public.payment_method set schema archive_boutique;
alter type public.show_status set schema archive_boutique;

do $$
declare f regprocedure;
begin
  for f in select p.oid::regprocedure from pg_proc p join pg_namespace n on n.oid = p.pronamespace
           where n.nspname = 'public' and p.proname = 'place_order'
  loop
    execute format('alter function %s set schema archive_boutique', f);
  end loop;
end $$;

-- Copie de l'ancienne fonction d'inscription, pointée sur les tables archivées (non branchée).
create or replace function archive_boutique.handle_new_user_boutique()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_phone text;
  v_role  archive_boutique.user_role;
begin
  v_phone := nullif(new.phone, '');
  if v_phone is not null and left(v_phone, 1) <> '+' then
    v_phone := '+' || v_phone;
  end if;
  v_role := case
    when new.raw_user_meta_data ->> 'role' = 'seller' then 'seller'::archive_boutique.user_role
    else 'buyer'::archive_boutique.user_role
  end;
  insert into archive_boutique.profiles (id, full_name, avatar_url, phone, phone_verified_at, role)
  values (
    new.id,
    coalesce(nullif(new.raw_user_meta_data ->> 'full_name', ''), nullif(new.raw_user_meta_data ->> 'name', '')),
    nullif(new.raw_user_meta_data ->> 'avatar_url', ''),
    v_phone,
    new.phone_confirmed_at,
    v_role
  );
  return new;
end;
$$;
revoke execute on function archive_boutique.handle_new_user_boutique() from anon, authenticated, public;
