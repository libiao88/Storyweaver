# StoryWeaver AI - 后端 API 文档

## 基础信息

- **Base URL**: `https://storyweaver-api.your-domain.workers.dev/api/v1`
- **认证方式**: Bearer Token (JWT)
- **Content-Type**: `application/json`

## 错误响应格式

所有错误响应都遵循以下格式：

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "错误描述",
    "details": "详细信息（可选）"
  }
}
```

## 认证接口

### 用户注册

```
POST /api/v1/auth/signup
```

**请求体：**
```json
{
  "email": "user@example.com",
  "password": "password123",
  "name": "用户名"
}
```

**响应：**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "user-uuid",
      "email": "user@example.com",
      "name": "用户名",
      "role": "user"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  },
  "message": "User created successfully"
}
```

### 用户登录

```
POST /api/v1/auth/login
```

**请求体：**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**响应：**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "user-uuid",
      "email": "user@example.com",
      "name": "用户名",
      "role": "user"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  },
  "message": "Login successful"
}
```

## 用户故事接口

### 获取用户故事列表

```
GET /api/v1/stories
```

**Headers：**
```
Authorization: Bearer <token>
```

**响应：**
```json
{
  "success": true,
  "data": [
    {
      "id": "story-uuid",
      "userId": "user-uuid",
      "documentId": "doc-uuid",
      "title": "用户故事标题",
      "description": "故事描述",
      "role": "作为用户",
      "action": "我想要",
      "value": "以便",
      "module": "模块名称",
      "priority": "P0",
      "status": "draft",
      "tags": ["tag1", "tag2"],
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

### 创建用户故事

```
POST /api/v1/stories
```

**Headers：**
```
Authorization: Bearer <token>
```

**请求体：**
```json
{
  "title": "用户故事标题",
  "description": "故事描述",
  "role": "作为用户",
  "action": "我想要",
  "value": "以便",
  "module": "模块名称",
  "priority": "P1",
  "status": "draft",
  "tags": ["tag1"]
}
```

### 更新用户故事

```
PUT /api/v1/stories/:id
```

**Headers：**
```
Authorization: Bearer <token>
```

**请求体：**
```json
{
  "title": "更新后的标题",
  "priority": "P0"
}
```

### 删除用户故事

```
DELETE /api/v1/stories/:id
```

**Headers：**
```
Authorization: Bearer <token>
```

### 搜索用户故事

```
GET /api/v1/stories/search?q=关键词
```

**Headers：**
```
Authorization: Bearer <token>
```

## LLM 优化接口

### 优化用户故事

```
POST /api/v1/llm/optimize
```

**Headers：**
```
Authorization: Bearer <token>
```

**请求体：**
```json
{
  "story": {
    "id": "story-uuid",
    "title": "用户故事标题",
    "description": "故事描述",
    "role": "作为用户",
    "action": "我想要",
    "value": "以便",
    "module": "模块名称",
    "priority": "P1"
  },
  "optimizationGoals": [
    "提升描述的清晰度",
    "补充缺失信息"
  ]
}
```

**响应：**
```json
{
  "success": true,
  "data": {
    "optimizedStory": {
      "id": "story-uuid",
      "title": "优化后的标题",
      "description": "优化后的描述",
      "confidence": 0.95
    },
    "changes": ["优化了标题", "优化了描述"],
    "cost": {
      "promptTokens": 500,
      "completionTokens": 200,
      "totalTokens": 700,
      "costUSD": 0.001
    },
    "timing": {
      "apiCall": 1500,
      "processing": 100,
      "total": 1600
    }
  }
}
```

### 测试 LLM 连接

```
POST /api/v1/llm/test
```

**Headers：**
```
Authorization: Bearer <token>
```

**请求体：**
```json
{
  "provider": "openai",
  "model": "gpt-4o-mini",
  "apiKey": "sk-..."
}
```

### 获取支持的模型列表

```
GET /api/v1/llm/models
```

**响应：**
```json
{
  "success": true,
  "data": {
    "openai": ["gpt-4o", "gpt-4o-mini", "gpt-3.5-turbo"],
    "anthropic": ["claude-3-opus", "claude-3-sonnet", "claude-3-haiku"],
    "google": ["gemini-1.5-pro", "gemini-1.5-flash"]
  }
}
```

## 配置管理接口

### 获取用户配置

```
GET /api/v1/config
```

**Headers：**
```
Authorization: Bearer <token>
```

**响应：**
```json
{
  "success": true,
  "data": {
    "id": "config-uuid",
    "userId": "user-uuid",
    "llmProvider": "openai",
    "defaultModel": "gpt-4o-mini",
    "temperature": 0.3,
    "maxTokens": 2000,
    "autoSave": true,
    "theme": "light",
    "notificationsEnabled": true
  }
}
```

### 更新用户配置

```
PUT /api/v1/config
```

**Headers：**
```
Authorization: Bearer <token>
```

**请求体：**
```json
{
  "llmProvider": "anthropic",
  "defaultModel": "claude-3-sonnet",
  "temperature": 0.5
}
```

### 重置用户配置

```
POST /api/v1/config/reset
```

**Headers：**
```
Authorization: Bearer <token>
```

## 文件上传接口

### 上传文件

```
POST /api/v1/files/upload
```

**Headers：**
```
Authorization: Bearer <token>
Content-Type: multipart/form-data
```

**请求体：**
```
file: <binary>
```

### 获取文件信息

```
GET /api/v1/files/:id
```

**Headers：**
```
Authorization: Bearer <token>
```

### 删除文件

```
DELETE /api/v1/files/:id
```

**Headers：**
```
Authorization: Bearer <token>
```

### 解析上传的文件

```
POST /api/v1/files/parse
```

**Headers：**
```
Authorization: Bearer <token>
```

**请求体：**
```json
{
  "fileId": "file-uuid"
}
```

## 错误代码

| 错误代码 | 描述 |
|---------|------|
| INVALID_INPUT | 输入参数无效 |
| USER_EXISTS | 用户已存在 |
| INVALID_CREDENTIALS | 邮箱或密码错误 |
| UNAUTHORIZED | 未授权 |
| INVALID_TOKEN | Token 无效或已过期 |
| NOT_FOUND | 资源不存在 |
| SERVER_ERROR | 服务器错误 |
| LLM_001 | API Key 未配置 |
| LLM_002 | API 调用失败 |
| LLM_003 | 请求超时 |
| LLM_004 | 响应无效 |
| CONFIG_ERROR | 配置错误 |

## 速率限制

每个 API 端点都有速率限制：

- **认证接口**: 10 次/分钟
- **LLM 接口**: 20 次/分钟
- **其他接口**: 60 次/分钟

## 健康检查

```
GET /health
```

**响应：**
```json
{
  "success": true,
  "message": "Service is healthy",
  "timestamp": 1704067200000
}
```
