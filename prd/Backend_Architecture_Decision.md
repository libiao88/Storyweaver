# StoryWeaver AI - 后端架构决策文档

**版本**: v1.0  
**日期**: 2026-02-14  
**状态**: 决策完成  
**决策人**: 技术委员会  

---

## 📑 目录

1. [决策概览](#1-决策概览)
2. [技术选型对比](#2-技术选型对比)
3. [推荐架构方案](#3-推荐架构方案)
4. [MVP架构 (Phase 1)](#4-mvp架构-phase-1)
5. [完整架构 (Phase 2)](#5-完整架构-phase-2)
6. [渐进式演进路线](#6-渐进式演进路线)
7. [部署策略](#7-部署策略)
8. [成本分析](#8-成本分析)
9. [风险评估](#9-风险评估)
10. [实施建议](#10-实施建议)

---

## 1. 决策概览

### 1.1 核心决策

| 决策项 | 选择 | 理由 |
|--------|------|------|
| **Phase 1 方案** | 纯前端 + 轻量级处理 | 快速MVP，无运维负担 |
| **Phase 2 方案** | Node.js + Express | 技术栈统一，团队熟悉 |
| **文档解析** | 前端库 + WASM | 减少后端依赖 |
| **数据库** | IndexedDB (P1) → PostgreSQL (P2) | 渐进式升级 |
| **部署方式** | Vercel/Netlify (P1) → VPS/云 (P2) | 成本优化 |

### 1.2 决策依据

**项目约束**:
- 前端代码库已使用 React + TypeScript + Vite
- 无现成后端团队
- 需要快速验证产品价值
- 预算有限

**技术趋势**:
- 前端处理能力越来越强 (WASM, File API)
- Serverless 降低运维成本
- 边缘计算减少延迟

---

## 2. 技术选型对比

### 2.1 方案对比总览

| 维度 | 方案A<br>纯前端 | 方案B<br>Node.js | 方案C<br>Python | 方案D<br>Serverless |
|------|----------------|------------------|-----------------|---------------------|
| **开发速度** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐ |
| **运维成本** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐ |
| **解析能力** | ⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ |
| **扩展性** | ⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ |
| **团队熟悉度** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐ | ⭐⭐⭐⭐ |
| **成本** | 低 | 中 | 中 | 低-中 |
| **适用阶段** | MVP | 生产 | 生产 | 全阶段 |

### 2.2 详细方案分析

#### 方案 A: 纯前端 (Browser-Only)

**架构**:
```
Browser (React + TypeScript)
├── PDF.js (PDF解析)
├── mammoth.js (Word解析)
├── Marked (Markdown解析)
├── NLP.js (简单NLP)
└── IndexedDB (数据存储)
```

**优点**:
- ✅ 无需后端服务器，零运维成本
- ✅ 用户数据隐私性好（不上传服务器）
- ✅ 部署简单（静态托管）
- ✅ 延迟低（本地处理）

**缺点**:
- ❌ 大文件处理受限（浏览器内存限制）
- ❌ PDF扫描件无法处理（无OCR）
- ❌ 复杂的NLP处理受限
- ❌ 多设备同步困难

**适用场景**:
- MVP验证阶段
- 处理小文档（<5MB）
- 注重隐私的场景

**技术栈**:
```javascript
// 文档解析库
- PDF: pdfjs-dist (Mozilla PDF.js)
- Word: mammoth.js
- Markdown: marked
- TXT: 原生 FileReader

// NLP处理
- compromise.js (轻量级NLP)
- natural.js (Node.js的浏览器版本)
```

**可行性评估**:
- PDF解析: ✅ pdfjs-dist 成熟可用
- Word解析: ✅ mammoth.js 支持良好
- 故事生成: ⚠️ 简单规则可行，复杂NLP受限
- 性能: ⚠️ <10MB文件可接受

---

#### 方案 B: Node.js + Express

**架构**:
```
Frontend (React + Vite)
    │
    ▼
API Gateway (Express.js)
    │
    ├── Document Controller
    │   ├── Multer (文件上传)
    │   ├── Parser Service
    │   │   ├── pdf-parse
    │   │   ├── mammoth
    │   │   └── cheerio
    │   └── Story Generator
    │
    ├── Story Controller
    ├── StoryMap Controller (P2)
    ├── Figma Controller (P2)
    └── Export Controller
    │
    ▼
PostgreSQL (主数据库)
Redis (缓存)
S3/OSS (文件存储)
```

**优点**:
- ✅ 技术栈统一（JavaScript/TypeScript全栈）
- ✅ 丰富的npm生态
- ✅ 高并发处理能力
- ✅ 团队学习成本低

**缺点**:
- ❌ Python NLP库更丰富（可用调用Python服务解决）
- ❌ 文档解析库不如Python成熟

**适用场景**:
- 生产环境
- 需要复杂业务逻辑
- 团队协作开发

**技术栈**:
```javascript
// 核心框架
- Express.js / Fastify / Nest.js
- TypeScript

// 文档解析
- pdf-parse (PDF)
- mammoth (Word)
- cheerio (HTML处理)

// 数据库
- PostgreSQL (主数据库)
- Redis (缓存/队列)
- Prisma / TypeORM (ORM)

// 其他
- Multer (文件上传)
- Bull (任务队列)
- Winston (日志)
```

---

#### 方案 C: Python + FastAPI

**架构**:
```
Frontend (React)
    │
    ▼
API Gateway (FastAPI)
    │
    ├── Upload Controller
    ├── Parser Service
    │   ├── PyPDF2 / pdfplumber
    │   ├── python-docx
    │   └── NLTK / spaCy (NLP)
    ├── Generator Service
    │   ├── Rule Engine
    │   └── LLM Integration (OpenAI)
    └── Export Controller
```

**优点**:
- ✅ 文档解析库最成熟 (PyPDF2, python-docx)
- ✅ NLP生态最丰富 (NLTK, spaCy, transformers)
- ✅ 科学计算能力强
- ✅ FastAPI性能优秀

**缺点**:
- ❌ 团队技术栈不一致
- ❌ 需要维护两套代码库
- ❌ 部署相对复杂

**适用场景**:
- 复杂的文档解析需求
- 需要深度学习NLP
- 有Python后端团队

**技术栈**:
```python
# 框架
- FastAPI
- SQLAlchemy (ORM)
- Celery (异步任务)

# 文档解析
- PyPDF2 / pdfplumber
- python-docx
- beautifulsoup4

# NLP
- spaCy / NLTK
- transformers (Hugging Face)
- langchain

# 数据库
- PostgreSQL
- Redis
```

---

#### 方案 D: Serverless / Edge Computing

**架构**:
```
Frontend (React)
    │
    ▼
Vercel Edge Functions / Cloudflare Workers
    │
    ├── 轻量级API
    ├── 文档解析 (WASM)
    └── 数据存储 (D1/PlanetScale)
```

**优点**:
- ✅ 按需付费，成本低
- ✅ 自动扩展
- ✅ 全球CDN加速
- ✅ 运维简单

**缺点**:
- ❌ 冷启动延迟
- ❌ 计算时长限制（通常<30秒）
- ❌ 大文件处理受限

**适用场景**:
- 流量波动大
- 全球化部署
- 预算敏感

---

## 3. 推荐架构方案

### 3.1 渐进式架构策略

```
Phase 1 (MVP - 0-3个月)
└── 纯前端方案 (浏览器处理)
    ├── 文档解析: 前端库
    ├── 故事生成: 规则引擎
    ├── 数据存储: IndexedDB
    └── 部署: Vercel/Netlify

Phase 2 (Growth - 3-6个月)
└── 混合方案 (前端 + 轻量后端)
    ├── 文档解析: 后端服务 (Node.js)
    ├── 故事生成: 后端规则 + 可选LLM
    ├── 数据存储: PostgreSQL
    └── 部署: VPS/轻量云服务器

Phase 3 (Scale - 6个月+)
└── 完整后端 (微服务架构)
    ├── 文档解析服务
    ├── NLP服务 (Python)
    ├── 业务API服务
    └── 部署: Kubernetes/云服务
```

### 3.2 决策矩阵

| 阶段 | 文档大小 | 并发量 | 推荐方案 | 理由 |
|------|----------|--------|----------|------|
| MVP | <10MB | <10 | 纯前端 | 快速验证，零成本 |
| 内测 | <50MB | <50 | Node.js轻量 | 处理能力提升 |
| 公测 | <100MB | <200 | Node.js完整 | 稳定可靠 |
| 生产 | >100MB | >500 | Python+Node | 专业解析 |

---

## 4. MVP架构 (Phase 1)

### 4.1 架构图

```
┌─────────────────────────────────────────────────────────────┐
│                     User Browser                            │
│  ┌──────────────────────────────────────────────────────┐  │
│  │                  React + TypeScript                   │  │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────────────┐   │  │
│  │  │  UI层    │  │  State   │  │  DocumentParser  │   │  │
│  │  │(Components│  │Management│  │  (前端解析库)     │   │  │
│  │  └──────────┘  └──────────┘  └──────────────────┘   │  │
│  │                                                      │  │
│  │  ┌──────────────────────────────────────────────┐   │  │
│  │  │          Story Generator Engine               │   │  │
│  │  │  ┌──────────┐ ┌──────────┐ ┌──────────────┐  │   │  │
│  │  │  │  Rule    │ │ Keyword  │ │ Template     │  │   │  │
│  │  │  │ Engine   │ │ Extractor│ │ Matcher      │  │   │  │
│  │  │  └──────────┘ └──────────┘ └──────────────┘  │   │  │
│  │  └──────────────────────────────────────────────┘   │  │
│  └──────────────────────────────────────────────────────┘  │
│                            │                                │
│                            ▼                                │
│  ┌──────────────────────────────────────────────────────┐  │
│  │                 IndexedDB (浏览器数据库)              │  │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐             │  │
│  │  │Documents │ │ Stories  │ │StoryMaps │             │  │
│  │  └──────────┘ └──────────┘ └──────────┘             │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│              Static Hosting (Vercel/Netlify)                │
│                     CDN + HTTPS                             │
└─────────────────────────────────────────────────────────────┘
```

### 4.2 核心模块设计

#### 4.2.1 文档解析服务 (前端)

```typescript
// services/DocumentParser.ts
class DocumentParser {
  async parse(file: File): Promise<ParsedDocument> {
    const type = this.detectFileType(file);
    
    switch (type) {
      case 'pdf':
        return this.parsePDF(file);
      case 'docx':
        return this.parseDOCX(file);
      case 'md':
      case 'txt':
        return this.parseText(file);
      default:
        throw new Error('Unsupported file type');
    }
  }
  
  private async parsePDF(file: File): Promise<ParsedDocument> {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    
    let fullText = '';
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      const pageText = textContent.items.map(item => item.str).join(' ');
      fullText += pageText + '\n';
    }
    
    return {
      id: generateUUID(),
      fileName: file.name,
      fileType: 'pdf',
      content: fullText,
      totalChars: fullText.length,
      sections: this.extractSections(fullText)
    };
  }
  
  private async parseDOCX(file: File): Promise<ParsedDocument> {
    const arrayBuffer = await file.arrayBuffer();
    const result = await mammoth.extractRawText({ arrayBuffer });
    
    return {
      id: generateUUID(),
      fileName: file.name,
      fileType: 'docx',
      content: result.value,
      totalChars: result.value.length,
      sections: this.extractSections(result.value)
    };
  }
  
  private extractSections(text: string): DocumentSection[] {
    // 基于标题模式提取章节
    const sectionRegex = /^(\d+\.\s+|#{1,6}\s+)(.+)$/gm;
    const sections: DocumentSection[] = [];
    let match;
    
    while ((match = sectionRegex.exec(text)) !== null) {
      sections.push({
        id: generateUUID(),
        title: match[2].trim(),
        level: match[1].includes('#') ? match[1].length : 1,
        content: '', // 需要进一步提取章节内容
        type: this.classifySection(match[2])
      });
    }
    
    return sections;
  }
}
```

#### 4.2.2 故事生成引擎 (前端)

```typescript
// services/StoryGenerator.ts
class StoryGenerator {
  private rules: GenerationRule[];
  
  constructor() {
    this.rules = this.loadRules();
  }
  
  async generate(sections: DocumentSection[]): Promise<Story[]> {
    const stories: Story[] = [];
    
    for (const section of sections) {
      if (section.type === 'functional') {
        const extractedStories = await this.extractFromSection(section);
        stories.push(...extractedStories);
      }
    }
    
    return this.postProcess(stories);
  }
  
  private async extractFromSection(section: DocumentSection): Promise<Story[]> {
    const stories: Story[] = [];
    const sentences = this.splitSentences(section.content);
    
    for (const sentence of sentences) {
      const role = this.extractRole(sentence);
      const action = this.extractAction(sentence);
      const value = this.extractValue(sentence);
      
      if (role && action) {
        const confidence = this.calculateConfidence(
          sentence, role, action, value
        );
        
        stories.push({
          id: generateUUID(),
          title: this.generateTitle(action),
          description: `As a ${role}, I want to ${action}, So that ${value || '...'}`,
          role,
          action,
          value: value || '（待补充）',
          module: section.title,
          priority: this.inferPriority(sentence),
          confidence,
          sourceReference: {
            text: sentence,
            sectionId: section.id,
            sectionTitle: section.title
          }
        });
      }
    }
    
    return stories;
  }
  
  private extractRole(text: string): string | null {
    // 角色提取规则
    const rolePatterns = [
      /(?:作为|as)\s*(?:一个|an?)?\s*([^，,]+?)(?:，|,|我|可以|能够)/i,
      /([^，,]+?)(?:可以|能够|需要|想要)/,
      /用户|管理员|访客|会员/
    ];
    
    for (const pattern of rolePatterns) {
      const match = text.match(pattern);
      if (match) return match[1]?.trim() || match[0];
    }
    
    return '用户'; // 默认角色
  }
  
  private extractAction(text: string): string | null {
    // 动作提取规则
    const actionPatterns = [
      /(?:可以|能够|需要|想要|希望|支持|允许)\s*(.+?)(?:以便|从而|为了|So that)/i,
      /(?:可以|能够|需要|想要|希望)\s*(.+?)(?:，|,|$)/i
    ];
    
    for (const pattern of actionPatterns) {
      const match = text.match(pattern);
      if (match) return match[1]?.trim();
    }
    
    return null;
  }
  
  private calculateConfidence(
    text: string,
    role: string,
    action: string,
    value: string | null
  ): ConfidenceScore {
    let score = 0.5;
    const reasons: string[] = [];
    
    // 模板匹配度
    if (text.match(/As a.*I want.*So that/i)) {
      score += 0.2;
      reasons.push('符合标准模板');
    }
    
    // 角色明确度
    if (role && role !== '用户') {
      score += 0.1;
      reasons.push('角色明确');
    }
    
    // 价值明确度
    if (value) {
      score += 0.1;
      reasons.push('商业价值明确');
    }
    
    // 长度适宜
    if (text.length >= 20 && text.length <= 200) {
      score += 0.1;
      reasons.push('描述长度适中');
    }
    
    return {
      overall: Math.min(score, 1.0),
      level: score >= 0.8 ? 'high' : score >= 0.5 ? 'medium' : 'low',
      factors: {
        templateMatch: text.match(/As a.*I want.*So that/i) ? 0.9 : 0.5,
        roleClarity: role ? 0.8 : 0.3,
        actionClarity: action ? 0.8 : 0.3,
        valueClarity: value ? 0.8 : 0.3,
        sourceLength: text.length >= 20 && text.length <= 200 ? 0.9 : 0.5,
        languageClarity: 0.7
      },
      reasons,
      needsReview: score < 0.7
    };
  }
}
```

### 4.3 技术依赖

```json
// package.json (关键依赖)
{
  "dependencies": {
    "pdfjs-dist": "^3.11.174",
    "mammoth": "^1.6.0",
    "marked": "^9.1.6",
    "compromise": "^14.10.1",
    "idb": "^7.1.1",
    "uuid": "^9.0.1"
  }
}
```

### 4.4 性能预期

| 指标 | 预期值 | 限制因素 |
|------|--------|----------|
| 文档大小 | <10MB | 浏览器内存 |
| 解析时间 | <10秒 | JavaScript性能 |
| 故事数量 | <100/文档 | 生成算法效率 |
| 响应时间 | <100ms | IndexedDB速度 |

---

## 5. 完整架构 (Phase 2)

### 5.1 架构图

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              Client Layer                                    │
│  ┌──────────────────────────────────────────────────────────────────────┐  │
│  │                        React SPA                                      │  │
│  │  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐ │  │
│  │  │   Upload     │ │   Story      │ │  StoryMap    │ │  FigmaAudit  │ │  │
│  │  │   Module     │ │   Module     │ │   Module     │ │   Module     │ │  │
│  │  └──────────────┘ └──────────────┘ └──────────────┘ └──────────────┘ │  │
│  └──────────────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    │ HTTPS / REST / WebSocket
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                            API Gateway                                       │
│  ┌──────────────────────────────────────────────────────────────────────┐  │
│  │                      Express.js + TypeScript                          │  │
│  │  ┌──────────────────────────────────────────────────────────────┐   │  │
│  │  │  Middleware: Auth, Rate Limit, Validation, Logging            │   │  │
│  │  └──────────────────────────────────────────────────────────────┘   │  │
│  └──────────────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
            ┌───────────────────────┼───────────────────────┐
            │                       │                       │
            ▼                       ▼                       ▼
┌──────────────────┐   ┌──────────────────┐   ┌──────────────────┐
│ Document Service │   │  Story Service   │   │ Figma Service    │
│                  │   │                  │   │                  │
│ - Upload         │   │ - CRUD           │   │ - API Client     │
│ - Parse          │   │ - Search         │   │ - Audit Engine   │
│ - Store          │   │ - Export         │   │ - Report Gen     │
└────────┬─────────┘   └────────┬─────────┘   └────────┬─────────┘
         │                      │                      │
         ▼                      ▼                      ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                         Shared Services                                      │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐ ┌──────────────────┐  │
│  │    Parser    │ │  Generator   │ │     LLM      │ │   Export Engine  │  │
│  │   Service    │ │   Service    │ │   Service    │ │                  │  │
│  │  (Node.js)   │ │  (Node.js)   │ │ (OpenAI API) │ │  (PDF/Excel/MD)  │  │
│  └──────────────┘ └──────────────┘ └──────────────┘ └──────────────────┘  │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
            ┌───────────────────────┼───────────────────────┐
            │                       │                       │
            ▼                       ▼                       ▼
┌──────────────────┐   ┌──────────────────┐   ┌──────────────────┐
│   PostgreSQL     │   │     Redis        │   │      S3/OSS      │
│   (Main DB)      │   │   (Cache/Queue)  │   │  (File Storage)  │
│                  │   │                  │   │                  │
│ - Documents      │   │ - Session        │   │ - Raw Files      │
│ - Stories        │   │ - Cache          │   │ - Exports        │
│ - Users          │   │ - Rate Limit     │   │ - Backups        │
│ - Audit Logs     │   │ - Job Queue      │   │                  │
└──────────────────┘   └──────────────────┘   └──────────────────┘
```

### 5.2 服务端技术栈

```javascript
// 核心框架
express: ^4.18.2
@types/express: ^4.17.21
ts-node: ^10.9.1
nodemon: ^3.0.1

// 数据库
prisma: ^5.6.0
@prisma/client: ^5.6.0
pg: ^8.11.3
redis: ^4.6.10

// 文档解析
pdf-parse: ^1.1.1
mammoth: ^1.6.0
cheerio: ^1.0.0-rc.12

// 中间件
multer: ^1.4.5-lts.1
helmet: ^7.1.0
cors: ^2.8.5
compression: ^1.7.4
express-rate-limit: ^7.1.5

// 工具
winston: ^3.11.0
joi: ^17.11.0
jsonwebtoken: ^9.0.2
bcryptjs: ^2.4.3
uuid: ^9.0.1

// 开发测试
jest: ^29.7.0
supertest: ^6.3.3
@types/jest: ^29.5.8
```

### 5.3 数据库 Schema (Prisma)

```prisma
// schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model Document {
  id            String   @id @default(uuid())
  fileName      String
  fileType      String
  fileSize      Int
  fileUrl       String?
  status        String   @default("uploaded")
  progress      Int      @default(0)
  rawContent    String?  @db.Text
  totalChars    Int?
  storyCount    Int      @default(0)
  averageConfidence Float?
  errorMessage  String?
  sessionId     String
  userId        String?
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
  expiresAt     DateTime?
  
  sections      Section[]
  stories       Story[]
  storyMaps     StoryMap[]
  audits        FigmaAudit[]
  apiSpecs      ApiSpec[]
  
  @@index([sessionId])
  @@index([userId])
  @@index([status])
  @@index([expiresAt])
}

model Section {
  id            String   @id @default(uuid())
  documentId    String
  title         String
  content       String   @db.Text
  type          String
  level         Int
  order         Int
  startPosition Int
  endPosition   Int
  charCount     Int
  parentId      String?
  
  document      Document @relation(fields: [documentId], references: [id], onDelete: Cascade)
  
  @@index([documentId])
}

model Story {
  id                    String   @id @default(uuid())
  documentId            String
  title                 String
  description           String   @db.Text
  role                  String
  action                String
  value                 String
  module                String
  priority              String   @default("P1")
  overallConfidence     Float
  confidenceLevel       String
  acceptanceCriteria    String[] @default([])
  storyPoints           Int?
  tags                  String[] @default([])
  status                String   @default("draft")
  isEdited              Boolean  @default(false)
  sourceText            String?
  sourceSectionId       String?
  sourceSectionTitle    String?
  createdAt             DateTime @default(now())
  updatedAt             DateTime @updatedAt
  
  document              Document @relation(fields: [documentId], references: [id], onDelete: Cascade)
  editHistory           EditHistory[]
  
  @@index([documentId])
  @@index([priority])
  @@index([module])
  @@index([status])
}

model EditHistory {
  id          String   @id @default(uuid())
  storyId     String
  field       String
  oldValue    String
  newValue    String
  editor      String
  reason      String?
  timestamp   DateTime @default(now())
  
  story       Story    @relation(fields: [storyId], references: [id], onDelete: Cascade)
  
  @@index([storyId])
}

// ... 其他模型
```

---

## 6. 渐进式演进路线

### 6.1 演进时间线

```
Month 1-2: Phase 1 MVP
├── Week 1-2: 纯前端架构搭建
│   ├── 前端文档解析实现
│   ├── IndexedDB集成
│   └── 基础UI组件
│
├── Week 3-4: 故事生成功能
│   ├── 规则引擎开发
│   ├── 置信度算法
│   └── 导出功能
│
└── Week 5-6: 优化与测试
    ├── 性能优化
    ├── 大文件处理
    └── 错误处理

Month 3-4: Phase 2 后端引入
├── Week 7-8: 后端基础架构
│   ├── Express项目搭建
│   ├── 数据库设计
│   └── 基础API实现
│
├── Week 9-10: 文档解析迁移
│   ├── 后端解析服务
│   ├── 文件上传接口
│   └── 前端对接
│
└── Week 11-12: Phase 2功能
    ├── 故事地图
    ├── Figma审计
    └── API生成

Month 5-6: 生产准备
├── Week 13-14: 性能优化
│   ├── 缓存优化
│   ├── 数据库索引
│   └── 并发处理
│
├── Week 15-16: 安全加固
│   ├── 认证授权
│   ├── 数据加密
│   └── 审计日志
│
└── Week 17-18: 部署上线
    ├── CI/CD搭建
    ├── 监控告警
    └── 文档完善
```

---

## 7. 部署策略

### 7.1 Phase 1 部署 (MVP)

**平台**: Vercel / Netlify / GitHub Pages

**配置**:
```javascript
// vercel.json
{
  "version": 2,
  "builds": [
    {
      "src": "package.json",
      "use": "@vercel/static-build",
      "config": {
        "distDir": "dist"
      }
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "/index.html"
    }
  ],
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=31536000, immutable"
        }
      ]
    }
  ]
}
```

**成本**: 免费 (Vercel免费版)

---

### 7.2 Phase 2 部署

**方案A: 轻量云服务器 (推荐)**

- **平台**: DigitalOcean / Linode / 阿里云轻量
- **配置**: 2核4G, 80GB SSD
- **成本**: ~$20/月 (~¥140/月)
- **部署**: Docker + Docker Compose

```yaml
# docker-compose.yml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - DATABASE_URL=postgresql://user:pass@db:5432/storyweaver
      - REDIS_URL=redis://redis:6379
    depends_on:
      - db
      - redis
    restart: unless-stopped
  
  db:
    image: postgres:15-alpine
    volumes:
      - postgres_data:/var/lib/postgresql/data
    environment:
      - POSTGRES_USER=user
      - POSTGRES_PASSWORD=pass
      - POSTGRES_DB=storyweaver
    restart: unless-stopped
  
  redis:
    image: redis:7-alpine
    volumes:
      - redis_data:/data
    restart: unless-stopped
  
  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./ssl:/etc/nginx/ssl
    depends_on:
      - app
    restart: unless-stopped

volumes:
  postgres_data:
  redis_data:
```

**方案B: Serverless**

- **平台**: Vercel Functions / AWS Lambda
- **成本**: 按调用付费
- **适用**: 流量波动大

---

## 8. 成本分析

### 8.1 Phase 1 成本

| 项目 | 服务 | 成本 | 说明 |
|------|------|------|------|
| 前端托管 | Vercel Pro | ¥0 | 免费版足够 |
| 域名 | 阿里云 | ¥60/年 | .com域名 |
| CDN | Vercel内置 | ¥0 | 免费 |
| **总计** | | **¥60/年** | |

### 8.2 Phase 2 成本

| 项目 | 服务 | 成本 | 说明 |
|------|------|------|------|
| 服务器 | DigitalOcean | ¥140/月 | 2核4G |
| 数据库 | 自建PostgreSQL | ¥0 | 包含在服务器 |
| 缓存 | 自建Redis | ¥0 | 包含在服务器 |
| 对象存储 | AWS S3/阿里云OSS | ¥50/月 | 100GB |
| 监控 | UptimeRobot | ¥0 | 免费版 |
| **总计** | | **~¥200/月** | |

### 8.3 扩展成本

| 用户量 | 月成本 | 配置 |
|--------|--------|------|
| <1000 | ¥200 | 单服务器 |
| 1K-10K | ¥800 | 2台 + RDS |
| 10K-100K | ¥3000 | K8s集群 |

---

## 9. 风险评估

### 9.1 技术风险

| 风险 | 概率 | 影响 | 缓解措施 |
|------|------|------|----------|
| 前端解析大文件性能差 | 中 | 高 | 限制文件大小，提供优化提示 |
| 浏览器兼容性 | 低 | 中 | 测试主流浏览器，提供降级方案 |
| IndexedDB容量不足 | 低 | 中 | 监控使用量，提示导出数据 |
| Serverless冷启动 | 中 | 低 | 使用预热，优化代码启动时间 |

### 9.2 业务风险

| 风险 | 概率 | 影响 | 缓解措施 |
|------|------|------|----------|
| 故事生成准确率不达标 | 中 | 高 | 规则+LLM混合，人工编辑功能 |
| 用户数据丢失 | 低 | 高 | 定期备份，导出提醒 |
| 服务器宕机 | 低 | 中 | 监控告警，快速恢复 |

---

## 10. 实施建议

### 10.1 立即执行 (Week 1)

- [ ] 选择前端文档解析库 (pdfjs-dist, mammoth)
- [ ] 搭建 IndexedDB 基础架构
- [ ] 实现文件上传组件
- [ ] 配置 Vercel 部署

### 10.2 短期目标 (Month 1)

- [ ] 完成 Phase 1 MVP
- [ ] 收集用户反馈
- [ ] 验证技术方案可行性
- [ ] 确定 Phase 2 优先级

### 10.3 中期目标 (Month 3)

- [ ] 引入 Node.js 后端
- [ ] 迁移文档解析逻辑
- [ ] 实现 Phase 2 核心功能
- [ ] 性能优化

### 10.4 长期目标 (Month 6)

- [ ] 生产环境部署
- [ ] 监控告警完善
- [ ] 自动化运维
- [ ] 团队培训

---

## 附录: 决策检查清单

- [x] 技术选型对比完成
- [x] 架构方案确定
- [x] 成本分析完成
- [x] 风险评估完成
- [x] 演进路线制定
- [x] 部署策略确定
- [ ] 团队评审通过
- [ ] 开发计划制定

---

**文档结束**

*本架构决策为 StoryWeaver AI 提供清晰的技术演进路线，确保项目在不同阶段采用最适合的技术方案。*
