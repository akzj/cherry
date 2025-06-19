-- Add down migration script here
alter table users drop column IF EXISTS avatar_url;
alter table users drop column IF EXISTS status;