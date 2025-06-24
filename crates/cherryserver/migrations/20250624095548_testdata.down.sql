-- Add down migration script here

-- 删除所有测试对话（先删除对话，因为对话引用了流）
DELETE FROM conversations 
WHERE meta->>'name' IN (
    '技术讨论组', '项目管理组', '设计团队', '市场推广', '客服团队',
    '产品开发', '数据分析', '运营团队', '财务团队', '全公司群',
    'Alice & Bob', 'Charlie & Diana', 'Eve & Frank'
);

-- 删除所有测试流（包括通知流和消息流）
DELETE FROM streams 
WHERE owner_id IN (
    SELECT user_id FROM users 
    WHERE username IN ('alice', 'bob', 'charlie', 'diana', 'eve', 'frank', 'grace', 'henry', 'iris', 'jack', 'kate', 'leo', 'mia', 'nina', 'oscar', 'paula', 'quinn', 'rose', 'sam', 'tina')
);

-- 删除所有测试用户
DELETE FROM users 
WHERE username IN ('alice', 'bob', 'charlie', 'diana', 'eve', 'frank', 'grace', 'henry', 'iris', 'jack', 'kate', 'leo', 'mia', 'nina', 'oscar', 'paula', 'quinn', 'rose', 'sam', 'tina');
