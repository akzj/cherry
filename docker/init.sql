-- CherryServer Database Initialization Script
-- This script creates the necessary tables and inserts test data

-- Create users table
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    avatar TEXT,
    status INTEGER DEFAULT 0
);

-- Create friends table
CREATE TABLE IF NOT EXISTS friends (
    user_id INTEGER REFERENCES users(id),
    friend_id INTEGER REFERENCES users(id),
    status INTEGER DEFAULT 1,
    PRIMARY KEY (user_id, friend_id)
);

-- Create groups table
CREATE TABLE IF NOT EXISTS groups (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    stream_id VARCHAR(255) NOT NULL,
    description TEXT
);

-- Create group_members table
CREATE TABLE IF NOT EXISTS group_members (
    group_id INTEGER REFERENCES groups(id),
    user_id INTEGER REFERENCES users(id),
    PRIMARY KEY (group_id, user_id)
);

-- Insert test users (passwords are bcrypt hashed versions of 'password123')
INSERT INTO users (name, email, password, avatar, status) VALUES
('admin', 'admin@cherryserver.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/Lovvx3j8QzksDnQ8C', 'https://api.dicebear.com/7.x/avataaars/svg?seed=admin', 1),
('alice', 'alice@example.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/Lovvx3j8QzksDnQ8C', 'https://api.dicebear.com/7.x/avataaars/svg?seed=alice', 1),
('bob', 'bob@example.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/Lovvx3j8QzksDnQ8C', 'https://api.dicebear.com/7.x/avataaars/svg?seed=bob', 0),
('charlie', 'charlie@example.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/Lovvx3j8QzksDnQ8C', 'https://api.dicebear.com/7.x/avataaars/svg?seed=charlie', 2),
('diana', 'diana@example.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/Lovvx3j8QzksDnQ8C', 'https://api.dicebear.com/7.x/avataaars/svg?seed=diana', 1)
ON CONFLICT (name) DO NOTHING;

-- Insert test groups
INSERT INTO groups (name, stream_id, description) VALUES
('Development Team', 'dev-team-stream-001', 'Main development team chat'),
('Product Team', 'product-team-stream-002', 'Product planning and discussion'),
('General', 'general-stream-003', 'General company discussion'),
('Random', 'random-stream-004', 'Random chatter and fun')
ON CONFLICT DO NOTHING;

-- Insert friend relationships
INSERT INTO friends (user_id, friend_id, status) VALUES
(1, 2, 1), (2, 1, 1),  -- admin <-> alice
(1, 3, 1), (3, 1, 1),  -- admin <-> bob
(2, 3, 1), (3, 2, 1),  -- alice <-> bob
(2, 4, 1), (4, 2, 1),  -- alice <-> charlie
(3, 5, 1), (5, 3, 1),  -- bob <-> diana
(4, 5, 1), (5, 4, 1)   -- charlie <-> diana
ON CONFLICT (user_id, friend_id) DO NOTHING;

-- Insert group memberships
INSERT INTO group_members (group_id, user_id) VALUES
(1, 1), (1, 2), (1, 3), (1, 4),  -- Development Team
(2, 1), (2, 2), (2, 5),          -- Product Team
(3, 1), (3, 2), (3, 3), (3, 4), (3, 5),  -- General
(4, 2), (4, 3), (4, 5)           -- Random
ON CONFLICT (group_id, user_id) DO NOTHING;

-- Display initialization summary
SELECT 'Database initialization completed!' AS status;
SELECT COUNT(*) AS user_count FROM users;
SELECT COUNT(*) AS group_count FROM groups;
SELECT COUNT(*) AS friendship_count FROM friends;
SELECT COUNT(*) AS membership_count FROM group_members; 