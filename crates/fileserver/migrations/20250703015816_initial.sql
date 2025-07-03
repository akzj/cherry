CREATE TABLE IF NOT EXISTS upload_files (
    file_id UUID PRIMARY KEY,
    conversation_id UUID NOT NULL,
    user_id UUID NOT NULL,
    filename TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'created',
    size BIGINT NOT NULL,
    mime_type TEXT NOT NULL,
    checksum TEXT,
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);




CREATE INDEX IF NOT EXISTS idx_upload_files_conversation_id ON upload_files (conversation_id);
CREATE INDEX IF NOT EXISTS idx_upload_files_file_id ON upload_files (file_id);
CREATE INDEX IF NOT EXISTS idx_upload_files_user_id ON upload_files (user_id);
