-- Add migration script here
-- Your SQL goes here
-- 启用UUID扩展
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 用户表
CREATE TABLE IF NOT EXISTS users (
    user_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    username VARCHAR(50) NOT NULL UNIQUE,
    avatar_url TEXT,
    email VARCHAR(100) NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    profile JSONB NOT NULL DEFAULT '{}'::JSONB, -- 存储动态用户属性
    app_config JSONB NOT NULL DEFAULT '{}'::JSONB, -- 存储应用配置
    stream_meta JSONB NOT NULL DEFAULT '{}'::JSONB, -- 存储流元数据
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    last_active TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 会话表（混合单聊/群聊）
CREATE TABLE IF NOT EXISTS conversations (
    conversation_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    conversation_type VARCHAR(10) NOT NULL, -- 会话类型
    members JSONB NOT NULL DEFAULT '[]'::JSONB, -- 成员ID数组
    meta JSONB NOT NULL DEFAULT '{}'::JSONB,    -- 动态会话属性
    -- 消息流ID
    stream_id BIGINT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 联系人表（支持双向关系与多种联系人类型）
CREATE TABLE IF NOT EXISTS contacts (
    contact_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    owner_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    target_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    relation_type VARCHAR(20) NOT NULL CHECK (relation_type IN ('friend', 'blocked', 'pending_outgoing', 'pending_incoming')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- 联系人专属信息
    remark_name VARCHAR(100),           -- 备注名
    tags JSONB DEFAULT '[]'::JSONB,     -- 标签分类 ["同事", "家人"]
    is_favorite BOOLEAN NOT NULL DEFAULT false,
    mute_settings JSONB DEFAULT '{}'::JSONB, -- {"muted": true, "expire_at": "2023-12-31"}
    
    -- 唯一约束确保不会重复添加
    UNIQUE (owner_id, target_id)
);

-- 联系人扩展信息表（存储非对称数据）
CREATE TABLE IF NOT EXISTS contact_details (
    contact_id UUID NOT NULL REFERENCES contacts(contact_id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    
    -- 用户自定义的专属信息
    custom_fields JSONB DEFAULT '{}'::JSONB, -- {"department": "技术部", "notes": "大学同学"}
    last_interaction TIMESTAMPTZ,           -- 最后互动时间
    
    PRIMARY KEY (contact_id, user_id)
);

-- 流表
CREATE TABLE IF NOT EXISTS streams (
    stream_id BIGSERIAL PRIMARY KEY,
    owner_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    stream_type VARCHAR(20) NOT NULL,
    status VARCHAR(20) NOT NULL,
    "offset" BIGINT NOT NULL DEFAULT 0,
    stream_meta JSONB NOT NULL DEFAULT '{}'::JSONB, -- 存储流元数据
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 索引优化
CREATE INDEX IF NOT EXISTS idx_streams_owner ON streams(owner_id);
CREATE INDEX IF NOT EXISTS idx_streams_stream_id ON streams(stream_id);
CREATE INDEX IF NOT EXISTS idx_contacts_owner ON contacts(owner_id);
CREATE INDEX IF NOT EXISTS idx_contacts_relation ON contacts(owner_id, relation_type);
