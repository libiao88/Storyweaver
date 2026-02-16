# 🚀 快速修复 - Hugging Face Spaces 503错误

## 问题

Hugging Face Spaces 返回 **503 Service Unavailable** 错误，需要将SDK从 **Docker** 更改为 **Static HTML**。

## 原因

在Hugging Face网页界面上找不到"App build command"和"App file"配置入口，这是已知的界面差异问题。

## ✅ 解决方案（推荐）

### 方法：使用Git命令行直接修改配置

**优势：**
- 不需要在网页界面上寻找配置入口
- 直接、可靠、可重复
- 可以精确控制配置内容

**操作步骤：**

#### 步骤1：运行自动修复脚本

```bash
# 在项目根目录执行
./fix-hf-sdk.sh
```

这个脚本会自动：
1. 克隆Hugging Face Space仓库
2. 创建包含正确SDK配置的README.md
3. 提交并推送更改

#### 步骤2：等待部署完成

```bash
# 等待2分钟
sleep 120

# 验证部署
./validate-deployment.sh
```

#### 步骤3：验证修复

```bash
# 测试访问
curl -I https://cobbrocks-storyweaver.hf.space
```

如果返回 `HTTP/2 200`，说明修复成功！

---

## 手动操作（如果自动脚本失败）

### 方法A：使用Git命令行

```bash
# 1. 克隆仓库
git clone https://huggingface.co/spaces/cobbrocks/Storyweaver
cd Storyweaver

# 2. 创建README.md
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

# 3. 提交并推送
git add README.md
git commit -m "更新SDK配置为Static HTML"
git push
```

### 方法B：使用Hugging Face Hub CLI

```bash
# 1. 安装CLI
pip install huggingface-hub

# 2. 登录
huggingface-cli login

# 3. 创建本地目录
mkdir -p space-config
cd space-config

# 4. 创建README.md
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

# 5. 上传配置
huggingface-cli upload cobbrocks/Storyweaver README.md README.md --repo-type space
```

---

## 预期结果

### 成功修复的标志

1. **推送成功后**，等待1-2分钟
2. **访问应用**：https://cobbrocks-storyweaver.hf.space
3. **状态码**：应该返回 `HTTP/2 200`
4. **页面内容**：显示StoryWeaver AI应用程序界面

### 验证脚本输出

```bash
./validate-deployment.sh
```

**成功时的输出：**
```
🚀 StoryWeaver AI 部署验证脚本
================================

✓ 项目文件检查完成
✓ Hugging Face Spaces 访问成功
✓ Supabase URL: https://dqmwpihbwggsjwmpktmo.supabase.co
✓ Supabase API 连接成功

🎉 部署成功！应用程序已可正常访问
📱 访问地址：https://cobbrocks-storyweaver.hf.space
```

---

## 常见问题

### Q1: 推送时要求输入用户名和密码

**A**: 
1. Hugging Face用户名：`cobbrocks`
2. 密码：使用Hugging Face Token（不是登录密码）
3. Token获取：https://huggingface.co/settings/tokens

### Q2: 提示权限不足

**A**: 确保您使用的是Space所有者账号，或者有写入权限的账号。

### Q3: 更新后仍然返回503

**A**: 
1. 检查README.md的YAML格式（注意缩进）
2. 等待2-3分钟后刷新
3. 查看Space的Logs获取详细错误

### Q4: Git命令行无法推送

**A**: 
1. 使用SSH密钥：`git clone git@huggingface.co:spaces/cobbrocks/Storyweaver`
2. 或者使用Token：`git clone https://<token>@huggingface.co/spaces/cobbrocks/Storyweaver`

---

## 后续步骤

修复Hugging Face Spaces后，还需要完成：

1. **Supabase配置**
   - 访问：https://supabase.com/dashboard/project/dqmwpihbwggsjwmpktmo
   - 在SQL Editor中执行 `supabase/init.sql`
   - 更新 `.env` 文件中的匿名密钥

2. **功能验证**
   - 测试文件上传
   - 测试数据存储
   - 测试LLM功能

详细步骤请参考 `DEPLOYMENT_STATUS.md`

---

## 相关文档

- `FIND_CONFIG_GUIDE.md` - 详细的配置查找指南
- `DEPLOYMENT_STATUS.md` - 部署状态分析
- `QUICK_FIX.md` - 快速修复说明
- `validate-deployment.sh` - 部署验证脚本

---

## 技术支持

如果仍然遇到问题：

1. **查看日志**：在Hugging Face Spaces页面的Settings → Logs
2. **Hugging Face论坛**：https://discuss.huggingface.co
3. **文档**：https://huggingface.co/docs/hub/spaces

---

**🎯 推荐操作：直接运行 `./fix-hf-sdk.sh` 脚本，这是最简单可靠的解决方案。**
