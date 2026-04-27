-- Fix chicken-and-egg: creator couldn't see their own channel before members were added,
-- causing the channel_members insert to fail its with-check.
drop policy if exists "view channels you belong to" on channels;

create policy "view channels you belong to"
  on channels for select to authenticated
  using (
    created_by = auth.uid()
    or exists (
      select 1 from channel_members where channel_id = channels.id and user_id = auth.uid()
    )
  );
