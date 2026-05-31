alter table public.pets
  add column if not exists image_href text,
  add column if not exists name text,
  add column if not exists birth_date date;