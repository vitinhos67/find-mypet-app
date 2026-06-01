-- Adiciona pet_id em device_locations para registrar qual pet estava usando
-- a coleira no momento em que cada localização foi gravada.
-- Permite reconstruir o histórico de localização por pet de forma precisa,
-- independente de vínculos futuros (um device pode trocar de pet ao longo do tempo).

ALTER TABLE public.device_locations
  ADD COLUMN pet_id uuid REFERENCES public.pets(id) ON DELETE SET NULL;

CREATE INDEX device_locations_pet_id_idx
  ON public.device_locations (pet_id, recorded_at DESC);
