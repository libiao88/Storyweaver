# StoryWeaver AI - API 接口规范

**版本**: v1.0  
**日期**: 2026-02-14  
**协议**: REST API (OpenAPI 3.0 兼容)  
**基础 URL**: `/api/v1`  

---

## 📑 目录

1. [API 概览](#1-api-概览)
2. [通用规范](#2-通用规范)
3. [文档管理 API](#3-文档管理-api)
4. [故事管理 API](#4-故事管理-api)
5. [故事地图 API (Phase 2)](#5-故事地图-api-phase-2)
6. [Figma 审计 API (Phase 2)](#6-figma-审计-api-phase-2)
7. [API 生成 API (Phase 2)](#7-api-生成-api-phase-2)
8. [导出 API](#8-导出-api)
9. [错误码定义](#9-错误码定义)
10. [Webhook 事件](#10-webhook-事件)

---

## 1. API 概览

### 1.1 API 分类

| 类别 | 端点数量 | 说明 | 阶段 |
|------|---------|------|------|
| 文档管理 | 6 | 上传、查询、删除文档 | Phase 1 |
| 故事管理 | 7 | CRUD、批量操作、搜索 | Phase 1 |
| 故事地图 | 8 | 地图CRUD、节点管理、排期 | Phase 2 |
| Figma审计 | 4 | 触发审计、获取结果 | Phase 2 |
| API生成 | 3 | 生成规范、获取结果 | Phase 2 |
| 导出 | 4 | 多格式导出 | Phase 1+2 |
| **总计** | **32** | | |

### 1.2 认证方式

**当前版本 (MVP)**: 无认证，使用 Session ID
```http
X-Session-ID: sess-550e8400-e29b-41d4-a716-446655440000
```

**未来版本**: JWT Token
```http
Authorization: Bearer <jwt_token>
```

### 1.3 请求/响应格式

**请求格式**:
- Content-Type: `application/json` (除文件上传外)
- 文件上传: `multipart/form-data`

**响应格式**:
```json
{
  "success": true,        // 请求是否成功
  "code": "SUCCESS",      // 业务状态码
  "message": "操作成功",   // 提示信息
  "data": { ... },        // 响应数据
  "meta": {               // 元数据(分页等)
    "page": 1,
    "pageSize": 20,
    "total": 100
  },
  "timestamp": "2026-02-14T10:30:00.000Z"
}
```

---

## 2. 通用规范

### 2.1 HTTP 方法语义

| 方法 | 用途 | 幂等性 |
|------|------|--------|
| GET | 获取资源 | ✅ 幂等 |
| POST | 创建资源 | ❌ 非幂等 |
| PUT | 完整更新 | ✅ 幂等 |
| PATCH | 部分更新 | ❌ 非幂等 |
| DELETE | 删除资源 | ✅ 幂等 |

### 2.2 状态码

| 状态码 | 含义 | 使用场景 |
|--------|------|----------|
| 200 OK | 成功 | 标准成功响应 |
| 201 Created | 创建成功 | POST 创建资源成功 |
| 202 Accepted | 已接受 | 异步任务已提交 |
| 204 No Content | 无内容 | DELETE 成功 |
| 400 Bad Request | 请求错误 | 参数校验失败 |
| 401 Unauthorized | 未授权 | 缺少认证信息 |
| 403 Forbidden | 禁止访问 | 权限不足 |
| 404 Not Found | 不存在 | 资源不存在 |
| 409 Conflict | 冲突 | 资源冲突(如重复) |
| 422 Unprocessable | 无法处理 | 业务逻辑错误 |
| 429 Too Many Requests | 请求过多 | 限流触发 |
| 500 Server Error | 服务器错误 | 系统内部错误 |

### 2.3 分页规范

**请求参数**:
```
?page=1&pageSize=20&sort=-createdAt
```

**参数说明**:
- `page`: 页码，从1开始
- `pageSize`: 每页数量，默认20，最大100
- `sort`: 排序字段，`-`前缀表示降序

**响应示例**:
```json
{
  "success": true,
  "data": [ ... ],
  "meta": {
    "page": 1,
    "pageSize": 20,
    "total": 100,
    "totalPages": 5,
    "hasNext": true,
    "hasPrev": false
  }
}
```

### 2.4 字段命名规范

- 使用 camelCase (小驼峰)
- ID 字段后缀: `Id` (如 `documentId`)
- 时间字段后缀: `At` (如 `createdAt`)
- 布尔字段前缀: `is` 或 `has` (如 `isEdited`)
- 列表字段后缀: `s` 或 `List` (如 `stories`, `storyList`)

---

## 3. 文档管理 API

### 3.1 上传文档

**端点**: `POST /documents/upload`

**Content-Type**: `multipart/form-data`

**请求参数**:

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| file | File | ✅ | 文档文件 (.docx, .pdf, .txt, .md) |
| autoProcess | boolean | ❌ | 是否自动开始解析，默认true |

**请求示例**:
```http
POST /api/v1/documents/upload
Content-Type: multipart/form-data; boundary=----WebKitFormBoundary
X-Session-ID: sess-550e8400-e29b-41d4-a716-446655440000

------WebKitFormBoundary
Content-Disposition: form-data; name="file"; filename="prd.docx"
Content-Type: application/vnd.openxmlformats-officedocument.wordprocessingml.document

[二进制文件内容]
------WebKitFormBoundary
Content-Disposition: form-data; name="autoProcess"

true
------WebKitFormBoundary--
```

**响应示例 (202 Accepted)**:
```json
{
  "success": true,
  "code": "ACCEPTED",
  "message": "文档已上传，开始处理",
  "data": {
    "documentId": "doc-550e8400-e29b-41d4-a716-446655440000",
    "fileName": "电商平台PRD_v2.docx",
    "fileType": "docx",
    "fileSize": 1543200,
    "status": "uploaded",
    "progress": 0,
    "createdAt": "2026-02-14T10:30:00.000Z",
    "expiresAt": "2026-02-21T10:30:00.000Z"
  }
}
```

**错误响应**:
```json
{
  "success": false,
  "code": "FILE_TOO_LARGE",
  "message": "文件大小超过20MB限制",
  "data": {
    "maxSize": 20971520,
    "actualSize": 25485760
  }
}
```

---

### 3.2 查询文档状态

**端点**: `GET /documents/{documentId}/status`

**路径参数**:
- `documentId`: 文档ID

**响应示例**:
```json
{
  "success": true,
  "code": "SUCCESS",
  "message": "查询成功",
  "data": {
    "documentId": "doc-550e8400-e29b-41d4-a716-446655440000",
    "status": "generating",
    "progress": 75,
    "stage": "generating_stories",
    "stageDescription": "正在生成用户故事...",
    "stages": [
      { "name": "uploaded", "status": "completed", "progress": 100 },
      { "name": "parsing", "status": "completed", "progress": 100 },
      { "name": "analyzing", "status": "completed", "progress": 100 },
      { "name": "generating", "status": "in_progress", "progress": 75 },
      { "name": "completed", "status": "pending", "progress": 0 }
    ],
    "result": null,
    "error": null,
    "updatedAt": "2026-02-14T10:32:15.000Z"
  }
}
```

**状态枚举**:
- `uploaded`: 已上传
- `parsing`: 解析中
- `analyzing`: 分析中
- `generating`: 生成中
- `completed`: 完成
- `failed`: 失败

---

### 3.3 获取文档详情

**端点**: `GET /documents/{documentId}`

**响应示例**:
```json
{
  "success": true,
  "code": "SUCCESS",
  "message": "查询成功",
  "data": {
    "id": "doc-550e8400-e29b-41d4-a716-446655440000",
    "fileName": "电商平台PRD_v2.docx",
    "fileType": "docx",
    "fileSize": 1543200,
    "mimeType": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "status": "completed",
    "progress": 100,
    "totalChars": 15432,
    "sectionCount": 12,
    "storyCount": 28,
    "averageConfidence": 0.82,
    "sections": [
      {
        "id": "sec-001",
        "title": "1. 项目概述",
        "type": "background",
        "level": 1,
        "charCount": 1250
      }
    ],
    "createdAt": "2026-02-14T10:30:00.000Z",
    "completedAt": "2026-02-14T10:35:22.000Z",
    "expiresAt": "2026-02-21T10:30:00.000Z"
  }
}
```

---

### 3.4 获取文档章节

**端点**: `GET /documents/{documentId}/sections`

**查询参数**:
- `level`: 按层级过滤 (可选)
- `type`: 按类型过滤 (可选)

**响应示例**:
```json
{
  "success": true,
  "code": "SUCCESS",
  "message": "查询成功",
  "data": [
    {
      "id": "sec-550e8400-e29b-41d4-a716-446655440001",
      "documentId": "doc-550e8400-e29b-41d4-a716-446655440000",
      "title": "2.1 用户登录功能",
      "content": "用户可以输入手机号和密码进行登录...",
      "type": "functional",
      "level": 2,
      "order": 3,
      "charCount": 456,
      "storyCount": 3
    }
  ],
  "meta": {
    "total": 12
  }
}
```

---

### 3.5 获取文档列表

**端点**: `GET /documents`

**查询参数**:
- `status`: 状态过滤 (可选)
- `page`: 页码 (默认1)
- `pageSize`: 每页数量 (默认20)
- `sort`: 排序字段 (默认`-createdAt`)

**响应示例**:
```json
{
  "success": true,
  "code": "SUCCESS",
  "message": "查询成功",
  "data": [
    {
      "id": "doc-550e8400-e29b-41d4-a716-446655440000",
      "fileName": "电商平台PRD_v2.docx",
      "fileType": "docx",
      "status": "completed",
      "storyCount": 28,
      "averageConfidence": 0.82,
      "createdAt": "2026-02-14T10:30:00.000Z"
    }
  ],
  "meta": {
    "page": 1,
    "pageSize": 20,
    "total": 5,
    "totalPages": 1
  }
}
```

---

### 3.6 删除文档

**端点**: `DELETE /documents/{documentId}`

**响应示例 (204 No Content)**:
```json
{
  "success": true,
  "code": "SUCCESS",
  "message": "文档已删除"
}
```

---

## 4. 故事管理 API

### 4.1 获取故事列表

**端点**: `GET /documents/{documentId}/stories`

**查询参数**:
- `priority`: 优先级过滤 (P0/P1/P2/P3)
- `module`: 模块过滤
- `status`: 状态过滤
- `minConfidence`: 最小置信度 (0-1)
- `page`, `pageSize`, `sort`: 分页排序

**响应示例**:
```json
{
  "success": true,
  "code": "SUCCESS",
  "message": "查询成功",
  "data": [
    {
      "id": "story-550e8400-e29b-41d4-a716-446655440002",
      "documentId": "doc-550e8400-e29b-41d4-a716-446655440000",
      "title": "用户登录功能",
      "description": "As a 普通用户, I want to 使用手机号登录, So that 我可以快速访问个人账户",
      "role": "普通用户",
      "action": "使用手机号登录",
      "value": "我可以快速访问个人账户",
      "module": "用户认证",
      "priority": "P0",
      "confidence": {
        "overall": 0.85,
        "level": "high"
      },
      "status": "draft",
      "isEdited": false,
      "createdAt": "2026-02-14T10:35:00.000Z"
    }
  ],
  "meta": {
    "total": 28,
    "byPriority": {
      "P0": 8,
      "P1": 12,
      "P2": 6,
      "P3": 2
    },
    "byConfidence": {
      "high": 18,
      "medium": 8,
      "low": 2
    }
  }
}
```

---

### 4.2 获取故事详情

**端点**: `GET /stories/{storyId}`

**响应示例**:
```json
{
  "success": true,
  "code": "SUCCESS",
  "message": "查询成功",
  "data": {
    "id": "story-550e8400-e29b-41d4-a716-446655440002",
    "documentId": "doc-550e8400-e29b-41d4-a716-446655440000",
    "title": "用户登录功能",
    "description": "As a 普通用户, I want to 使用手机号登录, So that 我可以快速访问个人账户",
    "role": "普通用户",
    "action": "使用手机号登录",
    "value": "我可以快速访问个人账户",
    "module": "用户认证",
    "priority": "P0",
    "confidence": {
      "overall": 0.85,
      "level": "high",
      "factors": {
        "templateMatch": 0.9,
        "roleClarity": 0.85,
        "actionClarity": 0.9,
        "valueClarity": 0.8,
        "sourceLength": 0.85,
        "languageClarity": 0.9
      },
      "reasons": ["角色明确", "动词清晰", "原文长度适中"],
      "needsReview": false
    },
    "sourceReference": {
      "text": "用户可以输入手机号和密码进行登录，登录成功后跳转到首页",
      "sectionId": "sec-550e8400-e29b-41d4-a716-446655440001",
      "sectionTitle": "2.1 用户登录功能",
      "context": {
        "before": "在前面的背景介绍之后，",
        "after": "这是用户最常用的功能之一。"
      }
    },
    "acceptanceCriteria": [
      "输入正确的手机号和密码可以成功登录",
      "错误的密码显示错误提示",
      "登录成功后跳转到首页"
    ],
    "tags": ["登录", "安全", "移动端"],
    "status": "draft",
    "isEdited": false,
    "createdAt": "2026-02-14T10:35:00.000Z",
    "updatedAt": "2026-02-14T10:35:00.000Z"
  }
}
```

---

### 4.3 更新故事

**端点**: `PUT /stories/{storyId}`

**请求体**:
```json
{
  "title": "用户手机号登录功能",
  "description": "As a 普通用户, I want to 使用手机号和验证码登录, So that 我可以安全快速地访问个人账户",
  "role": "普通用户",
  "action": "使用手机号和验证码登录",
  "value": "我可以安全快速地访问个人账户",
  "module": "用户认证",
  "priority": "P0",
  "acceptanceCriteria": [
    "输入正确的手机号和验证码可以成功登录",
    "验证码错误显示错误提示",
    "登录成功后跳转到首页"
  ],
  "storyPoints": 5,
  "tags": ["登录", "安全", "验证码"]
}
```

**响应示例**:
```json
{
  "success": true,
  "code": "SUCCESS",
  "message": "故事已更新",
  "data": {
    "id": "story-550e8400-e29b-41d4-a716-446655440002",
    "title": "用户手机号登录功能",
    "isEdited": true,
    "updatedAt": "2026-02-14T11:00:00.000Z",
    "editHistory": [
      {
        "id": "edit-001",
        "timestamp": "2026-02-14T11:00:00.000Z",
        "editor": "user",
        "field": "title",
        "oldValue": "用户登录功能",
        "newValue": "用户手机号登录功能"
      }
    ]
  }
}
```

**部分更新 (PATCH)**:
```http
PATCH /stories/{storyId}
Content-Type: application/json

{
  "priority": "P1",
  "storyPoints": 8
}
```

---

### 4.4 删除故事

**端点**: `DELETE /stories/{storyId}`

**响应示例**:
```json
{
  "success": true,
  "code": "SUCCESS",
  "message": "故事已删除"
}
```

---

### 4.5 批量更新故事

**端点**: `PUT /documents/{documentId}/stories/batch`

**请求体**:
```json
{
  "storyIds": ["story-001", "story-002", "story-003"],
  "updates": {
    "priority": "P1",
    "module": "用户管理"
  }
}
```

**响应示例**:
```json
{
  "success": true,
  "code": "SUCCESS",
  "message": "成功更新 3 个故事",
  "data": {
    "updatedCount": 3,
    "failedCount": 0,
    "updatedIds": ["story-001", "story-002", "story-003"]
  }
}
```

---

### 4.6 批量删除故事

**端点**: `DELETE /documents/{documentId}/stories/batch`

**请求体**:
```json
{
  "storyIds": ["story-001", "story-002"]
}
```

---

### 4.7 搜索故事

**端点**: `GET /stories/search`

**查询参数**:
- `q`: 搜索关键词
- `documentId`: 限定文档 (可选)
- `fields`: 搜索字段 (title,description,role等，逗号分隔)

**响应示例**:
```json
{
  "success": true,
  "code": "SUCCESS",
  "message": "搜索完成",
  "data": [
    {
      "id": "story-001",
      "title": "用户登录功能",
      "matches": [
        {
          "field": "title",
          "snippet": "用户<strong>登录</strong>功能",
          "positions": [2, 3]
        }
      ]
    }
  ]
}
```

---

## 5. 故事地图 API (Phase 2)

### 5.1 创建故事地图

**端点**: `POST /documents/{documentId}/storymap`

**请求体**:
```json
{
  "name": "电商平台v2.0故事地图",
  "description": "2026年春季大版本规划",
  "team": {
    "name": "电商平台研发团队",
    "velocity": 40,
    "sprintDuration": 2,
    "workingDays": [1, 2, 3, 4, 5]
  },
  "releases": [
    {
      "version": "v2.0",
      "name": "春季大版本",
      "plannedDate": "2026-04-01",
      "color": "#1890ff"
    }
  ]
}
```

**响应示例**:
```json
{
  "success": true,
  "code": "CREATED",
  "message": "故事地图已创建",
  "data": {
    "id": "map-550e8400-e29b-41d4-a716-446655440003",
    "documentId": "doc-550e8400-e29b-41d4-a716-446655440000",
    "name": "电商平台v2.0故事地图",
    "status": "draft",
    "team": {
      "name": "电商平台研发团队",
      "velocity": 40,
      "sprintDuration": 2,
      "workingDays": [1, 2, 3, 4, 5]
    },
    "releases": [...],
    "createdAt": "2026-02-14T12:00:00.000Z"
  }
}
```

---

### 5.2 获取故事地图

**端点**: `GET /storymaps/{mapId}`

**响应示例**:
```json
{
  "success": true,
  "code": "SUCCESS",
  "message": "查询成功",
  "data": {
    "id": "map-550e8400-e29b-41d4-a716-446655440003",
    "documentId": "doc-550e8400-e29b-41d4-a716-446655440000",
    "name": "电商平台v2.0故事地图",
    "status": "planning",
    "team": { ... },
    "releases": [
      {
        "id": "rel-001",
        "version": "v2.0",
        "name": "春季大版本",
        "plannedDate": "2026-04-01",
        "sprints": [
          {
            "id": "sprint-001",
            "number": 1,
            "name": "Sprint 1",
            "startDate": "2026-02-17",
            "endDate": "2026-02-28",
            "plannedPoints": 40,
            "storyIds": ["story-001", "story-002"]
          }
        ]
      }
    ],
    "nodes": [...],
    "dependencies": [...],
    "statistics": {
      "totalStories": 28,
      "totalPoints": 156,
      "byRelease": { "v2.0": 28 },
      "bySprint": { "sprint-001": 8, "sprint-002": 10 }
    }
  }
}
```

---

### 5.3 更新故事地图

**端点**: `PUT /storymaps/{mapId}`

---

### 5.4 添加地图节点

**端点**: `POST /storymaps/{mapId}/nodes`

**请求体**:
```json
{
  "storyId": "story-550e8400-e29b-41d4-a716-446655440002",
  "level": 3,
  "parentId": "node-001",
  "position": { "x": 100, "y": 200 },
  "releaseId": "rel-001",
  "sprintId": "sprint-001"
}
```

---

### 5.5 更新节点位置

**端点**: `PATCH /storymaps/{mapId}/nodes/{nodeId}`

**请求体**:
```json
{
  "position": { "x": 150, "y": 250 },
  "sprintId": "sprint-002"
}
```

---

### 5.6 删除节点

**端点**: `DELETE /storymaps/{mapId}/nodes/{nodeId}`

---

### 5.7 添加依赖关系

**端点**: `POST /storymaps/{mapId}/dependencies`

**请求体**:
```json
{
  "fromStoryId": "story-001",
  "toStoryId": "story-002",
  "type": "blocks",
  "isBlocking": true,
  "description": "必须先完成登录才能做个人中心"
}
```

---

### 5.8 自动排期

**端点**: `POST /storymaps/{mapId}/auto-schedule`

**请求体**:
```json
{
  "strategy": "priority_first",  // 优先策略: priority_first, dependency_first, balanced
  "respectDependencies": true,    // 是否尊重依赖关系
  "respectExisting": false        // 是否保留已有排期
}
```

**响应示例**:
```json
{
  "success": true,
  "code": "SUCCESS",
  "message": "自动排期完成",
  "data": {
    "scheduledStories": 28,
    "totalSprints": 4,
    "conflicts": [
      {
        "type": "dependency_conflict",
        "message": "Story-005 和 Story-006 存在循环依赖",
        "storyIds": ["story-005", "story-006"]
      }
    ],
    "suggestions": [
      "建议将 Sprint 3 的 2 个故事移至 Sprint 4"
    ]
  }
}
```

---

## 6. Figma 审计 API (Phase 2)

### 6.1 触发 Figma 审计

**端点**: `POST /documents/{documentId}/figma-audit`

**请求体**:
```json
{
  "figmaFileUrl": "https://www.figma.com/file/ABC123/Design",
  "figmaToken": "figd_xxxxxxxxxxxxxxxx",
  "options": {
    "checkMissing": true,
    "checkRedundant": true,
    "checkAmbiguous": true
  }
}
```

**响应示例 (202 Accepted)**:
```json
{
  "success": true,
  "code": "ACCEPTED",
  "message": "审计任务已提交",
  "data": {
    "auditId": "audit-550e8400-e29b-41d4-a716-446655440004",
    "status": "pending",
    "estimatedTime": 120,
    "createdAt": "2026-02-14T13:00:00.000Z"
  }
}
```

---

### 6.2 查询审计状态

**端点**: `GET /figma-audits/{auditId}/status`

**响应示例**:
```json
{
  "success": true,
  "code": "SUCCESS",
  "message": "查询成功",
  "data": {
    "auditId": "audit-550e8400-e29b-41d4-a716-446655440004",
    "status": "running",
    "progress": 65,
    "currentStage": "comparing_nodes",
    "figmaFile": {
      "name": "电商平台设计稿",
      "nodeCount": 156
    }
  }
}
```

---

### 6.3 获取审计结果

**端点**: `GET /figma-audits/{auditId}`

**响应示例**:
```json
{
  "success": true,
  "code": "SUCCESS",
  "message": "查询成功",
  "data": {
    "id": "audit-550e8400-e29b-41d4-a716-446655440004",
    "documentId": "doc-550e8400-e29b-41d4-a716-446655440000",
    "status": "completed",
    "figmaFile": {
      "url": "https://www.figma.com/file/ABC123/Design",
      "fileKey": "ABC123",
      "name": "电商平台设计稿",
      "lastModified": "2026-02-13T10:00:00.000Z"
    },
    "statistics": {
      "total": 15,
      "missingCount": 5,
      "redundantCount": 3,
      "ambiguousCount": 7,
      "highPriorityCount": 8
    },
    "issues": [
      {
        "id": "issue-001",
        "type": "missing",
        "priority": "high",
        "title": "缺少"用户注册"页面",
        "description": "PRD中描述了用户注册功能，但在Figma中未找到对应设计稿",
        "confidence": 0.92,
        "prdReference": {
          "text": "新用户可以通过手机号注册账户",
          "sectionId": "sec-002",
          "storyId": "story-003"
        },
        "figmaReference": null
      }
    ],
    "completedAt": "2026-02-14T13:03:45.000Z",
    "duration": 225
  }
}
```

---

### 6.4 更新审计问题状态

**端点**: `PATCH /figma-audits/{auditId}/issues/{issueId}`

**请求体**:
```json
{
  "status": "confirmed",
  "comment": "确实漏掉了注册页面，需要补充设计"
}
```

---

## 7. API 生成 API (Phase 2)

### 7.1 生成 API 规范

**端点**: `POST /documents/{documentId}/api-specs`

**请求体**:
```json
{
  "figmaFileUrl": "https://www.figma.com/file/ABC123/Design",  // 可选
  "options": {
    "includeFigmaData": true,
    "inferTypes": true,
    "generateExamples": true
  }
}
```

**响应示例 (202 Accepted)**:
```json
{
  "success": true,
  "code": "ACCEPTED",
  "message": "API规范生成任务已提交",
  "data": {
    "specId": "spec-550e8400-e29b-41d4-a716-446655440005",
    "status": "generating",
    "estimatedTime": 30
  }
}
```

---

### 7.2 获取 API 规范

**端点**: `GET /api-specs/{specId}`

**响应示例**:
```json
{
  "success": true,
  "code": "SUCCESS",
  "message": "查询成功",
  "data": {
    "id": "spec-550e8400-e29b-41d4-a716-446655440005",
    "documentId": "doc-550e8400-e29b-41d4-a716-446655440000",
    "title": "电商平台API",
    "version": "1.0.0",
    "status": "completed",
    "openApiSpec": {
      "openapi": "3.0.0",
      "info": { "title": "电商平台API", "version": "1.0.0" },
      "paths": { ... },
      "components": { "schemas": { ... } }
    },
    "endpoints": [
      {
        "id": "ep-001",
        "path": "/api/v1/users/login",
        "method": "POST",
        "summary": "用户登录",
        "tags": ["用户认证"]
      }
    ],
    "schemas": [
      {
        "name": "User",
        "description": "用户实体",
        "properties": [...]
      }
    ],
    "coverage": {
      "entityCount": 8,
      "endpointCount": 24,
      "percentage": 0.92
    }
  }
}
```

---

### 7.3 更新 API 端点

**端点**: `PUT /api-specs/{specId}/endpoints/{endpointId}`

**请求体**:
```json
{
  "summary": "用户手机号登录",
  "description": "使用手机号和验证码登录",
  "parameters": [...],
  "requestBody": { ... },
  "responses": [...]
}
```

---

## 8. 导出 API

### 8.1 导出为 CSV

**端点**: `POST /documents/{documentId}/export/csv`

**请求体**:
```json
{
  "storyIds": ["story-001", "story-002"],  // 不指定则导出全部
  "fields": ["id", "title", "description", "priority", "module", "storyPoints"],
  "options": {
    "includeHeader": true,
    "encoding": "utf-8-bom",  // Excel兼容性
    "delimiter": ","
  }
}
```

**响应示例**:
```json
{
  "success": true,
  "code": "SUCCESS",
  "message": "导出成功",
  "data": {
    "downloadUrl": "https://api.storyweaver.ai/exports/doc-001.csv?token=xxx",
    "expiresAt": "2026-02-14T14:00:00.000Z",
    "fileSize": 15432
  }
}
```

---

### 8.2 导出为 Markdown

**端点**: `POST /documents/{documentId}/export/markdown`

**请求体**:
```json
{
  "template": "standard",  // standard, detailed, compact
  "includeMetadata": true,
  "groupBy": "module"  // module, priority, status
}
```

**响应示例**:
```json
{
  "success": true,
  "code": "SUCCESS",
  "message": "导出成功",
  "data": {
    "content": "# 用户故事列表\n\n## 用户认证\n\n### Story-001: 用户登录功能\n...",
    "downloadUrl": "https://api.storyweaver.ai/exports/doc-001.md?token=xxx"
  }
}
```

---

### 8.3 导出为 JSON

**端点**: `POST /documents/{documentId}/export/json`

**响应**: 返回完整的文档和故事数据结构

---

### 8.4 导出故事地图 (Phase 2)

**端点**: `POST /storymaps/{mapId}/export`

**请求体**:
```json
{
  "format": "png",  // png, svg, json, excel
  "options": {
    "width": 1920,
    "height": 1080,
    "includeReleaseLines": true,
    "includeDependencies": true
  }
}
```

---

## 9. 错误码定义

### 9.1 错误码规范

格式: `[CATEGORY]_[NUMBER]`

**分类**:
- `FILE_xxx`: 文件相关错误 (1000-1999)
- `PARSE_xxx`: 解析相关错误 (2000-2999)
- `GEN_xxx`: 生成相关错误 (3000-3999)
- `AUTH_xxx`: 认证授权错误 (4000-4999)
- `RATE_xxx`: 限流相关错误 (5000-5999)
- `SYS_xxx`: 系统错误 (9000-9999)

### 9.2 完整错误码列表

| 错误码 | HTTP状态码 | 中文说明 | 英文说明 |
|--------|-----------|----------|----------|
| **文件错误** ||||
| FILE_001 | 400 | 文件过大 | File too large |
| FILE_002 | 400 | 文件为空 | File is empty |
| FILE_003 | 400 | 不支持的文件格式 | Unsupported file format |
| FILE_004 | 400 | 文件损坏 | File corrupted |
| FILE_005 | 422 | PDF为扫描件 | PDF is scanned image |
| FILE_006 | 404 | 文件不存在 | File not found |
| **解析错误** ||||
| PARSE_001 | 422 | 解析失败 | Parse failed |
| PARSE_002 | 504 | 解析超时 | Parse timeout |
| PARSE_003 | 200 | 部分解析成功 | Partial parse success |
| **生成错误** ||||
| GEN_001 | 422 | 故事生成失败 | Story generation failed |
| GEN_002 | 422 | 未提取到有效内容 | No content extracted |
| GEN_003 | 422 | 生成结果为空 | Generation result is empty |
| **认证错误** ||||
| AUTH_001 | 401 | 缺少认证信息 | Missing authentication |
| AUTH_002 | 401 | 会话已过期 | Session expired |
| AUTH_003 | 403 | 权限不足 | Insufficient permissions |
| **限流错误** ||||
| RATE_001 | 429 | 请求过于频繁 | Too many requests |
| RATE_002 | 429 | 超出并发限制 | Concurrency limit exceeded |
| **资源错误** ||||
| RES_001 | 404 | 文档不存在 | Document not found |
| RES_002 | 404 | 故事不存在 | Story not found |
| RES_003 | 404 | 地图不存在 | Story map not found |
| RES_004 | 409 | 资源已存在 | Resource already exists |
| **系统错误** ||||
| SYS_001 | 500 | 系统内部错误 | Internal server error |
| SYS_002 | 503 | 服务不可用 | Service unavailable |
| SYS_003 | 502 | 上游服务错误 | Upstream service error |

### 9.3 错误响应示例

```json
{
  "success": false,
  "code": "FILE_001",
  "message": "文件大小超过限制",
  "data": {
    "field": "file",
    "maxSize": 20971520,
    "actualSize": 25485760,
    "unit": "bytes"
  },
  "help": "请压缩文件或分批上传",
  "timestamp": "2026-02-14T10:30:00.000Z",
  "traceId": "trace-550e8400-e29b-41d4-a716-446655440000"
}
```

---

## 10. Webhook 事件

### 10.1 事件列表

| 事件名 | 说明 | 触发时机 |
|--------|------|----------|
| `document.uploaded` | 文档已上传 | 文件上传完成 |
| `document.processing` | 文档处理中 | 开始解析 |
| `document.completed` | 文档处理完成 | 故事生成完成 |
| `document.failed` | 文档处理失败 | 处理出错 |
| `story.updated` | 故事已更新 | 故事被编辑 |
| `storymap.updated` | 地图已更新 | 故事地图变更 |
| `figma_audit.completed` | Figma审计完成 | 审计结束 |
| `api_spec.generated` | API规范已生成 | 生成完成 |

### 10.2 Webhook 请求格式

```http
POST https://your-webhook-url.com/webhook
Content-Type: application/json
X-Webhook-Secret: whsec_xxxxxxxxxxxxxxxx

{
  "event": "document.completed",
  "timestamp": "2026-02-14T10:35:00.000Z",
  "data": {
    "documentId": "doc-550e8400-e29b-41d4-a716-446655440000",
    "fileName": "电商平台PRD_v2.docx",
    "storyCount": 28,
    "averageConfidence": 0.82
  }
}
```

---

## 附录 A: OpenAPI 3.0 文档

完整的 OpenAPI 3.0 规范文档可导出为 YAML 格式:

```yaml
openapi: 3.0.0
info:
  title: StoryWeaver AI API
  version: 1.0.0
  description: 智能需求拆解平台 API
servers:
  - url: https://api.storyweaver.ai/api/v1
    description: 生产环境
  - url: https://staging-api.storyweaver.ai/api/v1
    description: 测试环境
paths:
  /documents/upload:
    post:
      summary: 上传文档
      requestBody:
        content:
          multipart/form-data:
            schema:
              type: object
              properties:
                file:
                  type: string
                  format: binary
      responses:
        '202':
          description: 已接受
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ApiResponse'
# ... 更多路径定义
```

---

## 附录 B: Postman 集合

API 集合文件: `StoryWeaver_API.postman_collection.json`

包含:
- 所有 API 端点
- 示例请求和响应
- 环境变量配置
- 测试脚本

---

**文档结束**

*本 API 规范定义了 StoryWeaver AI 的所有接口，前后端开发应严格遵循此规范进行。*
