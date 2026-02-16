#!/bin/bash

# StoryWeaver AI 部署脚本
# 部署到 Hugging Face Spaces 和 Supabase

set -e  # 遇到错误立即停止

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

# 检查命令是否存在
check_command() {
    if ! command -v "$1" &> /dev/null; then
        print_error "命令 $1 未找到"
        return 1
    fi
    return 0
}

# 检查Git状态
check_git_status() {
    print_title "检查Git状态"
    
    if [ -n "$(git status --porcelain)" ]; then
        print_warning "Git工作区有未提交的更改"
        echo "当前状态:"
        git status
        
        read -p "是否继续部署? (y/N): " -n 1 -r
        echo
        
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            print_error "部署已取消"
            exit 1
        fi
    else
        print_success "Git工作区清洁"
    fi
    
    print_success "Git状态检查完成"
}

# 安装依赖
install_dependencies() {
    print_title "安装项目依赖"
    
    if [ ! -d "node_modules" ]; then
        print_warning "node_modules 不存在，正在安装依赖..."
        npm install
    else
        print_success "依赖已存在"
    fi
}

# 构建项目
build_project() {
    print_title "构建项目"
    
    print_warning "执行生产构建..."
    npm run build
    
    if [ $? -eq 0 ]; then
        print_success "构建成功"
    else
        print_error "构建失败"
        exit 1
    fi
}

# 检查构建产物
check_build_artifacts() {
    print_title "检查构建产物"
    
    if [ ! -d "dist" ]; then
        print_error "dist 目录不存在"
        exit 1
    fi
    
    if [ ! -f "dist/index.html" ]; then
        print_error "dist/index.html 不存在"
        exit 1
    fi
    
    if [ ! -d "dist/assets" ]; then
        print_error "dist/assets 目录不存在"
        exit 1
    fi
    
    print_success "构建产物检查完成"
}

# 部署到Hugging Face Spaces
deploy_to_huggingface() {
    print_title "部署到Hugging Face Spaces"
    
    # 检查是否安装了huggingface-hub CLI
    if ! command -v hf &> /dev/null && ! command -v huggingface-cli &> /dev/null; then
        print_warning "未找到Hugging Face CLI，尝试安装..."
        pip3 install --user huggingface-hub
        if [ $? -ne 0 ]; then
            print_error "Hugging Face CLI 安装失败"
            print_warning "您可以手动安装: pip3 install huggingface-hub"
            print_warning "或者使用 Hugging Face Hub 网页界面进行部署"
            read -p "是否继续部署? (y/N): " -n 1 -r
            echo
            
            if [[ ! $REPLY =~ ^[Yy]$ ]]; then
                print_error "部署已取消"
                exit 1
            fi
        fi
    fi
    
    # 检查Hugging Face令牌
    if [ -z "$HUGGING_FACE_HUB_TOKEN" ]; then
        print_warning "HUGGING_FACE_HUB_TOKEN 环境变量未设置"
        print_warning "您可以在 https://huggingface.co/settings/tokens 生成新令牌"
        print_warning "然后运行: export HUGGING_FACE_HUB_TOKEN=your_token"
        
        read -p "是否继续部署? (y/N): " -n 1 -r
        echo
        
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            print_error "部署已取消"
            exit 1
        fi
    fi
    
    print_success "Hugging Face Spaces 部署准备完成"
    print_warning "当前脚本不直接执行Hugging Face Spaces部署"
    print_warning "请访问以下链接进行部署:"
    echo "  https://huggingface.co/spaces/cobbrocks/Storyweaver"
    print_warning "或者使用huggingface-cli命令行工具"
}

# 部署到Supabase
deploy_to_supabase() {
    print_title "部署到Supabase"
    
    # 检查是否安装了Supabase CLI
    if ! command -v supabase &> /dev/null; then
        print_warning "未找到Supabase CLI"
        print_warning "您可以通过以下方式安装:"
        print_warning "  - macOS: brew install supabase/tap/supabase"
        print_warning "  - 其他系统: https://supabase.com/docs/guides/cli/getting-started"
        
        read -p "是否继续部署? (y/N): " -n 1 -r
        echo
        
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            print_error "部署已取消"
            exit 1
        fi
    fi
    
    # 检查Supabase配置
    if [ ! -d "supabase" ]; then
        print_error "supabase 目录不存在"
        exit 1
    fi
    
    if [ ! -f "supabase/init.sql" ]; then
        print_error "supabase/init.sql 不存在"
        exit 1
    fi
    
    print_success "Supabase 部署准备完成"
    print_warning "当前脚本不直接执行Supabase部署"
    print_warning "请访问以下链接进行部署:"
    echo "  https://supabase.com/dashboard/project/dqmwpihbwggsjwmpktmo"
    print_warning "或者使用Supabase CLI命令行工具"
}

# 显示部署信息
show_deployment_info() {
    print_title "部署完成"
    
    echo
    echo "🎉 StoryWeaver AI 部署准备完成！"
    echo
    echo "📋 部署步骤："
    echo "1. **Hugging Face Spaces**:"
    echo "   - 访问: https://huggingface.co/spaces/cobbrocks/Storyweaver"
    echo "   - 点击 \"Settings\""
    echo "   - 在 \"Files and versions\" 部分上传 build 后的文件"
    echo "   - 或者使用 Hugging Face Hub CLI 进行部署"
    echo
    echo "2. **Supabase**:"
    echo "   - 访问: https://supabase.com/dashboard/project/dqmwpihbwggsjwmpktmo"
    echo "   - 在 SQL Editor 中执行 supabase/init.sql 文件"
    echo "   - 配置 Storage 和 Real-time 功能"
    echo "   - 设置环境变量"
    echo
    echo "💡 提示："
    echo "   - 确保所有环境变量正确配置"
    echo "   - 测试应用程序功能"
    echo "   - 监控部署过程"
    echo
}

# 主函数
main() {
    echo -e "${BLUE}🚀 StoryWeaver AI 部署脚本${NC}"
    echo -e "${BLUE}===============================${NC}"
    echo
    
    # 检查依赖
    check_command "node" || exit 1
    check_command "npm" || exit 1
    check_command "git" || exit 1
    
    # 执行部署流程
    check_git_status
    install_dependencies
    build_project
    check_build_artifacts
    deploy_to_huggingface
    deploy_to_supabase
    show_deployment_info
    
    print_success "部署脚本执行完成！"
}

# 脚本入口
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    main "$@"
fi
