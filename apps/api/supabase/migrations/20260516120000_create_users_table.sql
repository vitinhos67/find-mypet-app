create table if not exists public.users (

  id uuid primary key default gen_random_uuid(),

  name text not null,

  email text not null,

  password text not null,

  created_at timestamptz not null default now(),

  constraint users_email_key unique (email)

);



alter table public.users enable row level security;



grant select, insert, update, delete on table public.users to service_role;