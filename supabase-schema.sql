-- Notes (列點式筆記)
create table if not exists notes (
  id bigint generated always as identity primary key,
  tab text not null default 'Work',
  items jsonb not null default '[""]',
  updated_at timestamptz not null default now()
);

-- Todos
create table if not exists todos (
  id bigint generated always as identity primary key,
  text text not null,
  done boolean not null default false,
  created_at timestamptz not null default now()
);

-- Custom sites (使用者新增的快捷連結)
create table if not exists sites (
  id bigint generated always as identity primary key,
  label text not null,
  url text not null,
  category text not null default 'Tool',
  favicon text,
  created_at timestamptz not null default now()
);

-- 初始化 notes 兩個 tab
insert into notes (tab, items) values ('Work', '[""]') on conflict do nothing;
insert into notes (tab, items) values ('Personal', '[""]') on conflict do nothing;

-- 開放 anon 存取 (RLS)
alter table notes enable row level security;
alter table todos enable row level security;
alter table sites enable row level security;

create policy "Allow all on notes" on notes for all using (true) with check (true);
create policy "Allow all on todos" on todos for all using (true) with check (true);
create policy "Allow all on sites" on sites for all using (true) with check (true);
