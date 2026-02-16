#!/bin/bash

# StoryWeaver AI - 项目测试脚本

echo "=== StoryWeaver AI 项目测试 ==="
echo "项目路径: /Users/cobbli/Desktop/storyweaver"
echo "================================="

# 检查 Node.js 和 npm
echo -e "\n1. 检查 Node.js 和 npm 版本"
node -v
npm -v

# 检查依赖是否已安装
echo -e "\n2. 检查项目依赖"
if [ ! -d "node_modules" ]; then
    echo "依赖未安装，正在安装..."
    npm install
else
    echo "依赖已安装"
fi

# 构建项目
echo -e "\n3. 构建项目"
npm run build

# 检查构建是否成功
if [ $? -eq 0 ]; then
    echo "✅ 项目构建成功！"
    
    # 检查构建产物
    echo -e "\n4. 验证构建产物"
    if [ -d "dist" ]; then
        echo "dist 目录存在"
        ls -la dist/
    else
        echo "❌ dist 目录不存在"
        exit 1
    fi
    
    # 启动开发服务器（后台运行）
    echo -e "\n5. 启动开发服务器"
    npm run dev &
    DEV_SERVER_PID=$!
    
    # 等待服务器启动
    echo "等待服务器启动..."
    sleep 5
    
    # 检查服务器是否响应
    echo -e "\n6. 验证服务器响应"
    curl -I -s http://localhost:5173 > /dev/null
    if [ $? -eq 0 ]; then
        echo "✅ 开发服务器正常响应"
        
        # 关闭服务器
        echo -e "\n7. 关闭开发服务器"
        kill $DEV_SERVER_PID 2>/dev/null
        if [ $? -eq 0 ]; then
            echo "服务器已关闭"
        else
            # 如果之前的 kill 失败，尝试使用 pkill
            pkill -f "vite" 2>/dev/null
            echo "服务器已关闭"
        fi
    else
        echo "❌ 无法连接到开发服务器"
        kill $DEV_SERVER_PID 2>/dev/null
        exit 1
    fi
    
    echo -e "\n✅ 所有测试通过！项目能正常运行。"
    echo -e "\n📦 构建产物位于 dist/ 目录"
    echo -e "🚀 开发服务器可通过 npm run dev 启动"
    echo -e "🌐 访问地址: http://localhost:5173"
else
    echo "❌ 项目构建失败"
    exit 1
fi
