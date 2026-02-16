import requests
import time

# 测试 1: 页面加载时间
print("=== 测试 1: 页面加载时间 ===")
try:
    start_time = time.time()
    response = requests.get("http://localhost:5173/")
    load_time = (time.time() - start_time) * 1000
    print(f"✅ 页面加载时间: {load_time:.2f}ms")
    print(f"   状态码: {response.status_code}")
    print(f"   响应内容长度: {len(response.text)} 字节")
except Exception as e:
    print(f"❌ 页面加载时间测试失败: {e}")

# 测试 2: 并发请求
print("\n=== 测试 2: 并发请求 ===")
try:
    start_time = time.time()
    responses = []
    for i in range(10):
        responses.append(requests.get("http://localhost:5173/"))
    total_time = (time.time() - start_time) * 1000
    average_time = total_time / 10
    print(f"✅ 并发请求测试成功")
    print(f"   总时间: {total_time:.2f}ms")
    print(f"   平均时间: {average_time:.2f}ms")
    print(f"   成功率: {len([r for r in responses if r.status_code == 200]) / len(responses) * 100:.0f}%")
except Exception as e:
    print(f"❌ 并发请求测试失败: {e}")

# 测试 3: 网络延迟
print("\n=== 测试 3: 网络延迟 ===")
try:
    start_time = time.time()
    response = requests.get("http://localhost:5173/")
    network_time = (time.time() - start_time) * 1000
    print(f"✅ 网络延迟测试成功")
    print(f"   网络延迟: {network_time:.2f}ms")
    print(f"   状态码: {response.status_code}")
except Exception as e:
    print(f"❌ 网络延迟测试失败: {e}")