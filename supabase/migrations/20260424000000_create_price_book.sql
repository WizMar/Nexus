create table if not exists price_book (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references organizations(id) on delete cascade,
  name text not null,
  description text not null default '',
  category text not null default 'Misc',
  unit text not null default 'ea',
  unit_price numeric not null default 0,
  created_at timestamptz not null default now()
);

alter table price_book enable row level security;

create policy "org members can read price_book"
  on price_book for select
  using (org_id = (select org_id from profiles where id = auth.uid()));

create policy "org members can insert price_book"
  on price_book for insert
  with check (org_id = (select org_id from profiles where id = auth.uid()));

create policy "org members can update price_book"
  on price_book for update
  using (org_id = (select org_id from profiles where id = auth.uid()));

create policy "org members can delete price_book"
  on price_book for delete
  using (org_id = (select org_id from profiles where id = auth.uid()));
