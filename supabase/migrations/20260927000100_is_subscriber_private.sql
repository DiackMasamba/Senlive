-- is_subscriber() n'a pas à être appelable depuis l'API : on la sort du schéma exposé.
-- Les politiques RLS qui l'utilisent suivent automatiquement.
alter function public.is_subscriber() set schema private;
grant usage on schema private to authenticated;
revoke execute on function private.handle_new_user() from authenticated;
