import requests
import time

# 测试 1: 页面加载
print("=== 测试 1: 页面加载 ===")
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

# 测试 2: 导航链接
print("\n=== 测试 2: 导航链接 ===")
try:
    response = requests.get("http://localhost:5173/")
    expected_links = ["首页", "产品功能", "关于我们", "联系我们"]
    for expected_link in expected_links:
        if expected_link in response.text:
            print(f"✅ 找到导航链接: {expected_link}")
        else:
            print(f"❌ 未找到导航链接: {expected_link}")
except Exception as e:
    print(f"❌ 导航链接测试失败: {e}")

# 测试 3: 文件上传
print("\n=== 测试 3: 文件上传 ===")
try:
    response = requests.get("http://localhost:5173/")
    if '<input type="file"' in response.text:
        print("✅ 找到文件上传按钮")
    else:
        print("❌ 未找到文件上传按钮")
except Exception as e:
    print(f"❌ 文件上传测试失败: {e}")

# 测试 4: 文件格式验证
print("\n=== 测试 4: 文件格式验证 ===")
try:
    response = requests.get("http://localhost:5173/")
    if '不支持' in response.text:
        print("✅ 找到文件格式验证提示")
    else:
        print("❌ 未找到文件格式验证提示")
except Exception as e:
    print(f"❌ 文件格式验证测试失败: {e}")

# 测试 5: 响应式设计
print("\n=== 测试 5: 响应式设计 ===")
try:
    response = requests.get("http://localhost:5173/")
    if '<meta name="viewport"' in response.text:
        print("✅ 找到响应式设计的 viewport 标签")
    else:
        print("❌ 未找到响应式设计的 viewport 标签")
except Exception as e:
    print(f"❌ 响应式设计测试失败: {e}")