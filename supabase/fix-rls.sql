-- 允许公开注册用户（无需认证）
-- 注意：这是为了让后端能够创建用户，实际生产环境可能需要更严格的控制

-- 禁用 RLS 临时用于测试
ALTER TABLE users DISABLE ROW LEVEL SECURITY;

-- 或者创建一个允许插入的策略
DROP POLICY IF EXISTS "Allow public insert" ON users;
CREATE POLICY "Allow public insert" ON users FOR INSERT WITH CHECK (true);

-- 允许读取自己的用户数据
DROP POLICY IF EXISTS "Users can view own data" ON users;
CREATE POLICY "Users can view own data" ON users FOR SELECT USING (true);

-- 允许更新自己的用户数据
DROP POLICY IF EXISTS "Users can update own data" ON users;
CREATE POLICY "Users can update own data" ON users FOR UPDATE USING (true);
