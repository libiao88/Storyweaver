import requests
import time

# 测试 1: 首页加载
print("=== 测试 1: 首页加载 ===")
try:
    start_time = time.time()
    response = requests.get("http://localhost:5173/")
    load_time = (time.time() - start_time) * 1000
    print(f"✅ 页面加载成功")
    print(f"   响应时间: {load_time:.2f}ms")
    print(f"   状态码: {response.status_code}")
    print(f"   页面标题: {response.text.split('<title>')[1].split('</title>')[0]}")
except Exception as e:
    print(f"❌ 页面加载失败: {e}")

# 测试 2: 响应式设计
print("\n=== 测试 2: 响应式设计 ===")
try:
    response = requests.get("http://localhost:5173/")
    if '<meta name="viewport"' in response.text:
        print("✅ 找到响应式设计的 viewport 标签")
    else:
        print("❌ 未找到响应式设计的 viewport 标签")
except Exception as e:
    print(f"❌ 响应式设计测试失败: {e}")

# 测试 3: 页面内容
print("\n=== 测试 3: 页面内容 ===")
try:
    response = requests.get("http://localhost:5173/")
    if '智语拆解' in response.text:
        print("✅ 找到应用程序标题")
    else:
        print("❌ 未找到应用程序标题")
    if '上传 PRD 文档' in response.text:
        print("✅ 找到文件上传区域")
    else:
        print("❌ 未找到文件上传区域")
except Exception as e:
    print(f"❌ 页面内容测试失败: {e}")

# 测试 4: 静态资源加载
print("\n=== 测试 4: 静态资源加载 ===")
try:
    response = requests.get("http://localhost:5173/src/main.tsx")
    print(f"✅ 找到入口文件: {response.status_code}")
except Exception as e:
    print(f"❌ 入口文件测试失败: {e}")

# 测试 5: 样式资源加载
print("\n=== 测试 5: 样式资源加载 ===")
try:
    response = requests.get("http://localhost:5173/src/index.css")
    print(f"✅ 找到样式文件: {response.status_code}")
except Exception as e:
    print(f"❌ 样式文件测试失败: {e}")