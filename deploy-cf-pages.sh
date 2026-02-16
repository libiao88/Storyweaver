#!/bin/bash

# StoryWeaver AI - Cloudflare Pages 部署脚本
# 自动部署到 Cloudflare Pages

set -e

# 颜色输出
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'  # No Color

print_title() {
    echo -e "${BLUE}"
    echo "====================================="
    echo "  $1"
    echo "====================================="
    echo -e "${NC}"
}

print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

check_command() {
    if ! command -v "$1" &> /dev/null; then
        print_error "命令 $1 未找到"
        return 1
    fi
    return 0
}

# 主函数
main() {
    print_title "StoryWeaver AI - Cloudflare Pages 部署"
    
    echo
    print_warning "此脚本将帮助您部署到 Cloudflare Pages"
    echo
    
    # 检查 Node.js 和 npm
    check_command "node" || exit 1
    check_command "npm" || exit 1
    
    # 检查 Wrangler CLI
    if ! command -v wrangler &> /dev/null; then
        print_warning "未安装 Wrangler CLI，正在安装..."
        npm install -g wrangler
    fi
    
    # 构建项目
    print_title "构建项目"
    npm run build
    print_success "构建成功"
    
    # 检查 dist 目录
    if [ ! -d "dist" ]; then
        print_error "dist 目录不存在"
        exit 1
    fi
    
    # 检查 dist/index.html
    if [ ! -f "dist/index.html" ]; then
        print_error "dist/index.html 不存在"
        exit 1
    fi
    
    print_success "构建产物检查完成"
    
    # 部署到 Cloudflare Pages
    print_title "部署到 Cloudflare Pages"
    print_warning "正在部署..."
    
    if wrangler pages deploy dist --project-name storyweaver-ai; then
        print_success "部署成功！"
        echo
        echo "🎉 StoryWeaver AI 已成功部署到 Cloudflare Pages！"
        echo
        echo "🔗 访问地址："
        echo "  https://storyweaver-ai.pages.dev"
        echo
        echo "💡 提示："
        echo "  - 部署可能需要几分钟才能在全球生效"
        echo "  - 可以通过 Cloudflare Dashboard 查看部署状态"
        echo "  - 后续提交代码将自动触发重新部署"
        echo
    else
        print_error "部署失败"
        print_warning "请检查："
        print_warning "  1. 是否已登录 Wrangler（运行: wrangler login）"
        print_warning "  2. Cloudflare 账户权限"
        print_warning "  3. 网络连接"
        exit 1
    fi
}

main