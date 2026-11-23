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
create or replace function public.es_coordinador()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from private.coordinadores c
    where c.usuario_id = (select auth.uid())
      and c.habilitado = true
  );
$$;

revoke all on function public.es_coordinador() from public;
revoke all on function public.es_coordinador() from anon;
grant execute on function public.es_coordinador() to authenticated;

-- Restablece las políticas de esta aplicación sin tocar otras tablas.
drop policy if exists "Luciérnagas: recepción pública" on public.solicitudes;
drop policy if exists "Luciérnagas: consulta de coordinación" on public.solicitudes;
drop policy if exists "Luciérnagas: seguimiento de coordinación" on public.solicitudes;

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

-- PASO MANUAL OBLIGATORIO, después de crear una cuenta en Authentication > Users:
-- Sustituye el UUID por el id real del usuario autorizado, y ejecútalo por separado.
-- insert into private.coordinadores (usuario_id, habilitado)
-- values ('COLOCA_AQUI_EL_UUID_DE_AUTH_USERS'::uuid, true)
-- on conflict (usuario_id) do update set habilitado = excluded.habilitado;

-- NOTAS DE SEGURIDAD:
-- 1. Configura la URL y clave PUBLICABLE en js/backend-config.js. Jamás service_role.
-- 2. Deshabilita el registro público de cuentas de coordinación si no lo necesitas.
-- 3. La inserción anónima sigue siendo susceptible a spam; considera una Edge Function
--    con verificación Turnstile, límite por IP y moderación antes de escalar.
-- 4. Define un plazo de conservación de propuestas, aviso de privacidad y
--    procedimiento de acceso/eliminación de datos antes de operar públicamente.
-- 5. La autorización no depende de ocultar el enlace /admin/; la protege RLS.
