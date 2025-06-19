-- This file should undo anything in `up.sql`

-- 先删除索引
DROP INDEX IF EXISTS idx_contacts_relation;
DROP INDEX IF EXISTS idx_contacts_owner;
DROP INDEX IF EXISTS idx_streams_stream_id;
DROP INDEX IF EXISTS idx_streams_owner;

-- 先删除依赖表（子表）
DROP TABLE IF EXISTS contact_details;
DROP TABLE IF EXISTS contacts;
DROP TABLE IF EXISTS streams;
DROP TABLE IF EXISTS conversations;

-- 最后删除被依赖的表（父表）
DROP TABLE IF EXISTS users;