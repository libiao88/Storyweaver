# StoryWeaver AI 后端架构 PRD

## 1. 文档信息
- Product Name: StoryWeaver AI Backend
- Version: 1.0
- Author: StoryWeaver Team
- Last Updated: 2026-02-16
- Status: Draft

## 2. 执行摘要

**产品概述:**
StoryWeaver AI 后端是一个基于 Cloudflare Workers 的无服务器架构后端服务,为前端应用提供 API 接口、LLM 代理、数据持久化和用户认证功能。

**问题陈述:**
当前前端应用直接在浏览器端调用 LLM API,存在 CORS 跨域问题和 API 密钥暴露风险,缺乏后端服务处理复杂业务逻辑和数据持久化功能。

**成功标准:**
- 所有 LLM API 调用通过后端代理
- 用户数据安全存储在 Supabase 中
- 前端通过 API 访问所有功能
- 服务稳定运行在 Cloudflare 上

## 3. 目标和目的

**业务目标:**
- 解决前端 API 密钥暴露和 CORS 问题
- 提供可扩展的后端架构
- 支持用户数据持久化
- 实现安全的用户认证

**用户目标:**
- 开发者能够安全地使用 LLM 功能
- 用户数据和配置能够持久化存储
- 提供稳定可靠的服务

**产品目标 (OKRs):**
- Objective 1: 实现完整的后端 API 服务
  - KR1: 完成 LLM API 代理服务 (P0)
  - KR2: 实现用户认证和管理 (P0)
  - KR3: 完成用户故事管理 API (P1)

## 4. 目标受众

**主要用户角色:**
### 角色: 前端开发者
- 年龄: 25-40 岁
- 位置: 全球
- 职位/角色: 前端工程师
- 技术熟练度: 高
- 目标: 安全地集成 LLM 功能到应用中
- 痛点: 浏览器端 API 调用的安全和 CORS 问题
- 当前解决方案: 直接在浏览器端调用 LLM API
- 引用: "我需要一个安全的后端服务来代理我的 LLM API 调用"

## 5. 用户故事和用例

### 用户故事: LLM API 代理

As a 前端开发者,
I want to 发送 LLM API 请求到后端代理,
So that 我的 API 密钥不会暴露在浏览器端。

**验收标准:**
- 给定 我发送一个包含 LLM 请求的 POST 请求到 `/api/llm/proxy`,
- 当 后端接收到请求并验证用户身份,
- 然后 后端转发请求到相应的 LLM API,
- 并 返回处理后的响应给前端。

### 用户故事: 用户认证

As a 应用用户,
I want to 注册和登录到应用,
So that 我的数据和配置能够被安全地存储和管理。

**验收标准:**
- 给定 我提供有效的邮箱和密码,
- 当 我尝试注册或登录,
- 然后 系统验证我的凭证,
- 并 生成一个 JWT token 供后续 API 请求使用。

## 6. 功能和要求

### 功能 1: LLM API 代理服务

**描述:**
后端代理服务负责转发前端的 LLM API 请求,处理 API 密钥管理和响应格式转换。

**用户价值:**
保护 API 密钥不暴露在前端代码中,解决 CORS 跨域问题。

**功能要求:**
1. 支持 OpenAI API 代理
2. 支持 Claude API 代理
3. 支持其他主流 LLM API
4. 统一的请求和响应格式
5. 请求限流和并发控制

**验收标准:**
- 给定 我发送一个 OpenAI API 请求到 `/api/llm/openai/chat/completions`,
- 当 后端接收到请求并验证 JWT token,
- 然后 后端转发请求到 OpenAI API,
- 并 返回格式化的响应。

**优先级:** P0 (必须)
**工作量:** M (中等)
**技术说明:** 使用 Hono 框架实现 API 路由,Cloudflare Workers 部署。

### 功能 2: 用户认证和管理

**描述:**
用户认证系统负责处理用户注册、登录和权限管理。

**功能要求:**
1. 邮箱/密码注册和登录
2. JWT token 认证
3. 用户信息管理
4. 密码重置功能
5. 权限级别管理

**验收标准:**
- 给定 我发送一个包含邮箱和密码的注册请求,
- 当 邮箱未被注册且密码符合要求,
- 然后 系统创建新用户,
- 并 返回 JWT token。

**优先级:** P0 (必须)
**工作量:** L (大型)
**技术说明:** 使用 Supabase Auth 或自定义 JWT 认证,配合 Supabase 数据库。

### 功能 3: 用户故事管理

**描述:**
提供用户故事的 CRUD 操作,支持搜索、筛选和导出功能。

**功能要求:**
1. 创建、读取、更新、删除用户故事
2. 支持按优先级、状态、标签筛选
3. 搜索功能
4. 批量操作
5. 导出到不同格式

**验收标准:**
- 给定 我发送一个创建用户故事的请求,
- 当 我提供完整的用户故事数据,
- 然后 系统创建新的用户故事记录,
- 并 返回新创建的用户故事。

**优先级:** P1 (应该)
**工作量:** M (中等)
**技术说明:** 使用 Supabase 作为数据存储,通过 REST API 访问。

### 功能 4: 配置管理

**描述:**
管理用户配置和系统设置。

**功能要求:**
1. 存储用户 LLM 配置
2. 管理应用偏好设置
3. 支持配置版本控制
4. 配置验证和测试

**验收标准:**
- 给定 我发送一个更新 LLM 配置的请求,
- 当 我提供有效的配置参数,
- 然后 系统保存配置,
- 并 返回更新后的配置。

**优先级:** P2 (可以)
**工作量:** S (小型)
**技术说明:** 使用 Supabase 存储配置数据。

### 功能 5: 文件上传处理

**描述:**
处理文档上传和解析。

**功能要求:**
1. 支持多种文件格式上传
2. 文件验证和预处理
3. 文档解析和内容提取
4. 文件存储和管理

**验收标准:**
- 给定 我上传一个支持的文档文件,
- 当 系统接收并验证文件,
- 然后 系统解析文件内容,
- 并 返回解析结果。

**优先级:** P1 (应该)
**工作量:** L (大型)
**技术说明:** 使用 Cloudflare R2 存储文件,配合 Supabase 存储元数据。

### 功能 6: 实时通信

**描述:**
提供 WebSocket 实时通信支持。

**功能要求:**
1. WebSocket 连接管理
2. 实时通知推送
3. 服务器端事件 (SSE)
4. 连接认证和权限验证

**验收标准:**
- 给定 我建立 WebSocket 连接,
- 当 连接通过认证,
- 然后 我可以发送和接收实时消息,
- 并 处理断开和重连。

**优先级:** P2 (可以)
**工作量:** M (中等)
**技术说明:** 使用 Cloudflare Workers 支持 WebSocket。

### 功能 7: 任务队列

**描述:**
处理异步任务和后台作业。

**功能要求:**
1. 任务调度和执行
2. 任务状态跟踪
3. 错误处理和重试
4. 任务优先级管理

**验收标准:**
- 给定 我提交一个异步任务,
- 当 任务被添加到队列,
- 然后 系统处理任务,
- 并 更新任务状态。

**优先级:** P2 (可以)
**工作量:** M (中等)
**技术说明:** 使用 Cloudflare Queues 或类似服务。

## 7. 非功能需求

### 性能
- API 响应时间: < 500ms (95 分位)
- 并发用户数: 1000 个
- 文件处理时间: < 30 秒 (PDF 解析)

### 安全
- 认证: JWT token + Refresh token
- 授权: 基于角色的访问控制 (RBAC)
- 数据加密: 传输加密 (HTTPS), 存储加密
- 输入验证: 严格的数据验证和清理
- 速率限制: 500 请求/分钟/用户

### 可扩展性
- 无服务器架构,自动扩缩容
- 支持多区域部署
- 资源隔离和限流

### 可靠性
- 正常运行时间 SLA: 99.9%
- 错误恢复: 自动重试和降级
- 数据备份: 每日备份,保留 7 天
- 监控: Cloudflare Analytics + Sentry

### 可访问性
- API 文档: OpenAPI 3.0 标准
- 错误消息: 英文和中文

## 8. 技术规范

### 系统架构

```
Frontend (Cloudflare Pages) <-> API Gateway (Cloudflare Workers) <-> Backend Services (Cloudflare Workers)
                                                                 ↓
                                                         Supabase (PostgreSQL)
                                                                 ↓
                                                  Cloudflare R2 (File Storage)
```

### 技术栈
- **前端:** React + TypeScript + Vite (现有)
- **API 网关:** Cloudflare Workers + Hono
- **后端服务:** Cloudflare Workers + TypeScript
- **数据库:** Supabase (PostgreSQL)
- **文件存储:** Cloudflare R2
- **缓存:** Cloudflare Cache
- **队列:** Cloudflare Queues
- **监控:** Cloudflare Analytics + Sentry

### API 要求

**通用响应格式:**
```json
{
  "success": true,
  "data": {},
  "message": "Success",
  "timestamp": 1734381234567,
  "requestId": "uuid"
}
```

**错误响应格式:**
```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Error message",
    "details": {},
    "traceId": "uuid"
  },
  "timestamp": 1734381234567,
  "requestId": "uuid"
}
```

### 数据模型

**用户 (Users) 表:**
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(100),
  avatar_url TEXT,
  role VARCHAR(50) DEFAULT 'user',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**用户故事 (Stories) 表:**
```sql
CREATE TABLE stories (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  document_id UUID,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  role VARCHAR(100),
  action VARCHAR(255),
  value VARCHAR(255),
  module VARCHAR(100),
  priority VARCHAR(10),
  status VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**文档 (Documents) 表:**
```sql
CREATE TABLE documents (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  file_name VARCHAR(255) NOT NULL,
  file_type VARCHAR(50),
  file_size BIGINT,
  status VARCHAR(50),
  storage_path TEXT,
  parsed_content TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 集成

| 服务 | 用途 | API | 认证 |
|------|------|-----|------|
| OpenAI | LLM 服务 | REST | API Key |
| Claude | LLM 服务 | REST | API Key |
| Supabase | 数据库和认证 | PostgREST | API Key + JWT |
| Cloudflare R2 | 文件存储 | S3 API | Cloudflare API Key |

## 9. 分析和指标

### 关键性能指标 (KPIs)

**产品 KPIs:**
- API 响应时间: 平均 < 500ms
- 错误率: < 1%
- 用户增长率: 每周 10%
- 请求量: 每日 10,000 请求

### 事件跟踪计划

| 事件名称 | 描述 | 属性 | 优先级 |
|---------|------|------|--------|
| api_request | API 请求完成 | method, endpoint, duration, status_code | P0 |
| llm_proxy_request | LLM 代理请求 | provider, model, duration, tokens_used | P0 |
| user_signup | 用户注册 | source, email_domain | P0 |
| user_login | 用户登录 | success, method | P0 |
| document_parse | 文档解析 | file_type, file_size, duration, status | P1 |

## 10. 风险和缓解策略

| 风险 | 概率 | 影响 | 缓解策略 |
|------|------|------|----------|
| LLM API 限制 | 高 | API 调用失败 | 实现重试逻辑和速率限制 |
| 数据库性能 | 中 | 查询慢 | 优化查询,添加索引,使用缓存 |
| 安全漏洞 | 中 | 数据泄露 | 定期安全审计,使用 HTTPS,输入验证 |
| 部署失败 | 低 | 服务中断 | CI/CD 自动化测试,蓝绿部署 |

## 11. 时间线和里程碑

### 项目阶段

**阶段 1: 架构设计和设置 (1 周)**
- [ ] 后端架构设计完成
- [ ] 项目结构创建
- [ ] Cloudflare 资源配置

**阶段 2: 核心功能开发 (2 周)**
- Sprint 1 (Week 1): LLM API 代理服务
- Sprint 2 (Week 2): 用户认证和管理

**阶段 3: 高级功能开发 (1.5 周)**
- Week 3: 用户故事管理和文件上传
- Week 4: 配置管理和实时通信

**阶段 4: 测试和部署 (0.5 周)**
- [ ] 单元和集成测试
- [ ] 性能和安全测试
- [ ] 生产环境部署

### 依赖关系

| 依赖 | 负责人 | 状态 | 截止日期 | 是否阻塞 |
|------|--------|------|----------|----------|
| Cloudflare 账户 | DevOps | 已准备 | 项目开始 | 是 |
| Supabase 项目 | DevOps | 已准备 | 项目开始 | 是 |
| LLM API 密钥 | 产品负责人 | 需要提供 | Sprint 1 开始 | 是 |

## 12. 待解决问题和假设

### 待解决问题

1. **LLM API 密钥管理**: 我们是否需要一个密钥轮换机制?
   - 需要在 Sprint 1 结束前决定
   - 负责人: 架构师
   - 推荐: 实现密钥轮换功能,每 90 天轮换一次

2. **文档解析引擎**: 我们应该支持哪些文件格式?
   - 需要在 Sprint 2 开始前决定
   - 负责人: 开发人员

### 假设

1. 前端应用已经能够处理 JWT token 认证
2. 用户能够接受邮箱/密码登录方式
3. Cloudflare Workers 提供足够的计算资源
4. Supabase 提供足够的数据库性能

### 范围之外 (明确不包括)

1. 第三方登录 (Google, GitHub) - 计划在 v2.0 实现
2. 实时协作功能 - 不包含在当前版本
3. 自定义 LLM 模型支持 - 优先级较低

## 13. 资源和团队

**核心团队:**
- 架构师: 1 人
- 后端开发人员: 1-2 人
- 前端开发人员: 1 人 (支持)
- DevOps: 1 人

**扩展团队:**
- QA: 1 人 (测试阶段)
- 安全审计: 1 人 (部署前)

## 14. 发布计划

**预发布:**
- [ ] Alpha 测试 (内部团队)
- [ ] Beta 测试 (50-100 名用户)
- [ ] 文档编写和更新
- [ ] 支持团队培训

**发布:**
- [ ] 生产环境部署
- [ ] 官方公告
- [ ] 社交媒体推广
- [ ] 客户支持准备

**发布后:**
- [ ] 每日监控服务指标
- [ ] 收集用户反馈
- [ ] 修复紧急问题
- [ ] 规划下一版本功能

## 15. 变更日志

| 日期 | 版本 | 变更 | 作者 |
|------|------|------|------|
| 2026-02-16 | 1.0 | 初始版本 | StoryWeaver Team |

---

## 实施计划

### 任务 1: 后端项目结构创建

**文件:**
- 创建: `backend/` 目录
- 创建: `backend/package.json` - 项目依赖配置
- 创建: `backend/tsconfig.json` - TypeScript 配置
- 创建: `backend/vite.config.ts` - Vite 配置
- 创建: `backend/src/index.ts` - 入口文件
- 创建: `backend/src/routes/` - 路由目录
- 创建: `backend/src/middleware/` - 中间件目录
- 创建: `backend/src/utils/` - 工具函数目录
- 创建: `backend/src/types/` - TypeScript 类型目录

**步骤 1: 创建 backend/package.json**

```json
{
  "name": "storyweaver-backend",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "wrangler dev src/index.ts",
    "build": "wrangler build src/index.ts",
    "deploy": "wrangler deploy src/index.ts"
  },
  "dependencies": {
    "hono": "^4.0.0",
    "jsonwebtoken": "^9.0.0",
    "bcryptjs": "^2.4.0",
    "@supabase/supabase-js": "^2.0.0"
  },
  "devDependencies": {
    "@cloudflare/workers-types": "^4.0.0",
    "typescript": "^5.0.0",
    "wrangler": "^3.0.0"
  }
}
```

**步骤 2: 创建入口文件 src/index.ts**

```typescript
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { secureHeaders } from 'hono/secure-headers';
import { authMiddleware } from './middleware/auth';
import { llmProxyRoutes } from './routes/llm';
import { authRoutes } from './routes/auth';

const app = new Hono();

// 全局中间件
app.use('*', cors());
app.use('*', logger());
app.use('*', secureHeaders());

// 健康检查
app.get('/health', (c) => {
  return c.json({
    success: true,
    message: 'Service is healthy',
    timestamp: Date.now(),
  });
});

// 认证路由 (不需要鉴权)
app.route('/api/auth', authRoutes);

// 需要鉴权的路由
app.use('/api/*', authMiddleware);

// LLM 代理路由
app.route('/api/llm', llmProxyRoutes);

export default app;
```

**步骤 3: 创建认证中间件 src/middleware/auth.ts**

```typescript
import { Context, Next } from 'hono';
import { verify } from 'jsonwebtoken';

export const authMiddleware = async (c: Context, next: Next) => {
  const authHeader = c.req.header('Authorization');
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return c.json({
      success: false,
      error: {
        code: 'UNAUTHORIZED',
        message: 'Authorization header is missing or invalid',
      },
    }, 401);
  }

  const token = authHeader.slice(7);
  const jwtSecret = c.env.JWT_SECRET;

  try {
    const decoded = verify(token, jwtSecret) as any;
    c.set('user', decoded);
    await next();
  } catch (error) {
    return c.json({
      success: false,
      error: {
        code: 'INVALID_TOKEN',
        message: 'Invalid or expired token',
      },
    }, 401);
  }
};
```

**步骤 4: 创建 LLM 代理路由 src/routes/llm.ts**

```typescript
import { Hono } from 'hono';

export const llmProxyRoutes = new Hono();

// OpenAI API 代理
llmProxyRoutes.post('/openai/*', async (c) => {
  const path = c.req.path.replace('/api/llm/openai/', '');
  const body = await c.req.json();
  const apiKey = c.env.OPENAI_API_KEY;
  
  const response = await fetch(`https://api.openai.com/v1/${path}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify(body),
  });

  const data = await response.json();
  
  return c.json({
    success: true,
    data,
  }, response.status);
});

// Claude API 代理
llmProxyRoutes.post('/claude/*', async (c) => {
  const path = c.req.path.replace('/api/llm/claude/', '');
  const body = await c.req.json();
  const apiKey = c.env.CLAUDE_API_KEY;
  
  const response = await fetch(`https://api.anthropic.com/v1/${path}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify(body),
  });

  const data = await response.json();
  
  return c.json({
    success: true,
    data,
  }, response.status);
});
```

**步骤 5: 创建认证路由 src/routes/auth.ts**

```typescript
import { Hono } from 'hono';
import { sign } from 'jsonwebtoken';
import { hash, compare } from 'bcryptjs';
import { createClient } from '@supabase/supabase-js';

export const authRoutes = new Hono();

const supabaseUrl = 'https://your-supabase-project.supabase.co';
const supabaseKey = 'your-supabase-anon-key';

const supabase = createClient(supabaseUrl, supabaseKey);

// 用户注册
authRoutes.post('/signup', async (c) => {
  const { email, password, name } = await c.req.json();

  // 验证输入
  if (!email || !password || !name) {
    return c.json({
      success: false,
      error: {
        code: 'INVALID_INPUT',
        message: 'Email, password, and name are required',
      },
    }, 400);
  }

  try {
    // 检查用户是否已存在
    const { data: existingUser, error: checkError } = await supabase
      .from('users')
      .select('id')
      .eq('email', email)
      .single();

    if (existingUser) {
      return c.json({
        success: false,
        error: {
          code: 'USER_EXISTS',
          message: 'User with this email already exists',
        },
      }, 409);
    }

    // 哈希密码
    const passwordHash = await hash(password, 10);

    // 创建用户
    const { data: newUser, error: createError } = await supabase
      .from('users')
      .insert({
        email,
        password_hash: passwordHash,
        name,
        role: 'user',
      })
      .select()
      .single();

    if (createError) {
      throw createError;
    }

    // 生成 JWT token
    const token = sign(
      {
        userId: newUser.id,
        email: newUser.email,
        name: newUser.name,
        role: newUser.role,
      },
      c.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    return c.json({
      success: true,
      data: {
        user: {
          id: newUser.id,
          email: newUser.email,
          name: newUser.name,
          role: newUser.role,
        },
        token,
      },
      message: 'User created successfully',
    });
  } catch (error) {
    console.error('Signup error:', error);
    return c.json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: 'Failed to create user',
        details: error.message,
      },
    }, 500);
  }
});

// 用户登录
authRoutes.post('/login', async (c) => {
  const { email, password } = await c.req.json();

  if (!email || !password) {
    return c.json({
      success: false,
      error: {
        code: 'INVALID_INPUT',
        message: 'Email and password are required',
      },
    }, 400);
  }

  try {
    // 查找用户
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();

    if (userError || !user) {
      return c.json({
        success: false,
        error: {
          code: 'INVALID_CREDENTIALS',
          message: 'Invalid email or password',
        },
      }, 401);
    }

    // 验证密码
    const isValidPassword = await compare(password, user.password_hash);

    if (!isValidPassword) {
      return c.json({
        success: false,
        error: {
          code: 'INVALID_CREDENTIALS',
          message: 'Invalid email or password',
        },
      }, 401);
    }

    // 生成 JWT token
    const token = sign(
      {
        userId: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
      c.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    return c.json({
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        },
        token,
      },
      message: 'Login successful',
    });
  } catch (error) {
    console.error('Login error:', error);
    return c.json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: 'Failed to login',
        details: error.message,
      },
    }, 500);
  }
});
```

**步骤 6: 创建类型定义 src/types/index.ts**

```typescript
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: ApiError;
  timestamp: number;
  requestId?: string;
}

export interface ApiError {
  code: string;
  message: string;
  details?: any;
  traceId?: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  avatarUrl?: string;
  role: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface JwtPayload {
  userId: string;
  email: string;
  name: string;
  role: string;
  iat?: number;
  exp?: number;
}

export interface LLMProxyRequest {
  provider: string;
  model: string;
  messages: LLMMessage[];
  temperature?: number;
  maxTokens?: number;
  stream?: boolean;
}

export interface LLMMessage {
  role: string;
  content: string;
}

export interface LLMProxyResponse {
  id: string;
  model: string;
  choices: LLMCompletionChoice[];
  usage?: LLMUsage;
}

export interface LLMCompletionChoice {
  index: number;
  message: LLMMessage;
  finishReason?: string;
}

export interface LLMUsage {
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
}
```

**步骤 7: 创建工具函数 src/utils/jwt.ts**

```typescript
import { sign, verify, JwtPayload } from 'jsonwebtoken';

export function generateToken(payload: any, secret: string, expiresIn: string = '24h') {
  return sign(payload, secret, { expiresIn });
}

export function verifyToken(token: string, secret: string) {
  try {
    return verify(token, secret) as JwtPayload;
  } catch (error) {
    return null;
  }
}
```

**步骤 8: 创建 wrangler.toml 配置文件**

```toml
name = "storyweaver-backend"
main = "src/index.ts"
compatibility_date = "2026-02-16"
workers_dev = true

[route]
pattern = "your-domain.com/*"
zone_name = "your-domain.com"

[vars]
JWT_SECRET = "your-jwt-secret-key"
OPENAI_API_KEY = "your-openai-api-key"
CLAUDE_API_KEY = "your-claude-api-key"
SUPABASE_URL = "https://your-supabase-project.supabase.co"
SUPABASE_KEY = "your-supabase-anon-key"

[kv_namespaces]
binding = "STORYWEAVER_KV"
id = "your-kv-namespace-id"

[[r2_buckets]]
binding = "STORYWEAVER_R2"
bucket_name = "storyweaver-files"

[[queues]]
binding = "STORYWEAVER_QUEUE"
queue_name = "storyweaver-tasks"

[triggers]
crons = [
  "0 0 * * *"
]
```

**步骤 9: 创建 tsconfig.json**

```json
{
  "compilerOptions": {
    "target": "ESNext",
    "module": "ESNext",
    "moduleResolution": "Node",
    "lib": ["ESNext"],
    "types": ["@cloudflare/workers-types"],
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "baseUrl": "./",
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules"]
}
```

**步骤 10: 初始化项目**

Run:
```bash
cd backend
npm install
npm run dev
```

Expected: Wrangler dev server starts on http://localhost:8787

**步骤 11: 测试基础功能**

Test health check:
```bash
curl http://localhost:8787/health
```

Expected response:
```json
{"success":true,"message":"Service is healthy","timestamp":1734381234567}
```

**步骤 12: 提交初始代码**

Run:
```bash
git add backend/
git commit -m "feat: initial backend project structure with Hono and Cloudflare Workers"
```

### 任务 2: 实现用户认证和权限管理

**文件:**
- 创建: `backend/src/routes/auth.ts` - 认证路由
- 创建: `backend/src/middleware/auth.ts` - 认证中间件
- 创建: `backend/src/utils/jwt.ts` - JWT 工具函数
- 创建: `backend/src/utils/password.ts` - 密码哈希工具

**步骤 1: 实现用户密码哈希功能**

```typescript
// src/utils/password.ts
import { hash, compare } from 'bcryptjs';

export async function hashPassword(password: string): Promise<string> {
  return hash(password, 10);
}

export async function comparePassword(
  password: string, 
  hashedPassword: string
): Promise<boolean> {
  return compare(password, hashedPassword);
}
```

**步骤 2: 实现密码重置功能**

```typescript
// src/routes/auth.ts - 添加密码重置路由
authRoutes.post('/reset-password', async (c) => {
  const { email } = await c.req.json();

  // 实现密码重置逻辑
  // 发送密码重置链接到用户邮箱
  // 这里简化处理
  
  return c.json({
    success: true,
    message: 'Password reset email sent',
  });
});
```

**步骤 3: 实现刷新 token 功能**

```typescript
// src/routes/auth.ts - 添加刷新 token 路由
authRoutes.post('/refresh-token', async (c) => {
  const refreshToken = c.req.header('Refresh-Token');
  
  if (!refreshToken) {
    return c.json({
      success: false,
      error: {
        code: 'MISSING_TOKEN',
        message: 'Refresh token is required',
      },
    }, 400);
  }

  // 验证刷新 token 并生成新的 access token
  // 这里简化处理
  
  return c.json({
    success: true,
    data: {
      token: 'new-access-token',
    },
  });
});
```

### 任务 3: 实现用户故事管理 API

**文件:**
- 创建: `backend/src/routes/stories.ts` - 故事管理路由
- 创建: `backend/src/services/stories.ts` - 故事业务逻辑
- 创建: `backend/src/repositories/stories.ts` - 故事数据访问层

**步骤 1: 创建数据访问层**

```typescript
// src/repositories/stories.ts
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://your-supabase-project.supabase.co';
const supabaseKey = 'your-supabase-anon-key';

const supabase = createClient(supabaseUrl, supabaseKey);

export interface Story {
  id: string;
  userId: string;
  documentId: string;
  title: string;
  description: string;
  role: string;
  action: string;
  value: string;
  module: string;
  priority: string;
  status: string;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateStoryInput {
  userId: string;
  documentId: string;
  title: string;
  description: string;
  role: string;
  action: string;
  value: string;
  module: string;
  priority: string;
  status: string;
  tags?: string[];
}

export const storyRepository = {
  async findAllByUserId(userId: string): Promise<Story[]> {
    const { data, error } = await supabase
      .from('stories')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data as Story[];
  },

  async findById(id: string, userId: string): Promise<Story | null> {
    const { data, error } = await supabase
      .from('stories')
      .select('*')
      .eq('id', id)
      .eq('user_id', userId)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data as Story | null;
  },

  async create(input: CreateStoryInput): Promise<Story> {
    const { data, error } = await supabase
      .from('stories')
      .insert({
        user_id: input.userId,
        document_id: input.documentId,
        title: input.title,
        description: input.description,
        role: input.role,
        action: input.action,
        value: input.value,
        module: input.module,
        priority: input.priority,
        status: input.status,
        tags: input.tags || [],
      })
      .select('*')
      .single();

    if (error) throw error;
    return data as Story;
  },

  async update(id: string, userId: string, updates: Partial<CreateStoryInput>): Promise<Story | null> {
    const { data, error } = await supabase
      .from('stories')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .eq('user_id', userId)
      .select('*')
      .single();

    if (error) throw error;
    return data as Story | null;
  },

  async delete(id: string, userId: string): Promise<boolean> {
    const { error } = await supabase
      .from('stories')
      .delete()
      .eq('id', id)
      .eq('user_id', userId);

    if (error) throw error;
    return true;
  },

  async search(userId: string, query: string): Promise<Story[]> {
    const { data, error } = await supabase
      .from('stories')
      .select('*')
      .eq('user_id', userId)
      .ilike('title', `%${query}%`)
      .or(`description.ilike.%${query}%,role.ilike.%${query}%,action.ilike.%${query}%,value.ilike.%${query}%`)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data as Story[];
  },
};
```

**步骤 2: 创建业务逻辑层**

```typescript
// src/services/stories.ts
import { storyRepository, type CreateStoryInput, type Story } from '../repositories/stories';

export const storyService = {
  async getAllStories(userId: string): Promise<Story[]> {
    return storyRepository.findAllByUserId(userId);
  },

  async getStoryById(id: string, userId: string): Promise<Story | null> {
    return storyRepository.findById(id, userId);
  },

  async createStory(input: CreateStoryInput): Promise<Story> {
    // 验证输入
    if (!input.title || !input.description || !input.role || !input.action || !input.value) {
      throw new Error('Missing required fields');
    }

    return storyRepository.create(input);
  },

  async updateStory(id: string, userId: string, updates: Partial<CreateStoryInput>): Promise<Story | null> {
    return storyRepository.update(id, userId, updates);
  },

  async deleteStory(id: string, userId: string): Promise<boolean> {
    return storyRepository.delete(id, userId);
  },

  async searchStories(userId: string, query: string): Promise<Story[]> {
    if (!query || query.trim().length < 2) {
      return [];
    }

    return storyRepository.search(userId, query.trim());
  },
};
```

**步骤 3: 创建 API 路由**

```typescript
// src/routes/stories.ts
import { Hono } from 'hono';
import { storyService } from '../services/stories';

export const storyRoutes = new Hono();

// 获取用户的所有故事
storyRoutes.get('/', async (c) => {
  try {
    const user = c.get('user');
    const stories = await storyService.getAllStories(user.userId);

    return c.json({
      success: true,
      data: stories,
    });
  } catch (error) {
    console.error('Get stories error:', error);
    return c.json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: 'Failed to get stories',
        details: error.message,
      },
    }, 500);
  }
});

// 获取单个故事
storyRoutes.get('/:id', async (c) => {
  try {
    const user = c.get('user');
    const id = c.req.param('id');
    const story = await storyService.getStoryById(id, user.userId);

    if (!story) {
      return c.json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Story not found',
        },
      }, 404);
    }

    return c.json({
      success: true,
      data: story,
    });
  } catch (error) {
    console.error('Get story error:', error);
    return c.json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: 'Failed to get story',
        details: error.message,
      },
    }, 500);
  }
});

// 创建故事
storyRoutes.post('/', async (c) => {
  try {
    const user = c.get('user');
    const input = await c.req.json();

    const story = await storyService.createStory({
      ...input,
      userId: user.userId,
    });

    return c.json({
      success: true,
      data: story,
      message: 'Story created successfully',
    }, 201);
  } catch (error) {
    console.error('Create story error:', error);
    return c.json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: 'Failed to create story',
        details: error.message,
      },
    }, 500);
  }
});

// 更新故事
storyRoutes.put('/:id', async (c) => {
  try {
    const user = c.get('user');
    const id = c.req.param('id');
    const updates = await c.req.json();

    const story = await storyService.updateStory(id, user.userId, updates);

    if (!story) {
      return c.json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Story not found',
        },
      }, 404);
    }

    return c.json({
      success: true,
      data: story,
      message: 'Story updated successfully',
    });
  } catch (error) {
    console.error('Update story error:', error);
    return c.json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: 'Failed to update story',
        details: error.message,
      },
    }, 500);
  }
});

// 删除故事
storyRoutes.delete('/:id', async (c) => {
  try {
    const user = c.get('user');
    const id = c.req.param('id');

    const success = await storyService.deleteStory(id, user.userId);

    if (!success) {
      return c.json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Story not found',
        },
      }, 404);
    }

    return c.json({
      success: true,
      message: 'Story deleted successfully',
    });
  } catch (error) {
    console.error('Delete story error:', error);
    return c.json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: 'Failed to delete story',
        details: error.message,
      },
    }, 500);
  }
});

// 搜索故事
storyRoutes.get('/search', async (c) => {
  try {
    const user = c.get('user');
    const query = c.req.query('q') || '';

    const stories = await storyService.searchStories(user.userId, query);

    return c.json({
      success: true,
      data: stories,
    });
  } catch (error) {
    console.error('Search stories error:', error);
    return c.json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: 'Failed to search stories',
        details: error.message,
      },
    }, 500);
  }
});
```

**步骤 4: 在入口文件中添加路由**

```typescript
// src/index.ts - 添加故事路由
import { storyRoutes } from './routes/stories';

app.route('/api/stories', storyRoutes);
```

**步骤 5: 测试用户故事 API**

Test creating a story:
```bash
curl -X POST http://localhost:8787/api/stories \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "documentId": "test-document-id",
    "title": "Test Story",
    "description": "This is a test story",
    "role": "User",
    "action": "Click button",
    "value": "View details",
    "module": "Dashboard",
    "priority": "P0",
    "status": "draft",
    "tags": ["test"]
  }'
```

### 任务 4: 实现配置管理 API

**文件:**
- 创建: `backend/src/routes/config.ts` - 配置管理路由
- 创建: `backend/src/repositories/config.ts` - 配置数据访问层
- 创建: `backend/src/services/config.ts` - 配置业务逻辑

**步骤 1: 创建配置数据访问层**

```typescript
// src/repositories/config.ts
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://your-supabase-project.supabase.co';
const supabaseKey = 'your-supabase-anon-key';

const supabase = createClient(supabaseUrl, supabaseKey);

export interface UserConfig {
  id: string;
  userId: string;
  llmProvider: string;
  defaultModel: string;
  temperature: number;
  maxTokens: number;
  autoSave: boolean;
  theme: string;
  notificationsEnabled: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface UpdateConfigInput {
  llmProvider?: string;
  defaultModel?: string;
  temperature?: number;
  maxTokens?: number;
  autoSave?: boolean;
  theme?: string;
  notificationsEnabled?: boolean;
}

export const configRepository = {
  async findByUserId(userId: string): Promise<UserConfig | null> {
    const { data, error } = await supabase
      .from('user_configs')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data as UserConfig | null;
  },

  async create(userId: string): Promise<UserConfig> {
    const { data, error } = await supabase
      .from('user_configs')
      .insert({
        user_id: userId,
        llm_provider: 'openai',
        default_model: 'gpt-3.5-turbo',
        temperature: 0.7,
        max_tokens: 2048,
        auto_save: true,
        theme: 'light',
        notifications_enabled: true,
      })
      .select('*')
      .single();

    if (error) throw error;
    return data as UserConfig;
  },

  async update(userId: string, updates: UpdateConfigInput): Promise<UserConfig | null> {
    const { data, error } = await supabase
      .from('user_configs')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', userId)
      .select('*')
      .single();

    if (error) throw error;
    return data as UserConfig | null;
  },

  async getDefaultConfig(): Promise<UpdateConfigInput> {
    return {
      llmProvider: 'openai',
      defaultModel: 'gpt-3.5-turbo',
      temperature: 0.7,
      maxTokens: 2048,
      autoSave: true,
      theme: 'light',
      notificationsEnabled: true,
    };
  },
};
```

**步骤 2: 创建配置业务逻辑**

```typescript
// src/services/config.ts
import { configRepository, type UserConfig, type UpdateConfigInput } from '../repositories/config';

export const configService = {
  async getUserConfig(userId: string): Promise<UserConfig> {
    let config = await configRepository.findByUserId(userId);
    
    if (!config) {
      config = await configRepository.create(userId);
    }
    
    return config;
  },

  async updateUserConfig(userId: string, updates: UpdateConfigInput): Promise<UserConfig | null> {
    // 验证输入
    if (updates.temperature !== undefined && (updates.temperature < 0 || updates.temperature > 2)) {
      throw new Error('Temperature must be between 0 and 2');
    }

    if (updates.maxTokens !== undefined && (updates.maxTokens < 1 || updates.maxTokens > 4096)) {
      throw new Error('Max tokens must be between 1 and 4096');
    }

    return configRepository.update(userId, updates);
  },

  async resetUserConfig(userId: string): Promise<UserConfig> {
    const defaultConfig = await configRepository.getDefaultConfig();
    const updated = await configRepository.update(userId, defaultConfig);
    
    if (!updated) {
      return configRepository.create(userId);
    }
    
    return updated;
  },
};
```

**步骤 3: 创建配置管理路由**

```typescript
// src/routes/config.ts
import { Hono } from 'hono';
import { configService } from '../services/config';

export const configRoutes = new Hono();

// 获取用户配置
configRoutes.get('/', async (c) => {
  try {
    const user = c.get('user');
    const config = await configService.getUserConfig(user.userId);

    return c.json({
      success: true,
      data: config,
    });
  } catch (error) {
    console.error('Get config error:', error);
    return c.json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: 'Failed to get user config',
        details: error.message,
      },
    }, 500);
  }
});

// 更新用户配置
configRoutes.put('/', async (c) => {
  try {
    const user = c.get('user');
    const updates = await c.req.json();

    const config = await configService.updateUserConfig(user.userId, updates);

    return c.json({
      success: true,
      data: config,
      message: 'Config updated successfully',
    });
  } catch (error) {
    console.error('Update config error:', error);
    return c.json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: 'Failed to update user config',
        details: error.message,
      },
    }, 500);
  }
});

// 重置用户配置
configRoutes.post('/reset', async (c) => {
  try {
    const user = c.get('user');
    const config = await configService.resetUserConfig(user.userId);

    return c.json({
      success: true,
      data: config,
      message: 'Config reset to defaults',
    });
  } catch (error) {
    console.error('Reset config error:', error);
    return c.json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: 'Failed to reset config',
        details: error.message,
      },
    }, 500);
  }
});
```

**步骤 4: 在入口文件中添加路由**

```typescript
// src/index.ts - 添加配置管理路由
import { configRoutes } from './routes/config';

app.route('/api/config', configRoutes);
```

### 任务 5: 实现文件上传处理 API

**文件:**
- 创建: `backend/src/routes/files.ts` - 文件处理路由
- 创建: `backend/src/services/files.ts` - 文件处理业务逻辑
- 创建: `backend/src/utils/fileParser.ts` - 文件解析工具
- 创建: `backend/src/repositories/documents.ts` - 文档数据访问

**步骤 1: 创建文档数据访问层**

```typescript
// src/repositories/documents.ts
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://your-supabase-project.supabase.co';
const supabaseKey = 'your-supabase-anon-key';

const supabase = createClient(supabaseUrl, supabaseKey);

export interface Document {
  id: string;
  userId: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  storagePath: string;
  parsedContent: string;
  status: string;
  parsedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export const documentRepository = {
  async findAllByUserId(userId: string): Promise<Document[]> {
    const { data, error } = await supabase
      .from('documents')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data as Document[];
  },

  async findById(id: string, userId: string): Promise<Document | null> {
    const { data, error } = await supabase
      .from('documents')
      .select('*')
      .eq('id', id)
      .eq('user_id', userId)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data as Document | null;
  },

  async create(input: Omit<Document, 'id' | 'createdAt' | 'updatedAt'>): Promise<Document> {
    const { data, error } = await supabase
      .from('documents')
      .insert({
        user_id: input.userId,
        file_name: input.fileName,
        file_type: input.fileType,
        file_size: input.fileSize,
        storage_path: input.storagePath,
        parsed_content: input.parsedContent,
        status: input.status,
        parsed_at: input.parsedAt,
      })
      .select('*')
      .single();

    if (error) throw error;
    return data as Document;
  },

  async updateStatus(id: string, userId: string, status: string): Promise<Document | null> {
    const { data, error } = await supabase
      .from('documents')
      .update({
        status,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .eq('user_id', userId)
      .select('*')
      .single();

    if (error) throw error;
    return data as Document | null;
  },

  async updateParsedContent(id: string, userId: string, parsedContent: string): Promise<Document | null> {
    const { data, error } = await supabase
      .from('documents')
      .update({
        parsed_content: parsedContent,
        status: 'parsed',
        parsed_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .eq('user_id', userId)
      .select('*')
      .single();

    if (error) throw error;
    return data as Document | null;
  },

  async delete(id: string, userId: string): Promise<boolean> {
    const { error } = await supabase
      .from('documents')
      .delete()
      .eq('id', id)
      .eq('user_id', userId);

    if (error) throw error;
    return true;
  },
};
```

**步骤 2: 创建文件解析工具**

```typescript
// src/utils/fileParser.ts
import mammoth from 'mammoth';
import pdfjs from 'pdfjs-dist/legacy/build/pdf';
import { marked } from 'marked';

export type FileType = 'docx' | 'pdf' | 'txt' | 'md' | 'unknown';

export interface ParseResult {
  content: string;
  metadata: {
    wordCount: number;
    charCount: number;
    pages?: number;
  };
}

export const fileParser = {
  async parseFile(fileData: Buffer, fileName: string, mimeType: string): Promise<ParseResult> {
    const fileType = this.detectFileType(fileName, mimeType);

    switch (fileType) {
      case 'docx':
        return this.parseDocx(fileData);
      case 'pdf':
        return this.parsePdf(fileData);
      case 'txt':
        return this.parseText(fileData);
      case 'md':
        return this.parseMarkdown(fileData);
      default:
        throw new Error(`Unsupported file type: ${fileType}`);
    }
  },

  detectFileType(fileName: string, mimeType: string): FileType {
    const ext = fileName.split('.').pop()?.toLowerCase();
    
    if (ext === 'docx' || mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
      return 'docx';
    }
    
    if (ext === 'pdf' || mimeType === 'application/pdf') {
      return 'pdf';
    }
    
    if (ext === 'txt' || mimeType === 'text/plain') {
      return 'txt';
    }
    
    if (ext === 'md' || ext === 'markdown' || mimeType === 'text/markdown') {
      return 'md';
    }
    
    return 'unknown';
  },

  async parseDocx(fileData: Buffer): Promise<ParseResult> {
    try {
      const result = await mammoth.extractRawText({ buffer: fileData });
      const content = result.value;
      const wordCount = content.split(/\s+/).filter(word => word.length > 0).length;
      
      return {
        content,
        metadata: {
          wordCount,
          charCount: content.length,
        },
      };
    } catch (error) {
      throw new Error('Failed to parse DOCX file');
    }
  },

  async parsePdf(fileData: Buffer): Promise<ParseResult> {
    try {
      const data = new Uint8Array(fileData);
      const pdf = await pdfjs.getDocument(data).promise;
      const pages = pdf.numPages;
      let content = '';
      
      for (let i = 1; i <= pages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const pageText = textContent.items.map(item => (item as any).str).join(' ');
        content += pageText + '\n';
      }
      
      const wordCount = content.split(/\s+/).filter(word => word.length > 0).length;
      
      return {
        content,
        metadata: {
          wordCount,
          charCount: content.length,
          pages,
        },
      };
    } catch (error) {
      throw new Error('Failed to parse PDF file');
    }
  },

  parseText(fileData: Buffer): ParseResult {
    try {
      const content = fileData.toString('utf-8');
      const wordCount = content.split(/\s+/).filter(word => word.length > 0).length;
      
      return {
        content,
        metadata: {
          wordCount,
          charCount: content.length,
        },
      };
    } catch (error) {
      throw new Error('Failed to parse text file');
    }
  },

  parseMarkdown(fileData: Buffer): ParseResult {
    try {
      const content = fileData.toString('utf-8');
      const wordCount = content.split(/\s+/).filter(word => word.length > 0).length;
      
      return {
        content,
        metadata: {
          wordCount,
          charCount: content.length,
        },
      };
    } catch (error) {
      throw new Error('Failed to parse Markdown file');
    }
  },
};
```

**步骤 2: 创建文件处理业务逻辑**

```typescript
// src/services/files.ts
import { documentRepository, type Document } from '../repositories/documents';
import { fileParser, type ParseResult } from '../utils/fileParser';

export const fileService = {
  async uploadFile(
    userId: string, 
    fileData: Buffer, 
    fileName: string, 
    mimeType: string
  ): Promise<Document> {
    const fileSize = fileData.length;
    
    // 上传到 Cloudflare R2
    const storagePath = `documents/${userId}/${Date.now()}-${fileName}`;
    
    // 这里应该调用 Cloudflare R2 API 上传文件
    // 简化处理，实际项目中需要实现
    
    // 创建数据库记录
    const document = await documentRepository.create({
      userId,
      fileName,
      fileType: mimeType,
      fileSize,
      storagePath,
      parsedContent: '',
      status: 'uploaded',
      parsedAt: null,
    });

    return document;
  },

  async parseDocument(documentId: string, userId: string): Promise<Document> {
    const document = await documentRepository.findById(documentId, userId);
    
    if (!document) {
      throw new Error('Document not found');
    }

    // 从 Cloudflare R2 下载文件
    // 这里应该调用 Cloudflare R2 API 下载文件
    const fileData = Buffer.from('test content'); // 测试数据
    
    // 解析文件
    const parseResult = await fileParser.parseFile(fileData, document.fileName, document.fileType);
    
    // 更新数据库记录
    const updatedDocument = await documentRepository.updateParsedContent(
      documentId, 
      userId, 
      parseResult.content
    );

    return updatedDocument!;
  },

  async getDocumentById(id: string, userId: string): Promise<Document | null> {
    return documentRepository.findById(id, userId);
  },

  async getAllDocuments(userId: string): Promise<Document[]> {
    return documentRepository.findAllByUserId(userId);
  },

  async deleteDocument(id: string, userId: string): Promise<boolean> {
    const document = await documentRepository.findById(id, userId);
    
    if (!document) {
      return false;
    }

    // 从 Cloudflare R2 删除文件
    // 这里应该调用 Cloudflare R2 API 删除文件
    
    // 从数据库删除记录
    return documentRepository.delete(id, userId);
  },
};
```

**步骤 3: 创建文件处理路由**

```typescript
// src/routes/files.ts
import { Hono } from 'hono';
import { fileService } from '../services/files';

export const fileRoutes = new Hono();

// 文件上传
fileRoutes.post('/upload', async (c) => {
  try {
    const user = c.get('user');
    const formData = await c.req.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return c.json({
        success: false,
        error: {
          code: 'MISSING_FILE',
          message: 'File is required',
        },
      }, 400);
    }

    const arrayBuffer = await file.arrayBuffer();
    const fileData = Buffer.from(arrayBuffer);

    const document = await fileService.uploadFile(
      user.userId,
      fileData,
      file.name,
      file.type
    );

    // 异步解析文件
    fileService.parseDocument(document.id, user.userId)
      .catch(error => console.error('Failed to parse document:', error));

    return c.json({
      success: true,
      data: document,
      message: 'File uploaded successfully',
    }, 201);
  } catch (error) {
    console.error('Upload file error:', error);
    return c.json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: 'Failed to upload file',
        details: error.message,
      },
    }, 500);
  }
});

// 获取用户所有文件
fileRoutes.get('/', async (c) => {
  try {
    const user = c.get('user');
    const documents = await fileService.getAllDocuments(user.userId);

    return c.json({
      success: true,
      data: documents,
    });
  } catch (error) {
    console.error('Get files error:', error);
    return c.json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: 'Failed to get files',
        details: error.message,
      },
    }, 500);
  }
});

// 获取单个文件
fileRoutes.get('/:id', async (c) => {
  try {
    const user = c.get('user');
    const id = c.req.param('id');
    const document = await fileService.getDocumentById(id, user.userId);

    if (!document) {
      return c.json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Document not found',
        },
      }, 404);
    }

    return c.json({
      success: true,
      data: document,
    });
  } catch (error) {
    console.error('Get file error:', error);
    return c.json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: 'Failed to get file',
        details: error.message,
      },
    }, 500);
  }
});

// 删除文件
fileRoutes.delete('/:id', async (c) => {
  try {
    const user = c.get('user');
    const id = c.req.param('id');
    
    const success = await fileService.deleteDocument(id, user.userId);

    if (!success) {
      return c.json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Document not found',
        },
      }, 404);
    }

    return c.json({
      success: true,
      message: 'File deleted successfully',
    });
  } catch (error) {
    console.error('Delete file error:', error);
    return c.json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: 'Failed to delete file',
        details: error.message,
      },
    }, 500);
  }
});
```

**步骤 4: 在入口文件中添加路由**

```typescript
// src/index.ts - 添加文件处理路由
import { fileRoutes } from './routes/files';

app.route('/api/files', fileRoutes);
```

### 任务 6: 部署到 Cloudflare Workers

**文件:**
- 修改: `backend/wrangler.toml` - 部署配置
- 创建: `backend/.github/workflows/deploy.yml` - CI/CD 配置

**步骤 1: 配置部署信息**

```toml
# backend/wrangler.toml
name = "storyweaver-backend"
main = "src/index.ts"
compatibility_date = "2026-02-16"
workers_dev = true

[route]
pattern = "*.your-domain.com/api/*"
zone_name = "your-domain.com"

[vars]
JWT_SECRET = "your-jwt-secret-key"
OPENAI_API_KEY = "your-openai-api-key"
CLAUDE_API_KEY = "your-claude-api-key"
SUPABASE_URL = "https://your-supabase-project.supabase.co"
SUPABASE_KEY = "your-supabase-anon-key"

[kv_namespaces]
binding = "STORYWEAVER_KV"
id = "your-kv-namespace-id"

[[r2_buckets]]
binding = "STORYWEAVER_R2"
bucket_name = "storyweaver-files"

[[queues]]
binding = "STORYWEAVER_QUEUE"
queue_name = "storyweaver-tasks"

[triggers]
crons = [
  "0 0 * * *"
]
```

**步骤 2: 创建 CI/CD 配置**

```yaml
# backend/.github/workflows/deploy.yml
name: Deploy StoryWeaver Backend

on:
  push:
    branches: [ main ]
    paths:
      - 'backend/**'

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v4
    
    - name: Setup Node.js
      uses: actions/setup-node@v4
      with:
        node-version: 20
        cache: 'npm'
        cache-dependency-path: 'backend/package-lock.json'
        
    - name: Install dependencies
      working-directory: ./backend
      run: npm ci
      
    - name: Deploy to Cloudflare Workers
      working-directory: ./backend
      run: npm run deploy
      env:
        CLOUDFLARE_API_TOKEN: ${{ secrets.CLOUDFLARE_API_TOKEN }}
        CLOUDFLARE_ACCOUNT_ID: ${{ secrets.CLOUDFLARE_ACCOUNT_ID }}
```

**步骤 3: 部署到 Cloudflare Workers**

```bash
cd backend
npm run deploy
```

Expected: 部署成功，输出访问 URL。

**步骤 4: 测试生产环境**

Test health check:
```bash
curl https://storyweaver-backend.your-domain.com/health
```

## 16. 资源链接

- [Cloudflare Workers Documentation](https://developers.cloudflare.com/workers/)
- [Hono Documentation](https://hono.dev/)
- [Supabase Documentation](https://supabase.com/docs)
- [OpenAI API Documentation](https://platform.openai.com/docs)

---

## 结论

本 PRD 文档详细描述了 StoryWeaver AI 后端架构的设计和实现计划。架构采用无服务器模式,使用 Cloudflare Workers 作为计算平台,Supabase 作为数据库,Cloudflare R2 作为文件存储。主要功能包括 LLM API 代理、用户认证、用户故事管理、配置管理、文件上传处理等。

文档提供了完整的技术规范、API 设计、数据模型、风险分析和部署计划。每个功能模块都有详细的实现步骤和测试指南。通过遵循本计划,可以快速构建一个安全、可扩展、高可用性的后端服务。