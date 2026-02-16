# StoryWeaver AI - 文件快速索引

## 🔍 按功能快速查找

### 配置文件
| 文件名 | 用途 | 路径 |
|--------|------|------|
| package.json | 项目依赖和脚本 | 根目录 |
| tsconfig.json | TypeScript配置 | 根目录 |
| vite.config.ts | Vite构建配置 | 根目录 |
| .env | 环境变量（敏感） | 根目录 |
| .env.example | 环境变量模板 | 根目录 |

### 入口文件
| 文件名 | 用途 | 路径 |
|--------|------|------|
| index.html | 应用入口HTML | 根目录 |
| main.tsx | React应用入口 | src/ |
| App.tsx | 根组件 | src/app/ |

### 核心组件
| 文件名 | 用途 | 路径 |
|--------|------|------|
| FileUpload.tsx | 文件上传组件 | src/app/components/ |
| StoryList.tsx | 故事列表组件 | src/app/components/ |
| StoryCard.tsx | 故事卡片组件 | src/app/components/ |
| StoryMap.tsx | 故事地图组件 | src/app/components/ |
| LLMConfigPanel.tsx | LLM配置面板 | src/app/components/ |

### 核心服务
| 文件名 | 用途 | 路径 |
|--------|------|------|
| DocumentParser.ts | 文档解析服务 | src/services/ |
| StoryGenerator.ts | 故事生成器 | src/services/ |
| LLMOptimizer.ts | LLM优化器 | src/services/ |
| LLMService.ts | LLM服务接口 | src/services/ |
| SessionManager.ts | 会话管理 | src/services/ |
| ExportService.ts | 导出服务 | src/services/ |
| supabase.ts | Supabase客户端 | src/services/ |

### PRD文档
| 文件名 | 用途 | 路径 |
|--------|------|------|
| PRD_StoryWeaver.md | 主PRD文档 | prd/ |
| Gap_Analysis_Report.md | 差距分析 | prd/ |
| Data_Model_Specification.md | 数据模型 | prd/ |
| API_Specification.md | API规范 | prd/ |
| Testing_Strategy.md | 测试策略 | prd/ |

### 部署文档
| 文件名 | 用途 | 路径 |
|--------|------|------|
| DEPLOYMENT.md | 部署说明 | 根目录 |
| DEPLOYMENT_EXECUTION_PLAN.md | 执行计划 | 根目录 |
| DEPLOYMENT_STATUS.md | 状态分析 | 根目录 |
| HUGGINGFACE_DEPLOYMENT.md | HF部署指南 | 根目录 |
| PROJECT_STRUCTURE.md | 项目结构 | 根目录 |
| DIRECTORY_TREE.txt | 目录树 | 根目录 |

### 部署脚本
| 文件名 | 用途 | 路径 |
|--------|------|------|
| deploy.sh | 主部署脚本 | 根目录 |
| validate-deployment.sh | 部署验证 | 根目录 |
| fix-hf-sdk.sh | SDK修复 | 根目录 |
| test-project.sh | 项目测试 | 根目录 |

### 配置文件
| 文件名 | 用途 | 路径 |
|--------|------|------|
| supabase/init.sql | 数据库初始化 | supabase/ |
| .huggingface/metadata.json | HF元数据 | .huggingface/ |
| hf-readme-config.md | HF README模板 | 根目录 |

---

## 📊 按类型分类

### 源代码文件 (src/)
```
入口文件:
- src/main.tsx
- src/app/App.tsx

组件 (src/app/components/):
- UI组件: src/app/components/ui/*.tsx (50+个)
- 业务组件: FileUpload, StoryList, StoryCard, StoryMap, etc.
- Figma组件: src/app/components/figma/*.tsx

服务 (src/services/):
- DocumentParser.ts
- ExportService.ts
- LLMOptimizer.ts
- LLMService.ts
- SessionManager.ts
- StoryGenerator.ts
- supabase.ts

样式 (src/styles/):
- fonts.css
- index.css
- tailwind.css
- theme.css

类型 (src/types/):
- storyweaver.ts
```

### 文档文件
```
PRD文档 (prd/):
- PRD_StoryWeaver.md
- PRD_StoryWeaver_Phase2.md
- PRD_StoryWeaver_Unified.md
- Gap_Analysis_Report.md
- Data_Model_Specification.md
- API_Specification.md
- Storage_Strategy.md
- Backend_Architecture_Decision.md
- Error_Handling_Specification.md
- AI_Algorithm_Strategy.md
- Authentication_Authorization_Design.md
- Testing_Strategy.md

部署文档:
- DEPLOYMENT.md
- DEPLOYMENT_EXECUTION_PLAN.md
- DEPLOYMENT_STATUS.md
- HUGGINGFACE_DEPLOYMENT.md
- FIND_CONFIG_GUIDE.md
- BACKUP_MANUAL_FIX.md
- QUICK_FIX.md
- QUICK_FIX_FINAL.md

架构文档:
- LLM_INTEGRATION_ARCHITECTURE.md
- AGENTS.md

项目文档:
- PROJECT_STRUCTURE.md
- DIRECTORY_TREE.txt
- README.md
```

### 脚本文件
```
部署脚本:
- deploy.sh
- validate-deployment.sh
- fix-hf-sdk.sh

测试脚本:
- test-project.sh
- test-llm-services.js
- test-llm-services.mjs
- test-volcano-api-key.mjs
```

### 配置文件
```
项目配置:
- package.json
- tsconfig.json
- vite.config.ts
- postcss.config.mjs
- index.html
- .env
- .env.example
- .gitignore

服务配置:
- supabase/init.sql
- supabase/supabase/config.toml
- .huggingface/metadata.json
- hf-readme-config.md
```

---

## 🎯 按任务快速定位

### 开发任务
| 任务 | 相关文件 |
|------|----------|
| 修改UI组件 | src/app/components/ui/*.tsx |
| 修改业务逻辑 | src/app/components/*.tsx |
| 修改服务 | src/services/*.ts |
| 修改样式 | src/styles/*.css |
| 修改类型 | src/types/*.ts |

### 部署任务
| 任务 | 相关文件 |
|------|----------|
| 部署到Hugging Face | deploy.sh, hf-readme-config.md, HUGGINGFACE_DEPLOYMENT.md |
| 部署到Supabase | supabase/init.sql, DEPLOYMENT.md |
| 验证部署 | validate-deployment.sh |
| 修复503错误 | fix-hf-sdk.sh, BACKUP_MANUAL_FIX.md |

### 文档任务
| 任务 | 相关文件 |
|------|----------|
| 查看PRD | prd/*.md |
| 查看部署说明 | DEPLOYMENT*.md |
| 查看项目结构 | PROJECT_STRUCTURE.md, DIRECTORY_TREE.txt |
| 查看架构 | LLM_INTEGRATION_ARCHITECTURE.md |

### 配置任务
| 任务 | 相关文件 |
|------|----------|
| 修改环境变量 | .env, .env.example |
| 修改构建设置 | vite.config.ts, tsconfig.json |
| 修改依赖 | package.json |
| 配置Hugging Face | .huggingface/metadata.json |
| 配置Supabase | supabase/init.sql |

---

## 📁 关键目录说明

### src/app/components/ui/ - UI组件库
包含50+个基于Radix UI的组件：
- 基础组件: button, card, input, label
- 表单组件: checkbox, radio, select, form
- 弹窗组件: dialog, alert-dialog, drawer
- 导航组件: tabs, breadcrumb, menu
- 反馈组件: alert, progress, toast
- 布局组件: accordion, resizable, sidebar

### src/services/ - 服务层
业务逻辑和API调用：
- DocumentParser: 解析DOCX, PDF, MD, TXT
- StoryGenerator: 生成用户故事
- LLMOptimizer: LLM优化功能
- LLMService: LLM服务接口
- SessionManager: 会话和分享
- ExportService: CSV/Markdown导出
- supabase: 数据库客户端

### prd/ - 产品需求文档
12个PRD文档，涵盖：
- 需求定义
- 数据模型
- API设计
- 架构决策
- 测试策略

---

## 🔧 常用命令对应文件

| 命令 | 使用的文件 |
|------|-----------|
| `npm run dev` | vite.config.ts, package.json |
| `npm run build` | vite.config.ts, package.json |
| `./deploy.sh` | deploy.sh, DEPLOYMENT*.md |
| `./validate-deployment.sh` | validate-deployment.sh |
| `./fix-hf-sdk.sh` | fix-hf-sdk.sh |

---

## 📝 文件命名规范

### 源代码
- 组件: PascalCase (e.g., `FileUpload.tsx`)
- 服务: camelCase (e.g., `documentParser.ts`)
- 样式: kebab-case (e.g., `theme.css`)
- 类型: PascalCase (e.g., `StoryWeaver.ts`)

### 文档
- PRD: PRD_*.md
- 部署: DEPLOYMENT*.md
- 指南: *GUIDE.md, *FIX.md
- 报告: *_REPORT.md

### 脚本
- Shell: *.sh
- Node: *.js, *.mjs
- 测试: test-*.js, test-*.mjs

---

**💡 提示：使用 Ctrl+F 在此文件中搜索关键词，快速定位所需文件！**
