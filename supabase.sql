-- Run this whole file once in Supabase: SQL Editor > New query > Run
-- Hackathon tip: Authentication → Providers → Email → disable "Confirm email"
-- so sign-up does not send mail and you avoid "email rate limit exceeded".
create extension if not exists btree_gist;

create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  role text not null check (role in ('student','faculty')),
  department text
);

create table rooms (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  type text not null check (type in ('Lab','Classroom','Seminar hall')),
  capacity int not null,
  equipment text[] default '{}',
  is_active boolean default true
);

create table bookings (
  id uuid primary key default gen_random_uuid(),
  room_id uuid not null references rooms(id),
  requested_by uuid not null references profiles(id) on delete cascade,
  start_time timestamptz not null,
  end_time timestamptz not null,
  purpose text not null,
  status text not null default 'pending' check (status in ('pending','approved','rejected')),
  reviewed_by uuid references profiles(id) on delete set null,
  reason text,
  created_at timestamptz default now(),
  check (end_time > start_time),
  -- two approved bookings can never overlap in the same room
  constraint no_overlap exclude using gist (room_id with =, tstzrange(start_time, end_time) with &&) where (status = 'approved')
);

-- New signups get a profile; role comes from sign-up metadata (student or faculty).
create or replace function handle_new_user() returns trigger language plpgsql security definer set search_path = public as $$
declare r text := coalesce(new.raw_user_meta_data->>'role', 'student');
begin
  if r not in ('student', 'faculty') then r := 'student'; end if;
  insert into profiles (id, full_name, role, department)
  values (new.id, coalesce(new.raw_user_meta_data->>'full_name','User'), r, new.raw_user_meta_data->>'department');
  return new;
end $$;
create trigger on_auth_user_created after insert on auth.users for each row execute function handle_new_user();

create or replace function is_faculty() returns boolean language sql security definer stable set search_path = public as
$$ select exists (select 1 from profiles where id = auth.uid() and role = 'faculty') $$;

-- Vacant rooms for a time window (students can't read other people's bookings, so this runs with elevated rights)
create or replace function available_rooms(p_start timestamptz, p_end timestamptz, p_min_cap int default 0, p_type text default null)
returns setof rooms language sql security definer stable set search_path = public as $$
  select r.* from rooms r
  where r.is_active and r.capacity >= p_min_cap and (p_type is null or r.type = p_type)
    and not exists (select 1 from bookings b where b.room_id = r.id and b.status = 'approved'
                    and tstzrange(b.start_time, b.end_time) && tstzrange(p_start, p_end))
  order by r.name $$;

alter table profiles enable row level security;
alter table rooms enable row level security;
alter table bookings enable row level security;

create policy "read own or faculty" on profiles for select using (id = auth.uid() or is_faculty());
create policy "read rooms" on rooms for select to authenticated using (true);
create policy "read own or faculty" on bookings for select using (requested_by = auth.uid() or is_faculty());
create policy "request a room" on bookings for insert with check (requested_by = auth.uid() and status = 'pending');
create policy "faculty decide" on bookings for update using (is_faculty());
create policy "cancel own pending" on bookings for delete using (requested_by = auth.uid() and status = 'pending');

-- Remove auth user + profile (bookings cascade via requested_by; reviewed_by nulled).
create or replace function delete_own_account()
returns void language plpgsql security definer set search_path = public, auth as $$
begin
  if auth.uid() is null then raise exception 'Not signed in'; end if;
  delete from auth.users where id = auth.uid();
end $$;
revoke all on function delete_own_account() from public;
grant execute on function delete_own_account() to authenticated;

insert into rooms (name, type, capacity, equipment) values
 ('CS Lab 1','Lab',60,'{PCs,Projector}'), ('CS Lab 2','Lab',60,'{PCs}'),
 ('Electronics Lab','Lab',40,'{Oscilloscopes,Projector}'), ('Room 101','Classroom',70,'{Projector}'),
 ('Room 204','Classroom',60,'{}'), ('Seminar Hall','Seminar hall',150,'{Projector,Mic system}');

-- Already created the DB? Run this once in SQL Editor so Auth → Delete user works:
-- alter table bookings drop constraint if exists bookings_requested_by_fkey;
-- alter table bookings add constraint bookings_requested_by_fkey
--   foreign key (requested_by) references profiles(id) on delete cascade;
-- alter table bookings drop constraint if exists bookings_reviewed_by_fkey;
-- alter table bookings add constraint bookings_reviewed_by_fkey
--   foreign key (reviewed_by) references profiles(id) on delete set null;
