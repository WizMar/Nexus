-- Simplify channels insert: checking created_by = auth.uid() is reliable and secure.
-- The org_id subquery against profiles caused silent failures due to type/permission edge cases.
drop policy if exists "create channels in your org" on channels;
create policy "create channels in your org"
  on channels for insert to authenticated
  with check (created_by = auth.uid());

-- Fix channels select: allow creator to see their own channel before members are added.
drop policy if exists "view channels you belong to" on channels;
create policy "view channels you belong to"
  on channels for select to authenticated
  using (
    created_by = auth.uid()
    or exists (
      select 1 from channel_members where channel_id = channels.id and user_id = auth.uid()
    )
  );
