-- Ensure the evidence storage bucket exists with appropriate limits
drop function if exists public.get_evidence_org_id(text);

insert into storage.buckets (id, name, public, file_size_limit)
values 
  ('evidence', 'evidence', false, 52428800),
  ('evidence-files', 'evidence-files', false, 52428800)
on conflict (id) do update
set public = excluded.public,
    file_size_limit = excluded.file_size_limit;

-- Storage access policies for evidence assets
create or replace function public.get_evidence_org_id(object_name text)
returns uuid as $$
begin
  -- Expecting paths like '<org_uuid>/filename.ext'
  if position('/' in object_name) = 0 then
    return null;
  end if;
  return split_part(object_name, '/', 1)::uuid;
exception
  when invalid_text_representation then
    return null;
end;
$$ language plpgsql security definer;

drop policy if exists "Org members can view evidence files" on storage.objects;
create policy "Org members can view evidence files"
  on storage.objects for select
  using (
    bucket_id = any (array['evidence','evidence-files'])
    and auth.role() = 'authenticated'
    and exists (
      select 1
      from public.users u
      where u.id = auth.uid()
        and u.org_id = public.get_evidence_org_id(name)
    )
  );

drop policy if exists "Org members can upload evidence files" on storage.objects;
create policy "Org members can upload evidence files"
  on storage.objects for insert
  with check (
    bucket_id = any (array['evidence','evidence-files'])
    and auth.role() = 'authenticated'
    and exists (
      select 1
      from public.users u
      where u.id = auth.uid()
        and u.org_id = public.get_evidence_org_id(name)
    )
  );

drop policy if exists "Org members can update evidence files" on storage.objects;
create policy "Org members can update evidence files"
  on storage.objects for update
  using (
    bucket_id = any (array['evidence','evidence-files'])
    and auth.role() = 'authenticated'
    and exists (
      select 1
      from public.users u
      where u.id = auth.uid()
        and u.org_id = public.get_evidence_org_id(name)
    )
  )
  with check (
    bucket_id = any (array['evidence','evidence-files'])
    and auth.role() = 'authenticated'
    and exists (
      select 1
      from public.users u
      where u.id = auth.uid()
        and u.org_id = public.get_evidence_org_id(name)
    )
  );

drop policy if exists "Org members can delete evidence files" on storage.objects;
create policy "Org members can delete evidence files"
  on storage.objects for delete
  using (
    bucket_id = any (array['evidence','evidence-files'])
    and auth.role() = 'authenticated'
    and exists (
      select 1
      from public.users u
      where u.id = auth.uid()
        and u.org_id = public.get_evidence_org_id(name)
    )
  );

-- RLS for evidence_files table
alter table if exists public.evidence_files enable row level security;

drop policy if exists "Org members can view evidence records" on public.evidence_files;
create policy "Org members can view evidence records"
  on public.evidence_files for select
  using (
    auth.role() = 'authenticated'
    and exists (
      select 1
      from public.users u
      where u.id = auth.uid()
        and u.org_id = public.evidence_files.organization_id
    )
  );

drop policy if exists "Org members can insert evidence records" on public.evidence_files;
create policy "Org members can insert evidence records"
  on public.evidence_files for insert
  with check (
    auth.role() = 'authenticated'
    and exists (
      select 1
      from public.users u
      where u.id = auth.uid()
        and u.org_id = public.evidence_files.organization_id
    )
  );

drop policy if exists "Org members can update evidence records" on public.evidence_files;
create policy "Org members can update evidence records"
  on public.evidence_files for update
  using (
    auth.role() = 'authenticated'
    and exists (
      select 1
      from public.users u
      where u.id = auth.uid()
        and u.org_id = public.evidence_files.organization_id
    )
  )
  with check (
    auth.role() = 'authenticated'
    and exists (
      select 1
      from public.users u
      where u.id = auth.uid()
        and u.org_id = public.evidence_files.organization_id
    )
  );

drop policy if exists "Org members can delete evidence records" on public.evidence_files;
create policy "Org members can delete evidence records"
  on public.evidence_files for delete
  using (
    auth.role() = 'authenticated'
    and exists (
      select 1
      from public.users u
      where u.id = auth.uid()
        and u.org_id = public.evidence_files.organization_id
    )
  );

-- Enforce file size/type constraints at the database level
alter table if exists public.evidence_files
drop constraint if exists evidence_files_file_size_limit;
alter table if exists public.evidence_files
  add constraint evidence_files_file_size_limit
  check (file_size <= 52428800);

alter table if exists public.evidence_files
drop constraint if exists evidence_files_allowed_file_type;
alter table if exists public.evidence_files
  add constraint evidence_files_allowed_file_type
  check (
    evidence_type is distinct from 'file'
    or file_type = any (
      array[
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'application/vnd.ms-powerpoint',
        'application/vnd.openxmlformats-officedocument.presentationml.presentation',
        'image/png',
        'image/jpeg',
        'text/plain',
        'text/csv'
      ]::text[]
    )
  );
