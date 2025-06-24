-- 插入测试用户
-- 密码是 "password123" 的哈希值（这里使用简单的哈希，实际应用中应该使用bcrypt等）
INSERT INTO users (username, email, password_hash, avatar_url, status) 
VALUES (
    'testuser',
    'test@example.com',
    'password123', -- 简单密码，实际应用中应该使用哈希
    'https://via.placeholder.com/150',
    'online'
) ON CONFLICT (username) DO NOTHING;

-- 插入另一个测试用户
INSERT INTO users (username, email, password_hash, avatar_url, status) 
VALUES (
    'alice',
    'alice@example.com',
    'password123',
    'https://via.placeholder.com/150',
    'online'
) ON CONFLICT (username) DO NOTHING;

-- 插入第三个测试用户
INSERT INTO users (username, email, password_hash, avatar_url, status) 
VALUES (
    'bob',
    'bob@example.com',
    'password123',
    'https://via.placeholder.com/150',
    'online'
) ON CONFLICT (username) DO NOTHING; 