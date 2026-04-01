-- Run this in your Supabase SQL editor

create table resumes (
  id uuid default gen_random_uuid() primary key,
  filename text not null,
  extracted_text text,
  score numeric default 0,
  matched_keywords text[],
  uploaded_at timestamp with time zone default now()
);

-- Storage bucket
insert into storage.buckets (id, name, public) values ('resumes', 'resumes', false);

create policy "Allow uploads" on storage.objects
  for insert with check (bucket_id = 'resumes');

create policy "Allow reads" on storage.objects
  for select using (bucket_id = 'resumes');
