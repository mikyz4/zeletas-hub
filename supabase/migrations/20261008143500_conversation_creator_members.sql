drop policy if exists conversation_members_insert_self on public.conversation_members;
create policy conversation_members_insert_by_creator
on public.conversation_members
for insert to authenticated
with check (
  exists (
    select 1 from public.conversations c
    where c.id=conversation_id and c.created_by=(select auth.uid())
  )
);
