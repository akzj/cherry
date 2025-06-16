-- Test data for cherryserver
-- Run this after the initial migration to populate test data

-- Insert test users (with bcrypt hashed passwords)
INSERT INTO users (name, email, password, avatar, status) VALUES
    ('admin', 'admin@example.com', '$2b$12$xaHIeJTevgXdu3.J4khGLOPkDbKY679W03VTVSekev33fPx05zoly', 'https://example.com/avatars/admin.jpg', 1),
    ('alice', 'alice@example.com', '$2b$12$7l0GhbtVaofRuLvixlRKoeP8H0EAJO6Ljd.gUpCDuEhbOP2kQv9bO', 'https://example.com/avatars/alice.jpg', 1),
    ('bob', 'bob@example.com', '$2b$12$7l0GhbtVaofRuLvixlRKoeP8H0EAJO6Ljd.gUpCDuEhbOP2kQv9bO', 'https://example.com/avatars/bob.jpg', 0),
    ('charlie', 'charlie@example.com', '$2b$12$7l0GhbtVaofRuLvixlRKoeP8H0EAJO6Ljd.gUpCDuEhbOP2kQv9bO', NULL, 2),
    ('diana', 'diana@example.com', '$2b$12$7l0GhbtVaofRuLvixlRKoeP8H0EAJO6Ljd.gUpCDuEhbOP2kQv9bO', 'https://example.com/avatars/diana.jpg', 1);

-- Insert test groups
INSERT INTO groups (name, stream_id) VALUES
    ('Development Team', 'dev-team-stream-001'),
    ('General Chat', 'general-chat-stream-002'),
    ('Project Alpha', 'project-alpha-stream-003'),
    ('Coffee Lovers', 'coffee-stream-004');

-- Insert group members
INSERT INTO group_members (group_id, user_id) VALUES
    -- Development Team (group_id: 1)
    (1, 1), (1, 2), (1, 3), (1, 5),
    -- General Chat (group_id: 2)  
    (2, 1), (2, 2), (2, 3), (2, 4), (2, 5),
    -- Project Alpha (group_id: 3)
    (3, 1), (3, 2), (3, 4),
    -- Coffee Lovers (group_id: 4)
    (4, 2), (4, 3), (4, 5);

-- Insert friend relationships
INSERT INTO friends (user_id, friend_id, status) VALUES
    -- Admin's friends
    (1, 2, 1), (1, 3, 1), (1, 4, 1),
    -- Alice's friends  
    (2, 1, 1), (2, 3, 1), (2, 5, 1),
    -- Bob's friends
    (3, 1, 1), (3, 2, 1), (3, 4, 1),
    -- Charlie's friends
    (4, 1, 1), (4, 3, 1),
    -- Diana's friends
    (5, 1, 1), (5, 2, 1); 