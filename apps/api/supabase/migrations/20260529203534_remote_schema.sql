revoke delete on table "public"."sessions" from "anon";

revoke insert on table "public"."sessions" from "anon";

revoke references on table "public"."sessions" from "anon";

revoke select on table "public"."sessions" from "anon";

revoke trigger on table "public"."sessions" from "anon";

revoke truncate on table "public"."sessions" from "anon";

revoke update on table "public"."sessions" from "anon";

revoke delete on table "public"."sessions" from "authenticated";

revoke insert on table "public"."sessions" from "authenticated";

revoke references on table "public"."sessions" from "authenticated";

revoke select on table "public"."sessions" from "authenticated";

revoke trigger on table "public"."sessions" from "authenticated";

revoke truncate on table "public"."sessions" from "authenticated";

revoke update on table "public"."sessions" from "authenticated";

revoke delete on table "public"."sessions" from "service_role";

revoke insert on table "public"."sessions" from "service_role";

revoke references on table "public"."sessions" from "service_role";

revoke select on table "public"."sessions" from "service_role";

revoke trigger on table "public"."sessions" from "service_role";

revoke truncate on table "public"."sessions" from "service_role";

revoke update on table "public"."sessions" from "service_role";

alter table "public"."sessions" drop constraint "sessions_user_id_fkey";

alter table "public"."sessions" drop constraint "sessions_pkey";

drop index if exists "public"."pets_owner_id_idx";

drop index if exists "public"."sessions_expires_at_idx";

drop index if exists "public"."sessions_pkey";

drop index if exists "public"."sessions_user_id_idx";

drop table "public"."sessions";

alter table "public"."devices" add column if not exists "comportamento_sem_wifi" text not null default 'PEGAR_LOCAL_E_DORMIR'::text;

alter table "public"."devices" add column if not exists "intervalo_acordar_minutos" integer not null default 10;

alter table "public"."devices" add column if not exists "serial_number" text;

alter table "public"."devices" add column if not exists "status" text not null default 'ONLINE'::text;

alter table "public"."devices" add column if not exists "wifi_senha" text;

alter table "public"."devices" add column if not exists "wifi_ssid" text;

alter table "public"."users" drop column "password";

alter table "public"."users" add column "genero" text;

alter table "public"."users" add column "telefone" text;

alter table "public"."users" alter column "id" drop default;

CREATE UNIQUE INDEX devices_serial_number_key ON public.devices USING btree (serial_number);

alter table "public"."devices" add constraint "devices_serial_number_key" UNIQUE using index "devices_serial_number_key";

alter table "public"."users" add constraint "users_id_fkey" FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE not valid;


DELETE FROM public.users WHERE id NOT IN (SELECT id FROM auth.users);

alter table "public"."users" validate constraint "users_id_fkey";


  create policy "Usuários atualizam suas próprias coleiras"
  on "public"."devices"
  as permissive
  for update
  to public
using ((auth.uid() = owner_id));



  create policy "Usuários deletam suas próprias coleiras"
  on "public"."devices"
  as permissive
  for delete
  to public
using ((auth.uid() = owner_id));



  create policy "Usuários inserem suas próprias coleiras"
  on "public"."devices"
  as permissive
  for insert
  to public
with check ((auth.uid() = owner_id));



  create policy "Usuários veem suas próprias coleiras"
  on "public"."devices"
  as permissive
  for select
  to public
using ((auth.uid() = owner_id));



