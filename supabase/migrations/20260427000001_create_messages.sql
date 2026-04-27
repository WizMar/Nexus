create table if not exists messages (
  id          uuid        primary key default gen_random_uuid(),
  org_id      text        not null,
  sender_id   uuid        not null references auth.users(id) on delete cascade,
  content     text        not null check (char_length(content) > 0 and char_length(content) <= 2000),
  created_at  timestamptz default now()
);

create index on messages(org_id, created_at desc);

alter table messages enable row level security;

create policy "org members can view messages"
  on messages for select to authenticated
  using (org_id = (select org_id::text from profiles where id = auth.uid()));

create policy "org members can send messages"
  on messages for insert to authenticated
  with check (
    sender_id = auth.uid() and
    org_id = (select org_id::text from profiles where id = auth.uid())
  );

alter publication supabase_realtime add table messages;
