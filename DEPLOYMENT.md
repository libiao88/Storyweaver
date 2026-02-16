# StoryWeaver AI - Cloudflare Workers 部署指南

本指南将帮助你将 StoryWeaver AI 后端部署到 Cloudflare Workers。

## 目录

1. [前置条件](#1-前置条件)
2. [创建 Cloudflare 账户](#2-创建-cloudflare-账户)
3. [配置环境](#3-配置环境)
4. [创建 Supabase 项目](#4-创建-supabase-项目)
5. [配置 Cloudflare 资源](#5-配置-cloudflare-资源)
6. [更新配置文件](#6-更新配置文件)
7. [本地测试](#7-本地测试)
8. [部署到生产环境](#8-部署到生产环境)
9. [验证部署](#9-验证部署)
10. [常见问题](#10-常见问题)

---

## 1. 前置条件

在开始部署之前，确保你已安装以下工具：

```bash
# 安装 Node.js (建议 v18+)
node --version

# 安装 Cloudflare Wrangler CLI
npm install -g wrangler

# 验证安装
wrangler --version
```

---

## 2. 创建 Cloudflare 账户

如果你还没有 Cloudflare 账户：

1. 访问 [cloudflare.com](https://cloudflare.com)
2. 注册一个新账户
3. 完成邮箱验证

---

## 3. 配置环境

### 3.1 安装依赖

```bash
cd backend
npm install
```

### 3.2 登录 Cloudflare

```bash
wrangler login
```

这将打开浏览器窗口，要求你授权 Cloudflare 访问。

---

## 4. 创建 Supabase 项目

### 4.1 创建 Supabase 账户

1. 访问 [supabase.com](https://supabase.com)
2. 注册并登录

### 4.2 创建新项目

1. 点击 "New Project"
2. 填写项目信息：
   - **Name**: storyweaver
   - **Database Password**: 设置一个强密码
   - **Region**: 选择最近的区域 (如 Singapore)
3. 等待项目创建完成

### 4.3 获取连接信息

项目创建完成后，在 Settings > API 中找到：
- **Project URL**: `https://your-project.supabase.co`
- **anon public key**: `your-anon-key`

### 4.4 创建数据库表

在 Supabase SQL Editor 中执行以下 SQL：

```sql
-- 创建用户表
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  name TEXT NOT NULL,
  role TEXT DEFAULT 'user',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 创建用户故事表
CREATE TABLE IF NOT EXISTS stories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  document_id UUID,
  title TEXT NOT NULL,
  description TEXT,
  role TEXT,
  action TEXT,
  value TEXT,
  module TEXT,
  priority TEXT DEFAULT 'P2',
  status TEXT DEFAULT 'draft',
  tags TEXT[],
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 创建用户配置表
CREATE TABLE IF NOT EXISTS user_configs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE UNIQUE,
  llm_provider TEXT DEFAULT 'openai',
  default_model TEXT DEFAULT 'gpt-4o-mini',
  temperature REAL DEFAULT 0.3,
  max_tokens INTEGER DEFAULT 2000,
  auto_save BOOLEAN DEFAULT true,
  theme TEXT DEFAULT 'light',
  notifications_enabled BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 创建文档表
CREATE TABLE IF NOT EXISTS documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  file_type TEXT,
  file_size BIGINT,
  storage_path TEXT,
  parsed_content TEXT,
  status TEXT DEFAULT 'uploaded',
  parsed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 启用 RLS (行级安全策略)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE stories ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;

-- 创建 RLS 策略
-- 用户只能访问自己的数据
CREATE POLICY "Users can view own data" ON users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can insert own data" ON users FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update own data" ON users FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can view own stories" ON stories FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own stories" ON stories FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own stories" ON stories FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own stories" ON stories FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can view own config" ON user_configs FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own config" ON user_configs FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own config" ON user_configs FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY own documents" ON "Users can view documents FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own documents" ON documents FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own documents" ON documents FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own documents" ON documents FOR DELETE USING (auth.uid() = user_id);
```

---

## 5. 配置 Cloudflare 资源

### 5.1 创建 KV 命名空间

```bash
wrangler kv:namespace create STORYWEAVER_KV
```

记录返回的 `id`，稍后需要用到。

### 5.2 创建 R2 存储桶

```bash
wrangler r2 bucket create storyweaver-files
```

### 5.3 获取 API 密钥

#### OpenAI API Key
1. 访问 [OpenAI Platform](https://platform.openai.com)
2. 进入 API Keys 页面
3. 创建新的 API Key

#### Claude API Key (可选)
1. 访问 [Anthropic Console](https://console.anthropic.com)
2. 创建 API Key

---

## 6. 更新配置文件

### 6.1 创建 `.dev.vars` 文件

在 `backend/` 目录下创建 `.dev.vars` 文件：

```bash
# backend/.dev.vars
JWT_SECRET=your-super-secret-jwt-key-min-32-chars
OPENAI_API_KEY=sk-your-openai-api-key
CLAUDE_API_KEY=sk-ant-your-claude-api-key
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your-supabase-anon-key
```

### 6.2 更新 `wrangler.toml`

```toml
name = "storyweaver-backend"
main = "src/index.ts"
compatibility_date = "2025-07-18"
workers_dev = true
compatibility_flags = ["nodejs_compat"]

[vars]
JWT_SECRET = "your-super-secret-jwt-key-min-32-chars"
OPENAI_API_KEY = "sk-your-openai-api-key"
CLAUDE_API_KEY = "sk-ant-your-claude-api-key"
SUPABASE_URL = "https://your-project.supabase.co"
SUPABASE_KEY = "your-supabase-anon-key"

[[kv_namespaces]]
binding = "STORYWEAVER_KV"
id = "your-kv-namespace-id"

[[r2_buckets]]
binding = "STORYWEAVER_R2"
bucket_name = "storyweaver-files"
```

**重要**：
- 将 `your-kv-namespace-id` 替换为步骤 5.1 获取的 ID
- 将所有 `your-*` 占位符替换为实际值

---

## 7. 本地测试

### 7.1 启动开发服务器

```bash
cd backend
npm run dev
```

这将在 `http://localhost:8787` 启动本地服务器。

### 7.2 测试 API

#### 健康检查
```bash
curl http://localhost:8787/health
```

响应：
```json
{
  "success": true,
  "message": "Service is healthy",
  "timestamp": 1704067200000
}
```

#### 用户注册
```bash
curl -X POST http://localhost:8787/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123","name":"Test User"}'
```

#### 用户登录
```bash
curl -X POST http://localhost:8787/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```

---

## 8. 部署到生产环境

### 8.1 构建项目

```bash
cd backend
npm run build
```

### 8.2 部署

```bash
npm run deploy
```

或者使用 Wrangler：

```bash
wrangler deploy
```

### 8.3 部署输出

成功部署后，你将看到类似以下的输出：

```
⬣  Uploading... (14.37 KB)
⬣  Uploaded storyweaver-backend (0.46 KB)
⬣  Published storyweaver-backend (https://storyweaver-backend.your-account.workers.dev)
```

记录下你的 Worker URL：`https://storyweaver-backend.your-account.workers.dev`

---

## 9. 验证部署

### 9.1 健康检查

```bash
curl https://your-worker-url.workers.dev/health
```

### 9.2 测试完整流程

1. **注册用户**
```bash
curl -X POST https://your-worker-url.workers.dev/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password123","name":"John Doe"}'
```

2. **登录获取 Token**
```bash
curl -X POST https://your-worker-url.workers.dev/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password123"}'
```

3. **使用 Token 访问受保护的 API**
```bash
curl -X GET https://your-worker-url.workers.dev/api/stories \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

---

## 10. 常见问题

### 10.1 部署失败

**问题**: 部署时出现错误

**解决方案**:
1. 检查 `wrangler.toml` 配置是否正确
2. 确保所有环境变量已设置
3. 运行 `wrangler whoami` 确认已登录

### 10.2 CORS 错误

**问题**: 前端调用 API 时出现 CORS 错误

**解决方案**:
确保后端已正确配置 CORS 中间件：
```typescript
app.use('*', cors());
```

### 10.3 数据库连接失败

**问题**: 无法连接到 Supabase

**解决方案**:
1. 检查 `SUPABASE_URL` 和 `SUPABASE_KEY` 是否正确
2. 确认 Supabase 项目是否已激活
3. 检查网络连接

### 10.4 API 密钥无效

**问题**: LLM API 调用失败

**解决方案**:
1. 确认 API 密钥是否正确且未过期
2. 检查账户是否有足够的配额
3. 验证 API 密钥权限

### 10.5 自定义域名 (可选)

如果你想使用自定义域名：

```bash
wrangler routes update --zone your-domain.com --pattern your-domain.com/*
```

或者在 Cloudflare Dashboard 中配置：
1. 进入 Workers > 你的 Worker
2. 点击 "Triggers" > "Custom Domains"
3. 添加你的域名

---

## 后续步骤

部署完成后，你需要：

1. **更新前端配置**：将前端 API 请求地址指向新的后端 URL
2. **配置生产环境变量**：在 Cloudflare Dashboard 中设置生产环境变量
3. **设置监控告警**：配置 Cloudflare Analytics
4. **配置 CI/CD**：设置 GitHub Actions 自动部署

---

## 快速命令参考

```bash
# 登录
wrangler login

# 本地开发
npm run dev

# 构建
npm run build

# 部署
wrangler deploy

# 查看日志
wrangler tail

# KV 操作
wrangler kv:namespace list
wrangler kv:key list --namespace-id=your-id

# R2 操作
wrangler r2 bucket list
```
