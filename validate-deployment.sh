#!/bin/bash

# StoryWeaver AI 部署验证脚本
# 用于检查应用程序部署状态和功能

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

# 检查命令是否存在
check_command() {
    if ! command -v "$1" &> /dev/null; then
        print_error "命令 $1 未找到"
        return 1
    fi
    return 0
}

# 检查Hugging Face Spaces访问
check_huggingface() {
    print_title "检查Hugging Face Spaces访问"
    
    if check_command "curl"; then
        print_warning "测试访问 https://cobbrocks-storyweaver.hf.space"
        
        # 测试访问
        response=$(curl -s -o /dev/null -w "%{http_code}" "https://cobbrocks-storyweaver.hf.space")
        
        if [ "$response" -eq 200 ]; then
            print_success "Hugging Face Spaces 访问成功"
            return 0
        elif [ "$response" -eq 503 ]; then
            print_warning "Hugging Face Spaces 返回 503 服务不可用"
            print_warning "可能是SDK配置不正确，需要在网页界面上更改为Static HTML"
            return 1
        elif [ "$response" -eq 404 ]; then
            print_error "Hugging Face Spaces 未找到"
            return 1
        else
            print_error "Hugging Face Spaces 访问失败，状态码: $response"
            return 1
        fi
    else
        print_warning "curl 命令未找到，无法测试访问"
        return 1
    fi
}

# 检查Supabase连接
check_supabase() {
    print_title "检查Supabase连接"
    
    # 检查环境变量文件
    if [ ! -f ".env" ]; then
        print_error ".env 文件不存在"
        return 1
    fi
    
    # 检查环境变量内容
    local supabase_url=$(grep -E 'VITE_SUPABASE_URL=' .env | cut -d '=' -f 2)
    local supabase_anon_key=$(grep -E 'VITE_SUPABASE_ANON_KEY=' .env | cut -d '=' -f 2)
    
    if [ -z "$supabase_url" ]; then
        print_error "VITE_SUPABASE_URL 未配置"
        return 1
    fi
    
    if [ -z "$supabase_anon_key" ] || [ "$supabase_anon_key" = "your-supabase-anon-key-here" ]; then
        print_error "VITE_SUPABASE_ANON_KEY 未配置"
        return 1
    fi
    
    print_success "Supabase URL: $supabase_url"
    
    # 测试Supabase API连接
    if check_command "curl"; then
        local api_url="${supabase_url}/rest/v1/"
        print_warning "测试Supabase API连接: $api_url"
        
        response=$(curl -s -o /dev/null -w "%{http_code}" -H "apikey: $supabase_anon_key" \
            -H "Authorization: Bearer $supabase_anon_key" "$api_url")
        
        if [ "$response" -eq 200 ]; then
            print_success "Supabase API 连接成功"
            return 0
        elif [ "$response" -eq 401 ]; then
            print_error "Supabase API 未授权，请检查匿名密钥"
            return 1
        else
            print_error "Supabase API 连接失败，状态码: $response"
            return 1
        fi
    fi
}

# 检查项目文件
check_project_files() {
    print_title "检查项目文件"
    
    if [ ! -d "dist" ]; then
        print_error "dist 目录不存在，项目未构建"
        return 1
    fi
    
    if [ ! -f "dist/index.html" ]; then
        print_error "dist/index.html 不存在，项目构建失败"
        return 1
    fi
    
    if [ ! -d "supabase" ]; then
        print_error "supabase 目录不存在"
        return 1
    fi
    
    if [ ! -f "supabase/init.sql" ]; then
        print_error "supabase/init.sql 不存在"
        return 1
    fi
    
    print_success "项目文件检查完成"
}

# 显示部署指南
show_deployment_guide() {
    print_title "部署指南"
    
    echo
    echo "📋 部署步骤："
    echo "1. **Hugging Face Spaces SDK配置：**"
    echo "   - 访问: https://huggingface.co/spaces/cobbrocks/Storyweaver"
    echo "   - 点击 \"Settings\""
    echo "   - 在 \"SDK and hardware\" 部分将SDK更改为 \"Static HTML\""
    echo "   - 确保 App build command 为 npm run build"
    echo "   - 确保 App file 为 index.html"
    echo "   - 点击 \"Save changes\""
    echo
    echo "2. **Supabase配置：**"
    echo "   - 访问: https://supabase.com/dashboard/project/dqmwpihbwggsjwmpktmo"
    echo "   - 点击 \"Settings\" → \"API\""
    echo "   - 复制 Project URL 和 anon key"
    echo "   - 更新 .env 文件中的 VITE_SUPABASE_URL 和 VITE_SUPABASE_ANON_KEY"
    echo "   - 点击 \"SQL Editor\" → 执行 supabase/init.sql 脚本"
    echo
    echo "3. **Storage和Real-time配置：**"
    echo "   - 在Supabase控制台中，点击 \"Storage\" 并创建存储桶"
    echo "   - 点击 \"Database\" → \"Replication\" 启用实时功能"
    echo
    echo "💡 部署完成后，重新运行此脚本来验证"
}

# 主函数
main() {
    echo -e "${BLUE}🚀 StoryWeaver AI 部署验证脚本${NC}"
    echo -e "${BLUE}===============================${NC}"
    echo
    
    # 检查依赖
    check_command "node" || exit 1
    check_command "npm" || exit 1
    
    # 执行检查
    check_project_files
    check_huggingface
    check_supabase
    
    echo
    print_title "部署验证完成"
    print_success "所有检查完成！"
    
    if check_huggingface && check_supabase; then
        print_success "🎉 部署成功！应用程序已可正常访问"
        echo "📱 访问地址：https://cobbrocks-storyweaver.hf.space"
    else
        print_warning "⚠ 部署尚未完成，需要完成剩余步骤"
        show_deployment_guide
    fi
}

# 脚本入口
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    main "$@"
fi
