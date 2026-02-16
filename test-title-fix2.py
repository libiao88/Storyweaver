import requests
import time

# 测试修复后的页面标题
print("=== 测试页面标题修复 ===")
try:
    response = requests.get("http://localhost:5173/", timeout=30)
    response.encoding = "utf-8"  # 设置编码格式
    page_title = response.text.split('<title>')[1].split('</title>')[0]
    print(f"页面标题: {page_title}")
    
    if page_title == "智语拆解 StoryWeaver AI":
        print("✅ 页面标题修复成功")
    else:
        print("❌ 页面标题修复失败")
        
except Exception as e:
    print(f"测试失败: {e}")

# 测试其他功能
print("\n=== 测试其他功能 ===")
try:
    response = requests.get("http://localhost:5173/", timeout=30)
    response.encoding = "utf-8"
    
    # 检查是否有智语拆解标题
    has_zhiyu_title = "智语拆解" in response.text
    print(f"是否显示智语拆解标题: {has_zhiyu_title}")
    
    # 检查是否有响应式设计
    has_viewport = '<meta name="viewport"' in response.text
    print(f"是否有响应式Viewport标签: {has_viewport}")
    
    # 检查是否有Tab导航相关代码
    has_tabs = "TabsList" in response.text or "TabsTrigger" in response.text
    print(f"是否有Tab导航相关代码: {has_tabs}")
    
    # 检查是否有文件上传相关代码
    has_file_upload = "FileUpload" in response.text or "选择文件" in response.text
    print(f"是否有文件上传相关代码: {has_file_upload}")
    
except Exception as e:
    print(f"测试失败: {e}")

print("\n=== 测试完成 ===")