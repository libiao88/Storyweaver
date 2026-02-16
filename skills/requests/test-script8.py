import requests
import time

# 测试 1: 浏览器兼容性
print("=== 测试 1: 浏览器兼容性 ===")
try:
    user_agents = [
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:120.0) Gecko/20100101 Firefox/120.0',
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 14_2) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.2 Safari/605.1.15',
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64; Trident/7.0; rv:11.0) like Gecko',
        'Mozilla/5.0 (Linux; Android 13; SM-G998B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36'
    ]
    for user_agent in user_agents:
        headers = {'User-Agent': user_agent}
        response = requests.get("http://localhost:5173/", headers=headers)
        print(f"✅ 浏览器兼容: {user_agent.split('(')[1].split(')')[0]}")
        print(f"   状态码: {response.status_code}")
        print(f"   响应内容长度: {len(response.text)} 字节")
        print()
except Exception as e:
    print(f"❌ 浏览器兼容性测试失败: {e}")

# 测试 2: 字符编码
print("\n=== 测试 2: 字符编码 ===")
try:
    response = requests.get("http://localhost:5173/")
    if 'charset' in response.headers.get('Content-Type', ''):
        print(f"✅ 字符编码: {response.headers['Content-Type'].split('charset=')[1]}")
    else:
        print("❌ 未找到字符编码")
except Exception as e:
    print(f"❌ 字符编码测试失败: {e}")

# 测试 3: 语言
print("\n=== 测试 3: 语言 ===")
try:
    response = requests.get("http://localhost:5173/")
    if 'Content-Language' in response.headers:
        print(f"✅ 语言: {response.headers['Content-Language']}")
    else:
        print("❌ 未找到语言")
except Exception as e:
    print(f"❌ 语言测试失败: {e}")