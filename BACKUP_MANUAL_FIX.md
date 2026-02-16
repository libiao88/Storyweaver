# 🆘 备用方案 - 手动配置 Hugging Face Spaces

## 当前状况

由于网络连接问题，无法通过 Git 命令行直接推送配置。需要使用**手动方式**在 Hugging Face 网页界面上完成配置。

## 方案 A：通过网页界面直接修改（推荐）

### 步骤 1：登录 Hugging Face

1. 访问 https://huggingface.co/login
2. 使用账号 **cobbrocks** 登录

### 步骤 2：进入 Space 设置

1. 访问 https://huggingface.co/spaces/cobbrocks/Storyweaver
2. 点击页面顶部的 **"Settings"** 标签（如果没有看到，点击右上角的三个点菜单 ☰）

### 步骤 3：查找 Factory 或 Space Configuration

在 Settings 页面中，寻找以下任一选项：

#### 选项 1：Factory Reboot（重启）
- 寻找 **"Factory Reboot"** 按钮
- 点击后可以选择 **"Static HTML"** 作为新的 SDK

#### 选项 2：Space Configuration
- 寻找 **"Space configuration"** 或 **"Space settings"** 部分
- 查找 **"SDK"** 下拉菜单
- 将 **"Custom Docker"** 改为 **"Static HTML"**

#### 选项 3：Files and versions（文件和版本）

如果找不到 Settings 中的配置选项，通过文件修改：

1. 点击 **"Files and versions"** 标签
2. 点击 **"Add file"** → **"Create new file"**
3. 文件名输入：`README.md`
4. 内容粘贴以下配置：

```yaml
---
title: StoryWeaver AI
emoji: 🚀
colorFrom: blue
colorTo: purple
sdk: static
app_build_command: npm run build
app_file: index.html
---

# StoryWeaver AI

智能需求拆解平台
```

5. 点击 **"Commit new file"**

### 步骤 4：确认配置

1. 等待 1-2 分钟让 Hugging Face 自动检测配置更改
2. Space 将自动重新部署
3. 部署完成后访问 https://cobbrocks-storyweaver.hf.space 验证

---

## 方案 B：下载配置文件本地准备，然后上传

我已经为您准备好了正确的配置文件：

### 准备好的文件

在项目根目录下，我创建了以下文件：
- `hf-readme-config.md` - 包含正确配置的 README.md

### 操作步骤

#### 步骤 1：下载配置文件

在您的本地浏览器中：

1. 打开项目文件夹：`/Users/cobbli/Desktop/storyweaver/`
2. 找到文件 `hf-readme-config.md`
3. 复制文件内容

#### 步骤 2：上传到 Hugging Face

1. 访问 https://huggingface.co/spaces/cobbrocks/Storyweaver
2. 点击 **"Files and versions"** 标签
3. 点击 **"Add file"** → **"Upload files"**
4. 或者点击 **"Create new file"**
   - 文件名：`README.md`
   - 粘贴以下内容：

```yaml
---
title: StoryWeaver AI
emoji: 🚀
colorFrom: blue
colorTo: purple
sdk: static
app_build_command: npm run build
app_file: index.html
---

# StoryWeaver AI

智能需求拆解平台，支持多种LLM模型进行需求分析和优化。

## 功能特点

- **智能文档解析**：支持 .docx, .pdf, .md, .txt 格式
- **LLM优化**：集成12种大语言模型
- **可视化**：用户故事地图、质量分析图表
- **导出功能**：CSV、Markdown导出
```

5. 点击 **"Commit changes"**

#### 步骤 3：等待部署

1. 提交后，Hugging Face 会自动重新部署 Space
2. 在 **"Files and versions"** 页面等待状态变为 **"Running"**
3. 部署完成后，访问应用链接验证

---

## 方案 C：使用 Hugging Face Hub 的上传功能

### 通过 Hugging Face 网页上传

1. 准备好要上传的文件（README.md）
2. 访问 https://huggingface.co/spaces/cobbrocks/Storyweaver
3. 点击 **"Files and versions"** → **"Upload files"**
4. 选择或拖拽 README.md 文件
5. 添加提交信息：**"更新SDK配置为Static HTML，解决503错误"**
6. 点击 **"Commit changes"**

---

## 配置成功后验证

### 验证步骤

1. **等待 2 分钟**让部署完成
2. **测试访问**：
   ```bash
   curl -I https://cobbrocks-storyweaver.hf.space
   ```
   应该返回 `HTTP/2 200`

3. **浏览器访问**：
   - 打开 https://cobbrocks-storyweaver.hf.space
   - 确认页面正常加载，显示 StoryWeaver AI 界面

4. **运行验证脚本**：
   ```bash
   ./validate-deployment.sh
   ```

---

## 如果网页界面也找不到配置入口

### 最终方案：联系 Hugging Face 支持

如果以上方法都无法找到配置入口：

1. **在 Space 页面报告问题**：
   - 访问 https://huggingface.co/spaces/cobbrocks/Storyweaver
   - 点击右下角的 **"Report"** 按钮
   - 描述问题："无法找到 SDK 配置入口，需要将 Docker 更改为 Static HTML"

2. **在论坛求助**：
   - 访问 https://discuss.huggingface.co
   - 创建新话题，描述您的问题

3. **查看文档**：
   - https://huggingface.co/docs/hub/spaces-config

---

## 关键配置参数

无论如何修改，确保最终配置包含：

```yaml
sdk: static
app_build_command: npm run build
app_file: index.html
```

这些参数告诉 Hugging Face：
- 使用 **Static HTML** SDK 而不是 Docker
- 构建命令是 `npm run build`
- 入口文件是 `index.html`

---

## 预期时间

- **文件上传**：1 分钟
- **自动部署**：1-2 分钟
- **验证测试**：1 分钟

**总计：约 3-5 分钟**

---

## 紧急联系方式

如果所有方法都失败：

1. **Hugging Face Discord**：https://huggingface.co/join/discord
2. **Twitter/X**：@huggingface
3. **Email**：website@huggingface.co

---

**💡 推荐操作：直接使用【方案 A 的步骤 3 - 选项 3】通过 Files and versions 创建 README.md 文件，这是最可靠的方法。**
