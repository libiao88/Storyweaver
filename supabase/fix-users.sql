-- 添加缺失的字段到 users 表
ALTER TABLE users ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'user';
