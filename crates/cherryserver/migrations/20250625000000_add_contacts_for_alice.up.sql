-- Add up migration script here

-- 为 alice 添加所有其他用户作为联系人
INSERT INTO contacts (
    owner_id,
    target_id,
    relation_type,
    remark_name,
    tags,
    is_favorite,
    created_at,
    updated_at
)
SELECT 
    (SELECT user_id FROM users WHERE username = 'alice') as owner_id,
    u.user_id as target_id,
    'friend' as relation_type,
    u.username as remark_name,
    CASE 
        WHEN u.username IN ('bob', 'charlie', 'diana') THEN '["同事", "技术"]'::jsonb
        WHEN u.username IN ('eve', 'frank', 'grace') THEN '["同事", "项目"]'::jsonb
        WHEN u.username IN ('jack', 'kate', 'leo') THEN '["同事", "设计"]'::jsonb
        WHEN u.username IN ('nina', 'oscar', 'paula') THEN '["同事", "市场"]'::jsonb
        WHEN u.username IN ('rose', 'sam', 'tina') THEN '["同事", "客服"]'::jsonb
        ELSE '["同事"]'::jsonb
    END as tags,
    CASE 
        WHEN u.username IN ('bob', 'diana', 'eve') THEN true
        ELSE false
    END as is_favorite,
    NOW() as created_at,
    NOW() as updated_at
FROM users u
WHERE u.username != 'alice'
ON CONFLICT (owner_id, target_id) DO NOTHING; 