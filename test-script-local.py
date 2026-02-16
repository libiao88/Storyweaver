import requests
import time

# TC-001: 首页加载
print("=== TC-001: 首页加载 ===")
try:
    start_time = time.time()
    response = requests.get("http://localhost:5174/", timeout=30)
    load_time = (time.time() - start_time) * 1000
    
    print(f"HTTP状态码: {response.status_code}")
    print(f"页面加载时间: {load_time:.2f}ms")
    print(f"页面标题: {response.text.split('<title>')[1].split('</title>')[0]}")
    
    # 检查是否显示标题
    if "智语拆解" in response.text:
        print("页面主标题: 智语拆解 StoryWeaver AI")
    elif "需求拆解" in response.text:
        print("页面主标题: 需求拆解平台")
    else:
        print("页面主标题: 未找到")
    
    # 检查是否有404错误
    has_404 = "404" in response.text or "Not Found" in response.text
    print(f"是否有404错误: {has_404}")
    
    # 检查资源加载
    has_css = "<link rel=" in response.text
    has_js = "<script" in response.text
    print(f"CSS资源加载: {has_css}")
    print(f"JS资源加载: {has_js}")
    
except Exception as e:
    print(f"测试失败: {e}")

# TC-002: 响应式设计 - 检查是否有响应式相关的标签
print("\n=== TC-002: 响应式设计 ===")
try:
    response = requests.get("http://localhost:5174/", timeout=30)
    
    # 检查viewport meta标签
    has_viewport = '<meta name="viewport"' in response.text
    print(f"Viewport标签: {has_viewport}")
    
    # 检查是否有响应式相关的CSS类
    has_responsive_css = "container" in response.text or "grid" in response.text or "flex" in response.text
    print(f"响应式CSS类: {has_responsive_css}")
    
except Exception as e:
    print(f"测试失败: {e}")

# TC-003: Tab导航 - 检查是否有Tab相关的元素
print("\n=== TC-003: Tab导航 ===")
try:
    response = requests.get("http://localhost:5174/", timeout=30)
    
    # 检查是否有Tab相关的元素
    has_tabs = 'role="tab"' in response.text or "tab" in response.text.lower()
    print(f"Tab元素: {has_tabs}")
    
    # 检查具体的Tab内容
    if has_tabs:
        print("Tab内容:")
        if "上传" in response.text:
            print("- 上传Tab")
        if "故事" in response.text:
            print("- 故事Tab")
        if "地图" in response.text:
            print("- 地图Tab")
        if "审计" in response.text:
            print("- 审计Tab")
        if "API" in response.text:
            print("- API Tab")
        if "分析" in response.text:
            print("- 分析Tab")
        if "配置" in response.text:
            print("- 配置Tab")
    
except Exception as e:
    print(f"测试失败: {e}")

# TC-004: 文件选择 - 检查是否有文件上传相关的元素
print("\n=== TC-004: 文件选择 ===")
try:
    response = requests.get("http://localhost:5174/", timeout=30)
    
    # 检查是否有文件上传相关的元素
    has_file_input = '<input type="file"' in response.text
    print(f"文件上传输入框: {has_file_input}")
    
    # 检查是否有选择文件按钮
    has_select_button = "选择文件" in response.text or "上传" in response.text
    print(f"选择文件按钮: {has_select_button}")
    
except Exception as e:
    print(f"测试失败: {e}")

# TC-005: 文件格式验证 - 检查是否有文件格式验证相关的代码
print("\n=== TC-005: 文件格式验证 ===")
try:
    response = requests.get("http://localhost:5174/", timeout=30)
    
    # 检查是否有文件格式验证相关的代码
    has_format_validation = "不支持的文件格式" in response.text or "文件格式" in response.text
    print(f"文件格式验证提示: {has_format_validation}")
    
except Exception as e:
    print(f"测试失败: {e}")

# TC-006: 文件大小验证 - 检查是否有文件大小限制相关的代码
print("\n=== TC-006: 文件大小验证 ===")
try:
    response = requests.get("http://localhost:5174/", timeout=30)
    
    # 检查是否有文件大小限制相关的代码
    has_size_validation = "MB" in response.text or "文件大小" in response.text or "大小限制" in response.text
    print(f"文件大小限制提示: {has_size_validation}")
    
except Exception as e:
    print(f"测试失败: {e}")

# 打印页面内容的前500个字符以帮助调试
print("\n=== 页面内容前500个字符 ===")
try:
    response = requests.get("http://localhost:5174/", timeout=30)
    print(response.text[:500])
except Exception as e:
    print(f"获取页面内容失败: {e}")

print("\n=== 测试执行完成 ===")