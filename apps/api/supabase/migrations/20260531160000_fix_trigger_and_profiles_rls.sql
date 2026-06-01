-- ─────────────────────────────────────────────────────────────────────────────
-- 1. Atualiza trigger com EXCEPTION handler para nunca bloquear o signUp.
--    Sem isso, qualquer falha no INSERT em profiles retorna
--    "Database error saving new user" para o cliente.
-- ─────────────────────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.handle_new_auth_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email, phone, gender)
  VALUES (
    NEW.id,
    COALESCE(
      NEW.raw_user_meta_data->>'nome_completo',
      NEW.raw_user_meta_data->>'name',
      split_part(NEW.email, '@', 1)
    ),
    NEW.email,
    NEW.raw_user_meta_data->>'telefone',
    NEW.raw_user_meta_data->>'genero'
  )
  ON CONFLICT (id) DO NOTHING;

  RETURN NEW;

EXCEPTION
  WHEN OTHERS THEN
    RAISE WARNING 'handle_new_auth_user falhou para uid=%: %', NEW.id, SQLERRM;
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_auth_user();

-- ─────────────────────────────────────────────────────────────────────────────
-- 2. RLS policies para profiles
--    Garante que cada usuário só acessa e edita o próprio perfil.
-- ─────────────────────────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "Usuários veem seu próprio perfil" ON public.profiles;
CREATE POLICY "Usuários veem seu próprio perfil"
  ON public.profiles FOR SELECT TO public
  USING (auth.uid() = id);

DROP POLICY IF EXISTS "Usuários atualizam seu próprio perfil" ON public.profiles;
CREATE POLICY "Usuários atualizam seu próprio perfil"
  ON public.profiles FOR UPDATE TO public
  USING (auth.uid() = id);

DROP POLICY IF EXISTS "Usuários inserem seu próprio perfil" ON public.profiles;
CREATE POLICY "Usuários inserem seu próprio perfil"
  ON public.profiles FOR INSERT TO public
  WITH CHECK (auth.uid() = id);

-- ─────────────────────────────────────────────────────────────────────────────
-- 3. Garante que pets.owner_id não é nullable (integridade de dados)
-- ─────────────────────────────────────────────────────────────────────────────
DELETE FROM public.pets WHERE owner_id IS NULL;

ALTER TABLE public.pets
  ALTER COLUMN owner_id SET NOT NULL;

ALTER TABLE public.devices
  ADD COLUMN IF NOT EXISTS created_at timestamptz NOT NULL DEFAULT now();
