-- supabase/migrations/0006_create_power_membership.sql
--
-- Create Power membership + block phase
--
-- Adds entitlement columns to profiles guarded by a trigger so the client
-- can never set program_member = true on its own. Only the
-- verify-membership edge function (service_role) writes these.

alter table profiles
  add column if not exists program_member boolean not null default false,
  add column if not exists join_email text,
  add column if not exists verified_at timestamptz,
  add column if not exists current_block text
    check (current_block in ('COMMIT','REFINE','EVOLVE','ADAPT','THRIVE','EXCEL')),
  add column if not exists non_member_diagnostic jsonb;

create or replace function public.prevent_client_entitlement_writes()
returns trigger as $$
declare
  caller_role text;
begin
  caller_role := coalesce(auth.role(), '');

  if caller_role <> 'service_role' then
    if new.program_member is distinct from old.program_member then
      raise exception 'program_member is server-set only';
    end if;
    if new.join_email is distinct from old.join_email then
      raise exception 'join_email is server-set only';
    end if;
    if new.verified_at is distinct from old.verified_at then
      raise exception 'verified_at is server-set only';
    end if;
    if new.current_block is distinct from old.current_block then
      raise exception 'current_block is server-set only';
    end if;
  end if;

  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists profiles_entitlement_guard on profiles;
create trigger profiles_entitlement_guard
  before update on profiles
  for each row execute function public.prevent_client_entitlement_writes();

create index if not exists profiles_join_email_idx on profiles (join_email);
create index if not exists profiles_program_member_idx on profiles (program_member);

-- Short-lived OTP store. RLS enabled with no policies so only service_role
-- (the edge function) reads or writes.
create table if not exists membership_verification_otps (
  email text primary key,
  code text not null,
  expires_at timestamptz not null,
  created_at timestamptz not null default now()
);

alter table membership_verification_otps enable row level security;
