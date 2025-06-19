-- Add up migration script here
alter table users
add column IF NOT EXISTS avatar_url TEXT;

alter table users add column IF NOT EXISTS status TEXT NOT NULL DEFAULT 'online';