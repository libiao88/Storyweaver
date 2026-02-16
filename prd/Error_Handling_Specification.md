# StoryWeaver AI - 错误处理规范

**版本**: v1.0  
**日期**: 2026-02-14  
**状态**: 规范完成  

---

## 📑 目录

1. [错误处理原则](#1-错误处理原则)
2. [错误分类体系](#2-错误分类体系)
3. [错误码规范](#3-错误码规范)
4. [错误响应格式](#4-错误响应格式)
5. [前端错误处理](#5-前端错误处理)
6. [后端错误处理](#6-后端错误处理)
7. [用户提示规范](#7-用户提示规范)
8. [重试机制](#8-重试机制)
9. [监控与日志](#9-监控与日志)
10. [错误处理流程图](#10-错误处理流程图)

---

## 1. 错误处理原则

### 1.1 核心原则

| 原则 | 说明 | 示例 |
|------|------|------|
| **用户友好** | 错误信息对用户友好，避免技术术语 | "文件过大" 而非 "File size exceeds buffer limit" |
| **可操作性** | 提供明确的解决方案 | "请上传小于20MB的文件" |
| **一致性** | 统一的错误格式和处理方式 | 所有API返回相同的错误结构 |
| **容错性** | 系统能优雅降级，不完全崩溃 | 部分解析失败时返回已解析内容 |
| **可追溯** | 每个错误都有唯一标识 | traceId 用于问题追踪 |

### 1.2 错误层级

```
Level 1: 系统级错误 (System Error)
├── 数据库连接失败
├── 服务器内存不足
└── 网络不可用

Level 2: 服务级错误 (Service Error)
├── 文档解析服务异常
├── 文件存储服务不可用
└── 第三方API调用失败

Level 3: 业务级错误 (Business Error)
├── 文件格式不支持
├── 文件大小超限
├── 必填字段缺失
└── 数据验证失败

Level 4: 用户级错误 (User Error)
├── 输入格式错误
├── 权限不足
└── 资源不存在
```

---

## 2. 错误分类体系

### 2.1 错误类别 (Category)

| 类别代码 | 类别名称 | HTTP状态码 | 说明 |
|----------|----------|------------|------|
| **FILE** | 文件相关错误 | 400 | 上传、格式、大小等问题 |
| **PARSE** | 解析相关错误 | 422 | 文档解析失败 |
| **GEN** | 生成相关错误 | 422 | 故事生成失败 |
| **VALID** | 验证错误 | 400 | 数据校验失败 |
| **AUTH** | 认证授权错误 | 401/403 | 登录、权限问题 |
| **RATE** | 限流错误 | 429 | 请求频率过高 |
| **RES** | 资源错误 | 404 | 资源不存在 |
| **SYS** | 系统错误 | 500 | 内部系统错误 |
| **NET** | 网络错误 | 503 | 网络连接问题 |
| **CONFIG** | 配置错误 | 500 | 系统配置问题 |

### 2.2 完整错误码列表

#### 文件错误 (FILE_xxx)

| 错误码 | HTTP状态码 | 错误信息 | 用户提示 | 解决方案 |
|--------|-----------|----------|----------|----------|
| FILE_001 | 400 | FILE_TOO_LARGE | 文件过大 | 文件大小超过{maxSize}MB限制，请压缩后重试 |
| FILE_002 | 400 | FILE_EMPTY | 文件为空 | 文件内容为空，请上传有效文档 |
| FILE_003 | 400 | FILE_TYPE_UNSUPPORTED | 不支持的格式 | 请上传 .docx, .pdf, .txt 或 .md 格式的文件 |
| FILE_004 | 400 | FILE_CORRUPTED | 文件损坏 | 文件已损坏，请重新上传 |
| FILE_005 | 422 | FILE_SCANNED_PDF | PDF是扫描件 | 无法识别扫描件，请上传可编辑的PDF文档 |
| FILE_006 | 404 | FILE_NOT_FOUND | 文件不存在 | 文件已过期或被删除，请重新上传 |
| FILE_007 | 400 | FILE_NAME_INVALID | 文件名无效 | 文件名包含非法字符，请修改后重试 |
| FILE_008 | 400 | FILE_UPLOAD_INTERRUPTED | 上传中断 | 文件上传被中断，请重试 |

#### 解析错误 (PARSE_xxx)

| 错误码 | HTTP状态码 | 错误信息 | 用户提示 | 解决方案 |
|--------|-----------|----------|----------|----------|
| PARSE_001 | 422 | PARSE_FAILED | 解析失败 | 文档解析失败，可能是格式不兼容 |
| PARSE_002 | 504 | PARSE_TIMEOUT | 解析超时 | 文档解析超时，请重试或联系支持 |
| PARSE_003 | 200 | PARSE_PARTIAL | 部分解析成功 | 文档部分解析成功，部分内容无法识别 |
| PARSE_004 | 422 | PARSE_ENCRYPTION | 文档已加密 | 文档已加密，请先解密后上传 |
| PARSE_005 | 422 | PARSE_PASSWORD_PROTECTED | 文档受密码保护 | 文档受密码保护，请先移除密码 |
| PARSE_006 | 422 | PARSE_CONTENT_EMPTY | 内容为空 | 未能从文档中提取到有效内容 |

#### 生成错误 (GEN_xxx)

| 错误码 | HTTP状态码 | 错误信息 | 用户提示 | 解决方案 |
|--------|-----------|----------|----------|----------|
| GEN_001 | 422 | GEN_FAILED | 生成失败 | 故事生成失败，请重试 |
| GEN_002 | 422 | GEN_NO_CONTENT | 无内容可生成 | 未能从文档中提取到可生成故事的内容 |
| GEN_003 | 422 | GEN_EMPTY_RESULT | 生成结果为空 | 生成的故事列表为空，请检查文档内容 |
| GEN_004 | 500 | GEN_AI_SERVICE_ERROR | AI服务错误 | 智能生成服务暂时不可用，请稍后重试 |
| GEN_005 | 429 | GEN_RATE_LIMITED | 生成频率限制 | 生成请求过于频繁，请稍后再试 |

#### 验证错误 (VALID_xxx)

| 错误码 | HTTP状态码 | 错误信息 | 用户提示 | 解决方案 |
|--------|-----------|----------|----------|----------|
| VALID_001 | 400 | FIELD_REQUIRED | 必填字段 | 字段{field}为必填项 |
| VALID_002 | 400 | FIELD_INVALID | 字段格式错误 | 字段{field}格式不正确 |
| VALID_003 | 400 | FIELD_TOO_LONG | 字段过长 | 字段{field}超过最大长度{maxLength} |
| VALID_004 | 400 | FIELD_TOO_SHORT | 字段过短 | 字段{field}小于最小长度{minLength} |
| VALID_005 | 400 | FIELD_PATTERN_MISMATCH | 格式不匹配 | 字段{field}不符合要求的格式 |
| VALID_006 | 400 | VALUE_OUT_OF_RANGE | 值超出范围 | 值必须在{min}和{max}之间 |
| VALID_007 | 400 | INVALID_JSON | JSON格式错误 | 请求体JSON格式不正确 |
| VALID_008 | 400 | INVALID_ENUM_VALUE | 枚举值错误 | 字段{field}的值不在允许范围内 |

#### 认证授权错误 (AUTH_xxx)

| 错误码 | HTTP状态码 | 错误信息 | 用户提示 | 解决方案 |
|--------|-----------|----------|----------|----------|
| AUTH_001 | 401 | MISSING_AUTH | 缺少认证信息 | 请先登录后再操作 |
| AUTH_002 | 401 | SESSION_EXPIRED | 会话已过期 | 会话已过期，请重新登录 |
| AUTH_003 | 401 | INVALID_TOKEN | Token无效 | 认证信息无效，请重新登录 |
| AUTH_004 | 403 | PERMISSION_DENIED | 权限不足 | 您没有权限执行此操作 |
| AUTH_005 | 403 | RESOURCE_ACCESS_DENIED | 资源访问被拒绝 | 您无权访问此资源 |
| AUTH_006 | 401 | FIGMA_AUTH_FAILED | Figma授权失败 | Figma授权失败，请重新授权 |
| AUTH_007 | 401 | FIGMA_TOKEN_EXPIRED | Figma Token过期 | Figma访问令牌已过期，请重新授权 |

#### 限流错误 (RATE_xxx)

| 错误码 | HTTP状态码 | 错误信息 | 用户提示 | 解决方案 |
|--------|-----------|----------|----------|----------|
| RATE_001 | 429 | TOO_MANY_REQUESTS | 请求过于频繁 | 请求过于频繁，请在{retryAfter}秒后重试 |
| RATE_002 | 429 | CONCURRENCY_LIMIT | 并发限制 | 同时处理的请求过多，请稍后再试 |
| RATE_003 | 429 | UPLOAD_RATE_LIMITED | 上传频率限制 | 上传过于频繁，请稍后再试 |
| RATE_004 | 429 | API_RATE_LIMITED | API调用限制 | API调用次数已达上限，请升级套餐 |

#### 资源错误 (RES_xxx)

| 错误码 | HTTP状态码 | 错误信息 | 用户提示 | 解决方案 |
|--------|-----------|----------|----------|----------|
| RES_001 | 404 | DOCUMENT_NOT_FOUND | 文档不存在 | 文档不存在或已删除 |
| RES_002 | 404 | STORY_NOT_FOUND | 故事不存在 | 故事不存在或已删除 |
| RES_003 | 404 | STORY_MAP_NOT_FOUND | 故事地图不存在 | 故事地图不存在 |
| RES_004 | 404 | SECTION_NOT_FOUND | 章节不存在 | 文档章节不存在 |
| RES_005 | 409 | RESOURCE_EXISTS | 资源已存在 | 资源已存在，请勿重复创建 |
| RES_006 | 410 | RESOURCE_EXPIRED | 资源已过期 | 资源已过期，请重新上传 |
| RES_007 | 404 | FIGMA_FILE_NOT_FOUND | Figma文件不存在 | Figma文件不存在或无法访问 |
| RES_008 | 404 | FIGMA_NODE_NOT_FOUND | Figma节点不存在 | Figma节点不存在或已被删除 |

#### 系统错误 (SYS_xxx)

| 错误码 | HTTP状态码 | 错误信息 | 用户提示 | 解决方案 |
|--------|-----------|----------|----------|----------|
| SYS_001 | 500 | INTERNAL_ERROR | 系统内部错误 | 系统出现错误，请稍后重试或联系支持 |
| SYS_002 | 503 | SERVICE_UNAVAILABLE | 服务不可用 | 服务暂时不可用，请稍后重试 |
| SYS_003 | 502 | UPSTREAM_ERROR | 上游服务错误 | 依赖服务异常，请稍后重试 |
| SYS_004 | 500 | DATABASE_ERROR | 数据库错误 | 数据操作失败，请稍后重试 |
| SYS_005 | 500 | CACHE_ERROR | 缓存错误 | 缓存服务异常 |
| SYS_006 | 507 | STORAGE_FULL | 存储空间不足 | 存储空间不足，请联系管理员 |
| SYS_007 | 500 | CONFIG_ERROR | 配置错误 | 系统配置错误，请联系管理员 |

#### 网络错误 (NET_xxx)

| 错误码 | HTTP状态码 | 错误信息 | 用户提示 | 解决方案 |
|--------|-----------|----------|----------|----------|
| NET_001 | 503 | NETWORK_ERROR | 网络错误 | 网络连接失败，请检查网络后重试 |
| NET_002 | 504 | GATEWAY_TIMEOUT | 网关超时 | 请求超时，请稍后重试 |
| NET_003 | 503 | DNS_ERROR | DNS解析错误 | 域名解析失败，请检查网络设置 |
| NET_004 | 503 | CONNECTION_REFUSED | 连接被拒绝 | 无法连接到服务器，请稍后重试 |
| NET_005 | 503 | FIGMA_API_ERROR | Figma API错误 | 无法连接到Figma服务，请稍后重试 |
| NET_006 | 503 | FIGMA_TIMEOUT | Figma请求超时 | Figma请求超时，请稍后重试 |

---

## 3. 错误码规范

### 3.1 错误码格式

```
[类别]_[序号]

示例:
- FILE_001  (文件错误第1个)
- PARSE_002 (解析错误第2个)
- AUTH_003  (认证错误第3个)
```

### 3.2 错误码分配规则

| 范围 | 类别 | 说明 |
|------|------|------|
| 001-099 | FILE | 文件相关错误 |
| 100-199 | PARSE | 解析相关错误 |
| 200-299 | GEN | 生成相关错误 |
| 300-399 | VALID | 验证错误 |
| 400-499 | AUTH | 认证授权错误 |
| 500-599 | RATE | 限流错误 |
| 600-699 | RES | 资源错误 |
| 900-999 | SYS/NET | 系统和网络错误 |

---

## 4. 错误响应格式

### 4.1 标准错误响应

```json
{
  "success": false,
  "code": "FILE_001",
  "message": "文件大小超过限制",
  "data": {
    "field": "file",
    "maxSize": 20971520,
    "actualSize": 25485760,
    "unit": "bytes",
    "maxSizeMB": 20,
    "actualSizeMB": 24.3
  },
  "help": "请压缩文件或分批上传，支持的最大文件大小为20MB",
  "action": "请上传更小的文件",
  "retryable": true,
  "retryAfter": null,
  "timestamp": "2026-02-14T10:30:00.000Z",
  "traceId": "trace-550e8400-e29b-41d4-a716-446655440000",
  "requestId": "req-1234567890",
  "documentation": "https://docs.storyweaver.ai/errors/FILE_001"
}
```

### 4.2 字段说明

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| success | boolean | ✅ | 始终为 false |
| code | string | ✅ | 错误码，如 "FILE_001" |
| message | string | ✅ | 用户友好的错误信息 |
| data | object | ❌ | 错误详情数据 |
| help | string | ❌ | 帮助信息，告诉用户如何解决 |
| action | string | ❌ | 建议用户采取的行动 |
| retryable | boolean | ❌ | 是否可重试 |
| retryAfter | number | ❌ | 重试等待时间（秒） |
| timestamp | string | ✅ | 错误发生时间 (ISO 8601) |
| traceId | string | ✅ | 追踪ID，用于问题排查 |
| requestId | string | ✅ | 请求ID |
| documentation | string | ❌ | 错误文档链接 |

### 4.3 多错误响应

当多个字段验证失败时：

```json
{
  "success": false,
  "code": "VALID_MULTIPLE",
  "message": "多个字段验证失败",
  "data": {
    "errors": [
      {
        "field": "title",
        "code": "VALID_002",
        "message": "标题不能为空"
      },
      {
        "field": "priority",
        "code": "VALID_008",
        "message": "优先级必须是 P0、P1、P2 或 P3"
      },
      {
        "field": "description",
        "code": "VALID_003",
        "message": "描述不能超过500个字符"
      }
    ]
  },
  "timestamp": "2026-02-14T10:30:00.000Z",
  "traceId": "trace-550e8400-e29b-41d4-a716-446655440000"
}
```

---

## 5. 前端错误处理

### 5.1 错误处理服务

```typescript
// services/ErrorHandler.ts
class ErrorHandler {
  private errorHandlers: Map<string, Function> = new Map();
  private toast: ToastService;
  private logger: LoggerService;
  
  constructor(toast: ToastService, logger: LoggerService) {
    this.toast = toast;
    this.logger = logger;
    this.setupGlobalHandlers();
  }
  
  // 注册特定错误处理器
  register(errorCode: string, handler: Function): void {
    this.errorHandlers.set(errorCode, handler);
  }
  
  // 处理错误
  async handle(error: AppError): Promise<void> {
    // 1. 记录错误
    this.logger.error('Error occurred', error);
    
    // 2. 检查是否有特定处理器
    const specificHandler = this.errorHandlers.get(error.code);
    if (specificHandler) {
      await specificHandler(error);
      return;
    }
    
    // 3. 根据错误类型默认处理
    switch (this.getErrorCategory(error.code)) {
      case 'FILE':
        await this.handleFileError(error);
        break;
      case 'PARSE':
        await this.handleParseError(error);
        break;
      case 'NET':
        await this.handleNetworkError(error);
        break;
      case 'AUTH':
        await this.handleAuthError(error);
        break;
      default:
        await this.handleGenericError(error);
    }
  }
  
  private async handleFileError(error: AppError): Promise<void> {
    const config: ErrorUIConfig = {
      type: 'error',
      title: '文件上传失败',
      message: error.message,
      description: error.help,
      actions: [
        {
          label: '重试',
          type: 'primary',
          onClick: () => this.retryOperation(error)
        },
        {
          label: '查看帮助',
          type: 'link',
          onClick: () => this.openDocumentation(error.documentation)
        }
      ]
    };
    
    this.showErrorUI(config);
  }
  
  private async handleNetworkError(error: AppError): Promise<void> {
    // 网络错误自动重试
    if (error.retryable) {
      const retryCount = this.getRetryCount(error.traceId);
      if (retryCount < 3) {
        this.incrementRetryCount(error.traceId);
        await this.delay(1000 * retryCount); // 指数退避
        await this.retryOperation(error);
        return;
      }
    }
    
    this.showErrorUI({
      type: 'error',
      title: '网络连接失败',
      message: error.message,
      description: '请检查您的网络连接后重试',
      actions: [
        {
          label: '重试',
          type: 'primary',
          onClick: () => this.retryOperation(error)
        }
      ]
    });
  }
  
  private async handleAuthError(error: AppError): Promise<void> {
    if (error.code === 'AUTH_002' || error.code === 'AUTH_003') {
      // 会话过期，重新登录
      this.showErrorUI({
        type: 'warning',
        title: '会话已过期',
        message: '您的登录状态已过期，请重新登录',
        actions: [
          {
            label: '重新登录',
            type: 'primary',
            onClick: () => this.redirectToLogin()
          }
        ]
      });
    } else {
      this.showErrorUI({
        type: 'error',
        title: '权限不足',
        message: error.message
      });
    }
  }
  
  private handleGenericError(error: AppError): void {
    this.toast.error({
      message: error.message,
      description: error.help,
      duration: 5000
    });
  }
  
  private showErrorUI(config: ErrorUIConfig): void {
    // 显示错误弹窗或通知
    Modal.error({
      title: config.title,
      content: (
        <div>
          <p>{config.message}</p>
          {config.description && <p className="text-gray-500">{config.description}</p>}
        </div>
      ),
      footer: config.actions?.map(action => (
        <Button
          key={action.label}
          type={action.type}
          onClick={() => {
            Modal.destroyAll();
            action.onClick();
          }}
        >
          {action.label}
        </Button>
      ))
    });
  }
  
  private setupGlobalHandlers(): void {
    // 全局未捕获错误
    window.onerror = (message, source, lineno, colno, error) => {
      this.logger.error('Uncaught error', { message, source, lineno, colno, error });
      this.handle({
        code: 'SYS_001',
        message: '系统出现错误',
        traceId: generateTraceId()
      });
      return true;
    };
    
    // 未处理的Promise错误
    window.onunhandledrejection = (event) => {
      this.logger.error('Unhandled promise rejection', event.reason);
      this.handle({
        code: 'SYS_001',
        message: '操作失败',
        traceId: generateTraceId()
      });
    };
  }
}

// 错误类型定义
interface AppError {
  code: string;
  message: string;
  data?: any;
  help?: string;
  action?: string;
  retryable?: boolean;
  retryAfter?: number;
  traceId: string;
  documentation?: string;
}

interface ErrorUIConfig {
  type: 'error' | 'warning' | 'info';
  title: string;
  message: string;
  description?: string;
  actions?: Array<{
    label: string;
    type: 'primary' | 'default' | 'link';
    onClick: () => void;
  }>;
}
```

### 5.2 API 错误拦截

```typescript
// api/interceptors.ts
import axios from 'axios';

// 响应拦截器
axios.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    // 处理特定错误
    if (error.response) {
      const { data, status } = error.response;
      
      // 自动重试逻辑
      if (data.retryable && !originalRequest._retry) {
        originalRequest._retry = true;
        
        if (data.retryAfter) {
          await delay(data.retryAfter * 1000);
        }
        
        return axios(originalRequest);
      }
      
      // Token过期自动刷新
      if (data.code === 'AUTH_002' && !originalRequest._refresh) {
        originalRequest._refresh = true;
        
        try {
          await refreshToken();
          return axios(originalRequest);
        } catch (refreshError) {
          redirectToLogin();
          return Promise.reject(refreshError);
        }
      }
      
      // 统一错误处理
      throw new AppError(data);
    }
    
    // 网络错误
    if (error.request) {
      throw new AppError({
        code: 'NET_001',
        message: '网络连接失败，请检查网络后重试',
        retryable: true,
        traceId: generateTraceId()
      });
    }
    
    // 其他错误
    throw new AppError({
      code: 'SYS_001',
      message: error.message,
      traceId: generateTraceId()
    });
  }
);
```

---

## 6. 后端错误处理

### 6.1 错误中间件 (Express)

```typescript
// middleware/errorHandler.ts
import { Request, Response, NextFunction } from 'express';

interface CustomError extends Error {
  code?: string;
  statusCode?: number;
  data?: any;
  retryable?: boolean;
}

// 错误处理中间件
export const errorHandler = (
  err: CustomError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const traceId = req.headers['x-trace-id'] || generateTraceId();
  
  // 记录错误日志
  logger.error({
    error: err.message,
    stack: err.stack,
    code: err.code,
    url: req.url,
    method: req.method,
    traceId,
    timestamp: new Date().toISOString()
  });
  
  // 业务错误
  if (err.code) {
    return res.status(err.statusCode || 400).json({
      success: false,
      code: err.code,
      message: err.message,
      data: err.data,
      traceId,
      timestamp: new Date().toISOString()
    });
  }
  
  // 系统错误
  res.status(500).json({
    success: false,
    code: 'SYS_001',
    message: '系统内部错误',
    traceId,
    timestamp: new Date().toISOString()
  });
};

// 自定义错误类
export class AppError extends Error {
  public code: string;
  public statusCode: number;
  public data?: any;
  public retryable?: boolean;
  public retryAfter?: number;
  public help?: string;
  
  constructor(
    code: string,
    message: string,
    statusCode: number = 400,
    data?: any,
    options?: {
      retryable?: boolean;
      retryAfter?: number;
      help?: string;
    }
  ) {
    super(message);
    this.code = code;
    this.statusCode = statusCode;
    this.data = data;
    this.retryable = options?.retryable;
    this.retryAfter = options?.retryAfter;
    this.help = options?.help;
  }
}

// 使用示例
export const fileTooLargeError = (actualSize: number) => {
  return new AppError(
    'FILE_001',
    '文件大小超过限制',
    400,
    {
      maxSize: 20 * 1024 * 1024,
      actualSize,
      maxSizeMB: 20,
      actualSizeMB: (actualSize / 1024 / 1024).toFixed(2)
    },
    {
      retryable: false,
      help: '请压缩文件或分批上传，支持的最大文件大小为20MB'
    }
  );
};

export const parseTimeoutError = () => {
  return new AppError(
    'PARSE_002',
    '文档解析超时',
    504,
    {},
    {
      retryable: true,
      retryAfter: 5,
      help: '文档较大，请稍后再试或尝试分批上传'
    }
  );
};
```

### 6.2 错误边界 (React)

```typescript
// components/ErrorBoundary.tsx
import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  
  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }
  
  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // 发送到错误追踪服务
    errorTracker.captureException(error, {
      extra: {
        componentStack: errorInfo.componentStack
      }
    });
  }
  
  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }
      
      return (
        <div className="error-boundary">
          <h2>页面出现错误</h2>
          <p>请刷新页面重试，如果问题持续存在请联系支持</p>
          <button onClick={() => window.location.reload()}>
            刷新页面
          </button>
        </div>
      );
    }
    
    return this.props.children;
  }
}

// 使用
<ErrorBoundary>
  <App />
</ErrorBoundary>
```

---

## 7. 用户提示规范

### 7.1 提示级别

| 级别 | 图标 | 颜色 | 使用场景 | 持续时间 |
|------|------|------|----------|----------|
| **Info** | ℹ️ | 蓝色 | 一般信息、提示 | 3秒 |
| **Success** | ✅ | 绿色 | 操作成功 | 3秒 |
| **Warning** | ⚠️ | 黄色 | 警告、需要注意 | 5秒 |
| **Error** | ❌ | 红色 | 错误、操作失败 | 不自动关闭 |

### 7.2 提示文案规范

**DO**:
- ✅ 使用友好的语言
- ✅ 提供具体信息
- ✅ 告诉用户下一步该做什么
- ✅ 避免技术术语

**DON'T**:
- ❌ "Error code: 500"
- ❌ "系统异常"
- ❌ "操作失败"

**好的示例**:
```
❌ 错误: "FILE_TOO_LARGE"
✅ 提示: "文件太大了（24.3MB），请上传小于20MB的文件"

❌ 错误: "Parse failed"
✅ 提示: "文档解析失败，可能是格式不兼容。建议转换为PDF或Word格式后重试"

❌ 错误: "Network error"
✅ 提示: "网络连接失败，请检查网络设置后点击重试按钮"
```

---

## 8. 重试机制

### 8.1 自动重试策略

| 错误类型 | 是否重试 | 重试次数 | 退避策略 | 最大延迟 |
|----------|----------|----------|----------|----------|
| 网络错误 | ✅ | 3 | 指数退避 | 8秒 |
| 解析超时 | ✅ | 2 | 线性 | 10秒 |
| 限流错误 | ✅ | 5 | 按Retry-After | - |
| 文件错误 | ❌ | - | - | - |
| 验证错误 | ❌ | - | - | - |
| 认证错误 | ❌ | - | - | - |

### 8.2 指数退避实现

```typescript
// utils/retry.ts
class RetryStrategy {
  private maxRetries: number;
  private baseDelay: number;
  private maxDelay: number;
  
  constructor(
    maxRetries: number = 3,
    baseDelay: number = 1000,
    maxDelay: number = 8000
  ) {
    this.maxRetries = maxRetries;
    this.baseDelay = baseDelay;
    this.maxDelay = maxDelay;
  }
  
  async execute<T>(
    operation: () => Promise<T>,
    shouldRetry?: (error: any) => boolean
  ): Promise<T> {
    let lastError: any;
    
    for (let attempt = 0; attempt <= this.maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error;
        
        // 检查是否应该重试
        if (shouldRetry && !shouldRetry(error)) {
          throw error;
        }
        
        if (attempt === this.maxRetries) {
          throw error;
        }
        
        // 计算延迟时间（指数退避）
        const delay = Math.min(
          this.baseDelay * Math.pow(2, attempt),
          this.maxDelay
        );
        
        // 添加随机抖动
        const jitter = Math.random() * 1000;
        await sleep(delay + jitter);
      }
    }
    
    throw lastError;
  }
}

// 使用示例
const retryStrategy = new RetryStrategy(3, 1000, 8000);

const uploadFile = async (file: File) => {
  return retryStrategy.execute(
    () => api.upload(file),
    (error) => error.code?.startsWith('NET') || error.code === 'PARSE_002'
  );
};
```

---

## 9. 监控与日志

### 9.1 错误日志规范

```typescript
// utils/logger.ts
interface LogEntry {
  level: 'debug' | 'info' | 'warn' | 'error';
  message: string;
  timestamp: string;
  traceId: string;
  context?: {
    userId?: string;
    sessionId?: string;
    url?: string;
    method?: string;
  };
  error?: {
    code?: string;
    stack?: string;
    data?: any;
  };
}

class Logger {
  private logLevel: string;
  
  error(message: string, error?: any, context?: any) {
    const entry: LogEntry = {
      level: 'error',
      message,
      timestamp: new Date().toISOString(),
      traceId: context?.traceId || generateTraceId(),
      context,
      error: error ? {
        code: error.code,
        stack: error.stack,
        data: error.data
      } : undefined
    };
    
    // 发送到日志服务
    this.sendToLogService(entry);
    
    // 控制台输出（开发环境）
    if (process.env.NODE_ENV === 'development') {
      console.error('[ERROR]', entry);
    }
  }
  
  private sendToLogService(entry: LogEntry) {
    // 实现发送到 Sentry / LogRocket / 自建日志服务等
    if (process.env.REACT_APP_SENTRY_DSN) {
      Sentry.captureMessage(entry.message, {
        level: entry.level,
        extra: entry
      });
    }
  }
}
```

### 9.2 错误监控指标

| 指标 | 说明 | 告警阈值 |
|------|------|----------|
| 错误率 | 错误请求数/总请求数 | > 5% |
| P95响应时间 | 95%请求响应时间 | > 3秒 |
| 特定错误数 | 特定错误码出现次数 | FILE_001 > 100/小时 |
| 系统错误数 | 5xx错误数量 | > 10/分钟 |

---

## 10. 错误处理流程图

```
┌─────────────────────────────────────────────────────────────────┐
│                        错误发生                                  │
└───────────────────────────┬─────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│                      错误分类                                    │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐           │
│  │ 业务错误  │ │ 系统错误  │ │ 网络错误  │ │ 用户错误  │           │
│  └────┬─────┘ └────┬─────┘ └────┬─────┘ └────┬─────┘           │
└───────┼────────────┼────────────┼────────────┼──────────────────┘
        │            │            │            │
        ▼            ▼            ▼            ▼
┌──────────────┐ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐
│ 显示友好提示  │ │ 记录错误日志  │ │ 自动重试     │ │ 高亮输入字段  │
│ 提供解决方案  │ │ 发送告警     │ │ 指数退避     │ │ 显示验证错误  │
└──────┬───────┘ └──────┬───────┘ └──────┬───────┘ └──────┬───────┘
       │                │                │                │
       ▼                ▼                ▼                ▼
┌─────────────────────────────────────────────────────────────────┐
│                     用户交互反馈                                 │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐           │
│  │ Toast提示 │ │ 模态框   │ │ 重试按钮  │ │ 帮助链接  │           │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘           │
└─────────────────────────────────────────────────────────────────┘
```

---

**文档结束**

*本错误处理规范确保 StoryWeaver AI 在各种异常情况下都能优雅处理，提供良好的用户体验和完善的错误追踪能力。*
