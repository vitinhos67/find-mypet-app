drop extension if exists "pg_net";

create sequence "public"."activity_logs_id_seq";

create sequence "public"."location_history_id_seq";


  create table "public"."activity_logs" (
    "id" bigint not null default nextval('public.activity_logs_id_seq'::regclass),
    "device_id" uuid,
    "event_type" text,
    "description" text,
    "created_at" timestamp without time zone
      );


alter table "public"."activity_logs" enable row level security;


  create table "public"."devices" (
    "id" uuid not null,
    "owner_id" uuid,
    "nickname" text,
    "pet_id" uuid,
    "battery_level" integer,
    "last_lat" double precision,
    "last_lng" double precision,
    "home_lat" double precision,
    "home_lng" double precision,
    "geofence_radius" integer,
    "updated_at" timestamp without time zone
      );


alter table "public"."devices" enable row level security;


  create table "public"."location_history" (
    "id" bigint not null default nextval('public.location_history_id_seq'::regclass),
    "device_id" uuid,
    "lat" double precision,
    "lng" double precision,
    "timestamp" timestamp without time zone
      );


alter table "public"."location_history" enable row level security;


  create table "public"."pets" (
    "id" uuid not null,
    "owner_id" uuid,
    "name" text,
    "species" text,
    "description" text,
    "photo_url" text,
    "birth_date" date,
    "weight" double precision,
    "vaccine_due_date" date
      );


alter table "public"."pets" enable row level security;


  create table "public"."profiles" (
    "id" uuid not null,
    "full_name" text,
    "email" text,
    "phone" text,
    "gender" text,
    "avatar_url" text,
    "updated_at" timestamp without time zone
      );


alter table "public"."profiles" enable row level security;

alter sequence "public"."activity_logs_id_seq" owned by "public"."activity_logs"."id";

alter sequence "public"."location_history_id_seq" owned by "public"."location_history"."id";

CREATE UNIQUE INDEX activity_logs_pkey ON public.activity_logs USING btree (id);

CREATE UNIQUE INDEX devices_pet_id_key ON public.devices USING btree (pet_id);

CREATE UNIQUE INDEX devices_pkey ON public.devices USING btree (id);

CREATE UNIQUE INDEX location_history_pkey ON public.location_history USING btree (id);

CREATE UNIQUE INDEX pets_pkey ON public.pets USING btree (id);

CREATE UNIQUE INDEX profiles_pkey ON public.profiles USING btree (id);

alter table "public"."activity_logs" add constraint "activity_logs_pkey" PRIMARY KEY using index "activity_logs_pkey";

alter table "public"."devices" add constraint "devices_pkey" PRIMARY KEY using index "devices_pkey";

alter table "public"."location_history" add constraint "location_history_pkey" PRIMARY KEY using index "location_history_pkey";

alter table "public"."pets" add constraint "pets_pkey" PRIMARY KEY using index "pets_pkey";

alter table "public"."profiles" add constraint "profiles_pkey" PRIMARY KEY using index "profiles_pkey";

alter table "public"."activity_logs" add constraint "activity_logs_device_id_fkey" FOREIGN KEY (device_id) REFERENCES public.devices(id) DEFERRABLE not valid;

alter table "public"."activity_logs" validate constraint "activity_logs_device_id_fkey";

alter table "public"."devices" add constraint "devices_owner_id_fkey" FOREIGN KEY (owner_id) REFERENCES public.profiles(id) DEFERRABLE not valid;

alter table "public"."devices" validate constraint "devices_owner_id_fkey";

alter table "public"."devices" add constraint "devices_pet_id_fkey" FOREIGN KEY (pet_id) REFERENCES public.pets(id) DEFERRABLE not valid;

alter table "public"."devices" validate constraint "devices_pet_id_fkey";

alter table "public"."devices" add constraint "devices_pet_id_key" UNIQUE using index "devices_pet_id_key";

alter table "public"."location_history" add constraint "location_history_device_id_fkey" FOREIGN KEY (device_id) REFERENCES public.devices(id) DEFERRABLE not valid;

alter table "public"."location_history" validate constraint "location_history_device_id_fkey";

alter table "public"."pets" add constraint "pets_owner_id_fkey" FOREIGN KEY (owner_id) REFERENCES public.profiles(id) DEFERRABLE not valid;

alter table "public"."pets" validate constraint "pets_owner_id_fkey";

grant delete on table "public"."activity_logs" to "anon";

grant insert on table "public"."activity_logs" to "anon";

grant references on table "public"."activity_logs" to "anon";

grant select on table "public"."activity_logs" to "anon";

grant trigger on table "public"."activity_logs" to "anon";

grant truncate on table "public"."activity_logs" to "anon";

grant update on table "public"."activity_logs" to "anon";

grant delete on table "public"."activity_logs" to "authenticated";

grant insert on table "public"."activity_logs" to "authenticated";

grant references on table "public"."activity_logs" to "authenticated";

grant select on table "public"."activity_logs" to "authenticated";

grant trigger on table "public"."activity_logs" to "authenticated";

grant truncate on table "public"."activity_logs" to "authenticated";

grant update on table "public"."activity_logs" to "authenticated";

grant delete on table "public"."activity_logs" to "service_role";

grant insert on table "public"."activity_logs" to "service_role";

grant references on table "public"."activity_logs" to "service_role";

grant select on table "public"."activity_logs" to "service_role";

grant trigger on table "public"."activity_logs" to "service_role";

grant truncate on table "public"."activity_logs" to "service_role";

grant update on table "public"."activity_logs" to "service_role";

grant delete on table "public"."devices" to "anon";

grant insert on table "public"."devices" to "anon";

grant references on table "public"."devices" to "anon";

grant select on table "public"."devices" to "anon";

grant trigger on table "public"."devices" to "anon";

grant truncate on table "public"."devices" to "anon";

grant update on table "public"."devices" to "anon";

grant delete on table "public"."devices" to "authenticated";

grant insert on table "public"."devices" to "authenticated";

grant references on table "public"."devices" to "authenticated";

grant select on table "public"."devices" to "authenticated";

grant trigger on table "public"."devices" to "authenticated";

grant truncate on table "public"."devices" to "authenticated";

grant update on table "public"."devices" to "authenticated";

grant delete on table "public"."devices" to "service_role";

grant insert on table "public"."devices" to "service_role";

grant references on table "public"."devices" to "service_role";

grant select on table "public"."devices" to "service_role";

grant trigger on table "public"."devices" to "service_role";

grant truncate on table "public"."devices" to "service_role";

grant update on table "public"."devices" to "service_role";

grant delete on table "public"."location_history" to "anon";

grant insert on table "public"."location_history" to "anon";

grant references on table "public"."location_history" to "anon";

grant select on table "public"."location_history" to "anon";

grant trigger on table "public"."location_history" to "anon";

grant truncate on table "public"."location_history" to "anon";

grant update on table "public"."location_history" to "anon";

grant delete on table "public"."location_history" to "authenticated";

grant insert on table "public"."location_history" to "authenticated";

grant references on table "public"."location_history" to "authenticated";

grant select on table "public"."location_history" to "authenticated";

grant trigger on table "public"."location_history" to "authenticated";

grant truncate on table "public"."location_history" to "authenticated";

grant update on table "public"."location_history" to "authenticated";

grant delete on table "public"."location_history" to "service_role";

grant insert on table "public"."location_history" to "service_role";

grant references on table "public"."location_history" to "service_role";

grant select on table "public"."location_history" to "service_role";

grant trigger on table "public"."location_history" to "service_role";

grant truncate on table "public"."location_history" to "service_role";

grant update on table "public"."location_history" to "service_role";

grant delete on table "public"."pets" to "anon";

grant insert on table "public"."pets" to "anon";

grant references on table "public"."pets" to "anon";

grant select on table "public"."pets" to "anon";

grant trigger on table "public"."pets" to "anon";

grant truncate on table "public"."pets" to "anon";

grant update on table "public"."pets" to "anon";

grant delete on table "public"."pets" to "authenticated";

grant insert on table "public"."pets" to "authenticated";

grant references on table "public"."pets" to "authenticated";

grant select on table "public"."pets" to "authenticated";

grant trigger on table "public"."pets" to "authenticated";

grant truncate on table "public"."pets" to "authenticated";

grant update on table "public"."pets" to "authenticated";

grant delete on table "public"."pets" to "service_role";

grant insert on table "public"."pets" to "service_role";

grant references on table "public"."pets" to "service_role";

grant select on table "public"."pets" to "service_role";

grant trigger on table "public"."pets" to "service_role";

grant truncate on table "public"."pets" to "service_role";

grant update on table "public"."pets" to "service_role";

grant delete on table "public"."profiles" to "anon";

grant insert on table "public"."profiles" to "anon";

grant references on table "public"."profiles" to "anon";

grant select on table "public"."profiles" to "anon";

grant trigger on table "public"."profiles" to "anon";

grant truncate on table "public"."profiles" to "anon";

grant update on table "public"."profiles" to "anon";

grant delete on table "public"."profiles" to "authenticated";

grant insert on table "public"."profiles" to "authenticated";

grant references on table "public"."profiles" to "authenticated";

grant select on table "public"."profiles" to "authenticated";

grant trigger on table "public"."profiles" to "authenticated";

grant truncate on table "public"."profiles" to "authenticated";

grant update on table "public"."profiles" to "authenticated";

grant delete on table "public"."profiles" to "service_role";

grant insert on table "public"."profiles" to "service_role";

grant references on table "public"."profiles" to "service_role";

grant select on table "public"."profiles" to "service_role";

grant trigger on table "public"."profiles" to "service_role";

grant truncate on table "public"."profiles" to "service_role";

grant update on table "public"."profiles" to "service_role";


