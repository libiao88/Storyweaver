# StoryWeaver AI - 需求差距分析报告 (Gap Analysis)

**文档版本**: v1.0  
**日期**: 2026-02-14  
**分析范围**: PRD_StoryWeaver_Unified.md (已移除飞书Wiki同步)

---

## 📊 执行摘要

本次分析针对统一后的PRD文档，识别出以下关键差距：

- **🔴 关键缺失 (Critical)**: 8 项
- **🟡 重要缺失 (Major)**: 12 项  
- **🟢 轻微缺失 (Minor)**: 6 项
- **⚠️ 模糊需求**: 10 项

**建议**: 在开发启动前，优先解决关键和重要级别的差距。

---

## 🔴 关键缺失 (Critical Gaps)

### CG-001: 缺少后端架构设计
**影响**: Phase 1 的文档解析和故事生成功能需要后端支持

**现状**:
- 当前代码库是纯前端项目 (React + Vite)
- PRD 要求文档解析使用 Python (python-docx, PyPDF2)
- 没有后端服务设计

**建议方案**:
1. **方案A**: 添加后端服务 (FastAPI/Node.js)
   - 优点: 功能完整，解析能力强
   - 缺点: 增加部署复杂度

2. **方案B**: 纯前端实现 (使用 WASM 或 JS 库)
   - 优点: 部署简单
   - 缺点: 解析能力受限，大文件处理困难

3. **方案C**: 集成第三方服务 (如文档解析API)
   - 优点: 快速实现
   - 缺点: 依赖外部服务，可能有费用

**决策点**: 需要产品和技术团队确认采用哪种方案

---

### CG-002: 缺少数据模型定义
**影响**: 影响前后端数据交互和存储设计

**缺失内容**:
```typescript
// 需要明确定义的数据模型

interface Story {
  id: string;                    // UUID 格式？
  title: string;                 // 最大长度？
  description: string;           // 标准用户故事格式
  module: string;                // 功能模块分类
  priority: 'P0' | 'P1' | 'P2' | '高' | '中' | '低';  // 枚举值不统一
  sourceReference: string;       // 原文引用，最大长度？
  confidence: number;            // 0-1 浮点数
  acceptanceCriteria?: string[]; // 验收标准数组
  storyPoints?: number;          // 估算点数
  dependencies?: string[];       // 依赖的故事ID数组
  createdAt: Date;
  updatedAt: Date;
}

interface ParsedDocument {
  fileId: string;
  fileName: string;
  fileType: 'docx' | 'pdf' | 'txt' | 'md';
  fileSize: number;
  content: string;
  sections: DocumentSection[];
  extractedAt: Date;
}

interface DocumentSection {
  type: 'background' | 'functional' | 'non-functional' | 'flow' | 'other';
  title: string;
  content: string;
  level: number;  // 标题层级 H1-H6
}
```

**建议**: 补充完整的数据模型定义，包括字段类型、约束、验证规则

---

### CG-003: 缺少 API 接口规范
**影响**: 前后端对接困难

**需要定义的接口**:

```yaml
# 文档上传
POST /api/v1/documents/upload
Request:
  - file: multipart/form-data
Response:
  - fileId: string
  - status: 'uploaded' | 'processing' | 'completed' | 'failed'
  - progress: number (0-100)

# 获取解析状态
GET /api/v1/documents/{fileId}/status
Response:
  - status: string
  - progress: number
  - error?: string

# 获取生成的故事列表
GET /api/v1/documents/{fileId}/stories
Response:
  - stories: Story[]
  - totalCount: number
  - confidence: { high: number, medium: number, low: number }

# 更新故事
PUT /api/v1/stories/{storyId}
Request:
  - title?: string
  - description?: string
  - priority?: string
  - module?: string
Response:
  - story: Story

# 删除故事
DELETE /api/v1/stories/{storyId}
Response:
  - success: boolean

# 导出故事
POST /api/v1/stories/export
Request:
  - format: 'csv' | 'markdown' | 'json'
  - storyIds?: string[]  // 不指定则导出全部
Response:
  - downloadUrl: string
  - expiresAt: Date

# Figma 审计 (Phase 2)
POST /api/v1/figma/audit
Request:
  - figmaFileUrl: string
  - figmaToken: string
  - documentId: string
Response:
  - auditId: string
  - status: 'processing' | 'completed'

# API 文档生成 (Phase 2)
POST /api/v1/api-docs/generate
Request:
  - documentId: string
  - figmaFileUrl?: string
Response:
  - openApiSpec: object
  - downloadUrl: string
```

---

### CG-004: 缺少存储策略设计
**影响**: 数据持久化和用户会话管理

**待决策问题**:
1. **文档存储**:
   - 临时存储还是永久存储？
   - 存储位置 (本地文件系统 / S3 / 数据库存储)?
   - 保留时长？

2. **故事数据存储**:
   - 浏览器本地存储 (localStorage/IndexedDB)?
   - 还是服务端数据库?
   - 用户是否需要登录?

3. **Figma Token 存储**:
   - 如何安全存储用户的 Figma PAT?
   - 是否需要加密?
   - 存储时长?

**建议**: 明确 MVP 阶段的存储策略（推荐：本地存储 + 内存处理，无后端）

---

### CG-005: 缺少错误处理规范
**影响**: 用户体验和系统稳定性

**需要定义的错误场景**:

| 错误类型 | 场景 | 用户提示 | 处理方式 |
|----------|------|----------|----------|
| **文件格式错误** | 上传了不支持的格式 (.jpg, .png) | "不支持的文件格式，请上传 .docx, .pdf, .txt 或 .md 文件" | 前端拦截，不上传 |
| **文件过大** | 文件 > 20MB | "文件大小超过 20MB 限制，请压缩后重试" | 前端拦截 |
| **空文件** | 文件内容为空 | "文件内容为空，请上传有效文档" | 后端校验后返回 |
| **解析失败** | PDF 是扫描件 | "无法识别扫描件，请上传可编辑文档" | 后端返回特定错误码 |
| **解析超时** | 文档过大或格式复杂 | "文档解析超时，请重试或联系支持" | 提供重试按钮 |
| **生成失败** | AI/算法服务异常 | "故事生成失败，请重试" | 自动重试 3 次 |
| **Figma 授权失败** | Token 无效或过期 | "Figma 授权失败，请重新授权" | 引导重新授权 |
| **网络错误** | 网络断开 | "网络连接失败，请检查网络后重试" | 自动重试 + 手动重试 |

**缺失内容**:
- 错误码定义 (Error Codes)
- 错误信息国际化 (i18n) 策略
- 日志记录规范
- 监控告警规则

---

### CG-006: 缺少用户认证与权限设计
**影响**: 数据安全和多用户支持

**待决策问题**:
1. 是否需要用户登录?
2. 支持哪些登录方式? (邮箱/手机/第三方 OAuth)
3. 用户数据隔离策略?
4. 管理员功能需求?

**MVP 建议**: 暂不支持登录，使用浏览器本地存储 + 会话级数据

---

### CG-007: 缺少 AI/算法策略详细设计
**影响**: 故事生成的准确率和可用性

**模糊的算法需求**:
- "基于动词提取" - 具体用什么 NLP 库/模型?
- "角色映射" - 规则-based 还是 ML-based?
- "价值推导" - 如何实现? 用 LLM 还是模板匹配?
- "置信度评分" - 评分算法是什么?

**建议**: 
1. 明确 Phase 1 使用 Rule-based 方案 (关键词匹配 + 正则)
2. 预留 LLM 集成接口供后续优化
3. 定义置信度计算公式

---

### CG-008: 缺少测试策略
**影响**: 代码质量和维护成本

**缺失内容**:
- 单元测试覆盖率要求
- 集成测试范围
- E2E 测试场景
- 性能测试基准
- 测试数据准备策略

**建议**: 在 AGENTS.md 中添加测试规范

---

## 🟡 重要缺失 (Major Gaps)

### MG-001: 缺少 UI/UX 设计规范
**影响**: 产品一致性和开发效率

**缺失内容**:
- 没有设计稿或原型图
- 缺少交互流程图
- 没有组件设计规范 (除了基础 UI 组件)
- 缺少响应式断点定义
- 缺少动效规范

**建议**:
1. 为核心流程创建低保真原型
2. 定义页面布局规范
3. 明确主要用户流程的交互细节

---

### MG-002: 缺少性能优化策略
**影响**: 大文档处理时的用户体验

**待优化场景**:
1. **大文件处理 (>10MB)**:
   - 是否需要分片上传?
   - 解析进度如何展示?
   - 是否需要后台处理 + 通知机制?

2. **大量故事 (>500条)**:
   - 列表虚拟化 (Virtual List)?
   - 分页还是无限滚动?
   - 搜索和过滤性能?

3. **故事地图大数据量**:
   - 画布性能优化 (Canvas vs SVG vs DOM)?
   - 懒加载策略?

---

### MG-003: 缺少 Figma 集成详细规范
**影响**: Phase 2 Figma 审计功能开发

**待明确问题**:
1. Figma PAT 如何获取和输入? (UI 流程)
2. 支持哪些类型的 Figma 文件? (Design File vs FigJam)
3. 如何处理大型 Figma 文件? (分页/增量加载)
4. 审计报告的数据结构?
5. 如何定位到具体的 Figma 节点? (deep link)

**需要的 API 调研**:
- Figma REST API 详细文档
- Figma Plugin API 是否相关?
- 访问权限和 Rate Limit

---

### MG-004: 缺少 OpenAPI 生成详细规范
**影响**: Phase 2 API 生成器功能

**待明确问题**:
1. 如何从 PRD 提取业务实体? (NER 算法?)
2. 如何从 Figma 推导字段类型? (String/Number/Boolean/Date)
3. 如何识别必填/可选字段?
4. 如何推断 API 端点路径?
5. 如何生成合理的示例数据?

**输出格式细节**:
- OpenAPI 3.0 完整规范支持?
- 是否需要生成请求/响应示例?
- 是否支持自定义模板?

---

### MG-005: 缺少用户故事地图详细交互规范
**影响**: Phase 2 故事地图功能

**待明确问题**:
1. **数据结构**:
   - 四级结构如何在数据中体现?
   - 依赖关系的数据模型?

2. **可视化**:
   - 使用什么技术? (React Flow / D3.js / Canvas)
   - 画布大小和缩放策略?
   - 节点样式和布局算法?

3. **拖拽交互**:
   - 拖拽到什么粒度? (Sprint 间移动? Release 间移动?)
   - 冲突检测逻辑? (依赖冲突)
   - 撤销/重做支持?

4. **排期算法**:
   - Velocity 如何设置?
   - Sprint 时长定义?
   - 工作日/节假日处理?

---

### MG-006: 缺少导入/导出详细规范
**影响**: 与其他工具集成

**CSV 导出细节**:
- 字段顺序和命名
- 编码格式 (UTF-8 BOM?)
- 分隔符 (逗号/分号)
- 日期格式
- 多行文本处理

**Markdown 导出细节**:
- 模板格式
- 是否包含元数据?
- 表格还是列表?

**Jira 集成**:
- 是否直接支持 Jira CSV 格式?
- 字段映射关系?

---

### MG-007: 缺少文档格式兼容性说明
**影响**: 用户预期管理

**需要明确的格式支持**:

| 格式 | 支持程度 | 限制说明 |
|------|----------|----------|
| **Word (.docx)** | ✅ 完全支持 | 标准 Office 格式 |
| **Word (.doc)** | ⚠️ 有限支持 | 旧格式，可能解析不完整 |
| **PDF** | ✅ 文本型支持 | 扫描件不支持 |
| **PDF** | ❌ 扫描件不支持 | 需要 OCR，后续版本考虑 |
| **TXT** | ✅ 完全支持 | 无格式信息 |
| **Markdown** | ✅ 完全支持 | 标准 Markdown |
| **Excel (.xlsx)** | ❌ 不支持 | 用户可能误传需求列表 |
| **图片 (.jpg/.png)** | ❌ 不支持 | 需要 OCR |

**建议**: 在 UI 上明确提示支持的格式和限制

---

### MG-008: 缺少置信度评分算法
**影响**: 故事质量评估

**需要定义**:
```typescript
interface ConfidenceScore {
  overall: number;      // 0-1 总体置信度
  factors: {
    templateMatch: number;    // 模板匹配度 (0-1)
    roleClarity: number;      // 角色明确度 (0-1)
    actionClarity: number;    // 活动明确度 (0-1)
    valueClarity: number;     // 价值明确度 (0-1)
    sourceLength: number;     // 原文长度适宜度 (0-1)
  };
  reasons: string[];    // 置信度说明 (为什么高/低)
}
```

**评分规则示例**:
- 完全匹配标准模板: +0.3
- 角色明确 (用户/管理员/系统): +0.2
- 动词清晰 (可以/允许/支持): +0.2
- 价值明确 (以便/从而): +0.2
- 原文长度适中 (20-200字): +0.1

---

### MG-009: 缺少优先级处理策略
**影响**: 需求管理

**问题**: PRD 中同时出现了多种优先级标识:
- Phase 1: "高"/"中"/"低" (中文)
- Phase 2: "P0"/"P1"/"P2" (英文)
- MoSCoW: Must/Should/Could/Won't

**建议统一**:
```typescript
type Priority = 'P0' | 'P1' | 'P2' | 'P3';

const PriorityMap = {
  'P0': { label: '高', moscow: 'Must', color: '#ff4d4f' },
  'P1': { label: '中', moscow: 'Should', color: '#faad14' },
  'P2': { label: '低', moscow: 'Could', color: '#52c41a' },
  'P3': { label: '最低', moscow: 'Won\'t', color: '#d9d9d9' }
};
```

---

### MG-010: 缺少文档模板示例
**影响**: 解析算法的准确性

**需要提供**:
1. 标准 PRD 文档模板 (Word/Markdown)
2. 示例 PRD 文件 (3-5个不同复杂度)
3. 期望输出结果示例 (对照表)

**用途**:
- 开发和测试的基准数据
- 用户参考模板
- 算法训练数据 (如果用 ML)

---

### MG-011: 缺少用户反馈机制
**影响**: 产品迭代

**缺失功能**:
- 故事质量反馈 (👍/👎)
- 错误报告机制
- 使用统计收集
- 用户满意度调查

**建议 MVP 阶段**: 至少提供简单的反馈入口

---

### MG-012: 缺少部署和运维文档
**影响**: 上线和运维

**缺失内容**:
- 环境配置要求
- 部署步骤
- 监控指标定义
- 备份策略
- 回滚方案

---

## 🟢 轻微缺失 (Minor Gaps)

### miG-001: 缺少快捷键定义
**建议**: 为常用操作定义快捷键
- Ctrl/Cmd + O: 上传文件
- Ctrl/Cmd + E: 导出
- Ctrl/Cmd + S: 保存 (如果有持久化)
- Delete: 删除选中的故事

### miG-002: 缺少暗色模式规范
**现状**: PRD 未提及主题切换
**建议**: 基于现有代码库的 next-themes 实现暗色模式

### miG-003: 缺少打印样式
**建议**: 为故事列表和地图提供打印友好的 CSS

### miG-004: 缺少空状态设计
**建议**: 为以下场景设计空状态:
- 首次使用 (无文档上传)
- 无搜索结果
- 生成结果为空
- 网络错误

### miG-005: 缺少加载状态规范
**建议**: 统一定义加载状态组件:
- 骨架屏 (Skeleton)
- 加载动画 (Spinner)
- 进度条 (Progress)

### miG-006: 缺少通知/消息规范
**建议**: 使用 sonner 组件统一定义:
- 成功消息
- 错误消息
- 警告消息
- 信息消息

---

## ⚠️ 模糊需求 (Ambiguous Requirements)

### AR-001: "60% 以上故事无需修改即可使用"
- **问题**: 如何定义"无需修改"? 谁来评判?
- **建议**: 
  - 定义明确的评判标准 (置信度 > 0.8)
  - 人工评测流程
  - A/B 测试方案

### AR-002: "30秒内完成10页文档处理"
- **问题**: 网络传输时间是否包含在内? 前端渲染时间呢?
- **建议**: 明确计时的起点和终点

### AR-003: "支持10个并发请求"
- **问题**: 是单用户并发还是全系统并发?
- **建议**: 明确定义并发维度

### AR-004: "200+节点流畅渲染"
- **问题**: 什么样的硬件配置? 流畅的定义是什么 (FPS)?
- **建议**: 定义测试环境和性能指标

### AR-005: "Figma审计准确率85%"
- **问题**: 准确率如何计算? 谁来标注 ground truth?
- **建议**: 建立评测数据集和评测流程

### AR-006: "API生成覆盖90%场景"
- **问题**: 什么是"场景"? 如何定义覆盖?
- **建议**: 定义场景分类和覆盖计算方法

### AR-007: "加密存储Token"
- **问题**: 使用什么加密算法? 密钥如何管理?
- **建议**: 明确 AES-256-GCM + 环境变量管理密钥

### AR-008: "移动端适配"
- **问题**: 适配到什么程度? 支持哪些操作?
- **建议**: 明确"查看为主，简单编辑为辅"

### AR-009: "零学习成本"
- **问题**: 如何衡量? 可用性测试标准?
- **建议**: 定义用户测试流程和通过标准

### AR-010: "3步完成核心流程"
- **问题**: 哪3步? 每个步骤的粒度?
- **建议**: 明确定义: 上传 → 等待解析 → 查看/导出

---

## 📋 建议优先级排序

### 立即解决 (开发前必须)
1. CG-002 数据模型定义
2. CG-003 API 接口规范
3. CG-004 存储策略决策
4. MG-009 优先级统一

### 尽快解决 (开发初期)
5. CG-001 后端架构决策
6. CG-007 AI/算法策略
7. MG-001 UI/UX 设计规范
8. MG-010 文档模板示例

### 迭代解决 (开发过程中)
9. CG-005 错误处理规范
10. MG-002 性能优化策略
11. MG-003 Figma 集成规范
12. MG-005 故事地图规范

### 后续优化
13. miG-001~006 体验优化
14. AR-001~010 需求澄清

---

## 🎯 下一步行动建议

### 行动1: 召开需求评审会议
**参与者**: 产品经理、技术负责人、UI设计师、测试负责人
**目标**: 
- 确认关键缺失的解决方案
- 统一优先级标识
- 确认技术架构决策

### 行动2: 补充数据模型和API文档
**负责人**: 技术负责人
**交付物**:
- 完整的数据模型定义 (TypeScript interfaces)
- API 接口文档 (OpenAPI 3.0 格式)
- 错误码定义表

### 行动3: 创建示例文档集
**负责人**: 产品经理 + 技术负责人
**交付物**:
- 3-5个不同复杂度的示例 PRD
- 每个 PRD 对应的期望输出
- 用于测试和演示

### 行动4: 技术原型验证
**负责人**: 前端开发工程师
**目标**: 验证关键技术方案
- 文档解析库选型验证
- 故事地图技术方案验证
- Figma API 接入验证

---

**报告完成** - 建议根据以上差距分析，优先解决 Critical 和 Major 级别的问题，确保开发顺利进行。
