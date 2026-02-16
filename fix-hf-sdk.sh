#!/bin/bash

# StoryWeaver AI - Hugging Face Spaces SDK配置修复脚本
# 解决503错误，将SDK从Docker更改为Static HTML

set -e

# 颜色输出
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'  # No Color

# 打印标题
print_title() {
    echo -e "${BLUE}"
    echo "====================================="
    echo "  $1"
    echo "====================================="
    echo -e "${NC}"
}

# 打印成功信息
print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

# 打印警告信息
print_warning() {
    echo -e "${YELLOW}⚠ $1${NC}"
}

# 打印错误信息
print_error() {
    echo -e "${RED}✗ $1${NC}"
}

# 主函数
main() {
    print_title "StoryWeaver AI - SDK配置修复"
    
    echo
    print_warning "此脚本将通过Git命令行更新Hugging Face Spaces配置"
    print_warning "将SDK从Docker更改为Static HTML，解决503错误"
    echo
    
    # 检查Git
    if ! command -v git &> /dev/null; then
        print_error "Git未安装，请先安装Git"
        exit 1
    fi
    
    # 创建临时目录
    TEMP_DIR=$(mktemp -d)
    print_warning "创建临时目录: $TEMP_DIR"
    
    # 克隆Space仓库
    print_title "克隆Hugging Face Space仓库"
    cd "$TEMP_DIR"
    
    if ! git clone https://huggingface.co/spaces/cobbrocks/Storyweaver; then
        print_error "克隆失败，请检查网络连接和权限"
        rm -rf "$TEMP_DIR"
        exit 1
    fi
    
    cd Storyweaver
    print_success "克隆成功"
    
    # 备份现有文件
    print_title "备份现有文件"
    if [ -f "README.md" ]; then
        cp README.md README.md.backup
        print_success "已备份README.md"
    fi
    
    # 创建新的README.md
    print_title "创建新的README.md配置文件"
    
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

# StoryWeaver AI - 智能需求拆解平台

基于React + TypeScript + Vite构建的智能需求拆解平台，支持多种LLM模型进行需求分析和优化。

## 功能特点

- **智能文档解析**：支持 .docx, .pdf, .md, .txt 格式
- **LLM优化**：集成12种大语言模型，包括国内大模型
- **可视化**：用户故事地图、质量分析图表
- **导出功能**：CSV、Markdown导出
- **配置灵活**：支持模型选择、API Key配置

## 技术栈

- **前端框架**：React 18 + TypeScript
- **构建工具**：Vite 6
- **UI组件**：Radix UI + Tailwind CSS
- **状态管理**：React Context + useState
- **文档解析**：Mammoth (DOCX) + PDF.js (PDF) + marked (MD)

## 模型支持

### 国内大模型
- 火山 Coding Plan
- Minimax Coding Plan  
- GLM Coding Plan
- Kimi
- DeepSeek
- 豆包

### 国外模型
- OpenAI (GPT-4o, GPT-4o Mini)
- Claude 3 (Haiku, Sonnet, Opus)
- Google Gemini (1.5 Flash, 1.5 Pro)

## 部署

本项目部署在Hugging Face Spaces上，使用Static HTML SDK。

## 许可证

MIT License
EOF

    print_success "README.md创建成功"
    
    # 显示配置内容
    print_title "配置内容预览"
    echo
    head -10 README.md
    echo
    
    # 提交更改
    print_title "提交更改到Git"
    
    git add README.md
    git commit -m "更新SDK配置为Static HTML，解决503错误

- 将sdk从docker更改为static
- 添加app_build_command: npm run build
- 添加app_file: index.html
- 更新项目说明文档"
    
    print_success "提交成功"
    
    # 推送到远程
    print_title "推送到Hugging Face"
    print_warning "正在推送配置更改..."
    
    if git push; then
        print_success "推送成功！"
    else
        print_error "推送失败，请检查权限和网络连接"
        print_warning "您可能需要使用SSH密钥或提供用户名/密码"
        cd "$OLDPWD"
        rm -rf "$TEMP_DIR"
        exit 1
    fi
    
    # 清理
    cd "$OLDPWD"
    rm -rf "$TEMP_DIR"
    
    # 完成
    print_title "配置更新完成！"
    
    echo
    print_success "✅ Hugging Face Spaces SDK配置已更新"
    echo
    echo "📋 更新内容："
    echo "  • SDK: Docker → Static HTML"
    echo "  • App build command: npm run build"
    echo "  • App file: index.html"
    echo
    echo "⏱️  等待部署完成..."
    echo "  通常需要1-2分钟"
    echo
    echo "🔗 访问地址："
    echo "  https://cobbrocks-storyweaver.hf.space"
    echo
    echo "📝 验证部署："
    echo "  1. 等待2分钟后访问上述链接"
    echo "  2. 检查页面是否正常加载"
    echo "  3. 运行 ./validate-deployment.sh 验证"
    echo
    print_warning "如果遇到问题，请查看FIND_CONFIG_GUIDE.md获取帮助"
}

# 运行主函数
main
