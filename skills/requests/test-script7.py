import requests
import time

# 测试 1: 安全头
print("=== 测试 1: 安全头 ===")
try:
    response = requests.get("http://localhost:5173/")
    security_headers = [
        'X-Frame-Options',
        'X-Content-Type-Options',
        'X-XSS-Protection',
        'Strict-Transport-Security',
        'Content-Security-Policy'
    ]
    for header in security_headers:
        if header in response.headers:
            print(f"✅ 找到安全头: {header}")
        else:
            print(f"❌ 未找到安全头: {header}")
except Exception as e:
    print(f"❌ 安全头测试失败: {e}")

# 测试 2: CORS 策略
print("\n=== 测试 2: CORS 策略 ===")
try:
    response = requests.get("http://localhost:5173/")
    if 'Access-Control-Allow-Origin' in response.headers:
        print(f"✅ 找到 CORS 策略: {response.headers['Access-Control-Allow-Origin']}")
    else:
        print("❌ 未找到 CORS 策略")
except Exception as e:
    print(f"❌ CORS 策略测试失败: {e}")

# 测试 3: 响应头
print("\n=== 测试 3: 响应头 ===")
try:
    response = requests.get("http://localhost:5173/")
    print(f"✅ 响应头测试成功")
    print(f"   响应头: {list(response.headers.keys())}")
except Exception as e:
    print(f"❌ 响应头测试失败: {e}")