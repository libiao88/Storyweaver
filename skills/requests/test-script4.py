import requests
import time

# 测试 1: 静态资源加载
print("=== 测试 1: 静态资源加载 ===")
try:
    start_time = time.time()
    response = requests.get("http://localhost:5173/src/main.tsx")
    load_time = (time.time() - start_time) * 1000
    print(f"✅ 入口文件加载成功")
    print(f"   响应时间: {load_time:.2f}ms")
    print(f"   状态码: {response.status_code}")
    print(f"   文件大小: {len(response.text)} 字节")
except Exception as e:
    print(f"❌ 入口文件加载失败: {e}")

# 测试 2: 样式资源加载
print("\n=== 测试 2: 样式资源加载 ===")
try:
    start_time = time.time()
    response = requests.get("http://localhost:5173/src/index.css")
    load_time = (time.time() - start_time) * 1000
    print(f"✅ 样式文件加载成功")
    print(f"   响应时间: {load_time:.2f}ms")
    print(f"   状态码: {response.status_code}")
    print(f"   文件大小: {len(response.text)} 字节")
except Exception as e:
    print(f"❌ 样式文件加载失败: {e}")

# 测试 3: 图片资源加载
print("\n=== 测试 3: 图片资源加载 ===")
try:
    start_time = time.time()
    response = requests.get("http://localhost:5173/src/assets/logo.png")
    load_time = (time.time() - start_time) * 1000
    print(f"✅ 图片文件加载成功")
    print(f"   响应时间: {load_time:.2f}ms")
    print(f"   状态码: {response.status_code}")
    print(f"   文件大小: {len(response.content)} 字节")
except Exception as e:
    print(f"❌ 图片文件加载失败: {e}")

# 测试 4: 其他静态资源
print("\n=== 测试 4: 其他静态资源 ===")
static_resources = [
    "/src/vite-env.d.ts",
    "/src/App.css",
    "/src/App.tsx",
    "/src/index.tsx",
]

for resource in static_resources:
    try:
        response = requests.get(f"http://localhost:5173{resource}")
        print(f"✅ {resource} 加载成功")
        print(f"   状态码: {response.status_code}")
        print(f"   文件大小: {len(response.text)} 字节")
    except Exception as e:
        print(f"❌ {resource} 加载失败: {e}")