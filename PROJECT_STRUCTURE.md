# StoryWeaver AI - 项目文件目录结构

## 📁 根目录结构

```
storyweaver/
├── 📄 项目配置文件
├── 📁 src/                    # 源代码目录
├── 📁 prd/                    # 产品需求文档
├── 📁 supabase/               # Supabase数据库配置
├── 📁 .huggingface/           # Hugging Face配置
├── 📁 guidelines/             # 项目规范
├── 📁 dist/                   # 构建输出（自动生成，不提交）
└── 📁 node_modules/           # 依赖目录（自动生成，不提交）
```

---

## 📄 项目配置文件（根目录）

### 核心配置
| 文件 | 说明 | 重要性 |
|------|------|--------|
| `package.json` | 项目依赖和脚本配置 | ⭐⭐⭐⭐⭐ |
| `tsconfig.json` | TypeScript配置 | ⭐⭐⭐⭐ |
| `vite.config.ts` | Vite构建工具配置 | ⭐⭐⭐⭐ |
| `postcss.config.mjs` | PostCSS配置 | ⭐⭐⭐ |
| `index.html` | 应用入口HTML文件 | ⭐⭐⭐⭐⭐ |

### 环境变量
| 文件 | 说明 | 重要性 |
|------|------|--------|
| `.env` | 环境变量（包含敏感信息，不提交） | ⭐⭐⭐⭐⭐ |
| `.env.example` | 环境变量模板 | ⭐⭐⭐ |
| `.gitignore` | Git忽略规则 | ⭐⭐⭐⭐ |

### 项目元数据
| 文件 | 说明 | 重要性 |
|------|------|--------|
| `README.md` | 项目说明文档 | ⭐⭐⭐⭐ |
| `ATTRIBUTIONS.md` | 第三方资源声明 | ⭐⭐ |
| `.DS_Store` | macOS系统文件（可删除） | ⭐ |

---

## 📁 src/ - 源代码目录

```
src/
├── 📄 main.tsx                      # 应用入口
├── 📁 app/                          # 主应用目录
│   ├── 📄 App.tsx                   # 根组件
│   └── 📁 components/               # 组件目录
│       ├── 📁 ui/                   # UI组件库
│       ├── 📁 figma/                # Figma相关组件
│       ├── 📄 APIGenerator.tsx      # API生成器
│       ├── 📄 FigmaAudit.tsx        # Figma审计
│       ├── 📄 FileUpload.tsx        # 文件上传
│       ├── 📄 LLMConfigPanel.tsx    # LLM配置面板
│       ├── 📄 StoryCard.tsx         # 故事卡片
│       ├── 📄 StoryList.tsx         # 故事列表
│       └── 📄 StoryMap.tsx          # 故事地图
├── 📁 services/                     # 服务层
│   ├── 📄 DocumentParser.ts         # 文档解析
│   ├── 📄 ExportService.ts          # 导出服务
│   ├── 📄 LLMOptimizer.ts           # LLM优化器
│   ├── 📄 LLMService.ts             # LLM服务
│   ├── 📄 SessionManager.ts         # 会话管理
│   ├── 📄 StoryGenerator.ts         # 故事生成器
│   └── 📄 supabase.ts               # Supabase客户端
├── 📁 styles/                       # 样式文件
│   ├── 📄 fonts.css                 # 字体样式
│   ├── 📄 index.css                 # 全局样式
│   ├── 📄 tailwind.css              # Tailwind样式
│   └── 📄 theme.css                 # 主题样式
├── 📁 types/                        # 类型定义
│   └── 📄 storyweaver.ts            # 核心类型
└── 📄 vite-env.d.ts                 # Vite环境类型
```

### UI组件库（src/app/components/ui/）
```
ui/
├── 基础组件
│   ├── button.tsx, card.tsx, input.tsx, label.tsx
│   ├── badge.tsx, avatar.tsx, separator.tsx
│   └── skeleton.tsx, spinner.tsx
├── 表单组件
│   ├── checkbox.tsx, radio-group.tsx, select.tsx
│   ├── switch.tsx, slider.tsx, textarea.tsx
│   ├── form.tsx, input-otp.tsx
│   └── calendar.tsx, date-picker.tsx
├── 弹窗组件
│   ├── dialog.tsx, alert-dialog.tsx, drawer.tsx
│   ├── sheet.tsx, popover.tsx, tooltip.tsx
│   └── hover-card.tsx
├── 导航组件
│   ├── tabs.tsx, breadcrumb.tsx, navigation-menu.tsx
│   ├── pagination.tsx, menubar.tsx
│   └── dropdown-menu.tsx, context-menu.tsx
├── 反馈组件
│   ├── alert.tsx, progress.tsx, sonner.tsx
│   └── toast.tsx
├── 布局组件
│   ├── accordion.tsx, collapsible.tsx
│   ├── resizable.tsx, scroll-area.tsx
│   ├── sidebar.tsx, table.tsx
│   └── aspect-ratio.tsx, carousel.tsx
├── 其他组件
│   ├── chart.tsx, command.tsx
│   ├── toggle.tsx, toggle-group.tsx
│   └── ...
└── 工具
    ├── utils.ts
    └── use-mobile.ts
```

---

## 📁 prd/ - 产品需求文档

```
prd/
├── 📄 PRD_StoryWeaver.md              # 主PRD文档
├── 📄 PRD_StoryWeaver_Phase2.md       # 第二阶段PRD
├── 📄 PRD_StoryWeaver_Unified.md      # 统一PRD
├── 📄 Gap_Analysis_Report.md          # 差距分析报告
├── 📄 Data_Model_Specification.md     # 数据模型规范
├── 📄 API_Specification.md            # API接口规范
├── 📄 Storage_Strategy.md             # 存储策略
├── 📄 Backend_Architecture_Decision.md # 架构决策
├── 📄 Error_Handling_Specification.md # 错误处理规范
├── 📄 AI_Algorithm_Strategy.md        # AI算法策略
├── 📄 Authentication_Authorization_Design.md # 认证授权设计
└── 📄 Testing_Strategy.md             # 测试策略
```

---

## 📁 supabase/ - Supabase配置

```
supabase/
├── 📄 init.sql                        # 数据库初始化脚本
└── 📁 supabase/                       # Supabase CLI配置
    ├── 📄 config.toml                 # 配置文件
    └── 📄 .gitignore                  # 忽略规则
```

---

## 📁 .huggingface/ - Hugging Face配置

```
.huggingface/
└── 📄 metadata.json                   # Space元数据配置
```

---

## 📁 guidelines/ - 项目规范

```
guidelines/
└── 📄 Guidelines.md                   # 项目开发规范
```

---

## 📄 部署相关文件

### 主部署脚本
| 文件 | 说明 |
|------|------|
| `deploy.sh` | 主要部署脚本 |
| `validate-deployment.sh` | 部署验证脚本 |
| `fix-hf-sdk.sh` | Hugging Face SDK修复脚本 |

### 部署文档
| 文件 | 说明 |
|------|------|
| `DEPLOYMENT.md` | 部署说明文档 |
| `DEPLOYMENT_EXECUTION_PLAN.md` | 部署执行计划 |
| `DEPLOYMENT_STATUS.md` | 部署状态分析 |
| `HUGGINGFACE_DEPLOYMENT.md` | Hugging Face部署指南 |
| `FIND_CONFIG_GUIDE.md` | 配置查找指南 |
| `BACKUP_MANUAL_FIX.md` | 备用手动修复指南 |
| `QUICK_FIX.md` | 快速修复说明 |
| `QUICK_FIX_FINAL.md` | 快速修复最终版 |
| `hf-readme-config.md` | Hugging Face README配置模板 |

---

## 📄 测试文件

| 文件 | 说明 |
|------|------|
| `TEST_PLAN.md` | 测试计划 |
| `TEST_REPORT.md` | 测试报告 |
| `test-document.md` | 测试文档 |
| `test-llm-services.js` | LLM服务测试（Node.js） |
| `test-llm-services.mjs` | LLM服务测试（ES Module） |
| `test-project.sh` | 项目测试脚本 |
| `test-volcano-api-key.mjs` | 火山API密钥测试 |

---

## 📄 架构文档

| 文件 | 说明 |
|------|------|
| `LLM_INTEGRATION_ARCHITECTURE.md` | LLM集成架构文档 |
| `AGENTS.md` | AI代理配置说明 |

---

## 🗂️ 建议的文件组织优化

### 当前问题
1. **部署相关文件过多**，散落在根目录
2. **测试文件不集中**，难以管理
3. **文档文件过多**，需要分类

### 建议的优化结构

```
storyweaver/
├── 📄 项目根文件（保留）
│   ├── package.json, tsconfig.json, vite.config.ts
│   ├── .env, .env.example, .gitignore
│   ├── index.html, README.md
│   └── ATTRIBUTIONS.md
│
├── 📁 src/                          # 源代码（保持不变）
│
├── 📁 docs/                         # 【建议新建】文档目录
│   ├── 📁 prd/                      # 产品需求文档
│   ├── 📁 deployment/               # 【建议新建】部署文档
│   │   ├── DEPLOYMENT.md
│   │   ├── DEPLOYMENT_EXECUTION_PLAN.md
│   │   ├── DEPLOYMENT_STATUS.md
│   │   ├── HUGGINGFACE_DEPLOYMENT.md
│   │   ├── FIND_CONFIG_GUIDE.md
│   │   ├── BACKUP_MANUAL_FIX.md
│   │   ├── QUICK_FIX.md
│   │   └── QUICK_FIX_FINAL.md
│   ├── 📁 architecture/             # 【建议新建】架构文档
│   │   ├── LLM_INTEGRATION_ARCHITECTURE.md
│   │   └── AGENTS.md
│   └── 📁 testing/                  # 【建议新建】测试文档
│       ├── TEST_PLAN.md
│       └── TEST_REPORT.md
│
├── 📁 scripts/                      # 【建议新建】脚本目录
│   ├── 📄 deploy.sh
│   ├── 📄 validate-deployment.sh
│   ├── 📄 fix-hf-sdk.sh
│   └── 📄 test-project.sh
│
├── 📁 tests/                        # 【建议新建】测试文件目录
│   ├── 📄 test-document.md
│   ├── 📄 test-llm-services.js
│   ├── 📄 test-llm-services.mjs
│   └── 📄 test-volcano-api-key.mjs
│
├── 📁 config/                       # 【建议新建】配置目录
│   ├── 📁 .huggingface/
│   │   └── metadata.json
│   ├── 📁 supabase/
│   │   ├── init.sql
│   │   └── supabase/
│   ├── 📁 guidelines/
│   │   └── Guidelines.md
│   └── 📄 hf-readme-config.md
│
└── 📁 .github/                      # 【可选】GitHub配置
    └── 📁 workflows/                # CI/CD工作流
```

---

## 📊 文件分类统计

### 按类型分类
- **配置文件**: 9个
- **源代码文件**: 约60个
- **文档文件**: 约25个
- **脚本文件**: 4个
- **测试文件**: 4个
- **其他**: 若干

### 按重要性分类
- **核心必需**: package.json, src/, index.html
- **部署必需**: 部署脚本, supabase/, .huggingface/
- **文档重要**: PRD文档, 架构文档
- **可选**: 测试文件, 备用文档

---

## ✅ 清理建议

### 可以删除的文件
1. `.DS_Store` - macOS系统文件
2. `package-lock.json` - 已在.gitignore中

### 可以合并的文档
- `QUICK_FIX.md` 和 `QUICK_FIX_FINAL.md` 可以合并
- `FIND_CONFIG_GUIDE.md` 和 `BACKUP_MANUAL_FIX.md` 有重叠内容

### 建议归档的文件
- 旧的测试文件
- 不再使用的备用方案文档

---

## 🔍 快速查找指南

### 查找配置
- **环境变量**: `.env`, `.env.example`
- **构建配置**: `vite.config.ts`, `tsconfig.json`
- **部署配置**: `deploy.sh`, `.huggingface/metadata.json`

### 查找文档
- **项目说明**: `README.md`
- **部署指南**: `DEPLOYMENT.md`, `DEPLOYMENT_EXECUTION_PLAN.md`
- **PRD文档**: `prd/PRD_StoryWeaver.md`

### 查找代码
- **入口**: `src/main.tsx`, `src/app/App.tsx`
- **组件**: `src/app/components/`
- **服务**: `src/services/`
- **样式**: `src/styles/`

---

**💡 提示：使用此文档作为项目导航手册，快速定位所需文件！**
