create policy contact_requests_no_direct_access on public.contact_requests for all to anon,authenticated using(false) with check(false);
create policy contact_rate_limits_no_direct_access on public.contact_rate_limits for all to anon,authenticated using(false) with check(false);
revoke execute on function public.handle_new_user() from public,anon,authenticated;
grant execute on function public.handle_new_user() to postgres;
create index if not exists contact_requests_user_id_idx on public.contact_requests(user_id);
create index if not exists conversation_members_user_id_idx on public.conversation_members(user_id);
create index if not exists conversations_listing_id_idx on public.conversations(listing_id);
create index if not exists messages_sender_id_idx on public.messages(sender_id);
