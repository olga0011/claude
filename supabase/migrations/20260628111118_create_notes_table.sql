create table notes (
  id bigint primary key generated always as identity,
  title text not null,
  body text,
  created_at timestamptz not null default now()
);

alter table notes enable row level security;
