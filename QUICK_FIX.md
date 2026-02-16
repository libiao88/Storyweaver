# 快速修复指南

## 问题概述

Hugging Face Spaces 返回 503 服务不可用，主要原因是SDK配置不正确。当前SDK配置为Docker，但我们需要使用Static HTML。

## 快速解决方案

### 步骤1：访问Hugging Face Spaces设置

1. 打开浏览器，访问：https://huggingface.co/spaces/cobbrocks/Storyweaver
2. 点击页面顶部的"Settings"标签

### 步骤2：更改SDK配置

1. 在"SDK and hardware"部分：
   - 找到"SDK"下拉菜单
   - 将其从"Custom Docker"更改为"Static HTML"
2. 确保其他配置项正确：
   - **App build command**: `npm run build`
   - **App file**: `index.html`
3. 点击"Save changes"按钮

### 步骤3：验证修复

1. 等待部署完成（约1-2分钟）
2. 刷新页面，检查是否可以正常访问
3. 使用验证脚本检查：

```bash
./validate-deployment.sh
```

---

## 详细操作步骤

### 1. 登录Hugging Face

确保您已登录Hugging Face账号，如果没有：

1. 点击页面右上角的"Log in"
2. 使用您的账号登录

### 2. 导航到Space页面

1. 在浏览器中访问：https://huggingface.co/spaces/cobbrocks/Storyweaver
2. 您会看到StoryWeaver AI的Space页面

### 3. 进入设置页面

1. 在Space页面的顶部导航栏中，找到"Settings"标签
2. 点击进入设置页面

### 4. 更改SDK配置

1. 在"SDK and hardware"部分：
   - 找到"SDK"下拉菜单（当前显示为"Custom Docker"）
   - 点击下拉菜单，选择"Static HTML"
2. 检查其他配置项：
   - **App build command**: 确保是 `npm run build`
   - **App file**: 确保是 `index.html`
3. 点击页面底部的"Save changes"按钮

### 5. 等待部署完成

1. 点击保存后，Space会开始重新部署
2. 部署过程通常需要1-2分钟
3. 您可以在页面顶部看到部署进度

### 6. 验证修复

1. 部署完成后，点击页面顶部的"Open in browser"按钮
2. 或直接访问：https://cobbrocks-storyweaver.hf.space
3. 确认页面可以正常加载
4. 运行验证脚本：

```bash
./validate-deployment.sh
```

---

## 预期结果

### 成功修复的标志

1. **访问状态**：返回200 OK
2. **页面内容**：显示StoryWeaver AI应用程序界面
3. **控制台信息**：无JavaScript错误
4. **功能测试**：
   - 文件上传功能正常
   - 数据存储和查询功能正常
   - 用户界面响应迅速

### 验证脚本输出

```
🚀 StoryWeaver AI 部署验证脚本
================================

=====================================
  检查项目文件
=====================================
✓ 项目文件检查完成
=====================================
  检查Hugging Face Spaces访问
=====================================
✓ Hugging Face Spaces 访问成功
=====================================
  检查Supabase连接
=====================================
✓ Supabase URL: https://dqmwpihbwggsjwmpktmo.supabase.co
✓ Supabase API 连接成功
=====================================
  部署验证完成
=====================================
✓ 所有检查完成！
🎉 部署成功！应用程序已可正常访问
📱 访问地址：https://cobbrocks-storyweaver.hf.space
```

---

## 如果问题仍然存在

### 检查部署日志

1. 在Space页面的"Settings"标签中
2. 点击"Logs"部分
3. 查看部署过程中是否有错误信息

### 重新上传文件

如果SDK配置正确但文件有误：

1. 在"Files and versions"标签中
2. 删除当前文件
3. 重新上传正确的文件

### 联系支持

如果问题无法解决：

1. 点击页面底部的"Report an issue"
2. 描述问题细节
3. 提供部署日志

---

## 预防措施

### 定期检查

1. 定期运行验证脚本：
   ```bash
   ./validate-deployment.sh
   ```
2. 检查应用程序功能是否正常

### 备份配置

1. 定期备份：
   - `.env`文件
   - `supabase/init.sql`文件
   - Hugging Face Spaces配置

---

**通过以上步骤，您可以快速解决Hugging Face Spaces的503服务不可用问题，使StoryWeaver AI应用程序正常运行。**
