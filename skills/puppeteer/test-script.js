import puppeteer from 'puppeteer';
import path from 'path';

async function runTests() {
  console.log("=== TC-001: 首页加载 ===");
  
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  
  try {
    // 导航到本地服务器
    const startTime = Date.now();
    await page.goto("http://localhost:5174/");
    await page.waitForLoadState("networkidle");
    const loadTime = Date.now() - startTime;
    
    console.log(`页面加载时间: ${loadTime}ms`);
    const pageTitle = await page.title();
    console.log(`页面标题: ${pageTitle}`);
    
    // 检查是否显示标题
    await page.waitForSelector("h1, h2, h3", { timeout: 10000 });
    const titleElements = await page.$$("h1, h2, h3");
    const titleText = await Promise.all(titleElements.map(el => el.textContent()));
    console.log(`页面主标题: ${titleText}`);
    
    // 检查是否有404错误
    const bodyText = await page.textContent("body");
    const has404 = bodyText?.includes("404") || bodyText?.includes("Not Found");
    console.log(`是否有404错误: ${has404}`);
    
    // 截图
    const screenshotDir = path.join(process.cwd(), "skills/puppeteer");
    const fs = await import('fs');
    if (!fs.existsSync(screenshotDir)) {
      fs.mkdirSync(screenshotDir, { recursive: true });
    }
    await page.screenshot({ path: path.join(screenshotDir, "TC-001首页加载.png") });
    
    // TC-003: Tab导航
    console.log("\n=== TC-003: Tab导航 ===");
    try {
      // 等待Tab元素加载
      await page.waitForSelector('[role="tab"]', { timeout: 10000 });
      
      // 获取所有Tab
      const tabElements = await page.$$('[role="tab"]');
      const tabCount = tabElements.length;
      console.log(`Tab数量: ${tabCount}`);

      // 记录所有Tab的文本
      const tabTexts = await Promise.all(tabElements.map(el => el.textContent()));
      console.log(`Tab列表: ${tabTexts.join(", ")}`);

      // 尝试点击第一个Tab
      await tabElements[0].click();
      console.log("第一个Tab点击成功");
      
      // 截图记录Tab导航
      await page.screenshot({ path: path.join(screenshotDir, "TC-003Tab导航.png") });
      
    } catch (error) {
      console.log("Tab导航测试失败:", error);
    }
    
    // TC-004: 文件选择
    console.log("\n=== TC-004: 文件选择 ===");
    try {
      // 等待文件选择按钮
      const uploadButton = await page.waitForSelector('input[type="file"]', { timeout: 10000 });
      console.log("文件选择按钮找到");
      
      // 截图记录文件选择界面
      await page.screenshot({ path: path.join(screenshotDir, "TC-004文件选择.png") });
      
    } catch (error) {
      console.log("文件选择测试失败:", error);
    }
    
    // TC-002: 响应式设计测试（桌面端）
    console.log("\n=== TC-002: 响应式设计（桌面端） ===");
    // 已经是桌面端尺寸，截图记录
    await page.screenshot({ path: path.join(screenshotDir, "TC-002响应式设计_桌面端.png") });
    
    // 测试平板端响应式设计
    console.log("\n=== TC-002: 响应式设计（平板端） ===");
    await page.setViewport({ width: 768, height: 1024 });
    await page.waitForTimeout(1000);
    await page.screenshot({ path: path.join(screenshotDir, "TC-002响应式设计_平板端.png") });
    
    // 测试移动端响应式设计
    console.log("\n=== TC-002: 响应式设计（移动端） ===");
    await page.setViewport({ width: 375, height: 667 });
    await page.waitForTimeout(1000);
    await page.screenshot({ path: path.join(screenshotDir, "TC-002响应式设计_移动端.png") });
    
    // 恢复到桌面端尺寸
    await page.setViewport({ width: 1920, height: 1080 });
    
    // TC-005: 文件格式验证测试
    console.log("\n=== TC-005: 文件格式验证 ===");
    try {
      // 找到文件上传输入框
      const fileInput = await page.$('input[type="file"]');
      
      if (fileInput) {
        // 尝试上传不支持的格式（.txt文件）
        const testFile = path.join(process.cwd(), "test-files", "test.txt");
        const inputElement = await page.$('input[type="file"]');
        await inputElement.uploadFile(testFile);
        console.log("成功尝试上传不支持的文件格式");
        
        // 等待错误提示
        await page.waitForTimeout(2000);
        
        // 截图记录错误提示
        await page.screenshot({ path: path.join(screenshotDir, "TC-005文件格式验证.png") });
        
      } else {
        console.log("未找到文件上传输入框");
      }
      
    } catch (error) {
      console.log("文件格式验证测试失败:", error);
    }
    
    // TC-006: 文件大小验证测试
    console.log("\n=== TC-006: 文件大小验证 ===");
    try {
      // 检查是否有文件大小限制信息
      const fileSizeInfo = await page.textContent("body");
      console.log("页面包含文件大小相关信息:", fileSizeInfo?.includes("MB") || fileSizeInfo?.includes("大小"));
      
      // 截图记录
      await page.screenshot({ path: path.join(screenshotDir, "TC-006文件大小验证.png") });
      
    } catch (error) {
      console.log("文件大小验证测试失败:", error);
    }
    
    console.log("\n=== 测试执行完成 ===");
  } catch (error) {
    console.error("测试过程中发生错误:", error);
  } finally {
    await browser.close();
  }
}

runTests().catch(error => {
  console.error("测试失败:", error);
  process.exit(1);
});