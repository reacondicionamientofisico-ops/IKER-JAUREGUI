-- Ejecutar en Supabase: Dashboard > SQL Editor > New query
-- Proyecto: lhchtvohikbseduanaie

-- 1) Tabla de clientes -------------------------------------------------
create table if not exists public.clientes (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  estado text not null default 'activo' check (estado in ('activo', 'baja')),
  values jsonb not null
);

alter table public.clientes enable row level security;

-- El formulario público (key anon, sin sesión) solo puede INSERTAR.
create policy "anon puede insertar clientes"
  on public.clientes
  for insert
  to anon
  with check (true);

-- La app ya no tiene login: /clientes es de acceso directo, así que el
-- rol anon también necesita poder leer (además de authenticated, por si
-- en el futuro se reintroduce un login de administrador).
create policy "anon puede leer clientes"
  on public.clientes
  for select
  to anon
  using (true);

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

-- /clientes es de acceso directo sin login, así que anon también necesita
-- poder actualizar (cambiar estado, editar ficha) y borrar, igual que ya
-- puede insertar y leer.
create policy "anon puede actualizar clientes"
  on public.clientes
  for update
  to anon
  using (true)
  with check (true);

create policy "anon puede borrar clientes"
  on public.clientes
  for delete
  to anon
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

-- Como /clientes ya no requiere login, anon también necesita poder leer
-- las fotos (via URL firmada) para poder mostrarlas en la ficha del cliente.
create policy "anon puede leer fotos"
  on storage.objects
  for select
  to anon
  using (bucket_id = 'fotos-clientes');

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
