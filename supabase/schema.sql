-- Juntos: esquema privado para dos personas
create extension if not exists pgcrypto;
create table if not exists public.couples(id uuid primary key default gen_random_uuid(),name text default 'Nosotros',invite_code text unique default encode(gen_random_bytes(6),'hex'),created_at timestamptz default now());
create table if not exists public.memberships(id uuid primary key default gen_random_uuid(),couple_id uuid references public.couples(id) on delete cascade,user_id uuid references auth.users(id) on delete cascade unique,display_name text,created_at timestamptz default now());
create table if not exists public.reflections(id uuid primary key default gen_random_uuid(),user_id uuid references auth.users(id) on delete cascade,couple_id uuid references public.couples(id) on delete cascade,chapter text not null,prompt text not null,body text not null,visibility text not null default 'private' check(visibility in('private','shared')),created_at timestamptz default now(),updated_at timestamptz default now());
create table if not exists public.activities(id uuid primary key default gen_random_uuid(),couple_id uuid references public.couples(id) on delete cascade,created_by uuid references auth.users(id) on delete cascade,title text not null,notes text,activity_date date,status text default 'planned',reflection text,created_at timestamptz default now());
create table if not exists public.agreements(id uuid primary key default gen_random_uuid(),couple_id uuid references public.couples(id) on delete cascade,created_by uuid references auth.users(id),title text not null,detail text,status text default 'trying',review_date date,created_at timestamptz default now());
create table if not exists public.memories(id uuid primary key default gen_random_uuid(),couple_id uuid references public.couples(id) on delete cascade,created_by uuid references auth.users(id),title text,body text,image_url text,memory_date date,created_at timestamptz default now());

alter table public.couples enable row level security; alter table public.memberships enable row level security; alter table public.reflections enable row level security; alter table public.activities enable row level security; alter table public.agreements enable row level security; alter table public.memories enable row level security;

create or replace function public.my_couple_ids() returns setof uuid language sql security definer set search_path=public stable as $$ select couple_id from public.memberships where user_id=auth.uid() $$;

create policy "members see couple" on public.couples for select using(id in(select public.my_couple_ids()));
create policy "users see memberships" on public.memberships for select using(user_id=auth.uid() or couple_id in(select public.my_couple_ids()));
create policy "own reflections insert" on public.reflections for insert with check(user_id=auth.uid());
create policy "own reflections read or shared partner" on public.reflections for select using(user_id=auth.uid() or (visibility='shared' and couple_id in(select public.my_couple_ids())));
create policy "own reflections update" on public.reflections for update using(user_id=auth.uid()) with check(user_id=auth.uid());
create policy "own reflections delete" on public.reflections for delete using(user_id=auth.uid());
create policy "member activities read" on public.activities for select using(created_by=auth.uid() or couple_id in(select public.my_couple_ids()));
create policy "member activities insert" on public.activities for insert with check(created_by=auth.uid() and (couple_id is null or couple_id in(select public.my_couple_ids())));
create policy "member activities update" on public.activities for update using(couple_id in(select public.my_couple_ids()) or created_by=auth.uid());
create policy "member agreements all" on public.agreements for all using(couple_id in(select public.my_couple_ids())) with check(couple_id in(select public.my_couple_ids()));
create policy "member memories all" on public.memories for all using(couple_id in(select public.my_couple_ids())) with check(couple_id in(select public.my_couple_ids()));

-- Para una demo rápida antes de enlazar las dos cuentas, reflections y activities admiten couple_id NULL.
-- En producción, crea un couple + memberships para ambos y asigna ese couple_id a nuevos registros.
