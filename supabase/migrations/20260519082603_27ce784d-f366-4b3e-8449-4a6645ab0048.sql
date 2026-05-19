
create table public.leads (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  budget_tier text not null,
  message text not null,
  created_at timestamptz not null default now()
);

alter table public.leads enable row level security;

create policy "Anyone can submit a lead"
  on public.leads for insert
  to anon, authenticated
  with check (true);
