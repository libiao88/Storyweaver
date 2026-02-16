# StoryWeaver AI - 后端架构设计文档

## 1. 架构概述

### 1.1 问题背景

当前 StoryWeaver AI 是一个纯前端应用，存在以下架构问题：

1. **CORS 跨域限制**：浏览器端直接调用 LLM API 导致跨域错误
2. **API 密钥暴露**：API 密钥存储在前端代码中，存在安全风险
3. **缺乏后端逻辑**：复杂业务逻辑无法在前端实现
4. **数据持久化缺失**：用户故事和配置无法持久化存储
5. **用户管理空白**：缺乏用户认证和权限管理

### 1.2 架构目标

设计一个完整的后端架构，解决上述问题并实现：

1. **API 代理服务**：代理 LLM API 调用，解决 CORS 问题
2. **数据持久化**：存储用户故事、配置和用户信息
3. **用户管理**：完整的用户认证和权限系统
4. **业务逻辑处理**：处理复杂的业务逻辑
5. **高可用性**：无服务器架构，自动扩缩容

## 2. 技术选型

### 2.1 部署架构

```
┌─────────────────────────────────────────────────────────────┐
│                     Cloudflare 生态系统                        │
├─────────────────────────────────────────────────────────────┤
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │  Cloudflare  │  │  Cloudflare  │  │  Cloudflare  │      │
│  │  Pages (前)  │  │  Workers (后)│  │  KV Storage  │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│         │                 │                 │                │
│         └────────────┬────┴─────────────────┘                │
│                      ▼                                       │
│              ┌──────────────┐                                │
│              │  Supabase DB │                                │
│              └──────────────┘                                │
└─────────────────────────────────────────────────────────────┘
```

### 2.2 核心技术栈

| 组件 | 技术选择 | 理由 |
|------|----------|------|
| **后端框架** | Hono | 轻量级、TypeScript 原生支持、Cloudflare Workers 优化 |
| **部署平台** | Cloudflare Workers | 无服务器架构、自动扩缩容、与 Pages 集成 |
| **数据库** | Supabase (PostgreSQL) | 已在项目中配置、实时功能、RESTful API |
| **缓存** | Cloudflare KV | 高性能键值存储、低延迟、与 Workers 深度集成 |
| **身份认证** | Supabase Auth | 邮箱/密码、第三方登录、JWT 认证 |
| **实时通信** | Supabase Realtime | WebSocket 支持、PostgreSQL 变更监听 |
| **任务队列** | Cloudflare Queues | 异步任务处理、可靠性保障 |
| **存储** | Cloudflare R2 | 无 egress 费用、S3 兼容、高性能 |

### 2.3 项目结构

```
backend/
├── src/
│   ├── app.ts                 # 主应用入口
│   ├── config/                # 配置文件
│   │   ├── index.ts
│   │   └── env.ts
│   ├── controllers/           # 控制器
│   │   ├── auth.controller.ts
│   │   ├── story.controller.ts
│   │   ├── llm.controller.ts
│   │   ├── config.controller.ts
│   │   └── upload.controller.ts
│   ├── services/              # 服务层
│   │   ├── auth.service.ts
│   │   ├── story.service.ts
│   │   ├── llm.service.ts
│   │   ├── config.service.ts
│   │   └── upload.service.ts
│   ├── models/                # 数据模型
│   │   ├── user.model.ts
│   │   ├── story.model.ts
│   │   ├── llm-config.model.ts
│   │   └── file.model.ts
│   ├── middleware/            # 中间件
│   │   ├── auth.middleware.ts
│   │   ├── error.middleware.ts
│   │   └── validation.middleware.ts
│   ├── routes/                # 路由
│   │   ├── auth.routes.ts
│   │   ├── story.routes.ts
│   │   ├── llm.routes.ts
│   │   ├── config.routes.ts
│   │   └── upload.routes.ts
│   ├── utils/                 # 工具函数
│   │   ├── logger.ts
│   │   ├── validator.ts
│   │   ├── error-handler.ts
│   │   └── helpers.ts
│   └── types/                 # TypeScript 类型
│       ├── index.ts
│       ├── request.ts
│       └── response.ts
├── test/                      # 测试文件
├── wrangler.toml             # Cloudflare Workers 配置
├── package.json
└── tsconfig.json
```

## 3. API 接口设计

### 3.1 基础规范

**API 前缀**：`/api/v1`
**数据格式**：JSON
**认证方式**：JWT Bearer Token
**错误格式**：
```json
{
  "code": "ERROR_CODE",
  "message": "错误描述",
  "details": "附加信息"
}
```

### 3.2 用户认证接口

| 方法 | 路径 | 描述 | 认证 |
|------|------|------|------|
| POST | `/auth/register` | 用户注册 | 否 |
| POST | `/auth/login` | 用户登录 | 否 |
| POST | `/auth/logout` | 用户登出 | 是 |
| POST | `/auth/refresh` | 刷新 Token | 是 |
| GET | `/auth/profile` | 获取用户信息 | 是 |
| PUT | `/auth/profile` | 更新用户信息 | 是 |

### 3.3 用户故事管理接口

| 方法 | 路径 | 描述 | 认证 |
|------|------|------|------|
| GET | `/stories` | 获取用户故事列表 | 是 |
| GET | `/stories/:id` | 获取单个用户故事 | 是 |
| POST | `/stories` | 创建用户故事 | 是 |
| PUT | `/stories/:id` | 更新用户故事 | 是 |
| DELETE | `/stories/:id` | 删除用户故事 | 是 |
| GET | `/stories/search` | 搜索用户故事 | 是 |

### 3.4 LLM 优化接口

| 方法 | 路径 | 描述 | 认证 |
|------|------|------|------|
| POST | `/llm/optimize` | 优化用户故事 | 是 |
| POST | `/llm/test` | 测试 LLM 连接 | 是 |
| GET | `/llm/models` | 获取支持的模型列表 | 是 |
| POST | `/llm/feedback` | 提交优化反馈 | 是 |

### 3.5 配置管理接口

| 方法 | 路径 | 描述 | 认证 |
|------|------|------|------|
| GET | `/config` | 获取用户配置 | 是 |
| PUT | `/config` | 更新用户配置 | 是 |
| GET | `/config/llm` | 获取 LLM 配置 | 是 |
| PUT | `/config/llm` | 更新 LLM 配置 | 是 |

### 3.6 文件上传接口

| 方法 | 路径 | 描述 | 认证 |
|------|------|------|------|
| POST | `/upload` | 上传文件 | 是 |
| GET | `/upload/:id` | 获取文件信息 | 是 |
| DELETE | `/upload/:id` | 删除文件 | 是 |
| POST | `/upload/parse` | 解析上传的文件 | 是 |

## 4. 数据模型设计

### 4.1 用户模型

```typescript
interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  role: 'user' | 'admin';
  created_at: Date;
  updated_at: Date;
}
```

### 4.2 用户故事模型

```typescript
interface Story {
  id: string;
  user_id: string;
  title: string;
  description: string;
  role: string;
  action: string;
  value: string;
  module: string;
  priority: 'P0' | 'P1' | 'P2';
  confidence: {
    overall: number;
    level: 'low' | 'medium' | 'high';
    factors: Record<string, number>;
    reasons: string[];
    needsReview: boolean;
  };
  status: 'draft' | 'published' | 'archived';
  dependencies: string[];
  sourceReference?: string;
  createdAt: Date;
  updatedAt: Date;
}
```

### 4.3 LLM 配置模型

```typescript
interface LLMConfig {
  id: string;
  user_id: string;
  model: string;
  apiKey: string;
  temperature: number;
  maxTokens: number;
  requestTimeout: number;
  createdAt: Date;
  updatedAt: Date;
}
```

### 4.4 文件模型

```typescript
interface File {
  id: string;
  user_id: string;
  filename: string;
  originalName: string;
  size: number;
  mimeType: string;
  url: string;
  status: 'uploaded' | 'parsed' | 'failed';
  parseResult?: any;
  createdAt: Date;
  updatedAt: Date;
}
```

### 4.5 优化历史模型

```typescript
interface OptimizationHistory {
  id: string;
  user_id: string;
  story_id: string;
  model: string;
  originalStory: any;
  optimizedStory: any;
  changes: string[];
  cost: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
    costUSD: number;
  };
  timing: {
    apiCall: number;
    processing: number;
    total: number;
  };
  createdAt: Date;
}
```

## 5. 核心功能实现

### 5.1 LLM API 代理

```typescript
// src/controllers/llm.controller.ts
import { Context } from 'hono';
import { LLMOptimizer } from '../services/llm.service';

export class LLMController {
  private optimizer: LLMOptimizer;

  constructor() {
    this.optimizer = new LLMOptimizer();
  }

  async optimize(c: Context) {
    try {
      const request = await c.req.json();
      const optimized = await this.optimizer.optimize(request);
      
      return c.json({
        success: true,
        data: optimized
      });
    } catch (error) {
      return c.json({
        success: false,
        error: error.message
      }, 500);
    }
  }

  async testConnection(c: Context) {
    try {
      const config = await c.req.json();
      const result = await this.optimizer.testConnection(config);
      
      return c.json({
        success: true,
        data: result
      });
    } catch (error) {
      return c.json({
        success: false,
        error: error.message
      }, 400);
    }
  }
}
```

### 5.2 用户认证

```typescript
// src/controllers/auth.controller.ts
import { Context } from 'hono';
import { AuthService } from '../services/auth.service';

export class AuthController {
  private authService: AuthService;

  constructor() {
    this.authService = new AuthService();
  }

  async login(c: Context) {
    try {
      const { email, password } = await c.req.json();
      const result = await this.authService.login(email, password);
      
      return c.json({
        success: true,
        data: result
      });
    } catch (error) {
      return c.json({
        success: false,
        error: error.message
      }, 401);
    }
  }

  async register(c: Context) {
    try {
      const { email, password, name } = await c.req.json();
      const user = await this.authService.register(email, password, name);
      
      return c.json({
        success: true,
        data: user
      }, 201);
    } catch (error) {
      return c.json({
        success: false,
        error: error.message
      }, 400);
    }
  }
}
```

### 5.3 用户故事管理

```typescript
// src/controllers/story.controller.ts
import { Context } from 'hono';
import { StoryService } from '../services/story.service';

export class StoryController {
  private storyService: StoryService;

  constructor() {
    this.storyService = new StoryService();
  }

  async list(c: Context) {
    try {
      const userId = c.get('userId');
      const stories = await this.storyService.listByUser(userId);
      
      return c.json({
        success: true,
        data: stories
      });
    } catch (error) {
      return c.json({
        success: false,
        error: error.message
      }, 500);
    }
  }

  async create(c: Context) {
    try {
      const userId = c.get('userId');
      const storyData = await c.req.json();
      const story = await this.storyService.create(userId, storyData);
      
      return c.json({
        success: true,
        data: story
      }, 201);
    } catch (error) {
      return c.json({
        success: false,
        error: error.message
      }, 400);
    }
  }

  async update(c: Context) {
    try {
      const userId = c.get('userId');
      const storyId = c.req.param('id');
      const updates = await c.req.json();
      const story = await this.storyService.update(userId, storyId, updates);
      
      return c.json({
        success: true,
        data: story
      });
    } catch (error) {
      return c.json({
        success: false,
        error: error.message
      }, 400);
    }
  }
}
```

## 6. 安全设计

### 6.1 API 密钥安全

- API 密钥加密存储在数据库中
- 每次使用时解密，使用后立即销毁
- 支持 API 密钥轮换和失效
- 监控 API 密钥使用情况

### 6.2 数据加密

- 敏感数据加密存储
- 传输加密（HTTPS）
- 数据库加密（Supabase 加密）

### 6.3 请求验证

- 输入验证和消毒
- 请求限制和频率控制
- SQL 注入防护
- XSS 攻击防护

## 7. 错误处理和日志

### 7.1 错误分类

```typescript
enum ErrorCode {
  // 认证错误
  AUTH_INVALID_CREDENTIALS = 'AUTH_001',
  AUTH_TOKEN_EXPIRED = 'AUTH_002',
  AUTH_TOKEN_INVALID = 'AUTH_003',
  
  // LLM 相关错误
  LLM_API_KEY_MISSING = 'LLM_001',
  LLM_API_CALL_FAILED = 'LLM_002',
  LLM_TIMEOUT = 'LLM_003',
  LLM_INVALID_RESPONSE = 'LLM_004',
  
  // 业务逻辑错误
  STORY_NOT_FOUND = 'STORY_001',
  STORY_INVALID_DATA = 'STORY_002',
  FILE_UPLOAD_FAILED = 'FILE_001',
  
  // 系统错误
  SYSTEM_DATABASE_ERROR = 'SYS_001',
  SYSTEM_SERVICE_UNAVAILABLE = 'SYS_002'
}
```

### 7.2 日志记录

```typescript
// src/utils/logger.ts
import { Logger } from 'hono/logger';

export class AppLogger {
  static info(message: string, data?: any) {
    console.log(`[INFO] ${message}`, data);
  }

  static warn(message: string, data?: any) {
    console.warn(`[WARN] ${message}`, data);
  }

  static error(error: Error, context?: any) {
    console.error(`[ERROR] ${error.message}`, {
      stack: error.stack,
      context
    });
  }

  static request(c: any) {
    const { method, url } = c.req;
    const userAgent = c.req.header('user-agent');
    AppLogger.info(`Request: ${method} ${url}`, { userAgent });
  }

  static response(c: any, status: number, duration: number) {
    const { method, url } = c.req;
    AppLogger.info(`Response: ${method} ${url} - ${status} (${duration}ms)`);
  }
}
```

## 8. 部署方案

### 8.1 Cloudflare Workers 部署

```toml
# wrangler.toml
name = "storyweaver-api"
main = "src/app.ts"
compatibility_date = "2023-12-01"
workers_dev = true

[vars]
NODE_ENV = "production"
SUPABASE_URL = "https://your-project.supabase.co"
SUPABASE_ANON_KEY = "your-anon-key"

[route]
pattern = "api.storyweaver-ai.com/*"
zone_id = "your-zone-id"

[build]
command = "npm run build"
[build.upload]
format = "service-worker"
```

### 8.2 部署命令

```bash
# 安装依赖
npm install

# 本地开发
npm run dev

# 生产构建
npm run build

# 预览
npm run preview

# 部署到 Cloudflare Workers
npm run deploy
```

### 8.3 CI/CD 配置

```yaml
# .github/workflows/deploy.yml
name: Deploy to Cloudflare Workers

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          
      - name: Install dependencies
        run: npm install
        
      - name: Build
        run: npm run build
        
      - name: Deploy to Cloudflare Workers
        uses: cloudflare/wrangler-action@v3
        with:
          apiToken: ${{ secrets.CLOUDFLARE_API_TOKEN }}
          accountId: ${{ secrets.CLOUDFLARE_ACCOUNT_ID }}
          wranglerVersion: '3'
```

## 9. 性能优化

### 9.1 缓存策略

```typescript
// src/middleware/cache.middleware.ts
import { Context } from 'hono';

export function cacheControl(duration: number = 3600) {
  return async (c: Context, next: () => Promise<void>) => {
    await next();
    c.header('Cache-Control', `public, max-age=${duration}`);
    c.header('Expires', new Date(Date.now() + duration * 1000).toUTCString());
  };
}

export function etag() {
  return async (c: Context, next: () => Promise<void>) => {
    await next();
    const etag = crypto.createHash('sha256')
      .update(c.res.body?.toString() || '')
      .digest('hex');
    c.header('ETag', etag);
  };
}
```

### 9.2 响应优化

- Gzip 压缩
- 内容协商
- 资源打包和压缩
- 静态资源 CDN 分发

## 10. 监控和维护

### 10.1 监控指标

```typescript
// src/utils/monitor.ts
export interface Metrics {
  requestCount: number;
  errorCount: number;
  avgResponseTime: number;
  llmApiCallCount: number;
  llmApiSuccessRate: number;
  llmApiAvgResponseTime: number;
  memoryUsage: number;
}

export class MetricsCollector {
  static collect(): Metrics {
    return {
      requestCount: 0,
      errorCount: 0,
      avgResponseTime: 0,
      llmApiCallCount: 0,
      llmApiSuccessRate: 0,
      llmApiAvgResponseTime: 0,
      memoryUsage: process.memoryUsage().rss
    };
  }
}
```

### 10.2 健康检查

```typescript
// src/routes/health.routes.ts
import { Hono } from 'hono';

const health = new Hono();

health.get('/', async (c) => {
  try {
    // 检查数据库连接
    // 检查外部服务可用性
    // 检查资源利用率
    
    return c.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      version: '1.0.0',
      services: {
        database: 'healthy',
        llmApi: 'healthy',
        cache: 'healthy'
      }
    });
  } catch (error) {
    return c.json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: error.message
    }, 503);
  }
});

export { health };
```

## 11. 实施计划

### Phase 1: 基础架构（1周）

- 项目初始化和配置
- 核心框架搭建
- 数据库连接
- 基础错误处理

### Phase 2: 用户认证（1周）

- 用户注册和登录
- JWT 认证中间件
- 用户信息管理

### Phase 3: 业务功能（2周）

- 用户故事管理 API
- LLM API 代理服务
- 文件上传处理
- 配置管理

### Phase 4: 优化和完善（1周）

- 错误处理和日志记录
- 性能优化
- 安全增强
- API 文档

### Phase 5: 部署和测试（1周）

- 部署到 Cloudflare Workers
- 集成测试
- 生产环境配置

## 12. 风险评估

### 12.1 技术风险

| 风险 | 影响 | 缓解措施 |
|------|------|----------|
| Cloudflare Workers 限制 | CPU/内存限制 | 代码优化、资源监控 |
| LLM API 不稳定 | 服务中断 | 重试机制、备用方案 |
| 数据库连接问题 | 数据不可用 | 连接池、重试逻辑 |

### 12.2 业务风险

| 风险 | 影响 | 缓解措施 |
|------|------|----------|
| 用户量增长 | 性能下降 | 自动扩缩容、缓存优化 |
| API 调用费用 | 成本超支 | 使用限制、预算控制 |
| 安全漏洞 | 数据泄露 | 安全审计、代码审查 |

## 13. 未来发展

### 13.1 功能扩展

- 支持更多 LLM 模型
- 实时协作功能
- 高级搜索和分析
- 自定义集成

### 13.2 架构演进

- 微服务拆分
- 消息队列引入
- 大数据处理
- AI 模型训练