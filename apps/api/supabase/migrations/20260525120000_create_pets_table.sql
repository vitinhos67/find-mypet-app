create table if not exists public.pets (
  id uuid primary key default gen_random_uuid(),
  image_href text,
  name text not null,
  created_at timestamptz not null default now(),
  birth_date date,
  owner_id uuid not null references public.users (id) on delete cascade
);

create index if not exists pets_owner_id_idx on public.pets (owner_id);

alter table public.pets enable row level security;

grant select, insert, update, delete on table public.pets to service_role;
