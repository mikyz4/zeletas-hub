create schema if not exists private;

create or replace function private.is_conversation_member(target_conversation_id uuid, target_user_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.conversation_members
    where conversation_id = target_conversation_id and user_id = target_user_id
  );
$$;

revoke all on function private.is_conversation_member(uuid, uuid) from public, anon;
grant usage on schema private to authenticated;
grant execute on function private.is_conversation_member(uuid, uuid) to authenticated;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles(user_id, display_name, avatar_url)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', 'Usuario Zeletas'),
    new.raw_user_meta_data->>'avatar_url'
  )
  on conflict (user_id) do nothing;
  return new;
end;
$$;

revoke execute on function public.handle_new_user() from public, anon, authenticated;
grant execute on function public.handle_new_user() to postgres;

drop policy if exists conversation_members_select_member on public.conversation_members;
create policy conversation_members_select_member
on public.conversation_members
for select to authenticated
using ((select private.is_conversation_member(conversation_id, (select auth.uid()))));

drop policy if exists conversations_select_member on public.conversations;
create policy conversations_select_member
on public.conversations
for select to authenticated
using ((select private.is_conversation_member(id, (select auth.uid()))));

drop policy if exists messages_select_member on public.messages;
create policy messages_select_member
on public.messages
for select to authenticated
using ((select private.is_conversation_member(conversation_id, (select auth.uid()))));

drop policy if exists messages_insert_member on public.messages;
create policy messages_insert_member
on public.messages
for insert to authenticated
with check (
  (select auth.uid()) = sender_id
  and (select private.is_conversation_member(conversation_id, (select auth.uid())))
);