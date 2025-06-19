-- Add migration script here
CREATE TABLE
    messages (
        id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
        conversation_id INTEGER NOT NULL,
        sender_id INTEGER NOT NULL REFERENCES users (id),
        content TEXT NOT NULL,
        type TEXT NOT NULL, --'text','image','voice','video','file','location','contact','system','encrypted_text'
        status TEXT NOT NULL CHECK (status IN ('sent', 'delivered', 'read')),
        timestamp TEXT NOT NULL,
        reaction TEXT,
        reply_to INTEGER,
        media_path TEXT
    );

CREATE TABLE
    offline_messages (
        id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
        conversation_id INTEGER NOT NULL,
        sender_id INTEGER NOT NULL,
        content TEXT NOT NULL,
        timestamp TEXT NOT NULL,
        is_sent BOOLEAN DEFAULT FALSE
    );

CREATE TABLE
    contacts (
        id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
        user_id INTEGER NOT NULL,
        contact_id INTEGER NOT NULL,
        relationship_type TEXT DEFAULT 'friend', -- friend, family, colleague
        nickname TEXT,
        status TEXT, -- online, offline, etc.
        last_seen TEXT,
        notes TEXT,
        is_verified BOOLEAN DEFAULT 0,
        is_blocked BOOLEAN DEFAULT 0,
        created_at TEXT NOT NULL
    );

CREATE TABLE
    friend_requests (
        id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
        from_user_id INTEGER NOT NULL, -- 发起申请的用户ID
        to_user_id INTEGER NOT NULL, -- 接受申请的用户ID
        content TEXT, -- 申请内容，可选
        status TEXT NOT NULL DEFAULT 'pending', -- 状态：pending, accepted, rejected
        created_at TEXT NOT NULL
    );

CREATE TABLE
    group_requests (
        id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
        group_id INTEGER NOT NULL, -- 外键，指向Group.id
        user_id INTEGER NOT NULL, -- 申请用户ID
        content TEXT, -- 申请内容，可选
        status TEXT NOT NULL DEFAULT 'pending', -- 状态：pending, accepted, rejected
        created_at TEXT NOT NULL
    );

CREATE TABLE
    users (
        id INTEGER PRIMARY KEY NOT NULL,
        username TEXT NOT NULL UNIQUE,
        display_name TEXT NOT NULL,
        avatar_path TEXT,
        last_login TEXT,
        registration_date TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'online', -- online, offline, busy, away
        last_active TEXT
    );

CREATE TABLE
    conversations (
        id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
        type TEXT NOT NULL CHECK (type IN ('private', 'group')),
        user_id INTEGER NOT NULL,
        other_user_id INTEGER,
        group_id INTEGER,
        stream_id INTEGER NOT NULL,
        last_message_id INTEGER,
        unread_count INTEGER DEFAULT 0,
        is_pinned BOOLEAN DEFAULT 0,
        created_at TEXT NOT NULL
    );

CREATE TABLE
    groups (
        id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
        name TEXT NOT NULL,
        description TEXT,
        creator_id INTEGER NOT NULL,
        avatar_path TEXT,
        created_at TEXT NOT NULL,
        is_encrypted BOOLEAN DEFAULT 0,
        encryption_key TEXT,
        visibility TEXT DEFAULT 'public', -- public, private, secret
        member_count INTEGER DEFAULT 0,
        last_active TEXT
    );

CREATE TABLE
    group_members (
        id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
        group_id INTEGER NOT NULL,
        user_id INTEGER NOT NULL,
        role TEXT DEFAULT 'member', -- member, admin, owner
        joined_at TEXT NOT NULL,
        is_muted BOOLEAN DEFAULT 0,
        mute_until TEXT,
        is_banned BOOLEAN DEFAULT 0
    );

CREATE TABLE
    files (
        id TEXT PRIMARY KEY NOT NULL,
        sender_id INTEGER NOT NULL,
        conversation_id INTEGER,
        type TEXT NOT NULL CHECK (
            type IN ('image', 'document', 'audio', 'video', 'other')
        ),
        name TEXT NOT NULL,
        size INTEGER NOT NULL,
        path TEXT NOT NULL,
        uploaded_at TEXT NOT NULL
    );

CREATE TABLE
    settings (
        id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
        key TEXT NOT NULL UNIQUE,
        value TEXT NOT NULL,
        category TEXT DEFAULT 'general'
    );

CREATE TABLE
    notifications (
        id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
        sender_id INTEGER,
        conversation_id INTEGER,
        user_id INTEGER NOT NULL,
        type TEXT NOT NULL CHECK (type IN ('message', 'system', 'event')),
        content TEXT NOT NULL,
        is_read BOOLEAN DEFAULT FALSE,
        timestamp TEXT NOT NULL,
        expires_at TEXT
    );

CREATE INDEX idx_conversation_last_message ON conversations (last_message_id);

CREATE INDEX idx_message_timestamp ON messages (timestamp);

CREATE INDEX idx_user_last_login ON users (last_login);

CREATE INDEX idx_contact_status ON contacts (status);

CREATE INDEX idx_group_member ON group_members (group_id, role);

CREATE INDEX idx_offline_message ON offline_messages (conversation_id, is_sent);

CREATE INDEX idx_notification ON notifications (user_id, is_read, timestamp);