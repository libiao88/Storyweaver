-- Supabase 数据库初始化脚本
-- 用于创建 StoryWeaver AI 所需的表和策略

-- 创建用户表（如果不存在）
CREATE TABLE IF NOT EXISTS users (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    name TEXT,
    avatar_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 创建故事表
CREATE TABLE IF NOT EXISTS stories (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    module TEXT NOT NULL,
    priority TEXT NOT NULL DEFAULT '中',
    source_reference TEXT,
    confidence NUMERIC NOT NULL DEFAULT 0.8,
    story_points INTEGER,
    dependencies TEXT[],
    status TEXT NOT NULL DEFAULT '待处理',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 创建文档表
CREATE TABLE IF NOT EXISTS documents (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    filename TEXT NOT NULL,
    file_type TEXT NOT NULL,
    file_size INTEGER,
    content TEXT,
    processed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 创建 LLM 配置表
CREATE TABLE IF NOT EXISTS llm_configurations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    model TEXT NOT NULL,
    api_key TEXT,
    temperature NUMERIC NOT NULL DEFAULT 0.3,
    max_tokens INTEGER NOT NULL DEFAULT 2000,
    request_timeout INTEGER NOT NULL DEFAULT 30000,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 创建行级安全策略（RLS）

-- 用户表策略
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own data"
    ON users FOR SELECT
    USING (auth.uid()::UUID = id);

CREATE POLICY "Users can update their own data"
    ON users FOR UPDATE
    USING (auth.uid()::UUID = id);

-- 故事表策略
ALTER TABLE stories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own stories"
    ON stories FOR SELECT
    USING (auth.uid()::UUID = user_id);

CREATE POLICY "Users can insert their own stories"
    ON stories FOR INSERT
    WITH CHECK (auth.uid()::UUID = user_id);

CREATE POLICY "Users can update their own stories"
    ON stories FOR UPDATE
    USING (auth.uid()::UUID = user_id);

CREATE POLICY "Users can delete their own stories"
    ON stories FOR DELETE
    USING (auth.uid()::UUID = user_id);

-- 文档表策略
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own documents"
    ON documents FOR SELECT
    USING (auth.uid()::UUID = user_id);

CREATE POLICY "Users can insert their own documents"
    ON documents FOR INSERT
    WITH CHECK (auth.uid()::UUID = user_id);

CREATE POLICY "Users can update their own documents"
    ON documents FOR UPDATE
    USING (auth.uid()::UUID = user_id);

CREATE POLICY "Users can delete their own documents"
    ON documents FOR DELETE
    USING (auth.uid()::UUID = user_id);

-- LLM 配置表策略
ALTER TABLE llm_configurations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own LLM configurations"
    ON llm_configurations FOR SELECT
    USING (auth.uid()::UUID = user_id);

CREATE POLICY "Users can insert their own LLM configurations"
    ON llm_configurations FOR INSERT
    WITH CHECK (auth.uid()::UUID = user_id);

CREATE POLICY "Users can update their own LLM configurations"
    ON llm_configurations FOR UPDATE
    USING (auth.uid()::UUID = user_id);

CREATE POLICY "Users can delete their own LLM configurations"
    ON llm_configurations FOR DELETE
    USING (auth.uid()::UUID = user_id);

-- 创建索引以提高查询性能
CREATE INDEX IF NOT EXISTS idx_stories_user_id ON stories(user_id);
CREATE INDEX IF NOT EXISTS idx_stories_module ON stories(module);
CREATE INDEX IF NOT EXISTS idx_stories_priority ON stories(priority);
CREATE INDEX IF NOT EXISTS idx_documents_user_id ON documents(user_id);
CREATE INDEX IF NOT EXISTS idx_llm_configurations_user_id ON llm_configurations(user_id);

-- 启用实时订阅
ALTER PUBLICATION supabase_realtime ADD TABLE stories;
ALTER PUBLICATION supabase_realtime ADD TABLE documents;
ALTER PUBLICATION supabase_realtime ADD TABLE llm_configurations;

-- 创建函数更新 updated_at 字段
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 为每个表创建更新触发器
CREATE TRIGGER set_stories_updated_at
    BEFORE UPDATE ON stories
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_documents_updated_at
    BEFORE UPDATE ON documents
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_llm_configurations_updated_at
    BEFORE UPDATE ON llm_configurations
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();