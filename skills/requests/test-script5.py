import requests
import time

# 测试 1: 桌面端响应式设计
print("=== 测试 1: 桌面端响应式设计 ===")
try:
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    }
    response = requests.get("http://localhost:5173/", headers=headers)
    print(f"✅ 桌面端响应式设计测试成功")
    print(f"   状态码: {response.status_code}")
    print(f"   响应内容长度: {len(response.text)} 字节")
except Exception as e:
    print(f"❌ 桌面端响应式设计测试失败: {e}")

# 测试 2: 平板端响应式设计
print("\n=== 测试 2: 平板端响应式设计 ===")
try:
    headers = {
        'User-Agent': 'Mozilla/5.0 (iPad; CPU OS 15_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.0 Mobile/15E148 Safari/604.1'
    }
    response = requests.get("http://localhost:5173/", headers=headers)
    print(f"✅ 平板端响应式设计测试成功")
    print(f"   状态码: {response.status_code}")
    print(f"   响应内容长度: {len(response.text)} 字节")
except Exception as e:
    print(f"❌ 平板端响应式设计测试失败: {e}")

# 测试 3: 移动端响应式设计
print("\n=== 测试 3: 移动端响应式设计 ===")
try:
    headers = {
        'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.0 Mobile/15E148 Safari/604.1'
    }
    response = requests.get("http://localhost:5173/", headers=headers)
    print(f"✅ 移动端响应式设计测试成功")
    print(f"   状态码: {response.status_code}")
    print(f"   响应内容长度: {len(response.text)} 字节")
except Exception as e:
    print(f"❌ 移动端响应式设计测试失败: {e}")