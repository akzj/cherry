-- Development Environment Additional Test Data
-- This script adds extra test data for development purposes

-- Add more test users for development
INSERT INTO users (name, email, password, avatar, status) VALUES
('testuser1', 'test1@dev.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/Lovvx3j8QzksDnQ8C', 'https://api.dicebear.com/7.x/avataaars/svg?seed=test1', 1),
('testuser2', 'test2@dev.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/Lovvx3j8QzksDnQ8C', 'https://api.dicebear.com/7.x/avataaars/svg?seed=test2', 0),
('devuser', 'dev@cherryserver.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/Lovvx3j8QzksDnQ8C', 'https://api.dicebear.com/7.x/avataaars/svg?seed=dev', 1)
ON CONFLICT (name) DO NOTHING;

-- Add development groups
INSERT INTO groups (name, stream_id, description) VALUES
('QA Team', 'qa-team-stream-005', 'Quality Assurance team'),
('DevOps', 'devops-stream-006', 'DevOps and Infrastructure'),
('Testing', 'testing-stream-007', 'Testing and debugging discussions')
ON CONFLICT DO NOTHING;

-- Add more friend relationships for testing
INSERT INTO friends (user_id, friend_id, status) VALUES
(1, 6, 1), (6, 1, 1),  -- admin <-> testuser1
(2, 7, 1), (7, 2, 1),  -- alice <-> testuser2
(8, 3, 1), (3, 8, 1)   -- devuser <-> bob
ON CONFLICT (user_id, friend_id) DO NOTHING;

-- Add group memberships for development testing
INSERT INTO group_members (group_id, user_id) VALUES
(5, 1), (5, 6), (5, 7),  -- QA Team
(6, 1), (6, 8),          -- DevOps
(7, 2), (7, 3), (7, 6), (7, 7), (7, 8)  -- Testing
ON CONFLICT (group_id, user_id) DO NOTHING;

-- Display development data summary
SELECT 'Development data loaded!' AS status;
SELECT 'Total users: ' || COUNT(*) AS info FROM users;
SELECT 'Total groups: ' || COUNT(*) AS info FROM groups; 