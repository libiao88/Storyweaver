# Hugging Face Spaces 部署指南

## 1. 访问 Hugging Face Spaces

1. 打开浏览器，访问：https://huggingface.co/spaces/cobbrocks/Storyweaver
2. 使用您的Hugging Face账号登录

## 2. 配置 Space 基本信息

1. 点击页面顶部的"Settings"标签
2. 在"Space settings"部分：
   - 确保**Title**为："StoryWeaver AI"
   - 确保**Emoji**为："🚀"
   - 确保**Color theme**为："Blue to Purple"

## 3. 配置 SDK

1. 在"SDK and hardware"部分：
   - 将**SDK**从"Custom Docker"更改为"Static HTML"
   - 设置**App build command**为：`npm run build`
   - 设置**App file**为：`dist/index.html`
   - 确保**Hardware**为：`CPU Basic` (免费版本)

## 4. 上传构建文件

### 方法一：使用网页界面上传

1. 点击页面顶部的"Files and versions"标签
2. 点击页面右侧的"Add files"按钮
3. 选择"Upload files"
4. 选择您项目根目录下的`dist/`文件夹中的所有文件
5. 添加描述信息（如："Deploy StoryWeaver AI"）
6. 点击"Commit changes"

### 方法二：使用 Git 上传

```bash
# 克隆 Space 仓库
git clone https://huggingface.co/spaces/cobbrocks/Storyweaver
cd Storyweaver

# 替换现有文件
rm -rf *
cp -r /path/to/your/project/dist/* .

# 提交更改
git add .
git commit -m "Deploy StoryWeaver AI"
git push
```

## 5. 配置环境变量

1. 在"Settings"标签的"Variables and secrets"部分：
2. 添加以下环境变量：
   - `VITE_SUPABASE_URL`: 您的Supabase项目URL（如：https://dqmwpihbwggsjwmpktmo.supabase.co）
   - `VITE_SUPABASE_ANON_KEY`: 您的Supabase匿名密钥
3. 确保环境变量已正确配置

## 6. 验证部署

1. 部署完成后，访问：https://cobbrocks-storyweaver.hf.space
2. 检查应用是否正常加载
3. 测试基本功能（如上传文件、解析内容等）

## 7. 问题排查

### 常见错误

1. **构建失败**：
   - 检查是否有未安装的依赖
   - 检查是否有TypeScript错误
   - 检查Vite配置是否正确

2. **环境变量未加载**：
   - 确保环境变量名称正确
   - 确保环境变量值正确
   - 检查是否有拼写错误

3. **API请求失败**：
   - 检查网络连接
   - 检查API密钥是否有效
   - 检查CORS配置

### 查看日志

1. 访问Space的"Settings"标签
2. 在"Logs"部分查看部署和运行时的日志
3. 点击"Clear logs"按钮可以清除历史日志

## 8. 更新部署

要更新部署，重复第4步即可：
1. 重新构建项目：`npm run build`
2. 上传新的构建文件
3. 验证应用功能

---

## 部署检查清单

- [ ] 访问Hugging Face Spaces页面
- [ ] 配置Space基本信息
- [ ] 配置SDK为Static HTML
- [ ] 上传构建文件
- [ ] 配置环境变量
- [ ] 验证部署
- [ ] 测试基本功能

---

## 联系支持

如果您在部署过程中遇到问题，可以：
1. 查看Hugging Face Spaces文档：https://huggingface.co/docs/hub/spaces
2. 检查Hugging Face论坛：https://discuss.huggingface.co
3. 联系Hugging Face支持团队

---

**部署时间估算**：约5-10分钟（取决于网络速度）
