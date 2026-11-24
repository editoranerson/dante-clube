-- Dante avatars (card photos the associate picks from)
create table public.dante_avatars (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  image_url text not null,
  sort_order int not null default 0,
  is_default boolean not null default false,
  created_at timestamptz not null default now()
);
create unique index dante_avatars_one_default on public.dante_avatars (is_default) where is_default;
grant select on public.dante_avatars to anon, authenticated;
grant insert, update, delete on public.dante_avatars to authenticated;
grant all on public.dante_avatars to service_role;
alter table public.dante_avatars enable row level security;
create policy "Anyone reads dante avatars" on public.dante_avatars for select to anon, authenticated using (true);
create policy "Admins manage dante avatars" on public.dante_avatars for all to authenticated
  using (public.has_role(auth.uid(), 'admin')) with check (public.has_role(auth.uid(), 'admin'));

alter table public.associates add column dante_avatar_id uuid references public.dante_avatars(id) on delete set null;

insert into public.dante_avatars (name, image_url, sort_order, is_default) values
  ('Dante Clássico', '/brand/dante-avatar.webp', 1, true);

-- Coupon mode on offers: one shared code, or one unique code per associate
alter table public.offers add column coupon_mode text not null default 'single';
alter table public.offers add constraint offers_coupon_mode_check check (coupon_mode in ('single', 'unique'));

create or replace function public.owns_offer(_offer_id uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.offers o join public.stores s on s.id = o.store_id
    where o.id = _offer_id and s.owner_id = auth.uid()
  )
$$;

create table public.offer_coupons (
  id uuid primary key default gen_random_uuid(),
  offer_id uuid not null references public.offers(id) on delete cascade,
  code text not null,
  associate_id uuid references public.associates(id) on delete set null,
  assigned_at timestamptz,
  created_at timestamptz not null default now(),
  unique (offer_id, code),
  unique (offer_id, associate_id)
);
create index offer_coupons_available_idx on public.offer_coupons (offer_id, created_at) where assigned_at is null;
create index offer_coupons_associate_idx on public.offer_coupons (associate_id) where associate_id is not null;
grant select, insert, delete on public.offer_coupons to authenticated;
grant all on public.offer_coupons to service_role;
alter table public.offer_coupons enable row level security;
create policy "Admins manage coupons" on public.offer_coupons for all to authenticated
  using (public.has_role(auth.uid(), 'admin')) with check (public.has_role(auth.uid(), 'admin'));
create policy "Partners manage own offer coupons" on public.offer_coupons for all to authenticated
  using (public.owns_offer(offer_id)) with check (public.owns_offer(offer_id));

-- Hands out one code per associate per offer, atomically. Returns the same code on repeat calls,
-- or null when the offer has no codes left.
create or replace function public.claim_offer_coupon(_offer_id uuid, _associate_id uuid)
returns text language plpgsql security definer set search_path = public as $$
declare c text;
begin
  select code into c from public.offer_coupons where offer_id = _offer_id and associate_id = _associate_id;
  if c is not null then return c; end if;
  begin
    update public.offer_coupons set associate_id = _associate_id, assigned_at = now()
    where id = (
      select id from public.offer_coupons
      where offer_id = _offer_id and assigned_at is null
      order by created_at, id
      limit 1
      for update skip locked
    )
    returning code into c;
  exception when unique_violation then
    select code into c from public.offer_coupons where offer_id = _offer_id and associate_id = _associate_id;
  end;
  return c;
end $$;
revoke execute on function public.claim_offer_coupon(uuid, uuid) from public, anon, authenticated;
grant execute on function public.claim_offer_coupon(uuid, uuid) to service_role;

-- Stock per offer (respects the caller's access rules)
create or replace function public.coupon_stock(_offer_ids uuid[])
returns table (offer_id uuid, total int, available int)
language sql stable security invoker set search_path = public as $$
  select c.offer_id, count(*)::int, (count(*) filter (where c.assigned_at is null))::int
  from public.offer_coupons c
  where c.offer_id = any(_offer_ids)
  group by c.offer_id
$$;
revoke execute on function public.coupon_stock(uuid[]) from public, anon;
grant execute on function public.coupon_stock(uuid[]) to authenticated, service_role;