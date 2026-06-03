
-- 1. Garante que profiles.id referencia auth.users
ALTER TABLE public.profiles
  DROP CONSTRAINT IF EXISTS profiles_id_fkey;

ALTER TABLE public.profiles
  ADD CONSTRAINT profiles_id_fkey
  FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE;


INSERT INTO public.profiles (id, full_name, email)
SELECT
  u.id,
  u.name,
  u.email
FROM public.users u
WHERE NOT EXISTS (
  SELECT 1 FROM public.profiles p WHERE p.id = u.id
)
ON CONFLICT (id) DO NOTHING;


INSERT INTO public.profiles (id, full_name, email)
SELECT
  au.id,
  COALESCE(
    au.raw_user_meta_data->>'nome_completo',
    au.raw_user_meta_data->>'name',
    split_part(au.email, '@', 1)
  ),
  au.email
FROM auth.users au
WHERE NOT EXISTS (
  SELECT 1 FROM public.profiles p WHERE p.id = au.id
)
ON CONFLICT (id) DO NOTHING;

ALTER TABLE public.pets
  DROP CONSTRAINT IF EXISTS pets_owner_id_fkey;

ALTER TABLE public.pets
  ADD CONSTRAINT pets_owner_id_fkey
  FOREIGN KEY (owner_id) REFERENCES auth.users(id) ON DELETE CASCADE;

ALTER TABLE public.devices
  DROP CONSTRAINT IF EXISTS devices_owner_id_fkey;

ALTER TABLE public.devices
  ADD CONSTRAINT devices_owner_id_fkey
  FOREIGN KEY (owner_id) REFERENCES auth.users(id) ON DELETE CASCADE;

DROP TABLE IF EXISTS public.users CASCADE;
