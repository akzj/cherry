-- Add up migration script here

-- 生成20个测试用户
INSERT INTO users (username, email, password_hash, avatar_url, status) VALUES
('alice', 'alice@example.com', 'password123', 'https://randomuser.me/api/portraits/women/1.jpg', 'online'),
('bob', 'bob@example.com', 'password123', 'https://randomuser.me/api/portraits/men/2.jpg', 'online'),
('charlie', 'charlie@example.com', 'password123', 'https://randomuser.me/api/portraits/men/3.jpg', 'away'),
('diana', 'diana@example.com', 'password123', 'https://randomuser.me/api/portraits/women/4.jpg', 'online'),
('eve', 'eve@example.com', 'password123', 'https://randomuser.me/api/portraits/women/5.jpg', 'offline'),
('frank', 'frank@example.com', 'password123', 'https://randomuser.me/api/portraits/men/6.jpg', 'online'),
('grace', 'grace@example.com', 'password123', 'https://randomuser.me/api/portraits/women/7.jpg', 'away'),
('henry', 'henry@example.com', 'password123', 'https://randomuser.me/api/portraits/men/8.jpg', 'online'),
('iris', 'iris@example.com', 'password123', 'https://randomuser.me/api/portraits/women/9.jpg', 'online'),
('jack', 'jack@example.com', 'password123', 'https://randomuser.me/api/portraits/men/10.jpg', 'offline'),
('kate', 'kate@example.com', 'password123', 'https://randomuser.me/api/portraits/women/11.jpg', 'online'),
('leo', 'leo@example.com', 'password123', 'https://randomuser.me/api/portraits/men/12.jpg', 'away'),
('mia', 'mia@example.com', 'password123', 'https://randomuser.me/api/portraits/women/13.jpg', 'online'),
('nina', 'nina@example.com', 'password123', 'https://randomuser.me/api/portraits/women/14.jpg', 'online'),
('oscar', 'oscar@example.com', 'password123', 'https://randomuser.me/api/portraits/men/15.jpg', 'offline'),
('paula', 'paula@example.com', 'password123', 'https://randomuser.me/api/portraits/women/16.jpg', 'online'),
('quinn', 'quinn@example.com', 'password123', 'https://randomuser.me/api/portraits/men/17.jpg', 'away'),
('rose', 'rose@example.com', 'password123', 'https://randomuser.me/api/portraits/women/18.jpg', 'online'),
('sam', 'sam@example.com', 'password123', 'https://randomuser.me/api/portraits/men/19.jpg', 'online'),
('tina', 'tina@example.com', 'password123', 'https://randomuser.me/api/portraits/women/20.jpg', 'online')
ON CONFLICT (username) DO NOTHING;

-- 为每个用户创建通知流
INSERT INTO streams (owner_id, stream_type, status, "offset", stream_meta, created_at, updated_at)
SELECT 
    user_id,
    'notification',
    'active',
    0,
    '{}'::jsonb,
    NOW(),
    NOW()
FROM users
WHERE username IN ('alice', 'bob', 'charlie', 'diana', 'eve', 'frank', 'grace', 'henry', 'iris', 'jack', 'kate', 'leo', 'mia', 'nina', 'oscar', 'paula', 'quinn', 'rose', 'sam', 'tina')
ON CONFLICT DO NOTHING;

-- 群组1: 技术讨论组
INSERT INTO streams (owner_id, stream_type, status, "offset", stream_meta, created_at, updated_at)
SELECT 
    (SELECT user_id FROM users WHERE username = 'alice'),
    'message',
    'active',
    0,
    '{"conversation_id": "group1"}'::jsonb,
    NOW(),
    NOW()
WHERE NOT EXISTS (SELECT 1 FROM streams WHERE stream_meta->>'conversation_id' = 'group1');

INSERT INTO conversations (conversation_type, members, meta, stream_id, created_at, updated_at)
SELECT 
    'group',
    json_build_array(
        (SELECT user_id FROM users WHERE username = 'alice'),
        (SELECT user_id FROM users WHERE username = 'bob'),
        (SELECT user_id FROM users WHERE username = 'charlie'),
        (SELECT user_id FROM users WHERE username = 'diana')
    ),
    '{"name": "技术讨论组", "description": "讨论最新技术趋势"}'::jsonb,
    (SELECT stream_id FROM streams WHERE stream_type = 'message' and stream_meta->>'conversation_id' = 'group1'  LIMIT 1),
    NOW(),
    NOW()
WHERE NOT EXISTS (SELECT 1 FROM conversations WHERE meta->>'name' = '技术讨论组');

-- 群组2: 项目管理组
INSERT INTO streams (owner_id, stream_type, status, "offset", stream_meta, created_at, updated_at)
SELECT 
    (SELECT user_id FROM users WHERE username = 'eve'),
    'message',
    'active',
    0,
    '{"conversation_id": "group2"}'::jsonb,
    NOW(),
    NOW()
WHERE NOT EXISTS (SELECT 1 FROM streams WHERE stream_meta->>'conversation_id' = 'group2');

INSERT INTO conversations (conversation_type, members, meta, stream_id, created_at, updated_at)
SELECT 
    'group',
    json_build_array(
        (SELECT user_id FROM users WHERE username = 'eve'),
        (SELECT user_id FROM users WHERE username = 'frank'),
        (SELECT user_id FROM users WHERE username = 'grace'),
        (SELECT user_id FROM users WHERE username = 'henry'),
        (SELECT user_id FROM users WHERE username = 'iris')
    ),
    '{"name": "项目管理组", "description": "项目进度跟踪"}'::jsonb,
    (SELECT stream_id FROM streams WHERE stream_type = 'message' and stream_meta->>'conversation_id' = 'group2'  LIMIT 1),
    NOW(),
    NOW()
WHERE NOT EXISTS (SELECT 1 FROM conversations WHERE meta->>'name' = '项目管理组');

-- 群组3: 设计团队
INSERT INTO streams (owner_id, stream_type, status, "offset", stream_meta, created_at, updated_at)
SELECT 
    (SELECT user_id FROM users WHERE username = 'jack'),
    'message',
    'active',
    0,
    '{"conversation_id": "group3"}'::jsonb,
    NOW(),
    NOW()
WHERE NOT EXISTS (SELECT 1 FROM streams WHERE stream_meta->>'conversation_id' = 'group3');

INSERT INTO conversations (conversation_type, members, meta, stream_id, created_at, updated_at)
SELECT 
    'group',
    json_build_array(
        (SELECT user_id FROM users WHERE username = 'jack'),
        (SELECT user_id FROM users WHERE username = 'kate'),
        (SELECT user_id FROM users WHERE username = 'leo'),
        (SELECT user_id FROM users WHERE username = 'mia')
    ),
    '{"name": "设计团队", "description": "UI/UX设计讨论"}'::jsonb,
    (SELECT stream_id FROM streams WHERE stream_type = 'message' and stream_meta->>'conversation_id' = 'group3'  LIMIT 1),
    NOW(),
    NOW()
WHERE NOT EXISTS (SELECT 1 FROM conversations WHERE meta->>'name' = '设计团队');

-- 群组4: 市场推广
INSERT INTO streams (owner_id, stream_type, status, "offset", stream_meta, created_at, updated_at)
SELECT 
    (SELECT user_id FROM users WHERE username = 'nina'),
    'message',
    'active',
    0,
    '{"conversation_id": "group4"}'::jsonb,
    NOW(),
    NOW()
WHERE NOT EXISTS (SELECT 1 FROM streams WHERE stream_meta->>'conversation_id' = 'group4');

INSERT INTO conversations (conversation_type, members, meta, stream_id, created_at, updated_at)
SELECT 
    'group',
    json_build_array(
        (SELECT user_id FROM users WHERE username = 'nina'),
        (SELECT user_id FROM users WHERE username = 'oscar'),
        (SELECT user_id FROM users WHERE username = 'paula'),
        (SELECT user_id FROM users WHERE username = 'quinn')
    ),
    '{"name": "市场推广", "description": "营销策略讨论"}'::jsonb,
    (SELECT stream_id FROM streams WHERE stream_type = 'message' and stream_meta->>'conversation_id' = 'group4'  LIMIT 1),
    NOW(),
    NOW()
WHERE NOT EXISTS (SELECT 1 FROM conversations WHERE meta->>'name' = '市场推广');

-- 群组5: 客服团队
INSERT INTO streams (owner_id, stream_type, status, "offset", stream_meta, created_at, updated_at)
SELECT 
    (SELECT user_id FROM users WHERE username = 'rose'),
    'message',
    'active',
    0,
    '{"conversation_id": "group5"}'::jsonb,
    NOW(),
    NOW()
WHERE NOT EXISTS (SELECT 1 FROM streams WHERE stream_meta->>'conversation_id' = 'group5');

INSERT INTO conversations (conversation_type, members, meta, stream_id, created_at, updated_at)
SELECT 
    'group',
    json_build_array(
        (SELECT user_id FROM users WHERE username = 'rose'),
        (SELECT user_id FROM users WHERE username = 'sam'),
        (SELECT user_id FROM users WHERE username = 'tina'),
        (SELECT user_id FROM users WHERE username = 'alice')
    ),
    '{"name": "客服团队", "description": "客户服务支持"}'::jsonb,
    (SELECT stream_id FROM streams WHERE stream_type = 'message' and stream_meta->>'conversation_id' = 'group5'  LIMIT 1),
    NOW(),
    NOW()
WHERE NOT EXISTS (SELECT 1 FROM conversations WHERE meta->>'name' = '客服团队');

-- 群组6: 产品开发
INSERT INTO streams (owner_id, stream_type, status, "offset", stream_meta, created_at, updated_at)
SELECT 
    (SELECT user_id FROM users WHERE username = 'bob'),
    'message',
    'active',
    0,
    '{"conversation_id": "group6"}'::jsonb,
    NOW(),
    NOW()
WHERE NOT EXISTS (SELECT 1 FROM streams WHERE stream_meta->>'conversation_id' = 'group6');

INSERT INTO conversations (conversation_type, members, meta, stream_id, created_at, updated_at)
SELECT 
    'group',
    json_build_array(
        (SELECT user_id FROM users WHERE username = 'bob'),
        (SELECT user_id FROM users WHERE username = 'charlie'),
        (SELECT user_id FROM users WHERE username = 'diana'),
        (SELECT user_id FROM users WHERE username = 'eve'),
        (SELECT user_id FROM users WHERE username = 'frank')
    ),
    '{"name": "产品开发", "description": "产品功能开发讨论"}'::jsonb,
    (SELECT stream_id FROM streams WHERE stream_type = 'message' and stream_meta->>'conversation_id' = 'group6'  LIMIT 1),
    NOW(),
    NOW()
WHERE NOT EXISTS (SELECT 1 FROM conversations WHERE meta->>'name' = '产品开发');

-- 群组7: 数据分析
INSERT INTO streams (owner_id, stream_type, status, "offset", stream_meta, created_at, updated_at)
SELECT 
    (SELECT user_id FROM users WHERE username = 'grace'),
    'message',
    'active',
    0,
    '{"conversation_id": "group7"}'::jsonb,
    NOW(),
    NOW()
WHERE NOT EXISTS (SELECT 1 FROM streams WHERE stream_meta->>'conversation_id' = 'group7');

INSERT INTO conversations (conversation_type, members, meta, stream_id, created_at, updated_at)
SELECT 
    'group',
    json_build_array(
        (SELECT user_id FROM users WHERE username = 'grace'),
        (SELECT user_id FROM users WHERE username = 'henry'),
        (SELECT user_id FROM users WHERE username = 'iris'),
        (SELECT user_id FROM users WHERE username = 'jack')
    ),
    '{"name": "数据分析", "description": "数据分析和报告"}'::jsonb,
    (SELECT stream_id FROM streams WHERE stream_type = 'message' and stream_meta->>'conversation_id' = 'group7'  LIMIT 1),
    NOW(),
    NOW()
WHERE NOT EXISTS (SELECT 1 FROM conversations WHERE meta->>'name' = '数据分析');

-- 群组8: 运营团队
INSERT INTO streams (owner_id, stream_type, status, "offset", stream_meta, created_at, updated_at)
SELECT 
    (SELECT user_id FROM users WHERE username = 'kate'),
    'message',
    'active',
    0,
    '{"conversation_id": "group8"}'::jsonb,
    NOW(),
    NOW()
WHERE NOT EXISTS (SELECT 1 FROM streams WHERE stream_meta->>'conversation_id' = 'group8');

INSERT INTO conversations (conversation_type, members, meta, stream_id, created_at, updated_at)
SELECT 
    'group',
    json_build_array(
        (SELECT user_id FROM users WHERE username = 'kate'),
        (SELECT user_id FROM users WHERE username = 'leo'),
        (SELECT user_id FROM users WHERE username = 'mia'),
        (SELECT user_id FROM users WHERE username = 'nina'),
        (SELECT user_id FROM users WHERE username = 'oscar')
    ),
    '{"name": "运营团队", "description": "日常运营管理"}'::jsonb,
    (SELECT stream_id FROM streams WHERE stream_type = 'message' and stream_meta->>'conversation_id' = 'group8'  LIMIT 1),
    NOW(),
    NOW()
WHERE NOT EXISTS (SELECT 1 FROM conversations WHERE meta->>'name' = '运营团队');

-- 群组9: 财务团队
INSERT INTO streams (owner_id, stream_type, status, "offset", stream_meta, created_at, updated_at)
SELECT 
    (SELECT user_id FROM users WHERE username = 'paula'),
    'message',
    'active',
    0,
    '{"conversation_id": "group9"}'::jsonb,
    NOW(),
    NOW()
WHERE NOT EXISTS (SELECT 1 FROM streams WHERE stream_meta->>'conversation_id' = 'group9');

INSERT INTO conversations (conversation_type, members, meta, stream_id, created_at, updated_at)
SELECT 
    'group',
    json_build_array(
        (SELECT user_id FROM users WHERE username = 'paula'),
        (SELECT user_id FROM users WHERE username = 'quinn'),
        (SELECT user_id FROM users WHERE username = 'rose'),
        (SELECT user_id FROM users WHERE username = 'sam')
    ),
    '{"name": "财务团队", "description": "财务管理和预算"}'::jsonb,
    (SELECT stream_id FROM streams WHERE stream_type = 'message' and stream_meta->>'conversation_id' = 'group9'  LIMIT 1),
    NOW(),
    NOW()
WHERE NOT EXISTS (SELECT 1 FROM conversations WHERE meta->>'name' = '财务团队');

-- 群组10: 全公司群
INSERT INTO streams (owner_id, stream_type, status, "offset", stream_meta, created_at, updated_at)
SELECT 
    (SELECT user_id FROM users WHERE username = 'alice'),
    'message',
    'active',
    0,
    '{"conversation_id": "group10"}'::jsonb,
    NOW(),
    NOW()
WHERE NOT EXISTS (SELECT 1 FROM streams WHERE stream_meta->>'conversation_id' = 'group10');

INSERT INTO conversations (conversation_type, members, meta, stream_id, created_at, updated_at)
SELECT 
    'group',
    (SELECT json_agg(user_id) FROM users WHERE username IN ('alice', 'bob', 'charlie', 'diana', 'eve', 'frank', 'grace', 'henry', 'iris', 'jack', 'kate', 'leo', 'mia', 'nina', 'oscar', 'paula', 'quinn', 'rose', 'sam', 'tina')),
    '{"name": "全公司群", "description": "公司全体成员交流群"}'::jsonb,
    (SELECT stream_id FROM streams WHERE stream_type = 'message' and stream_meta->>'conversation_id' = 'group10'  LIMIT 1),
    NOW(),
    NOW()
WHERE NOT EXISTS (SELECT 1 FROM conversations WHERE meta->>'name' = '全公司群');

-- 1对1对话
-- Alice & Bob
INSERT INTO streams (owner_id, stream_type, status, "offset", stream_meta, created_at, updated_at)
SELECT 
    (SELECT user_id FROM users WHERE username = 'alice'),
    'message',
    'active',
    0,
    '{"conversation_id": "ab"}'::jsonb,
    NOW(),
    NOW()
WHERE NOT EXISTS (SELECT 1 FROM streams WHERE stream_meta->>'conversation_id' = 'ab');

INSERT INTO conversations (conversation_type, members, meta, stream_id, created_at, updated_at)
SELECT 
    'direct',
    json_build_array(
        (SELECT user_id FROM users WHERE username = 'alice'),
        (SELECT user_id FROM users WHERE username = 'bob')
    ),
    '{"name": "Alice & Bob"}'::jsonb,
    (SELECT stream_id FROM streams WHERE stream_type = 'message' and stream_meta->>'conversation_id' = 'ab'  LIMIT 1),
    NOW(),
    NOW()
WHERE NOT EXISTS (SELECT 1 FROM conversations WHERE meta->>'name' = 'Alice & Bob');

-- Charlie & Diana
INSERT INTO streams (owner_id, stream_type, status, "offset", stream_meta, created_at, updated_at)
SELECT 
    (SELECT user_id FROM users WHERE username = 'charlie'),
    'message',
    'active',
    0,
    '{"conversation_id": "cd"}'::jsonb,
    NOW(),
    NOW()
WHERE NOT EXISTS (SELECT 1 FROM streams WHERE stream_meta->>'conversation_id' = 'cd');

INSERT INTO conversations (conversation_type, members, meta, stream_id, created_at, updated_at)
SELECT 
    'direct',
    json_build_array(
        (SELECT user_id FROM users WHERE username = 'charlie'),
        (SELECT user_id FROM users WHERE username = 'diana')
    ),
    '{"name": "Charlie & Diana"}'::jsonb,
    (SELECT stream_id FROM streams WHERE stream_type = 'message' and stream_meta->>'conversation_id' = 'cd'  LIMIT 1),
    NOW(),
    NOW()
WHERE NOT EXISTS (SELECT 1 FROM conversations WHERE meta->>'name' = 'Charlie & Diana');

-- Eve & Frank
INSERT INTO streams (owner_id, stream_type, status, "offset", stream_meta, created_at, updated_at)
SELECT 
    (SELECT user_id FROM users WHERE username = 'eve'),
    'message',
    'active',
    0,
    '{"conversation_id": "ef"}'::jsonb,
    NOW(),
    NOW()
WHERE NOT EXISTS (SELECT 1 FROM streams WHERE stream_meta->>'conversation_id' = 'ef');

INSERT INTO conversations (conversation_type, members, meta, stream_id, created_at, updated_at)
SELECT 
    'direct',
    json_build_array(
        (SELECT user_id FROM users WHERE username = 'eve'),
        (SELECT user_id FROM users WHERE username = 'frank')
    ),
    '{"name": "Eve & Frank"}'::jsonb,
    (SELECT stream_id FROM streams WHERE stream_type = 'message' and stream_meta->>'conversation_id' = 'ef'  LIMIT 1),
    NOW(),
    NOW()
WHERE NOT EXISTS (SELECT 1 FROM conversations WHERE meta->>'name' = 'Eve & Frank');
