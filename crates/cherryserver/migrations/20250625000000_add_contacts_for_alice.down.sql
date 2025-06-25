-- Add down migration script here

-- 删除 alice 的所有联系人
DELETE FROM contacts 
WHERE owner_id = (SELECT user_id FROM users WHERE username = 'alice'); 