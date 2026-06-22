-- Ejecutar en Supabase SQL Editor

create table if not exists public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  current_level text not null default 'A1' check (current_level in ('A1', 'A2')),
  ui_toggles jsonb not null default '{"showAudio":true,"showText":true,"showInput":false,"showHints":true}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.srs_progress (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  japanese_phrase text not null,
  interval_days integer not null default 1,
  next_review timestamptz not null default now() + interval '1 day',
  ease_factor float not null default 2.5,
  created_at timestamptz not null default now(),
  unique (user_id, japanese_phrase)
);

create table if not exists public.forgotten_vocab (
  user_id    uuid not null references public.users(id) on delete cascade,
  forma      text not null,
  created_at timestamptz not null default now(),
  primary key (user_id, forma)
);

-- Row Level Security
alter table public.users enable row level security;
alter table public.srs_progress enable row level security;

create policy "Users can manage own data" on public.users
  for all using (auth.uid() = id);

create policy "Users can manage own SRS" on public.srs_progress
  for all using (auth.uid() = user_id);

alter table public.forgotten_vocab enable row level security;

create policy "Users can manage own forgotten vocab" on public.forgotten_vocab
  for all using (auth.uid() = user_id);

-- Auto-crear perfil al registrarse
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.users (id, email)
  values (new.id, new.email);
  return new;
end;
$$;

create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
