# Supabase Setup SQL
# Run this in your Supabase SQL editor to create the rsvps table

create table rsvps (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  email text not null,
  attending boolean not null,
  adults_count integer default 1,
  kids_count integer default 0,
  dietary_restrictions text,
  staying_until_night boolean,
  song_request text,
  comments text,
  created_at timestamp with time zone default now()
);

-- Enable Row Level Security
alter table rsvps enable row level security;

-- Allow anon to insert (for RSVP submissions)
create policy "Allow anonymous inserts" on rsvps
  for insert
  to anon
  with check (true);

-- Allow authenticated users to read all RSVPs (for admin)
create policy "Allow auth read" on rsvps
  for select
  to authenticated
  using (true);
