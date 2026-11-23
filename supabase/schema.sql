-- Luciérnagas · esquema de recepción y gestión de propuestas
-- Ejecutar en el SQL Editor de un proyecto Supabase dedicado a Luciérnagas.
-- No usar el proyecto de otros sistemas sin una decisión expresa.
-- Requiere la extensión pgcrypto (gen_random_uuid() está disponible en Supabase).

create schema if not exists private;
revoke all on schema private from public;
revoke all on schema private from anon, authenticated;

create table if not exists private.coordinadores (
  usuario_id uuid primary key references auth.users(id) on delete cascade,
  habilitado boolean not null default true,
  creado_en timestamptz not null default now()
);
alter table private.coordinadores enable row level security;
revoke all on private.coordinadores from public, anon, authenticated;

create table if not exists public.solicitudes (
  id uuid primary key default gen_random_uuid(),
  tipo text not null check (tipo in ('materiales','tutorias','talleres','alianzas','otros')),
  nombre text not null check (char_length(trim(nombre)) between 3 and 90),
  correo text check (correo is null or (char_length(correo)<=254 and correo ~ '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$')),
  telefono text check (telefono is null or (char_length(telefono) between 7 and 25)),
  ciudad text not null check (char_length(trim(ciudad)) between 1 and 100),
  descripcion text not null check (char_length(trim(descripcion)) between 12 and 1600),
  autorizacion boolean not null default false check (autorizacion = true),
  estado text not null default 'nueva' check (estado in ('nueva','contactada','en_coordinacion','completada','archivada')),
  nota_interna text not null default '' check (char_length(nota_interna) <= 3000),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint contacto_requerido check (
    (correo is not null and length(trim(correo)) > 0)
    or (telefono is not null and length(trim(telefono)) > 0)
  )
);
create index if not exists solicitudes_fecha_idx on public.solicitudes (created_at desc);
create index if not exists solicitudes_estado_idx on public.solicitudes (estado);
create index if not exists solicitudes_tipo_idx on public.solicitudes (tipo);
alter table public.solicitudes enable row level security;

-- Resuelve el rol de coordinación con un SELECT privado.
-- El resultado es un booleano; la tabla de administradores no se expone al cliente.
-- La función con privilegios elevados vive en un esquema NO expuesto a la API.
-- Solo puede comprobar la cuenta que inició sesión; devuelve true o false.
create or replace function private.es_coordinador_interno()
returns boolean language sql stable security definer set search_path = ''
as $$
  select (select auth.uid()) is not null
    and exists (
      select 1 from private.coordinadores c
      where c.usuario_id = (select auth.uid())
        and c.habilitado = true
    );
$$;
revoke all on function private.es_coordinador_interno() from public, anon, authenticated;
grant usage on schema private to authenticated;
grant execute on function private.es_coordinador_interno() to authenticated;

create or replace function public.es_coordinador()
returns boolean language sql stable security invoker set search_path = ''
as $$ select private.es_coordinador_interno(); $$;
revoke all on function public.es_coordinador() from public, anon, authenticated;
grant execute on function public.es_coordinador() to authenticated;

-- Políticas para un proyecto dedicado, inicialmente vacío.

create policy "Luciérnagas: recepción pública"
on public.solicitudes for insert to anon
with check (
  autorizacion = true
  and estado = 'nueva'
  and nota_interna = ''
);

create policy "Luciérnagas: consulta de coordinación"
on public.solicitudes for select to authenticated
using ((select public.es_coordinador()));

create policy "Luciérnagas: seguimiento de coordinación"
on public.solicitudes for update to authenticated
using ((select public.es_coordinador()))
with check ((select public.es_coordinador()));

-- Imprescindible: una persona anónima solo puede INSERTAR los campos de su propuesta.
-- No puede consultar listas, cambiar estados ni leer notas internas.
revoke all on public.solicitudes from public, anon, authenticated;
grant usage on schema public to anon, authenticated;
grant insert (tipo,nombre,correo,telefono,ciudad,descripcion,autorizacion)
  on public.solicitudes to anon;
grant select on public.solicitudes to authenticated;
grant update (estado,nota_interna,updated_at)
  on public.solicitudes to authenticated;

-- Salvaguarda del plan gratuito: 100 propuestas por cada ventana de 24 horas
-- y 3 por contacto por ventana. El bloqueo transaccional serializa la comprobación.
create or replace function private.limitar_solicitudes()
returns trigger language plpgsql security definer set search_path = ''
as $$
declare
  ultimas_24h integer;
  mismo_contacto integer;
begin
  perform pg_catalog.pg_advisory_xact_lock(77439123);

  select count(*) into ultimas_24h from public.solicitudes
  where created_at >= now() - interval '24 hours';
  if ultimas_24h >= 100 then
    raise exception 'RECEPCION_TEMPORALMENTE_LIMITADA' using errcode='P0001';
  end if;

  select count(*) into mismo_contacto from public.solicitudes
  where created_at >= now() - interval '24 hours'
    and (
      (new.correo is not null and correo is not null
       and pg_catalog.lower(pg_catalog.btrim(correo)) =
           pg_catalog.lower(pg_catalog.btrim(new.correo)))
      or (new.telefono is not null and telefono is not null
       and pg_catalog.regexp_replace(telefono, '[^0-9]', '', 'g') =
           pg_catalog.regexp_replace(new.telefono, '[^0-9]', '', 'g'))
    );
  if mismo_contacto >= 3 then
    raise exception 'CONTACTO_TEMPORALMENTE_LIMITADO' using errcode='P0001';
  end if;
  return new;
end;
$$;
revoke all on function private.limitar_solicitudes() from public, anon, authenticated;
drop trigger if exists trg_limitar_solicitudes on public.solicitudes;
create trigger trg_limitar_solicitudes before insert on public.solicitudes
for each row execute function private.limitar_solicitudes();

-- PASO MANUAL OBLIGATORIO, después de crear una cuenta en Authentication > Users:
-- Sustituye el UUID por el id real del usuario autorizado, y ejecútalo por separado.
-- insert into private.coordinadores (usuario_id, habilitado)
-- values ('COLOCA_AQUI_EL_UUID_DE_AUTH_USERS'::uuid, true)
-- on conflict (usuario_id) do update set habilitado = excluded.habilitado;

-- NOTAS DE SEGURIDAD:
-- 1. Configura la URL y clave PUBLICABLE en js/backend-config.js. Jamás service_role.
-- 2. Crea cuentas de coordinación de forma manual; no habilites registros innecesarios.
-- 3. La inserción anónima sigue siendo susceptible a spam; considera una Edge Function
--    con verificación Turnstile, límite por IP y moderación antes de escalar.
-- 4. Define un plazo de conservación de propuestas, aviso de privacidad y
--    procedimiento de acceso/eliminación de datos antes de operar públicamente.
-- 5. La autorización no depende de ocultar el enlace /admin/; la protege RLS.

-- Este archivo refleja la migración desplegada `crear_gestion_luciernagas_segura`.
