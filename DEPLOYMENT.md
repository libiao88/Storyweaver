# StoryWeaver AI 部署计划

## 项目信息

**项目名称**：StoryWeaver AI - 智能需求拆解平台  
**技术栈**：React 18 + TypeScript + Vite + Tailwind CSS  
**部署目标**：Hugging Face Spaces（前端） + Supabase（后端/数据库）  
**构建工具**：Vite 6  

---

## 1. 部署准备工作

### 1.1 前期要求

- Hugging Face 账号（用于创建 Spaces）
- Supabase 账号（用于创建项目和数据库）
- Git 环境（用于版本控制和部署）
- Node.js 18+ 和 npm/pnpm（用于开发和构建）

### 1.2 所需工具

- `git` - 版本控制
- `npm` 或 `pnpm` - 包管理
- `supabase-cli`（可选）- 本地开发和部署

---

## 2. Supabase 部署流程

### 2.1 创建 Supabase 项目

1. 访问 [Supabase 控制台](https://supabase.com/dashboard) 并登录
2. 点击「New Project」创建新项目
3. 填写项目信息：
   - **Project Name**：`StoryWeaver AI`
   - **Database Password**：设置强密码（保存好！）
   - **Region**：选择离您最近的区域（如 `ap-northeast-1`）
4. 点击「Create Project」，等待项目创建完成（约 2-3 分钟）

### 2.2 获取项目凭证

项目创建成功后：
1. 进入「Settings」→「API」页面
2. 复制以下信息（保存到安全位置）：
   - **Project URL**：如 `https://abcdefghijklmnopqrst.supabase.co`
   - **Anon public**：如 `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

### 2.3 初始化数据库

1. 进入「SQL Editor」页面
2. 点击「New Query」
3. 复制 `supabase/init.sql` 文件内容并粘贴到编辑器
4. 点击「Run」执行初始化脚本
5. 等待脚本执行完成（约 1-2 分钟）
6. 验证表是否创建成功：进入「Table Editor」查看

### 2.4 配置环境变量

在项目根目录创建 `.env` 文件：

```bash
# 复制 .env.example 并填入实际值
cp .env.example .env
```

编辑 `.env` 文件：

```bash
VITE_SUPABASE_URL=您的Supabase项目URL
VITE_SUPABASE_ANON_KEY=您的Supabase匿名密钥
```

---

## 3. Hugging Face Spaces 部署流程

### 3.1 创建 Spaces

1. 访问 [Hugging Face Spaces](https://huggingface.co/spaces) 并登录
2. 点击「Create new Space」
3. 填写 Space 信息：
   - **Space name**：`storyweaver-ai`
   - **License**：选择 `MIT` 或合适的许可证
   - **SDK**：选择 `Static HTML`
4. 点击「Create Space」

### 3.2 配置 Git 远程仓库

1. 克隆创建好的 Space 到本地：
   ```bash
   git clone https://huggingface.co/spaces/您的用户名/storyweaver-ai
   ```

2. 将项目文件复制到 Space 目录：
   ```bash
   cp -r dist/* storyweaver-ai/
   cd storyweaver-ai
   git add .
   git commit -m "Initial deployment"
   git push
   ```

### 3.3 自动部署

Hugging Face Spaces 将自动检测 `README.md` 中的配置：
- 执行 `app_build_command: npm run build`
- 部署 `app_file: dist/index.html`

---

## 4. 本地开发部署

### 4.1 安装依赖

```bash
npm install
```

### 4.2 开发模式

```bash
npm run dev
```

访问 `http://localhost:5173`

### 4.3 构建生产版本

```bash
npm run build
```

构建产物将生成在 `dist/` 目录

### 4.4 本地预览

```bash
npm run preview
```

访问 `http://localhost:4173`

---

## 5. 部署验证

### 5.1 功能验证

部署完成后，验证以下功能：

1. **页面加载**：访问 Space URL，确认页面正常加载
2. **文件上传**：测试支持的文件格式（.docx, .pdf, .txt, .md）
3. **LLM 集成**：测试 12 种 LLM 模型的连接
4. **故事管理**：创建、编辑、删除用户故事
5. **数据持久化**：刷新页面，确认数据是否保存

### 5.2 性能测试

- 检查页面加载时间
- 测试文件处理速度
- 验证响应式设计

---

## 6. 错误处理和回滚方案

### 6.1 常见错误

#### 1. Supabase 连接失败

**症状**：页面显示连接错误，无法读取数据
**解决方案**：
- 检查 `.env` 文件中的配置是否正确
- 验证 Supabase 项目是否已激活
- 检查网络连接

#### 2. 构建失败

**症状**：Hugging Face Spaces 构建失败
**解决方案**：
- 查看构建日志
- 检查 `package.json` 依赖
- 验证 Node.js 版本

#### 3. 文件处理错误

**症状**：上传文件后无响应或报错
**解决方案**：
- 检查文件格式和大小限制
- 验证 LLM API 密钥配置
- 查看浏览器控制台错误信息

### 6.2 回滚方案

1. **代码回滚**：使用 Git 恢复到稳定版本
2. **数据库回滚**：使用 Supabase 备份恢复
3. **配置回滚**：使用环境变量管理工具回滚配置

---

## 7. 安全考虑

### 7.1 API 密钥管理

- 永远不要在代码库中硬编码 API 密钥
- 使用环境变量管理敏感信息
- 定期轮换 API 密钥

### 7.2 数据安全

- 启用 Supabase RLS（行级安全）
- 配置适当的访问策略
- 定期备份数据

---

## 8. 部署检查清单

- [ ] Supabase 项目已创建
- [ ] 数据库初始化脚本已执行
- [ ] 环境变量已配置
- [ ] 项目构建成功
- [ ] 本地预览功能正常
- [ ] Git 远程仓库已配置
- [ ] 代码已推送到 Hugging Face Spaces
- [ ] 部署过程无错误
- [ ] 所有功能验证通过

---

## 9. 维护和监控

### 9.1 定期维护

- 监控依赖更新
- 检查安全漏洞
- 优化性能

### 9.2 日志监控

- 使用浏览器开发者工具
- 集成错误跟踪服务（如 Sentry）
- 监控 Supabase 查询性能

---

## 10. 联系方式

**开发者**：[您的姓名/团队]  
**邮箱**：[您的邮箱]  
**文档更新时间**：2024年1月