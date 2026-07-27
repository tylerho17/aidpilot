-- AidPilot: private document storage so students can upload the docs their aid
-- office asks for (verification paperwork, appeal documentation). PII-sensitive:
-- a PRIVATE bucket + strict per-user-folder RLS on storage.objects, so a student
-- can only ever see/upload/delete files under their own auth.uid() folder.
-- Files are served via short-lived signed URLs, never public.
--
-- ⚠️ SECURITY REVIEW BEFORE REAL USE: confirm these policies in the Supabase
-- dashboard (Storage → Policies) and test that user A cannot read user B's files.
-- Safe to rerun.

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'student-docs', 'student-docs', false, 10485760,
  array['application/pdf','image/png','image/jpeg','image/heic']
)
on conflict (id) do update
  set public = false,
      file_size_limit = 10485760,
      allowed_mime_types = array['application/pdf','image/png','image/jpeg','image/heic'];

-- Per-user folder isolation: the first path segment must equal the user's id.
drop policy if exists "Users read own docs" on storage.objects;
create policy "Users read own docs" on storage.objects
  for select to authenticated
  using (bucket_id = 'student-docs' and (storage.foldername(name))[1] = auth.uid()::text);

drop policy if exists "Users upload own docs" on storage.objects;
create policy "Users upload own docs" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'student-docs' and (storage.foldername(name))[1] = auth.uid()::text);

drop policy if exists "Users delete own docs" on storage.objects;
create policy "Users delete own docs" on storage.objects
  for delete to authenticated
  using (bucket_id = 'student-docs' and (storage.foldername(name))[1] = auth.uid()::text);
