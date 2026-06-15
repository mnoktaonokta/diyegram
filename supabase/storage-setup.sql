-- Supabase Storage: uploads bucket ve anon yükleme politikası
-- Dashboard > SQL Editor içinde çalıştırın.

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'uploads',
  'uploads',
  true,
  10485760,
  array[
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/gif',
    'image/avif'
  ]
)
on conflict (id) do update
set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

create policy "Public read uploads"
on storage.objects
for select
to public
using (bucket_id = 'uploads');

create policy "Anon insert uploads"
on storage.objects
for insert
to anon, authenticated
with check (bucket_id = 'uploads');

create policy "Anon update own uploads"
on storage.objects
for update
to anon, authenticated
using (bucket_id = 'uploads')
with check (bucket_id = 'uploads');

create policy "Anon delete own uploads"
on storage.objects
for delete
to anon, authenticated
using (bucket_id = 'uploads');
