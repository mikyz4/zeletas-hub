-- Zeletas Hub: initial application schema and RLS.
-- Apply with Supabase migrations; no destructive operations.

create table if not exists public.profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  display_name text, account_type text not null default 'personal' check (account_type in ('personal','pro','business')),
  avatar_url text, bio text, address text, gender text, birthdate date,
  public_profile boolean not null default true, sms_alerts boolean not null default false,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table if not exists public.listings (
  id uuid primary key default gen_random_uuid(), owner_id uuid not null references auth.users(id) on delete cascade,
  category text not null check (category in ('general','vehiculos','inmobiliaria','servicios')),
  title text not null check (char_length(trim(title)) between 3 and 120),
  description text not null check (char_length(trim(description)) between 10 and 5000),
  price numeric(12,2) check (price is null or price >= 0), currency text not null default 'EUR' check (currency='EUR'),
  city text, status text not null default 'published' check (status in ('published','sold','archived')),
  metadata jsonb not null default '{}'::jsonb, created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table if not exists public.contact_requests (
  id uuid primary key default gen_random_uuid(), user_id uuid references auth.users(id) on delete set null,
  name text not null check (char_length(trim(name)) between 2 and 120),
  email text not null check (char_length(trim(email)) between 5 and 320), phone text, subject text,
  message text not null check (char_length(trim(message)) between 10 and 5000),
  status text not null default 'new' check (status in ('new','in_progress','resolved','spam')), created_at timestamptz not null default now()
);
create table if not exists public.conversations (
  id uuid primary key default gen_random_uuid(), listing_id uuid references public.listings(id) on delete set null,
  created_by uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table if not exists public.conversation_members (
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade, joined_at timestamptz not null default now(),
  primary key (conversation_id,user_id)
);
create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(), conversation_id uuid not null references public.conversations(id) on delete cascade,
  sender_id uuid not null references auth.users(id) on delete cascade,
  body text not null check (char_length(trim(body)) between 1 and 5000), created_at timestamptz not null default now()
);
create table if not exists public.contact_rate_limits (key_hash text primary key, last_request_at timestamptz not null);

create or replace function public.set_updated_at() returns trigger language plpgsql security invoker set search_path=public as $$
begin new.updated_at=now(); return new; end; $$;
drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at before update on public.profiles for each row execute function public.set_updated_at();
drop trigger if exists listings_set_updated_at on public.listings;
create trigger listings_set_updated_at before update on public.listings for each row execute function public.set_updated_at();
drop trigger if exists conversations_set_updated_at on public.conversations;
create trigger conversations_set_updated_at before update on public.conversations for each row execute function public.set_updated_at();

create or replace function public.handle_new_user() returns trigger language plpgsql security definer set search_path=public as $$
begin
  insert into public.profiles(user_id,display_name,avatar_url)
  values(new.id,coalesce(new.raw_user_meta_data->>'full_name',new.raw_user_meta_data->>'name'),'')
  on conflict(user_id) do nothing;
  return new;
end; $$;
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users for each row execute function public.handle_new_user();

insert into public.profiles(user_id,display_name)
select id,coalesce(raw_user_meta_data->>'full_name',raw_user_meta_data->>'name','Usuario Zeletas') from auth.users
on conflict(user_id) do nothing;

alter table public.profiles enable row level security;
alter table public.listings enable row level security;
alter table public.contact_requests enable row level security;
alter table public.conversations enable row level security;
alter table public.conversation_members enable row level security;
alter table public.messages enable row level security;
alter table public.contact_rate_limits enable row level security;

revoke all on public.profiles,public.listings,public.contact_requests,public.conversations,public.conversation_members,public.messages,public.contact_rate_limits from anon,authenticated;
grant select,insert,update on public.profiles to authenticated;
grant select on public.listings to anon,authenticated;
grant select,insert,update,delete on public.listings to authenticated;
grant select,insert on public.conversations to authenticated;
grant select,insert,delete on public.conversation_members to authenticated;
grant select,insert on public.messages to authenticated;

create policy profiles_select_own on public.profiles for select to authenticated using((select auth.uid())=user_id);
create policy profiles_insert_own on public.profiles for insert to authenticated with check((select auth.uid())=user_id);
create policy profiles_update_own on public.profiles for update to authenticated using((select auth.uid())=user_id) with check((select auth.uid())=user_id);

create policy listings_select_public on public.listings for select to anon,authenticated using(status='published' or (select auth.uid())=owner_id);
create policy listings_insert_own on public.listings for insert to authenticated with check((select auth.uid())=owner_id);
create policy listings_update_own on public.listings for update to authenticated using((select auth.uid())=owner_id) with check((select auth.uid())=owner_id);
create policy listings_delete_own on public.listings for delete to authenticated using((select auth.uid())=owner_id);

create policy conversations_select_member on public.conversations for select to authenticated using(exists(select 1 from public.conversation_members cm where cm.conversation_id=id and cm.user_id=(select auth.uid())));
create policy conversations_insert_own on public.conversations for insert to authenticated with check((select auth.uid())=created_by);
create policy conversation_members_select_member on public.conversation_members for select to authenticated using(exists(select 1 from public.conversation_members mine where mine.conversation_id=conversation_id and mine.user_id=(select auth.uid())));
create policy conversation_members_insert_self on public.conversation_members for insert to authenticated with check((select auth.uid())=user_id and exists(select 1 from public.conversations c where c.id=conversation_id and c.created_by=(select auth.uid())));
create policy conversation_members_delete_self on public.conversation_members for delete to authenticated using((select auth.uid())=user_id);
create policy messages_select_member on public.messages for select to authenticated using(exists(select 1 from public.conversation_members cm where cm.conversation_id=conversation_id and cm.user_id=(select auth.uid())));
create policy messages_insert_member on public.messages for insert to authenticated with check((select auth.uid())=sender_id and exists(select 1 from public.conversation_members cm where cm.conversation_id=conversation_id and cm.user_id=(select auth.uid())));

create index if not exists listings_owner_id_idx on public.listings(owner_id);
create index if not exists listings_status_category_idx on public.listings(status,category);
create index if not exists listings_created_at_idx on public.listings(created_at desc);
create index if not exists messages_conversation_created_at_idx on public.messages(conversation_id,created_at);
