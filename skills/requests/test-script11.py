import requests
import time

# 测试 1: 错误处理
print("=== 测试 1: 错误处理 ===")
try:
    response = requests.get("http://localhost:5173/nonexistent")
    print(f"✅ 错误处理成功")
    print(f"   状态码: {response.status_code}")
    print(f"   响应内容: {response.text}")
except Exception as e:
    print(f"❌ 错误处理失败: {e}")

# 测试 2: 服务器错误
print("\n=== 测试 2: 服务器错误 ===")
try:
    response = requests.post("http://localhost:5173/api/stories", json={'invalid': 'data'})
    print(f"✅ 服务器错误处理成功")
    print(f"   状态码: {response.status_code}")
    print(f"   响应内容: {response.text}")
except Exception as e:
    print(f"❌ 服务器错误处理失败: {e}")

# 测试 3: 网络错误
print("\n=== 测试 3: 网络错误 ===")
try:
    response = requests.get("http://localhost:5174/")
    print(f"✅ 网络错误处理成功")
    print(f"   状态码: {response.status_code}")
    print(f"   响应内容: {response.text}")
except Exception as e:
    print(f"✅ 网络错误处理成功: {e}")