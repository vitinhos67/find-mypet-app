-- Tabela de compartilhamentos de pets (N:N entre pets e usuários)
CREATE TABLE IF NOT EXISTS public.pet_shares (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  pet_id uuid NOT NULL REFERENCES public.pets(id) ON DELETE CASCADE,
  owner_id uuid NOT NULL,
  shared_with_user_id uuid NOT NULL,
  permission text NOT NULL DEFAULT 'VIEW' CHECK (permission IN ('VIEW', 'EDIT')),
  created_at timestamptz DEFAULT now(),
  UNIQUE (pet_id, shared_with_user_id)
);

-- RLS
ALTER TABLE public.pet_shares ENABLE ROW LEVEL SECURITY;

-- Dono do pet pode ver, criar, atualizar e remover compartilhamentos
CREATE POLICY "Dono gerencia compartilhamentos"
  ON public.pet_shares
  FOR ALL
  USING (owner_id = auth.uid())
  WITH CHECK (owner_id = auth.uid());

-- Usuário convidado pode ver os compartilhamentos onde ele foi adicionado
CREATE POLICY "Convidado ve seus compartilhamentos"
  ON public.pet_shares
  FOR SELECT
  USING (shared_with_user_id = auth.uid());


CREATE INDEX IF NOT EXISTS idx_pet_shares_pet_id ON public.pet_shares(pet_id);
CREATE INDEX IF NOT EXISTS idx_pet_shares_shared_with_user_id ON public.pet_shares(shared_with_user_id);
CREATE INDEX IF NOT EXISTS idx_pet_shares_owner_id ON public.pet_shares(owner_id);
