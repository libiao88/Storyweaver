#!/usr/bin/env node

import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { readFileSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// 读取项目配置文件
const packageJsonPath = join(__dirname, 'package.json');
const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf8'));

console.log('📦 项目信息:', packageJson.name, packageJson.version);
console.log('');

// 检查火山Coding Plan相关配置
console.log('🔥 火山Coding Plan配置检测:');
console.log('');

// 检查LLM服务配置
console.log('📄 检查LLM服务配置文件...');

try {
  const llmServicePath = join(__dirname, 'src', 'services', 'LLMService.ts');
  const llmServiceContent = readFileSync(llmServicePath, 'utf8');
  
  // 检查是否包含火山Coding Plan枚举
  if (llmServiceContent.includes('VolcanoCodingPlan')) {
    console.log('✅ LLMModel枚举中已包含VolcanoCodingPlan');
  } else {
    console.log('❌ LLMModel枚举中缺少VolcanoCodingPlan');
  }
  
  // 检查是否包含火山Coding Plan服务类型
  if (llmServiceContent.includes('LLMServiceType')) {
    console.log('✅ 已包含LLMServiceType枚举');
  }
  
  if (llmServiceContent.includes('Volcano')) {
    console.log('✅ LLMServiceType枚举中已包含Volcano服务类型');
  }
  
  console.log('');
} catch (error) {
  console.log('❌ 无法读取LLMService.ts文件:', error.message);
}

// 检查LLMOptimizer配置
console.log('🔍 检查LLMOptimizer.ts中的火山引擎服务...');

try {
  const llmOptimizerPath = join(__dirname, 'src', 'services', 'LLMOptimizer.ts');
  const llmOptimizerContent = readFileSync(llmOptimizerPath, 'utf8');
  
  if (llmOptimizerContent.includes('class VolcanoService')) {
    console.log('✅ 已实现VolcanoService类');
  }
  
  if (llmOptimizerContent.includes('LLMServiceFactory')) {
    console.log('✅ 已包含LLMServiceFactory');
  }
  
  if (llmOptimizerContent.includes('case LLMModel.VolcanoCodingPlan:')) {
    console.log('✅ LLMServiceFactory中已包含火山Coding Plan模型映射');
  }
  
  // 检查火山引擎API端点
  if (llmOptimizerContent.includes('https://ark.cn-beijing.volces.com/api/v3')) {
    console.log('✅ 火山引擎API端点配置正确');
  }
  
  console.log('');
} catch (error) {
  console.log('❌ 无法读取LLMOptimizer.ts文件:', error.message);
}

// 检查LLM配置界面
console.log('⚙️ 检查LLM配置界面...');

try {
  const llmConfigPanelPath = join(__dirname, 'src', 'app', 'components', 'LLMConfigPanel.tsx');
  const llmConfigPanelContent = readFileSync(llmConfigPanelPath, 'utf8');
  
  if (llmConfigPanelContent.includes('VolcanoCodingPlan')) {
    console.log('✅ LLMConfigPanel中已包含火山Coding Plan选项');
  }
  
  if (llmConfigPanelContent.includes('火山 Coding Plan')) {
    console.log('✅ 配置界面显示名称正确');
  }
  
  console.log('');
} catch (error) {
  console.log('❌ 无法读取LLMConfigPanel.tsx文件:', error.message);
}

// 检查App.tsx配置
console.log('🚀 检查App.tsx配置...');

try {
  const appPath = join(__dirname, 'src', 'app', 'App.tsx');
  const appContent = readFileSync(appPath, 'utf8');
  
  if (appContent.includes('LLMServiceFactory')) {
    console.log('✅ App.tsx中已使用LLMServiceFactory');
  }
  
  if (appContent.includes('handleTestConnection')) {
    console.log('✅ 已包含连接测试功能');
  }
  
  console.log('');
} catch (error) {
  console.log('❌ 无法读取App.tsx文件:', error.message);
}

console.log('✅ 火山Coding Plan配置检测完成！');
console.log('');
console.log('📝 使用说明:');
console.log('1. 在浏览器中打开 http://localhost:5174/');
console.log('2. 点击"配置"标签页');
console.log('3. 在LLM配置面板中：');
console.log('   - 输入火山引擎的API Key');
console.log('   - 在"模型选择"中选择"火山 Coding Plan"');
console.log('   - 调整其他参数（可选）');
console.log('4. 点击"保存配置"');
console.log('5. 点击"测试连接"验证API Key是否有效');
console.log('');
console.log('💡 提示:');
console.log('   - API Key格式通常为：sk-xxx');
console.log('   - 可以在火山引擎控制台获取API Key');
console.log('   - 火山Coding Plan支持国内网络环境');
