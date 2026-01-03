-- Create api_keys table
create table if not exists api_keys (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  key text not null unique,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  last_used_at timestamp with time zone,
  is_active boolean default true
);

-- RLS policies
alter table api_keys enable row level security;

create policy "Admins can view all api keys"
  on api_keys for select
  using ( auth.role() = 'authenticated' );

create policy "Admins can insert api keys"
  on api_keys for insert
  with check ( auth.role() = 'authenticated' );

create policy "Admins can update api keys"
  on api_keys for update
  using ( auth.role() = 'authenticated' );

create policy "Admins can delete api keys"
  on api_keys for delete
  using ( auth.role() = 'authenticated' );

-- Function to validate API key (for API routes)
-- This function can be called with security definer to bypass RLS for API routes
create or replace function validate_api_key(api_key text)
returns boolean
language plpgsql
security definer
as $$
begin
  if exists (
    select 1 from api_keys 
    where key = api_key 
    and is_active = true
  ) then
    -- Update last_used_at
    update api_keys 
    set last_used_at = now() 
    where key = api_key;
    return true;
  end if;
  return false;
end;
$$;
