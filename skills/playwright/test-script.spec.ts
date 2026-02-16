import { test, expect } from '@playwright/test';

test.describe('应用程序测试', () => {
  test('页面加载', async ({ page }) => {
    await page.goto('http://localhost:5173/');
    await page.waitForSelector('h1');
    const title = await page.title();
    expect(title).toContain('智语拆解');
    const h1Element = await page.$('h1');
    const h1Text = await h1Element?.textContent();
    expect(h1Text).toContain('智语拆解');
  });

  test('导航测试', async ({ page }) => {
    await page.goto('http://localhost:5173/');
    const links = await page.$$('a');
    const linkTexts = await Promise.all(links.map(link => link.textContent()));
    const expectedLinks = ['首页', '产品功能', '关于我们', '联系我们'];
    for (const expectedLink of expectedLinks) {
      expect(linkTexts.some(linkText => linkText?.includes(expectedLink))).toBe(true);
    }
  });

  test('文件上传', async ({ page }) => {
    await page.goto('http://localhost:5173/');
    const fileUpload = await page.$('input[type="file"]');
    expect(fileUpload).not.toBeNull();
    await fileUpload?.setInputFiles('/Users/cobbli/Desktop/storyweaver/test-files/test.txt');
    const uploadButton = await page.$('button');
    expect(uploadButton?.textContent()).toContain('上传');
  });

  test('文件格式验证', async ({ page }) => {
    await page.goto('http://localhost:5173/');
    const fileUpload = await page.$('input[type="file"]');
    await fileUpload?.setInputFiles('/Users/cobbli/Desktop/storyweaver/test-files/test.pdf');
    const errorMessage = await page.waitForSelector('.error-message');
    expect(errorMessage?.textContent()).toContain('不支持');
  });

  test('响应式设计', async ({ page }) => {
    await page.goto('http://localhost:5173/');
    await page.setViewportSize({ width: 1920, height: 1080 });
    const desktopElement = await page.$('.desktop');
    expect(desktopElement).not.toBeNull();
    await page.setViewportSize({ width: 768, height: 1024 });
    const tabletElement = await page.$('.tablet');
    expect(tabletElement).not.toBeNull();
    await page.setViewportSize({ width: 375, height: 667 });
    const mobileElement = await page.$('.mobile');
    expect(mobileElement).not.toBeNull();
  });
});