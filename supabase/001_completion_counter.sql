-- AidPilot v1 — anonymous aggregate completion counter (F6).
--
-- This is the ONLY server write in the app, and it is fully anonymous:
-- no identifiers, no answers, no PII. The client can only call the RPC below,
-- which does nothing but increment an integer. There is no per-user row and no
-- way to attribute a +1 to any person (AGENT_RULES.md Rule 1).

create table if not exists public.completion_counters (
  key text primary key,
  count bigint not null default 0,
  updated_at timestamptz not null default now()
);

-- Lock the table down: anon/authenticated get NO direct access. All increments
-- flow through the SECURITY DEFINER function, which cannot read or leak anything
-- (there is nothing personal to read).
alter table public.completion_counters enable row level security;
revoke all on public.completion_counters from anon, authenticated;

create or replace function public.increment_completion(counter_key text)
returns bigint
language plpgsql
security definer
set search_path = public
as $$
declare
  new_count bigint;
begin
  -- Only a known aggregate key may be incremented (prevents junk rows).
  if counter_key is null or counter_key <> 'completions' then
    raise exception 'invalid counter key';
  end if;

  insert into public.completion_counters (key, count, updated_at)
  values (counter_key, 1, now())
  on conflict (key)
  do update set count = public.completion_counters.count + 1, updated_at = now()
  returning count into new_count;

  return new_count;
end;
$$;

grant execute on function public.increment_completion(text) to anon, authenticated;
