-- Job Command schema (optional cloud sync)
-- Apply in the Supabase SQL editor, then enable Realtime on employees.

create table if not exists public.companies (
  id text primary key,
  payload jsonb not null,
  updated_at timestamptz not null default now()
);

create table if not exists public.employees (
  id text primary key,
  payload jsonb not null,
  updated_at timestamptz not null default now()
);

create table if not exists public.jobs (
  id text primary key,
  payload jsonb not null,
  updated_at timestamptz not null default now()
);

create table if not exists public.expenses (
  id text primary key,
  payload jsonb not null,
  updated_at timestamptz not null default now()
);

alter table public.companies enable row level security;
alter table public.employees enable row level security;
alter table public.jobs enable row level security;
alter table public.expenses enable row level security;

create policy "anon_read_companies" on public.companies for select using (true);
create policy "anon_write_companies" on public.companies for all using (true) with check (true);
create policy "anon_read_employees" on public.employees for select using (true);
create policy "anon_write_employees" on public.employees for all using (true) with check (true);
create policy "anon_read_jobs" on public.jobs for select using (true);
create policy "anon_write_jobs" on public.jobs for all using (true) with check (true);
create policy "anon_read_expenses" on public.expenses for select using (true);
create policy "anon_write_expenses" on public.expenses for all using (true) with check (true);

alter publication supabase_realtime add table public.employees;
