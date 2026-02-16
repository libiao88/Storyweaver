-- 禁用 stories 表的 RLS
ALTER TABLE stories DISABLE ROW LEVEL SECURITY;

-- 禁用 user_configs 表的 RLS
ALTER TABLE user_configs DISABLE ROW LEVEL SECURITY;

-- 禁用 documents 表的 RLS
ALTER TABLE documents DISABLE ROW LEVEL SECURITY;
