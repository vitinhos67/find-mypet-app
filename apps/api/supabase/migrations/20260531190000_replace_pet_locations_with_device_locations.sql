-- Substitui pet_locations por device_locations.
-- A localização é rastreada via coleira (device), não diretamente pelo pet.

DROP TABLE IF EXISTS public.pet_locations CASCADE;

CREATE TABLE public.device_locations (
  id          uuid             PRIMARY KEY DEFAULT gen_random_uuid(),
  device_id   uuid             NOT NULL REFERENCES public.devices(id) ON DELETE CASCADE,
  latitude    double precision NOT NULL,
  longitude   double precision NOT NULL,
  precision   numeric,
  recorded_at timestamptz      NOT NULL DEFAULT now()
);

CREATE INDEX device_locations_device_id_idx
  ON public.device_locations (device_id, recorded_at DESC);

ALTER TABLE public.device_locations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuários veem localizações de seus dispositivos"
  ON public.device_locations FOR SELECT TO public
  USING (
    EXISTS (
      SELECT 1 FROM public.devices
      WHERE id = device_id AND auth.uid() = owner_id
    )
  );

CREATE POLICY "Usuários inserem localizações de seus dispositivos"
  ON public.device_locations FOR INSERT TO public
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.devices
      WHERE id = device_id AND auth.uid() = owner_id
    )
  );
