enCREATE TABLE IF NOT EXISTS public.alerts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  pet_id uuid NOT NULL REFERENCES public.pets(id) ON DELETE CASCADE,
  owner_id uuid NOT NULL,
  type text NOT NULL DEFAULT 'OUTSIDE_SAFE_ZONE',
  latitude double precision NOT NULL,
  longitude double precision NOT NULL,
  triggered_at timestamptz DEFAULT now(),
  read_at timestamptz
);

ALTER TABLE public.alerts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Dono ve e atualiza seus alertas" ON public.alerts;
CREATE POLICY "Dono ve e atualiza seus alertas"
  ON public.alerts FOR ALL
  USING (owner_id = auth.uid())
  WITH CHECK (owner_id = auth.uid());

CREATE INDEX IF NOT EXISTS idx_alerts_owner_id ON public.alerts(owner_id);
CREATE INDEX IF NOT EXISTS idx_alerts_pet_id ON public.alerts(pet_id);
CREATE INDEX IF NOT EXISTS idx_alerts_triggered_at ON public.alerts(triggered_at DESC);
