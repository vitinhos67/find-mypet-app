alter table public.pets
  add column if not exists created_at timestamptz not null default now();