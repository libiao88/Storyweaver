# Hugging Face Spaces 配置入口查找指南

## 问题说明

您无法在Hugging Face Spaces网页界面上找到"App build command"和"App file"配置入口。这通常是因为：

1. **访问权限问题**：需要Space的所有者或管理员权限
2. **界面位置问题**：这些配置可能位于不同的标签页或菜单中
3. **项目类型差异**：已存在的项目与新建项目的配置界面可能有所不同

## 解决方案

### 方法1：通过Settings页面直接访问

**步骤：**

1. **确保已登录Hugging Face账号**
   - 访问 https://huggingface.co/login
   - 使用您的账号登录

2. **访问Settings页面**
   - 直接访问链接：https://huggingface.co/spaces/cobbrocks/Storyweaver/settings
   - 或者访问Space主页：https://huggingface.co/spaces/cobbrocks/Storyweaver
   - 点击页面顶部的"Settings"标签

3. **查找SDK配置**
   - 在Settings页面中，寻找以下部分：
     - "Space settings" 或 "Space configuration"
     - "SDK and hardware" 
     - "Build configuration"

### 方法2：通过Files and versions页面配置

**步骤：**

1. **访问Files页面**
   - 访问：https://huggingface.co/spaces/cobbrocks/Storyweaver/tree/main
   - 或者点击Space主页的"Files and versions"标签

2. **创建配置文件**
   - 如果找不到配置界面，您可能需要手动创建配置文件
   - 点击"Add file" → "Create new file"
   - 创建文件名为 `README.md`（如果已存在则编辑）

3. **在README中添加配置**
   ```markdown
   ---
   title: StoryWeaver AI
   emoji: 🚀
   colorFrom: blue
   colorTo: purple
   sdk: static
   app_build_command: npm run build
   app_file: index.html
   ---
   ```

### 方法3：使用Git命令行配置

**步骤：**

1. **克隆Space仓库**
   ```bash
   git clone https://huggingface.co/spaces/cobbrocks/Storyweaver
   cd Storyweaver
   ```

2. **创建README.md文件**
   ```bash
   cat > README.md << 'EOF'
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
   EOF
   ```

3. **提交更改**
   ```bash
   git add README.md
   git commit -m "更新SDK配置为Static HTML"
   git push
   ```

### 方法4：通过Hugging Face Hub CLI配置

**步骤：**

1. **安装并登录CLI**
   ```bash
   pip install huggingface-hub
   huggingface-cli login
   # 输入您的token
   ```

2. **下载当前配置**
   ```bash
   huggingface-cli download cobbrocks/Storyweaver README.md --repo-type space --local-dir ./space-config
   ```

3. **修改配置**
   ```bash
   cat > ./space-config/README.md << 'EOF'
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
   EOF
   ```

4. **上传配置**
   ```bash
   huggingface-cli upload cobbrocks/Storyweaver ./space-config/README.md README.md --repo-type space
   ```

## 推荐的解决方案

### 对于您的情况，我推荐使用方法3（Git命令行）

**原因：**
1. 最直接有效
2. 不需要在网页界面上寻找配置入口
3. 可以精确控制配置内容

**具体操作：**

```bash
# 1. 克隆仓库
git clone https://huggingface.co/spaces/cobbrocks/Storyweaver
cd Storyweaver

# 2. 检查当前文件
ls -la

# 3. 备份现有README（如果有）
cp README.md README.md.backup 2>/dev/null || true

# 4. 创建新的README.md
cat > README.md << 'EOF'
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

## 技术栈

- React 18 + TypeScript
- Vite 6
- Tailwind CSS
- Radix UI

## 部署

本项目部署在Hugging Face Spaces上。
EOF

# 5. 提交更改
git add README.md
git commit -m "更新SDK配置为Static HTML，解决503错误"
git push

# 6. 等待部署完成（约1-2分钟）
echo "配置已更新，请等待部署完成..."
echo "访问地址：https://cobbrocks-storyweaver.hf.space"
```

## 验证配置是否成功

### 方法1：查看Space信息
```bash
# 使用Hugging Face Hub CLI
huggingface-cli repo info cobbrocks/Storyweaver --repo-type space
```

### 方法2：检查部署状态
1. 访问：https://huggingface.co/spaces/cobbrocks/Storyweaver
2. 查看页面顶部的状态指示器
3. 等待状态变为"Running"

### 方法3：测试访问
```bash
# 等待2分钟后测试
curl -I https://cobbrocks-storyweaver.hf.space
```

## 常见问题

### Q1: 推送时提示权限不足
**A**: 确保您使用的是正确的Hugging Face账号，并且该账号有权限修改这个Space。

### Q2: 配置更新后仍然返回503
**A**: 
1. 检查README.md的YAML格式是否正确（注意缩进）
2. 确保sdk值为`static`而不是`docker`
3. 等待1-2分钟后刷新页面
4. 查看Space的Logs获取详细错误信息

### Q3: 找不到Git仓库地址
**A**: Space的Git地址格式为：`https://huggingface.co/spaces/<username>/<space-name>`

## 联系支持

如果以上方法都无法解决问题：

1. **Hugging Face论坛**：https://discuss.huggingface.co
2. **Hugging Face文档**：https://huggingface.co/docs/hub/spaces
3. **Space页面报告问题**：在Space页面点击"Report"按钮

---

**推荐的快速解决方案：使用方法3（Git命令行）更新README.md配置文件，这是最直接有效的方式。**
