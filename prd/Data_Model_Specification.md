# StoryWeaver AI - 数据模型定义规范

**版本**: v1.0  
**日期**: 2026-02-14  
**状态**: 定义完成  

---

## 📑 目录

1. [模型概览](#1-模型概览)
2. [核心数据模型](#2-核心数据模型)
3. [Phase 2 数据模型](#3-phase-2-数据模型)
4. [枚举类型定义](#4-枚举类型定义)
5. [验证规则](#5-验证规则)
6. [关系图](#6-关系图)

---

## 1. 模型概览

### 1.1 实体关系总览

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│ ParsedDocument  │────▶│ DocumentSection │     │   StoryMap      │
│    (文档)        │     │    (章节)        │     │   (故事地图)     │
└────────┬────────┘     └─────────────────┘     └────────┬────────┘
         │                                               │
         │ 1:N                                           │ 1:N
         ▼                                               ▼
┌─────────────────┐                            ┌─────────────────┐
│     Story       │◀───────────────────────────│  StoryMapNode   │
│   (用户故事)     │                            │   (地图节点)     │
└────────┬────────┘                            └─────────────────┘
         │
         │ 1:1 (Phase 2)
         ▼
┌─────────────────┐     ┌─────────────────┐
│  FigmaAuditItem │     │   APISpec       │
│ (Figma审计项)    │     │  (API规范)       │
└─────────────────┘     └─────────────────┘
```

### 1.2 模型清单

| 模型 | 英文名称 | 用途 | 所属阶段 |
|------|----------|------|----------|
| 解析文档 | ParsedDocument | 存储上传的PRD文档元数据和内容 | Phase 1 |
| 文档章节 | DocumentSection | 存储文档结构化后的章节信息 | Phase 1 |
| 用户故事 | Story | 核心模型，存储生成的用户故事 | Phase 1 |
| 置信度评分 | ConfidenceScore | 嵌入Story，评估故事质量 | Phase 1 |
| 故事地图 | StoryMap | Phase 2的故事地图配置 | Phase 2 |
| 地图节点 | StoryMapNode | 故事在地图中的位置和层级 | Phase 2 |
| 依赖关系 | Dependency | 故事间的依赖关系 | Phase 2 |
| Figma审计项 | FigmaAuditItem | Figma审计发现的问题 | Phase 2 |
| API规范 | APISpec | 生成的OpenAPI规范 | Phase 2 |

---

## 2. 核心数据模型 (Phase 1)

### 2.1 ParsedDocument (解析的PRD文档)

存储用户上传的PRD文档信息。

```typescript
/**
 * 解析的PRD文档
 * 对应一次上传和解析过程
 */
interface ParsedDocument {
  /** 唯一标识符 (UUID v4) */
  id: string;  // 例: "doc-550e8400-e29b-41d4-a716-446655440000"
  
  /** 原始文件名 */
  fileName: string;  // 例: "电商平台PRD_v2.docx"
  
  /** 文件类型 */
  fileType: 'docx' | 'pdf' | 'txt' | 'md';
  
  /** 文件大小 (字节) */
  fileSize: number;  // 例: 1543200 (约1.5MB)
  
  /** MIME类型 */
  mimeType: string;  // 例: "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
  
  /** 文档处理状态 */
  status: DocumentStatus;
  
  /** 处理进度 (0-100) */
  progress: number;  // 例: 75
  
  /** 原始文本内容 (清理后的) */
  rawContent?: string;
  
  /** 文档总字符数 */
  totalChars?: number;  // 例: 15432
  
  /** 提取的章节列表 */
  sections?: DocumentSection[];
  
  /** 章节数量 */
  sectionCount?: number;  // 例: 12
  
  /** 生成的故事列表 (冗余存储，方便查询) */
  stories?: Story[];
  
  /** 故事数量 */
  storyCount?: number;  // 例: 28
  
  /** 平均置信度 */
  averageConfidence?: number;  // 例: 0.82
  
  /** 错误信息 (处理失败时) */
  errorMessage?: string;
  
  /** 错误码 */
  errorCode?: ErrorCode;
  
  /** 上传时间 */
  createdAt: Date;  // ISO 8601 格式
  
  /** 最后更新时间 */
  updatedAt: Date;
  
  /** 过期时间 (临时存储策略) */
  expiresAt?: Date;
  
  /** 用户会话ID (匿名用户使用) */
  sessionId: string;
  
  /** 用户ID (登录用户，可选) */
  userId?: string;
}
```

---

### 2.2 DocumentSection (文档章节)

存储文档结构化解析后的章节信息。

```typescript
/**
 * 文档章节
 * PRD文档结构化后的一个章节
 */
interface DocumentSection {
  /** 唯一标识符 */
  id: string;  // 例: "sec-550e8400-e29b-41d4-a716-446655440001"
  
  /** 所属文档ID */
  documentId: string;  // 关联 ParsedDocument.id
  
  /** 章节标题 */
  title: string;  // 例: "2.1 用户登录功能"
  
  /** 章节内容 */
  content: string;  // 章节纯文本内容
  
  /** 章节类型 */
  type: SectionType;
  
  /** 标题层级 (1-6, 对应H1-H6) */
  level: number;  // 例: 2 (表示H2)
  
  /** 在文档中的顺序 */
  order: number;  // 例: 3 (第3个章节)
  
  /** 章节在原文中的起始位置 (字符索引) */
  startPosition: number;
  
  /** 章节在原文中的结束位置 */
  endPosition: number;
  
  /** 章节字数 */
  charCount: number;
  
  /** 该章节生成的故事ID列表 */
  storyIds: string[];
  
  /** 父章节ID (层级关系) */
  parentId?: string;
  
  /** 子章节ID列表 */
  childrenIds?: string[];
}
```

---

### 2.3 Story (用户故事)

核心数据模型，存储生成的用户故事。

```typescript
/**
 * 用户故事
 * 核心模型，代表一个标准的敏捷用户故事
 */
interface Story {
  /** 唯一标识符 */
  id: string;  // 例: "story-550e8400-e29b-41d4-a716-446655440002"
  
  /** 所属文档ID */
  documentId: string;
  
  /** 故事标题 (功能摘要) */
  title: string;  // 例: "用户登录功能"
  
  /** 
   * 标准用户故事描述
   * 格式: As a <role>, I want to <action>, So that <value>
   */
  description: string;  // 例: "As a 普通用户, I want to 使用手机号登录, So that 我可以快速访问个人账户"
  
  /** 角色 */
  role: string;  // 例: "普通用户"
  
  /** 活动/功能 */
  action: string;  // 例: "使用手机号登录"
  
  /** 商业价值 */
  value: string;  // 例: "我可以快速访问个人账户"
  
  /** 功能模块 */
  module: string;  // 例: "用户认证"
  
  /** 优先级 (统一使用P0/P1/P2/P3) */
  priority: Priority;
  
  /** 置信度评分 */
  confidence: ConfidenceScore;
  
  /** 原文引用 (用于溯源) */
  sourceReference: SourceReference;
  
  /** 验收标准列表 */
  acceptanceCriteria?: string[];  // 例: ["输入正确的手机号和密码可以登录", "错误的密码显示错误提示"]
  
  /** 估算故事点数 (Phase 2使用) */
  storyPoints?: number;  // 例: 5
  
  /** 标签列表 */
  tags?: string[];  // 例: ["登录", "安全", "移动端"]
  
  /** 故事状态 */
  status: StoryStatus;
  
  /** 是否经过人工编辑 */
  isEdited: boolean;
  
  /** 编辑历史 */
  editHistory?: EditRecord[];
  
  /** 创建时间 */
  createdAt: Date;
  
  /** 最后更新时间 */
  updatedAt: Date;
  
  /** 创建者 */
  createdBy: 'system' | string;  // 'system' 表示自动生成，或用户ID
  
  /** 排序权重 (用于展示顺序) */
  sortOrder: number;
}
```

---

### 2.4 ConfidenceScore (置信度评分)

嵌入在 Story 中，评估故事质量的多维评分。

```typescript
/**
 * 置信度评分
 * 评估用户故事质量的多个维度
 */
interface ConfidenceScore {
  /** 总体置信度 (0-1) */
  overall: number;  // 例: 0.85
  
  /** 置信度等级 */
  level: ConfidenceLevel;  // 'high' | 'medium' | 'low'
  
  /** 各维度评分详情 */
  factors: {
    /** 模板匹配度 (是否符合 As a...I want...So that...) */
    templateMatch: number;  // 0-1
    
    /** 角色明确度 */
    roleClarity: number;  // 0-1
    
    /** 活动/功能明确度 */
    actionClarity: number;  // 0-1
    
    /** 价值/收益明确度 */
    valueClarity: number;  // 0-1
    
    /** 原文长度适宜度 (太短或太长都扣分) */
    sourceLength: number;  // 0-1
    
    /** 语言清晰度 (是否有歧义词汇) */
    languageClarity: number;  // 0-1
  };
  
  /** 置信度评估原因说明 */
  reasons: string[];  // 例: ["角色明确", "缺少商业价值描述", "原文长度适中"]
  
  /** 是否需要人工确认 */
  needsReview: boolean;
  
  /** 建议操作 */
  suggestions?: string[];  // 例: ["建议补充明确的商业价值", "检查角色定义是否准确"]
}
```

---

### 2.5 SourceReference (原文引用)

用于溯源，指向原始PRD中的具体位置。

```typescript
/**
 * 原文引用
 * 指向PRD文档中的具体位置
 */
interface SourceReference {
  /** 引用的原始文本片段 */
  text: string;  // 例: "用户可以输入手机号和密码进行登录，登录成功后跳转到首页"
  
  /** 所属章节ID */
  sectionId: string;
  
  /** 章节标题 */
  sectionTitle: string;  // 例: "2.1 用户登录功能"
  
  /** 在文档中的起始位置 (字符索引) */
  startPosition: number;
  
  /** 在文档中的结束位置 */
  endPosition: number;
  
  /** 上下文信息 (前后各50字符) */
  context: {
    before: string;  // 前文
    after: string;   // 后文
  };
}
```

---

### 2.6 EditRecord (编辑记录)

记录故事的编辑历史。

```typescript
/**
 * 编辑记录
 * 记录故事的每次修改
 */
interface EditRecord {
  /** 编辑ID */
  id: string;
  
  /** 编辑时间 */
  timestamp: Date;
  
  /** 编辑者 */
  editor: 'user' | string;
  
  /** 修改的字段 */
  field: 'title' | 'description' | 'role' | 'action' | 'value' | 'priority' | 'module' | 'acceptanceCriteria' | 'storyPoints';
  
  /** 旧值 */
  oldValue: string | number | string[];
  
  /** 新值 */
  newValue: string | number | string[];
  
  /** 编辑原因/备注 */
  reason?: string;
}
```

---

## 3. Phase 2 数据模型

### 3.1 StoryMap (故事地图)

Phase 2的故事地图配置和元数据。

```typescript
/**
 * 故事地图
 * 管理一个故事地图的所有配置和节点
 */
interface StoryMap {
  /** 地图ID */
  id: string;  // 例: "map-550e8400-e29b-41d4-a716-446655440003"
  
  /** 关联的文档ID */
  documentId: string;
  
  /** 地图名称 */
  name: string;  // 例: "电商平台v2.0故事地图"
  
  /** 地图描述 */
  description?: string;
  
  /** 地图状态 */
  status: StoryMapStatus;
  
  /** 团队配置 */
  team: {
    /** 团队名称 */
    name: string;
    
    /** 迭代速度 (每个Sprint完成的故事点数) */
    velocity: number;  // 例: 40
    
    /** Sprint时长 (周) */
    sprintDuration: number;  // 例: 2
    
    /** 工作日配置 */
    workingDays: number[];  // [1,2,3,4,5] 表示周一到周五
  };
  
  /** 发布版本配置 */
  releases: Release[];
  
  /** 地图节点列表 */
  nodes: StoryMapNode[];
  
  /** 依赖关系列表 */
  dependencies: Dependency[];
  
  /** 创建时间 */
  createdAt: Date;
  
  /** 最后更新时间 */
  updatedAt: Date;
  
  /** 最后修改者 */
  lastModifiedBy?: string;
  
  /** 视图配置 */
  viewConfig: {
    /** 当前缩放级别 */
    zoom: number;  // 例: 1.0
    
    /** 视口位置 */
    viewport: {
      x: number;
      y: number;
    };
    
    /** 显示的层级 */
    visibleLevels: number[];  // [1,2,3,4]
  };
}

/**
 * 发布版本
 */
interface Release {
  /** 版本ID */
  id: string;
  
  /** 版本号 */
  version: string;  // 例: "v2.0"
  
  /** 版本名称 */
  name: string;  // 例: "春季大版本"
  
  /** 计划发布日期 */
  plannedDate?: Date;
  
  /** 包含的Sprint列表 */
  sprints: Sprint[];
  
  /** 该版本的目标故事ID列表 */
  storyIds: string[];
  
  /** 版本颜色标识 (用于可视化) */
  color: string;  // 例: "#1890ff"
}

/**
 * Sprint
 */
interface Sprint {
  /** Sprint ID */
  id: string;
  
  /** Sprint序号 */
  number: number;  // 例: 1
  
  /** Sprint名称 */
  name: string;  // 例: "Sprint 1"
  
  /** 开始日期 */
  startDate: Date;
  
  /** 结束日期 */
  endDate: Date;
  
  /** 计划完成的故事点数 */
  plannedPoints: number;
  
  /** 实际完成的故事点数 */
  actualPoints?: number;
  
  /** 包含的故事ID列表 */
  storyIds: string[];
  
  /** Sprint状态 */
  status: 'planned' | 'active' | 'completed';
}
```

---

### 3.2 StoryMapNode (故事地图节点)

故事在地图中的具体位置和层级信息。

```typescript
/**
 * 故事地图节点
 * 表示一个故事在地图中的位置和层级
 */
interface StoryMapNode {
  /** 节点ID */
  id: string;
  
  /** 关联的故事ID */
  storyId: string;
  
  /** 故事引用 (冗余存储，方便查询) */
  story?: Story;
  
  /** 节点类型 (四级结构) */
  level: StoryMapLevel;
  
  /** 父节点ID */
  parentId?: string;
  
  /** 子节点ID列表 */
  childrenIds?: string[];
  
  /** 在画布上的位置 */
  position: {
    x: number;
    y: number;
  };
  
  /** 所属Release ID */
  releaseId?: string;
  
  /** 所属Sprint ID */
  sprintId?: string;
  
  /** 排序权重 (同层级内的排序) */
  sortOrder: number;
  
  /** 是否手动调整过位置 */
  isManuallyPositioned: boolean;
  
  /** 扩展属性 */
  metadata?: {
    /** 预估工时 (小时) */
    estimatedHours?: number;
    
    /** 负责人 */
    assignee?: string;
    
    /** 自定义标签 */
    customTags?: string[];
  };
}

/**
 * 故事地图四级层级
 */
enum StoryMapLevel {
  ACTIVITY = 1,    // 骨干 (Activities) - 最高层级，业务活动
  TASK = 2,        // 任务 (Tasks) - 具体任务
  STORY = 3,       // 故事 (Stories) - 用户故事
  DETAIL = 4       // 细节 (Acceptance Criteria) - 验收标准/子任务
}
```

---

### 3.3 Dependency (依赖关系)

故事间的依赖关系定义。

```typescript
/**
 * 依赖关系
 * 表示两个故事之间的依赖关系
 */
interface Dependency {
  /** 依赖ID */
  id: string;
  
  /** 前置故事ID (被依赖的) */
  fromStoryId: string;
  
  /** 后置故事ID (依赖他人的) */
  toStoryId: string;
  
  /** 依赖类型 */
  type: DependencyType;
  
  /** 依赖描述 */
  description?: string;
  
  /** 是否是阻塞性依赖 */
  isBlocking: boolean;
  
  /** 创建时间 */
  createdAt: Date;
}

/**
 * 依赖类型
 */
enum DependencyType {
  BLOCKS = 'blocks',           // 阻塞依赖: A必须完成才能做B
  RELATES_TO = 'relates_to',   // 相关依赖: A和B有关联，可并行
  DUPLICATES = 'duplicates',   // 重复依赖: B是A的重复
  SPLIT_FROM = 'split_from'    // 拆分依赖: B是从A拆分出来的
}
```

---

### 3.4 FigmaAudit (Figma审计)

Phase 2 Figma设计稿审计结果。

```typescript
/**
 * Figma审计结果
 * 存储一次Figma审计的完整结果
 */
interface FigmaAudit {
  /** 审计ID */
  id: string;
  
  /** 关联的文档ID */
  documentId: string;
  
  /** Figma文件信息 */
  figmaFile: {
    /** Figma文件URL */
    url: string;
    
    /** Figma文件Key */
    fileKey: string;
    
    /** Figma文件名称 */
    name: string;
    
    /** 最后修改时间 */
    lastModified: Date;
    
    /** 版本号 */
    version: string;
  };
  
  /** 审计状态 */
  status: AuditStatus;
  
  /** 审计进度 (0-100) */
  progress: number;
  
  /** 发现的问题列表 */
  issues: FigmaAuditIssue[];
  
  /** 问题统计 */
  statistics: {
    /** 总问题数 */
    total: number;
    
    /** 遗漏项数量 */
    missingCount: number;
    
    /** 冗余项数量 */
    redundantCount: number;
    
    /** 歧义项数量 */
    ambiguousCount: number;
    
    /** 高优先级问题数 */
    highPriorityCount: number;
    
    /** 已确认问题数 */
    confirmedCount: number;
    
    /** 已忽略问题数 */
    ignoredCount: number;
  };
  
  /** 审计创建时间 */
  createdAt: Date;
  
  /** 审计完成时间 */
  completedAt?: Date;
  
  /** 审计耗时 (秒) */
  duration?: number;
  
  /** 错误信息 */
  errorMessage?: string;
}

/**
 * Figma审计问题项
 */
interface FigmaAuditIssue {
  /** 问题ID */
  id: string;
  
  /** 问题类型 */
  type: AuditIssueType;
  
  /** 优先级 */
  priority: AuditPriority;
  
  /** 问题标题 */
  title: string;
  
  /** 问题详细描述 */
  description: string;
  
  /** 问题状态 */
  status: AuditIssueStatus;
  
  /** PRD侧信息 */
  prdReference: {
    /** 引用的PRD段落 */
    text: string;
    
    /** 所属章节ID */
    sectionId: string;
    
    /** 关联的故事ID */
    storyId?: string;
  };
  
  /** Figma侧信息 */
  figmaReference: {
    /** Figma节点ID */
    nodeId: string;
    
    /** 节点名称 */
    nodeName: string;
    
    /** 节点类型 */
    nodeType: string;
    
    /** 所在画板名称 */
    pageName: string;
    
    /** 深度链接 */
    deepLink: string;
    
    /** 节点截图URL (可选) */
    thumbnailUrl?: string;
  };
  
  /** 置信度 (0-1) */
  confidence: number;
  
  /** 处理记录 */
  handlingRecords?: {
    /** 处理时间 */
    timestamp: Date;
    
    /** 处理人 */
    handledBy: string;
    
    /** 处理动作 */
    action: 'confirmed' | 'ignored' | 'fixed';
    
    /** 备注 */
    comment?: string;
  }[];
  
  /** 创建时间 */
  createdAt: Date;
}
```

---

### 3.5 APISpec (API规范)

Phase 2 自动生成的API规范。

```typescript
/**
 * API规范
 * 存储生成的OpenAPI规范
 */
interface APISpec {
  /** 规范ID */
  id: string;
  
  /** 关联的文档ID */
  documentId: string;
  
  /** 关联的Figma文件信息 (可选) */
  figmaFile?: {
    url: string;
    fileKey: string;
    name: string;
  };
  
  /** 规范标题 */
  title: string;  // 例: "电商平台API"
  
  /** 规范版本 */
  version: string;  // 例: "1.0.0"
  
  /** 规范描述 */
  description?: string;
  
  /** OpenAPI规范对象 (符合OpenAPI 3.0标准) */
  openApiSpec: OpenAPISpecObject;
  
  /** API端点列表 (简化视图) */
  endpoints: APIEndpoint[];
  
  /** 数据模型定义 */
  schemas: APISchema[];
  
  /** 生成状态 */
  status: APISpecStatus;
  
  /** 覆盖率统计 */
  coverage: {
    /** 识别的业务实体数 */
    entityCount: number;
    
    /** 生成的端点数 */
    endpointCount: number;
    
    /** 覆盖率百分比 */
    percentage: number;  // 例: 0.92 (92%)
  };
  
  /** 创建时间 */
  createdAt: Date;
  
  /** 最后更新时间 */
  updatedAt: Date;
  
  /** 是否经过人工编辑 */
  isEdited: boolean;
}

/**
 * API端点
 */
interface APIEndpoint {
  /** 端点ID */
  id: string;
  
  /** API路径 */
  path: string;  // 例: "/api/v1/users/login"
  
  /** HTTP方法 */
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  
  /** 操作ID */
  operationId: string;  // 例: "userLogin"
  
  /** 摘要 */
  summary: string;
  
  /** 详细描述 */
  description?: string;
  
  /** 标签分类 */
  tags: string[];  // 例: ["用户认证"]
  
  /** 请求参数 */
  parameters?: APIParameter[];
  
  /** 请求体 */
  requestBody?: APIRequestBody;
  
  /** 响应定义 */
  responses: APIResponse[];
  
  /** 来源追溯 */
  source: {
    /** 关联的PRD段落 */
    prdSectionId?: string;
    
    /** 关联的Figma节点 */
    figmaNodeId?: string;
  };
}

/**
 * API参数
 */
interface APIParameter {
  /** 参数名 */
  name: string;
  
  /** 参数位置 */
  in: 'query' | 'path' | 'header' | 'cookie';
  
  /** 是否必填 */
  required: boolean;
  
  /** 参数描述 */
  description?: string;
  
  /** 数据类型 */
  schema: APIDataSchema;
}

/**
 * API请求体
 */
interface APIRequestBody {
  /** 是否必填 */
  required: boolean;
  
  /** 内容类型 */
  contentType: string;  // 例: "application/json"
  
  /** 数据结构 */
  schema: APIDataSchema;
  
  /** 示例 */
  example?: object;
}

/**
 * API响应
 */
interface APIResponse {
  /** HTTP状态码 */
  statusCode: string;  // 例: "200", "201", "400"
  
  /** 响应描述 */
  description: string;
  
  /** 内容类型 */
  contentType: string;
  
  /** 数据结构 */
  schema?: APIDataSchema;
  
  /** 示例 */
  example?: object;
}

/**
 * API数据模型
 */
interface APISchema {
  /** 模型名称 */
  name: string;  // 例: "User"
  
  /** 模型类型 */
  type: 'object' | 'enum';
  
  /** 描述 */
  description?: string;
  
  /** 属性列表 */
  properties?: APISchemaProperty[];
  
  /** 枚举值 (如果是enum类型) */
  enumValues?: string[];
  
  /** 来源追溯 */
  source: {
    /** 从PRD识别的实体名 */
    prdEntityName?: string;
    
    /** 关联的Figma组件 */
    figmaComponentId?: string;
  };
}

/**
 * API模型属性
 */
interface APISchemaProperty {
  /** 属性名 */
  name: string;
  
  /** 数据类型 */
  type: 'string' | 'number' | 'integer' | 'boolean' | 'array' | 'object';
  
  /** 格式 (如date-time, email等) */
  format?: string;
  
  /** 是否必填 */
  required: boolean;
  
  /** 描述 */
  description?: string;
  
  /** 示例值 */
  example?: any;
  
  /** 数组项类型 (如果是array类型) */
  items?: APIDataSchema;
  
  /** 引用其他模型 (如果是object类型) */
  ref?: string;
  
  /** 验证规则 */
  validation?: {
    minLength?: number;
    maxLength?: number;
    minimum?: number;
    maximum?: number;
    pattern?: string;
    enum?: string[];
  };
}

/**
 * 数据Schema (简化版)
 */
interface APIDataSchema {
  type: string;
  format?: string;
  ref?: string;  // 引用其他模型 $ref: "#/components/schemas/User"
  items?: APIDataSchema;  // 数组项类型
  properties?: Record<string, APIDataSchema>;  // 对象属性
  required?: string[];
}

/**
 * OpenAPI规范对象 (符合OpenAPI 3.0.0标准)
 */
interface OpenAPISpecObject {
  openapi: '3.0.0' | '3.0.1' | '3.0.2' | '3.0.3';
  info: {
    title: string;
    version: string;
    description?: string;
  };
  servers?: Array<{
    url: string;
    description?: string;
  }>;
  paths: Record<string, any>;  // API路径定义
  components?: {
    schemas?: Record<string, any>;  // 数据模型
    responses?: Record<string, any>;
    parameters?: Record<string, any>;
  };
  tags?: Array<{
    name: string;
    description?: string;
  }>;
}
```

---

## 4. 枚举类型定义

### 4.1 Phase 1 枚举

```typescript
/**
 * 文档处理状态
 */
enum DocumentStatus {
  UPLOADED = 'uploaded',           // 已上传，等待处理
  PARSING = 'parsing',             // 正在解析文档
  ANALYZING = 'analyzing',         // 正在分析内容
  GENERATING = 'generating',       // 正在生成故事
  COMPLETED = 'completed',         // 处理完成
  FAILED = 'failed',               // 处理失败
  EXPIRED = 'expired'              // 已过期
}

/**
 * 文档章节类型
 */
enum SectionType {
  BACKGROUND = 'background',       // 业务背景
  FUNCTIONAL = 'functional',       // 功能需求
  NON_FUNCTIONAL = 'non-functional', // 非功能需求
  FLOW = 'flow',                   // 流程图/时序图
  UI = 'ui',                       // UI设计
  API = 'api',                     // 接口定义
  ACCEPTANCE = 'acceptance',       // 验收标准
  OTHER = 'other'                  // 其他
}

/**
 * 优先级 (统一标准)
 */
enum Priority {
  P0 = 'P0',  // 最高优先级 - Must Have
  P1 = 'P1',  // 高优先级 - Should Have
  P2 = 'P2',  // 中优先级 - Could Have
  P3 = 'P3'   // 低优先级 - Won't Have (this time)
}

/**
 * 故事状态
 */
enum StoryStatus {
  DRAFT = 'draft',                 // 草稿 (新生成)
  REVIEW = 'review',               // 待审核
  APPROVED = 'approved',           // 已确认
  REJECTED = 'rejected',           // 已拒绝
  IMPLEMENTED = 'implemented',     // 已实现
  ARCHIVED = 'archived'            // 已归档
}

/**
 * 置信度等级
 */
enum ConfidenceLevel {
  HIGH = 'high',      // 0.8-1.0 - 质量高，可直接使用
  MEDIUM = 'medium',  // 0.5-0.8 - 质量中等，建议检查
  LOW = 'low'         // 0-0.5 - 质量低，需要人工重写
}

/**
 * 错误码
 */
enum ErrorCode {
  // 文件相关错误 (1xxx)
  FILE_TOO_LARGE = 'FILE_001',           // 文件过大
  FILE_EMPTY = 'FILE_002',               // 文件内容为空
  FILE_FORMAT_UNSUPPORTED = 'FILE_003',  // 不支持的格式
  FILE_CORRUPTED = 'FILE_004',           // 文件损坏
  FILE_SCANNED_PDF = 'FILE_005',         // PDF是扫描件
  
  // 解析相关错误 (2xxx)
  PARSE_FAILED = 'PARSE_001',            // 解析失败
  PARSE_TIMEOUT = 'PARSE_002',           // 解析超时
  PARSE_PARTIAL = 'PARSE_003',           // 部分解析成功
  
  // 生成相关错误 (3xxx)
  GENERATE_FAILED = 'GEN_001',           // 生成失败
  NO_CONTENT_EXTRACTED = 'GEN_002',      // 未提取到有效内容
  
  // 系统错误 (9xxx)
  SYSTEM_ERROR = 'SYS_001',              // 系统错误
  NETWORK_ERROR = 'SYS_002',             // 网络错误
  RATE_LIMITED = 'SYS_003'               // 请求频率限制
}
```

### 4.2 Phase 2 枚举

```typescript
/**
 * 故事地图状态
 */
enum StoryMapStatus {
  DRAFT = 'draft',           // 草稿
  PLANNING = 'planning',     // 规划中
  FINALIZED = 'finalized',   // 已确定
  ARCHIVED = 'archived'      // 已归档
}

/**
 * 审计状态
 */
enum AuditStatus {
  PENDING = 'pending',       // 等待中
  RUNNING = 'running',       // 进行中
  COMPLETED = 'completed',   // 完成
  FAILED = 'failed',         // 失败
  CANCELLED = 'cancelled'    // 已取消
}

/**
 * 审计问题类型
 */
enum AuditIssueType {
  MISSING = 'missing',           // 遗漏项：PRD有但Figma无
  REDUNDANT = 'redundant',       // 冗余项：Figma有但PRD无
  AMBIGUOUS = 'ambiguous',       // 歧义项：PRD和Figma不一致
  INCOMPLETE = 'incomplete'      // 不完整：信息缺失
}

/**
 * 审计问题优先级
 */
enum AuditPriority {
  CRITICAL = 'critical',     // 严重 - 影响核心功能
  HIGH = 'high',            // 高 - 重要功能缺失
  MEDIUM = 'medium',        // 中 - 次要问题
  LOW = 'low'               // 低 - 建议性改进
}

/**
 * 审计问题状态
 */
enum AuditIssueStatus {
  OPEN = 'open',             // 待处理
  CONFIRMED = 'confirmed',   // 已确认
  IGNORED = 'ignored',       // 已忽略
  FIXED = 'fixed'            // 已修复
}

/**
 * API规范生成状态
 */
enum APISpecStatus {
  GENERATING = 'generating',     // 生成中
  COMPLETED = 'completed',       // 完成
  FAILED = 'failed',            // 失败
  VALIDATED = 'validated'       // 已验证
}
```

---

## 5. 验证规则

### 5.1 输入验证规则

```typescript
/**
 * 验证规则配置
 */
const ValidationRules = {
  // ParsedDocument 验证
  document: {
    fileName: {
      required: true,
      maxLength: 255,
      pattern: /^[^\\/:*?"<>|]+$/  // 不允许特殊字符
    },
    fileSize: {
      required: true,
      max: 20 * 1024 * 1024,  // 20MB
      min: 1  // 至少1字节
    },
    fileType: {
      required: true,
      allowed: ['docx', 'pdf', 'txt', 'md']
    }
  },
  
  // Story 验证
  story: {
    title: {
      required: true,
      minLength: 2,
      maxLength: 100
    },
    description: {
      required: true,
      minLength: 20,
      maxLength: 500,
      // 必须包含 As a...I want...So that... 结构
      pattern: /As a\s+.+?\s*,?\s*I want(?: to)?\s+.+?\s*,?\s*So that\s+.+?/i
    },
    role: {
      required: true,
      minLength: 2,
      maxLength: 50
    },
    action: {
      required: true,
      minLength: 5,
      maxLength: 200
    },
    value: {
      required: true,
      minLength: 5,
      maxLength: 200
    },
    module: {
      required: true,
      maxLength: 50
    },
    priority: {
      required: true,
      allowed: ['P0', 'P1', 'P2', 'P3']
    },
    acceptanceCriteria: {
      maxItems: 20,  // 最多20条验收标准
      itemMaxLength: 200
    },
    storyPoints: {
      min: 1,
      max: 100,
      // 建议使用斐波那契数列: 1, 2, 3, 5, 8, 13, 21, 34, 55, 89
      allowedValues: [1, 2, 3, 5, 8, 13, 21, 34, 55, 89]
    }
  },
  
  // Figma URL 验证
  figmaUrl: {
    required: true,
    pattern: /^https:\/\/(www\.)?figma\.com\/file\/[a-zA-Z0-9]+/
  },
  
  // Sprint 验证
  sprint: {
    velocity: {
      min: 1,
      max: 200
    },
    sprintDuration: {
      min: 1,
      max: 4  // 最多4周
    }
  }
};
```

### 5.2 业务规则

```typescript
/**
 * 业务规则定义
 */
const BusinessRules = {
  // 置信度计算规则
  confidence: {
    // 完全匹配标准模板: +0.3
    templateMatchBonus: 0.3,
    // 角色明确: +0.2
    roleClarityBonus: 0.2,
    // 动词清晰: +0.2
    actionClarityBonus: 0.2,
    // 价值明确: +0.2
    valueClarityBonus: 0.2,
    // 长度适中: +0.1
    lengthBonus: 0.1,
    
    // 置信度等级阈值
    thresholds: {
      high: 0.8,
      medium: 0.5
    }
  },
  
  // 文档存储规则
  storage: {
    // 临时文档保留时间: 7天
    documentRetentionDays: 7,
    // 最大存储文档数 (匿名用户)
    maxAnonymousDocuments: 10,
    // 单用户最大文档数 (登录用户)
    maxUserDocuments: 100
  },
  
  // 生成限制
  generation: {
    // 单次最大生成故事数
    maxStoriesPerDocument: 200,
    // 最小故事长度 (字符)
    minStoryLength: 20,
    // 最大故事长度 (字符)
    maxStoryLength: 500
  },
  
  // 故事地图限制
  storyMap: {
    // 最大Release数
    maxReleases: 10,
    // 每个Release最大Sprint数
    maxSprintsPerRelease: 10,
    // 每个Sprint最大故事数
    maxStoriesPerSprint: 50,
    // 最大依赖关系数
    maxDependencies: 500
  }
};
```

---

## 6. 关系图

### 6.1 实体关系图 (ER Diagram)

```
┌─────────────────────────────────────────────────────────────────────┐
│                         ParsedDocument                               │
├─────────────────────────────────────────────────────────────────────┤
│ PK  id: string                                                       │
│     fileName: string                                                 │
│     fileType: enum                                                   │
│     fileSize: number                                                 │
│     status: enum                                                     │
│     progress: number                                                 │
│     sessionId: string                                                │
│     createdAt: Date                                                  │
│     expiresAt: Date                                                  │
└──────────────┬──────────────────────────────────────────────────────┘
               │ 1:N
               ▼
┌─────────────────────────────────────────────────────────────────────┐
│                      DocumentSection                                 │
├─────────────────────────────────────────────────────────────────────┤
│ PK  id: string                                                       │
│ FK  documentId: string                                               │
│     title: string                                                    │
│     content: string                                                  │
│     type: enum                                                       │
│     level: number                                                    │
│     order: number                                                    │
│     parentId: string (自关联)                                         │
└──────────────┬──────────────────────────────────────────────────────┘
               │ 1:N
               ▼
┌─────────────────────────────────────────────────────────────────────┐
│                           Story                                      │
├─────────────────────────────────────────────────────────────────────┤
│ PK  id: string                                                       │
│ FK  documentId: string                                               │
│     title: string                                                    │
│     description: string                                              │
│     role: string                                                     │
│     action: string                                                   │
│     value: string                                                    │
│     module: string                                                   │
│     priority: enum                                                   │
│     confidence: object                                               │
│     sourceReference: object                                          │
│     storyPoints: number                                              │
│     status: enum                                                     │
│     isEdited: boolean                                                │
│     createdAt: Date                                                  │
└───────┬─────────────────────────────────────────────────────────────┘
        │ 1:1 (Phase 2)
        ▼
┌─────────────────────────────────────────────────────────────────────┐
│                      StoryMapNode                                    │
├─────────────────────────────────────────────────────────────────────┤
│ PK  id: string                                                       │
│ FK  storyId: string                                                  │
│ FK  storyMapId: string                                               │
│     level: enum                                                      │
│     parentId: string (自关联)                                         │
│     position: { x, y }                                               │
│     releaseId: string                                                │
│     sprintId: string                                                 │
└───────┬─────────────────────────────────────────────────────────────┘
        │ N:1
        ▼
┌─────────────────────────────────────────────────────────────────────┐
│                         StoryMap                                     │
├─────────────────────────────────────────────────────────────────────┤
│ PK  id: string                                                       │
│ FK  documentId: string                                               │
│     name: string                                                     │
│     status: enum                                                     │
│     team: object                                                     │
│     releases: array                                                  │
│     viewConfig: object                                               │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│                      FigmaAudit                                      │
├─────────────────────────────────────────────────────────────────────┤
│ PK  id: string                                                       │
│ FK  documentId: string                                               │
│     figmaFile: object                                                │
│     status: enum                                                     │
│     statistics: object                                               │
└───────┬─────────────────────────────────────────────────────────────┘
        │ 1:N
        ▼
┌─────────────────────────────────────────────────────────────────────┐
│                      FigmaAuditIssue                                 │
├─────────────────────────────────────────────────────────────────────┤
│ PK  id: string                                                       │
│ FK  auditId: string                                                  │
│     type: enum                                                       │
│     priority: enum                                                   │
│     prdReference: object                                             │
│     figmaReference: object                                           │
│     confidence: number                                               │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│                         APISpec                                      │
├─────────────────────────────────────────────────────────────────────┤
│ PK  id: string                                                       │
│ FK  documentId: string                                               │
│     title: string                                                    │
│     version: string                                                  │
│     openApiSpec: object                                              │
│     endpoints: array                                                 │
│     schemas: array                                                   │
│     coverage: object                                                 │
└─────────────────────────────────────────────────────────────────────┘
```

### 6.2 关联关系说明

| 父实体 | 子实体 | 关系类型 | 关联字段 | 说明 |
|--------|--------|----------|----------|------|
| ParsedDocument | DocumentSection | 1:N | documentId | 一个文档包含多个章节 |
| ParsedDocument | Story | 1:N | documentId | 一个文档生成多个故事 |
| ParsedDocument | StoryMap | 1:1 | documentId | 一个文档对应一个故事地图 |
| ParsedDocument | FigmaAudit | 1:N | documentId | 一个文档可以有多次审计 |
| ParsedDocument | APISpec | 1:N | documentId | 一个文档可以生成多个API规范 |
| DocumentSection | Story | 1:N | sectionId (在sourceReference中) | 一个章节可以生成多个故事 |
| Story | StoryMapNode | 1:1 | storyId | 一个故事在地图中对应一个节点 |
| StoryMap | StoryMapNode | 1:N | storyMapId | 一个地图包含多个节点 |
| StoryMap | Release | 1:N | (embedded) | 一个地图包含多个Release |
| Release | Sprint | 1:N | (embedded) | 一个Release包含多个Sprint |
| StoryMapNode | StoryMapNode | N:1 (自关联) | parentId | 节点层级关系 |
| FigmaAudit | FigmaAuditIssue | 1:N | auditId | 一次审计发现多个问题 |
| Story | Story | N:M | (通过Dependency表) | 故事间的依赖关系 |

---

## 附录：TypeScript 类型声明文件

```typescript
// types/storyweaver.d.ts

declare module 'storyweaver' {
  // 重新导出所有类型
  export * from './models';
  export * from './enums';
  export * from './validation';
}

// types/models.ts
export interface ParsedDocument { /* ... */ }
export interface DocumentSection { /* ... */ }
export interface Story { /* ... */ }
export interface ConfidenceScore { /* ... */ }
export interface SourceReference { /* ... */ }
export interface EditRecord { /* ... */ }
export interface StoryMap { /* ... */ }
export interface StoryMapNode { /* ... */ }
export interface Dependency { /* ... */ }
export interface FigmaAudit { /* ... */ }
export interface FigmaAuditIssue { /* ... */ }
export interface APISpec { /* ... */ }

// types/enums.ts
export enum DocumentStatus { /* ... */ }
export enum SectionType { /* ... */ }
export enum Priority { /* ... */ }
export enum StoryStatus { /* ... */ }
export enum ConfidenceLevel { /* ... */ }
export enum ErrorCode { /* ... */ }
export enum StoryMapLevel { /* ... */ }
export enum DependencyType { /* ... */ }
export enum AuditStatus { /* ... */ }
export enum AuditIssueType { /* ... */ }
export enum AuditPriority { /* ... */ }
export enum AuditIssueStatus { /* ... */ }
export enum APISpecStatus { /* ... */ }

// types/validation.ts
export const ValidationRules: { /* ... */ };
export const BusinessRules: { /* ... */ };
```

---

**文档结束**

*本数据模型定义规范为 StoryWeaver AI 项目的数据结构提供标准参考，所有开发应遵循此规范进行。*
