CREATE TABLE public.pet_locations (
  id          uuid             PRIMARY KEY DEFAULT gen_random_uuid(),
  pet_id      uuid             NOT NULL REFERENCES public.pets (id) ON DELETE CASCADE,
  latitude    double precision NOT NULL,
  longitude   double precision NOT NULL,
  precision   numeric,
  recorded_at timestamptz      NOT NULL DEFAULT now()
);

CREATE INDEX pet_locations_pet_id_idx
  ON public.pet_locations (pet_id, recorded_at DESC);

ALTER TABLE public.pet_locations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuários veem localizações de seus pets"
  ON public.pet_locations FOR SELECT TO public
  USING (
    EXISTS (
      SELECT 1 FROM public.pets
      WHERE id = pet_id AND auth.uid() = owner_id
    )
  );

CREATE POLICY "Usuários inserem localizações de seus pets"
  ON public.pet_locations FOR INSERT TO public
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.pets
      WHERE id = pet_id AND auth.uid() = owner_id
    )
  );
