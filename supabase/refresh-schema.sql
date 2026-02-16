-- 刷新 Supabase schema cache
NOTIFY pgrst, 'reload schema';

-- 检查 stories 表结构
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'stories';
