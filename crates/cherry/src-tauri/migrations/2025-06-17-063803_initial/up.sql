-- Your SQL goes here
CREATE TABLE chat_messages (
    id Integer PRIMARY KEY NOT NULL,
    sender_id TEXT NOT NULL,
    sender_name TEXT NOT NULL,
    content TEXT NOT NULL,
    timestamp INTEGER NOT NULL,
    message_type TEXT NOT NULL,
    text TEXT,
    url TEXT,
    width INTEGER,
    height INTEGER,
    duration INTEGER
);

CREATE TABLE contacts (
    id Integer PRIMARY KEY NOT NULL,
    name TEXT NOT NULL,
    avatar TEXT NOT NULL,
    created_at INTEGER NOT NULL,
    updated_at INTEGER NOT NULL
);

CREATE TABLE chat_session_messages (