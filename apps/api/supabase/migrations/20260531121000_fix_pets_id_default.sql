alter table public.pets 
  alter column id set default gen_random_uuid();