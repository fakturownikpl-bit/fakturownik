-- Fakturownik – Supabase schema
-- Uruchom w: Supabase Dashboard → SQL Editor → New Query

-- Strefa czasowa
alter database postgres set timezone to 'Europe/Warsaw';

-- ─── Firmy (dane firmy per użytkownik) ──────────────────────────────────────
create table if not exists firmy (
  id         bigserial primary key,
  user_id    uuid references auth.users(id) on delete cascade not null,
  nazwa      text not null default '',
  nip        text not null default '',
  adres      text not null default '',
  email      text not null default '',
  tel        text not null default '',
  nr_konta   text not null default '',
  unique(user_id)
);

alter table firmy enable row level security;

create policy "Użytkownik widzi tylko swoją firmę"
  on firmy for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ─── Klienci ─────────────────────────────────────────────────────────────────
create table if not exists klienci (
  id         bigserial primary key,
  user_id    uuid references auth.users(id) on delete cascade not null,
  nazwa      text not null,
  email      text not null default '',
  tel        text not null default '',
  adres      text not null default '',
  nip        text not null default '',
  created_at timestamptz not null default now()
);

alter table klienci enable row level security;

create policy "Użytkownik widzi tylko swoich klientów"
  on klienci for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ─── Faktury ─────────────────────────────────────────────────────────────────
create table if not exists faktury (
  id         text primary key,          -- np. FV/2026/06/001
  user_id    uuid references auth.users(id) on delete cascade not null,
  klient_id  bigint references klienci(id) on delete set null,
  data       date not null,
  termin     date not null,
  status     text not null check (status in ('oplacona','nieoplacona','projekt','przeterminowana')),
  pozycje    jsonb not null default '[]',
  uwagi      text not null default '',
  created_at timestamptz not null default now()
);

alter table faktury enable row level security;

create policy "Użytkownik widzi tylko swoje faktury"
  on faktury for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ─── Indeksy ─────────────────────────────────────────────────────────────────
create index if not exists faktury_user_id_idx  on faktury(user_id);
create index if not exists klienci_user_id_idx  on klienci(user_id);
