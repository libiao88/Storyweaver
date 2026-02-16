# StoryWeaver AI 部署执行计划

## 项目信息
- **项目名称**: StoryWeaver AI - 智能需求拆解平台
- **技术栈**: React 18 + TypeScript + Vite + Tailwind CSS
- **部署目标**: Hugging Face Spaces（前端） + Supabase（后端/数据库）
- **最新代码**: https://github.com/libiao88/Storyweaver
- **构建工具**: Vite 6

## 部署准备

### 1. 前期要求
- Hugging Face 账号（已拥有，Space 名称：cobbrocks/Storyweaver）
- Supabase 账号（已拥有，项目 ID：dqmwpihbwggsjwmpktmo）
- Git 环境（已配置）
- Node.js 18+ 和 npm/pnpm（已安装）

### 2. 所需工具
- `git` - 版本控制
- `npm` - 包管理
- `huggingface-hub` CLI - Hugging Face Spaces 部署
- `supabase-cli` - Supabase 部署
- 浏览器 - 验证部署结果

## 部署流程

### 阶段一：本地部署准备（30分钟）

#### 任务 1.1：检查项目状态
```bash
cd /Users/cobbli/Desktop/storyweaver
git status
git log --oneline | head -10
```
**预期输出**: Git 工作区清洁，最新提交已同步

#### 任务 1.2：安装依赖
```bash
npm install
```
**预期输出**: 依赖安装成功，无错误

#### 任务 1.3：构建生产版本
```bash
npm run build
```
**预期输出**: 构建成功，dist/ 目录生成

#### 任务 1.4：验证构建产物
```bash
ls -la dist/
ls -la dist/assets/
```
**预期输出**: dist/index.html 和 dist/assets/ 目录存在

### 阶段二：Supabase 部署（45分钟）

#### 任务 2.1：访问 Supabase 控制台
- 打开浏览器访问：https://supabase.com/dashboard/project/dqmwpihbwggsjwmpktmo
- 登录到 Supabase 账号

#### 任务 2.2：初始化数据库
1. 进入「SQL Editor」页面
2. 点击「New Query」
3. 复制 `supabase/init.sql` 文件内容并粘贴到编辑器
4. 点击「Run」执行初始化脚本
5. 等待脚本执行完成（约 1-2 分钟）
6. 验证表是否创建成功：进入「Table Editor」查看

**预期输出**: 所有表创建成功，无错误

#### 任务 2.3：配置环境变量
1. 在项目根目录创建 `.env` 文件：
   ```bash
   cp .env.example .env
   ```

2. 编辑 `.env` 文件，填入实际值：
   ```bash
   VITE_SUPABASE_URL=https://dqmwpihbwggsjwmpktmo.supabase.co
   VITE_SUPABASE_ANON_KEY=您的Supabase匿名密钥
   ```

#### 任务 2.4：配置 Storage 和 Real-time
1. 进入「Storage」页面
2. 确保存储桶配置正确
3. 进入「Database」→「Replication」页面
4. 确保 Real-time 功能已启用

### 阶段三：Hugging Face Spaces 部署（30分钟）

#### 任务 3.1：访问 Hugging Face Spaces
- 打开浏览器访问：https://huggingface.co/spaces/cobbrocks/Storyweaver
- 登录到 Hugging Face 账号

#### 任务 3.2：检查 Space 配置
- 确认 SDK 为 Static HTML
- 确认 app_build_command: npm run build
- 确认 app_file: dist/index.html

#### 任务 3.3：部署到 Hugging Face Spaces

**方法一：使用 Hugging Face Hub CLI**
```bash
# 安装 CLI（如果未安装）
pip3 install --user huggingface-hub

# 登录（需要 Hugging Face 令牌）
huggingface-cli login

# 部署
huggingface-cli upload cobbrocks/Storyweaver dist/ --commit-message "Deploy StoryWeaver AI v1.0"
```

**方法二：使用网页界面**
1. 点击「Settings」
2. 在「Files and versions」部分点击「Upload files」
3. 上传 dist/ 目录下的所有文件
4. 点击「Commit changes」

**预期输出**: 文件上传成功，Hugging Face Spaces 开始自动部署

### 阶段四：部署验证（30分钟）

#### 任务 4.1：验证 Hugging Face Spaces 部署
- 访问：https://cobbrocks-storyweaver.hf.space/
- 检查页面是否正常加载
- 确认无 JavaScript 错误

#### 任务 4.2：验证 Supabase 连接
- 打开浏览器开发者工具
- 检查 Console 面板是否有连接错误
- 测试页面加载时是否能从 Supabase 读取数据

#### 任务 4.3：功能验证
1. **页面加载**: 确认页面正常加载，无白屏
2. **文件上传**: 测试支持的文件格式（.docx, .pdf, .txt, .md）
3. **LLM 集成**: 测试 LLM 模型的连接
4. **故事管理**: 创建、编辑、删除用户故事
5. **数据持久化**: 刷新页面，确认数据是否保存

#### 任务 4.4：性能测试
- 检查页面加载时间（目标 < 3秒）
- 测试文件处理速度
- 验证响应式设计（移动端、桌面端）

## 错误处理和回滚方案

### 常见错误

#### 1. Supabase 连接失败
**症状**: 页面显示连接错误，无法读取数据
**解决方案**:
- 检查 `.env` 文件中的配置是否正确
- 验证 Supabase 项目是否已激活
- 检查网络连接

#### 2. Hugging Face Spaces 构建失败
**症状**: Space 页面显示构建错误
**解决方案**:
- 查看构建日志
- 检查 `package.json` 依赖
- 验证 Node.js 版本

#### 3. 文件处理错误
**症状**: 上传文件后无响应或报错
**解决方案**:
- 检查文件格式和大小限制
- 验证 LLM API 密钥配置
- 查看浏览器控制台错误信息

### 回滚方案

#### 方案一：代码回滚
```bash
# 恢复到上一个稳定版本
git log --oneline
git revert <commit-hash>
npm run build
# 重新部署
```

#### 方案二：数据库回滚
- 进入 Supabase 控制台 → 「Database」→「Backups」
- 选择最近的备份 → 点击「Restore」

#### 方案三：配置回滚
- 保存环境变量的历史版本
- 回滚 `.env` 文件到之前的工作状态

## 成功标准

✅ 项目构建成功
✅ Hugging Face Spaces 部署成功
✅ Supabase 数据库初始化成功
✅ 所有功能验证通过
✅ 页面加载时间 < 3秒
✅ 文件上传和处理正常
✅ 数据持久化功能正常

## 部署检查清单

- [ ] Git 工作区清洁
- [ ] 依赖安装成功
- [ ] 生产构建成功
- [ ] 构建产物验证通过
- [ ] Supabase 数据库初始化成功
- [ ] Hugging Face Spaces 部署成功
- [ ] 页面加载正常
- [ ] 所有功能验证通过
- [ ] 响应式设计验证通过
- [ ] 无 JavaScript 错误

## 维护和监控

### 定期维护
- 监控依赖更新
- 检查安全漏洞
- 优化性能

### 日志监控
- 使用浏览器开发者工具
- 集成错误跟踪服务（如 Sentry）
- 监控 Supabase 查询性能

## 联系方式

**开发者**: 李博
**邮箱**: libiao88@example.com
**项目文档更新时间**: 2024年

---

**部署执行计划版本**: 1.0  
**创建时间**: 2024年  
**预计总部署时间**: 135分钟