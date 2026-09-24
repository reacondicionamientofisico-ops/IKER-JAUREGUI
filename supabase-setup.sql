-- Ejecutar en Supabase: Dashboard > SQL Editor > New query
-- Proyecto: lhchtvohikbseduanaie

-- 1) Tabla de clientes -------------------------------------------------
create table if not exists public.clientes (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  estado text not null default 'nuevo' check (estado in ('nuevo', 'en_seguimiento', 'archivado')),
  values jsonb not null
);

alter table public.clientes enable row level security;

-- El formulario público (key anon, sin sesión) solo puede INSERTAR.
create policy "anon puede insertar clientes"
  on public.clientes
  for insert
  to anon
  with check (true);

-- Solo un usuario autenticado (admin logueado) puede leer, editar o borrar.
create policy "autenticados pueden leer clientes"
  on public.clientes
  for select
  to authenticated
  using (true);

create policy "autenticados pueden actualizar clientes"
  on public.clientes
  for update
  to authenticated
  using (true)
  with check (true);

create policy "autenticados pueden borrar clientes"
  on public.clientes
  for delete
  to authenticated
  using (true);

-- 2) Bucket de Storage para las fotos ----------------------------------
insert into storage.buckets (id, name, public)
values ('fotos-clientes', 'fotos-clientes', false)
on conflict (id) do nothing;

-- El formulario público puede subir fotos (pero no listarlas ni leerlas).
create policy "anon puede subir fotos"
  on storage.objects
  for insert
  to anon
  with check (bucket_id = 'fotos-clientes');

-- Solo el admin autenticado puede ver/leer las fotos (via URL firmada).
create policy "autenticados pueden leer fotos"
  on storage.objects
  for select
  to authenticated
  using (bucket_id = 'fotos-clientes');

create policy "autenticados pueden borrar fotos"
  on storage.objects
  for delete
  to authenticated
  using (bucket_id = 'fotos-clientes');

-- 3) Usuario admin -------------------------------------------------------
-- Crea el usuario admin manualmente en:
-- Dashboard > Authentication > Users > Add user (email + contraseña)
-- Ese email/contraseña serán los que uses para entrar en /login de la app.
