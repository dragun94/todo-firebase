-- Already applied to qpvbzzpsknaqabyagrsb (see README).
-- Shared list, intentionally available without login.
create table public.todos (
  id uuid primary key default gen_random_uuid(),
  text text not null check (char_length(btrim(text)) between 1 and 200),
  completed boolean not null default false,
  created_at timestamptz not null default now()
);
create index todos_created_at_id_idx on public.todos (created_at desc, id desc);
alter table public.todos enable row level security;
grant select, insert, update, delete on public.todos to anon, authenticated;
create policy "Public todo select" on public.todos for select to anon, authenticated using (true);
create policy "Public todo insert" on public.todos for insert to anon, authenticated with check (true);
create policy "Public todo update" on public.todos for update to anon, authenticated using (true) with check (true);
create policy "Public todo delete" on public.todos for delete to anon, authenticated using (true);
comment on table public.todos is 'Shared todo list: intentionally accessible without login.';
