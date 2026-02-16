-- 检查 stories 表的所有列
SELECT column_name FROM information_schema.columns 
WHERE table_name = 'stories' ORDER BY ordinal_position;
