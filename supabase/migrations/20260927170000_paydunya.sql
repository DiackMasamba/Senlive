-- Recharge de pièces via PayDunya : seule la fonction serveur (service_role) peut valider un paiement.
create function private.complete_coin_payment(p_provider_ref text, p_amount integer)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_payment uuid;
begin
  update public.payments pay
  set status = 'succeeded'
  where pay.provider_ref = p_provider_ref
    and pay.coin_pack_id is not null
    and pay.amount_fcfa = p_amount
    and pay.status in ('pending', 'succeeded')
  returning pay.id into v_payment;
  if v_payment is null then raise exception 'payment_not_found'; end if;
  perform private.credit_coin_purchase(v_payment);
  return v_payment;
end;
$$;

revoke execute on function private.complete_coin_payment(text, integer) from anon, authenticated, public;
grant usage on schema private to service_role;
grant execute on function private.complete_coin_payment(text, integer) to service_role;

create function public.complete_coin_payment(p_provider_ref text, p_amount integer)
returns uuid
language sql
security invoker
set search_path = ''
as $$ select private.complete_coin_payment(p_provider_ref, p_amount) $$;

revoke execute on function public.complete_coin_payment(text, integer) from anon, authenticated, public;
grant execute on function public.complete_coin_payment(text, integer) to service_role;
