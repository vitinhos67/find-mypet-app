ALTER TABLE public.devices RENAME COLUMN nickname              TO name;
ALTER TABLE public.devices RENAME COLUMN wifi_senha            TO wifi_password;
ALTER TABLE public.devices RENAME COLUMN intervalo_acordar_minutos TO wake_interval;
ALTER TABLE public.devices RENAME COLUMN comportamento_sem_wifi    TO behavior_no_wifi;
