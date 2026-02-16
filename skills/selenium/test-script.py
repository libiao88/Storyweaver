from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.chrome.options import Options
from webdriver_manager.chrome import ChromeDriverManager
import time

def run_tests():
    print("=== TC-001: 页面加载 ===")
    
    chrome_options = Options()
    chrome_options.add_argument('--headless')
    chrome_options.add_argument('--no-sandbox')
    chrome_options.add_argument('--disable-dev-shm-usage')
    
    try:
        driver = webdriver.Chrome(ChromeDriverManager().install(), options=chrome_options)
        
        # 导航到应用程序
        driver.get("http://localhost:5173/")
        
        # 等待页面加载
        wait = WebDriverWait(driver, 30)
        wait.until(EC.presence_of_element_located((By.TAG_NAME, 'h1')))
        
        # 获取页面标题
        print(f"页面标题: {driver.title}")
        
        # 获取页面主标题
        h1_element = driver.find_element(By.TAG_NAME, 'h1')
        print(f"页面主标题: {h1_element.text}")
        
        # 获取所有链接
        links = driver.find_elements(By.TAG_NAME, 'a')
        print(f"页面链接数量: {len(links)}")
        
        print("✅ 页面加载测试通过")
    except Exception as e:
        print(f"❌ 页面加载测试失败: {e}")
    finally:
        if 'driver' in locals():
            driver.quit()
    
    print("\n=== TC-002: 导航测试 ===")
    
    try:
        driver = webdriver.Chrome(ChromeDriverManager().install(), options=chrome_options)
        driver.get("http://localhost:5173/")
        
        wait = WebDriverWait(driver, 30)
        
        # 检查导航链接
        expected_links = ["首页", "产品功能", "关于我们", "联系我们"]
        links = driver.find_elements(By.TAG_NAME, 'a')
        
        found_links = []
        for link in links:
            if link.text.strip() in expected_links:
                found_links.append(link.text.strip())
        
        missing_links = [link for link in expected_links if link not in found_links]
        if missing_links:
            print(f"❌ 缺少导航链接: {', '.join(missing_links)}")
        else:
            print(f"✅ 所有导航链接都已找到: {', '.join(found_links)}")
        
        # 检查导航链接是否可点击
        for link in links:
            if link.text.strip() in expected_links:
                link.click()
                wait.until(EC.presence_of_element_located((By.TAG_NAME, 'h1')))
                print(f"✅ 导航到: {driver.current_url}")
                driver.back()
                wait.until(EC.presence_of_element_located((By.TAG_NAME, 'h1')))
    except Exception as e:
        print(f"❌ 导航测试失败: {e}")
    finally:
        if 'driver' in locals():
            driver.quit()
    
    print("\n=== TC-003: 文件上传 ===")
    
    try:
        driver = webdriver.Chrome(ChromeDriverManager().install(), options=chrome_options)
        driver.get("http://localhost:5173/")
        
        wait = WebDriverWait(driver, 30)
        
        # 找到文件上传按钮
        file_upload = driver.find_element(By.CSS_SELECTOR, 'input[type="file"]')
        print(f"✅ 文件上传按钮已找到: {file_upload.get_attribute('id')}")
        
        # 检查是否可以上传文件
        file_path = "/Users/cobbli/Desktop/storyweaver/test-files/test.txt"
        file_upload.send_keys(file_path)
        print("✅ 文件上传成功")
    except Exception as e:
        print(f"❌ 文件上传测试失败: {e}")
    finally:
        if 'driver' in locals():
            driver.quit()
    
    print("\n=== TC-004: 文件格式验证 ===")
    
    try:
        driver = webdriver.Chrome(ChromeDriverManager().install(), options=chrome_options)
        driver.get("http://localhost:5173/")
        
        wait = WebDriverWait(driver, 30)
        
        # 找到文件上传按钮
        file_upload = driver.find_element(By.CSS_SELECTOR, 'input[type="file"]')
        
        # 上传不支持的文件格式
        file_path = "/Users/cobbli/Desktop/storyweaver/test-files/test.pdf"
        file_upload.send_keys(file_path)
        
        # 等待错误提示
        error_message = wait.until(EC.presence_of_element_located((By.CSS_SELECTOR, '.error-message')))
        print(f"✅ 文件格式验证测试通过: {error_message.text}")
    except Exception as e:
        print(f"❌ 文件格式验证测试失败: {e}")
    finally:
        if 'driver' in locals():
            driver.quit()
    
    print("\n=== TC-005: 响应式设计 ===")
    
    try:
        driver = webdriver.Chrome(ChromeDriverManager().install(), options=chrome_options)
        
        # 测试桌面端
        driver.set_window_size(1920, 1080)
        driver.get("http://localhost:5173/")
        wait = WebDriverWait(driver, 30)
        wait.until(EC.presence_of_element_located((By.TAG_NAME, 'h1')))
        
        # 测试平板端
        driver.set_window_size(768, 1024)
        driver.get("http://localhost:5173/")
        wait.until(EC.presence_of_element_located((By.TAG_NAME, 'h1')))
        
        # 测试移动端
        driver.set_window_size(375, 667)
        driver.get("http://localhost:5173/")
        wait.until(EC.presence_of_element_located((By.TAG_NAME, 'h1')))
        
        print("✅ 响应式设计测试通过")
    except Exception as e:
        print(f"❌ 响应式设计测试失败: {e}")
    finally:
        if 'driver' in locals():
            driver.quit()

if __name__ == "__main__":
    print("=== 开始应用程序测试 ===\n")
    run_tests()