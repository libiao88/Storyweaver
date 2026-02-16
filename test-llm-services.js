#!/usr/bin/env node

const { LLMModel, LLMConfig } = require('./src/services/LLMService');
const { LLMServiceFactory } = require('./src/services/LLMOptimizer');

// 测试LLM服务工厂
console.log('=== 测试LLM服务工厂 ===');

// 测试不同模型的服务创建
const testModels = [
  LLMModel.GPT4oMini,
  LLMModel.GPT4o,
  LLMModel.Claude3Haiku,
  LLMModel.Gemini15Flash,
  LLMModel.MinimaxCodingPlan,
  LLMModel.Kimi,
  LLMModel.GLMCodingPlan,
  LLMModel.VolcanoCodingPlan,
  LLMModel.DeepSeek,
  LLMModel.Doubao
];

const config = {
  apiKey: 'test-key',
  temperature: 0.3,
  maxTokens: 2000,
  requestTimeout: 30000
};

testModels.forEach(model => {
  try {
    const service = LLMServiceFactory.createService({ 
      ...config, 
      model 
    });
    console.log(`✅ 成功创建服务: ${model}`);
    console.log(`   服务类型: ${service.constructor.name}`);
    
    // 测试成本计算
    const cost = service.calculateCost(1000, 500); // 1500 tokens
    console.log(`   成本计算 (1500 tokens): $${cost.toFixed(3)}`);
    
  } catch (error) {
    console.log(`❌ 创建服务失败: ${model}`);
    console.error(`   错误: ${error.message}`);
  }
  
  console.log('');
});

// 测试默认配置
console.log('=== 测试默认配置 ===');
const defaultConfig = {
  ...config,
  model: 'invalid-model' // 使用不存在的模型
};

try {
  const service = LLMServiceFactory.createService(defaultConfig);
  console.log(`✅ 默认服务创建成功: ${service.constructor.name}`);
} catch (error) {
  console.log(`❌ 默认服务创建失败`);
  console.error(`   错误: ${error.message}`);
}

console.log('');
console.log('=== 测试完成 ===');
console.log(`成功创建 ${testModels.filter(model => {
  try {
    LLMServiceFactory.createService({ ...config, model });
    return true;
  } catch (error) {
    return false;
  }
}).length} 个服务`);