import requests
import time

# 测试 1: 页面标题
print("=== 测试 1: 页面标题 ===")
try:
    response = requests.get("http://localhost:5173/")
    if '<title>' in response.text and '</title>' in response.text:
        print(f"✅ 页面标题: {response.text.split('<title>')[1].split('</title>')[0]}")
    else:
        print("❌ 未找到页面标题")
except Exception as e:
    print(f"❌ 页面标题测试失败: {e}")

# 测试 2: 页面描述
print("\n=== 测试 2: 页面描述 ===")
try:
    response = requests.get("http://localhost:5173/")
    if '<meta name="description"' in response.text:
        description = response.text.split('<meta name="description" content="')[1].split('">')[0]
        print(f"✅ 页面描述: {description}")
    else:
        print("❌ 未找到页面描述")
except Exception as e:
    print(f"❌ 页面描述测试失败: {e}")

# 测试 3: 页面关键词
print("\n=== 测试 3: 页面关键词 ===")
try:
    response = requests.get("http://localhost:5173/")
    if '<meta name="keywords"' in response.text:
        keywords = response.text.split('<meta name="keywords" content="')[1].split('">')[0]
        print(f"✅ 页面关键词: {keywords}")
    else:
        print("❌ 未找到页面关键词")
except Exception as e:
    print(f"❌ 页面关键词测试失败: {e}")

# 测试 4: 页面导航
print("\n=== 测试 4: 页面导航 ===")
try:
    response = requests.get("http://localhost:5173/")
    if '<nav' in response.text and '</nav>' in response.text:
        print("✅ 页面导航: 找到导航栏")
    else:
        print("❌ 页面导航: 未找到导航栏")
except Exception as e:
    print(f"❌ 页面导航测试失败: {e}")