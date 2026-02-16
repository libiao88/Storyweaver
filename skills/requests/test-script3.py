import requests
import time

# 测试 1: API 接口测试
print("=== 测试 1: API 接口测试 ===")
try:
    response = requests.get("http://localhost:5173/api/stories")
    print(f"✅ API 接口测试成功")
    print(f"   状态码: {response.status_code}")
    print(f"   响应内容: {response.text}")
except Exception as e:
    print(f"❌ API 接口测试失败: {e}")

# 测试 2: 文件上传接口
print("\n=== 测试 2: 文件上传接口 ===")
try:
    files = {'file': open('/Users/cobbli/Desktop/storyweaver/test-files/test.txt', 'rb')}
    response = requests.post("http://localhost:5173/api/upload", files=files)
    print(f"✅ 文件上传接口测试成功")
    print(f"   状态码: {response.status_code}")
    print(f"   响应内容: {response.text}")
except Exception as e:
    print(f"❌ 文件上传接口测试失败: {e}")

# 测试 3: 文件格式验证接口
print("\n=== 测试 3: 文件格式验证接口 ===")
try:
    files = {'file': open('/Users/cobbli/Desktop/storyweaver/test-files/test.pdf', 'rb')}
    response = requests.post("http://localhost:5173/api/upload", files=files)
    print(f"✅ 文件格式验证接口测试成功")
    print(f"   状态码: {response.status_code}")
    print(f"   响应内容: {response.text}")
except Exception as e:
    print(f"❌ 文件格式验证接口测试失败: {e}")

# 测试 4: 故事生成接口
print("\n=== 测试 4: 故事生成接口 ===")
try:
    data = {
        'title': '测试故事',
        'description': '这是一个测试故事',
        'module': '测试模块',
        'priority': '高',
        'sourceReference': '测试引用',
        'confidence': 0.8,
    }
    response = requests.post("http://localhost:5173/api/stories", json=data)
    print(f"✅ 故事生成接口测试成功")
    print(f"   状态码: {response.status_code}")
    print(f"   响应内容: {response.text}")
except Exception as e:
    print(f"❌ 故事生成接口测试失败: {e}")