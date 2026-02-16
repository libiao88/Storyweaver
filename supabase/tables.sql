-- 补充缺失的表结构（与后端代码匹配）

-- 创建用户配置表 (user_configs)
CREATE TABLE IF NOT EXISTS user_configs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE UNIQUE,
    llm_provider TEXT DEFAULT 'openai',
    default_model TEXT DEFAULT 'gpt-4o-mini',
    temperature REAL DEFAULT 0.3,
    max_tokens INTEGER DEFAULT 2000,
    auto_save BOOLEAN DEFAULT true,
    theme TEXT DEFAULT 'light',
    notifications_enabled BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 为 users 表添加 password_hash 字段（如果不存在）
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'password_hash') THEN
        ALTER TABLE users ADD COLUMN password_hash TEXT NOT NULL;
    END IF;
END $$;

-- 启用 RLS
ALTER TABLE user_configs ENABLE ROW LEVEL SECURITY;

-- 创建 RLS 策略
CREATE POLICY "Users can view their own config"
    ON user_configs FOR SELECT
    USING (auth.uid()::UUID = user_id);

CREATE POLICY "Users can insert their own config"
    ON user_configs FOR INSERT
    WITH CHECK (auth.uid()::UUID = user_id);

CREATE POLICY "Users can update their own config"
    ON user_configs FOR UPDATE
    USING (auth.uid()::UUID = user_id);

CREATE POLICY "Users can delete their own config"
    ON user_configs FOR DELETE
    USING (auth.uid()::UUID = user_id);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_user_configs_user_id ON user_configs(user_id);

-- 启用实时订阅
ALTER PUBLICATION supabase_realtime ADD TABLE user_configs;

-- 创建 updated_at 触发器
CREATE TRIGGER set_user_configs_updated_at
    BEFORE UPDATE ON user_configs
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();
