import { Priority, ConfidenceLevel } from '@/types/storyweaver';

// LLM模型类型
export enum LLMModel {
  // OpenAI
  GPT4oMini = 'gpt-4o-mini',
  GPT4o = 'gpt-4o',
  // Claude
  Claude3Haiku = 'claude-3-haiku-20240307',
  Claude3Sonnet = 'claude-3-sonnet-20240229',
  Claude3Opus = 'claude-3-opus-20240229',
  // Google
  Gemini15Flash = 'gemini-1.5-flash',
  Gemini15Pro = 'gemini-1.5-pro',
  // 国内大模型
  MinimaxCodingPlan = 'minimax-coding-plan',
  Kimi = 'kimi',
  GLMCodingPlan = 'glm-coding-plan',
  VolcanoCodingPlan = 'volcano-coding-plan',
  DeepSeek = 'deepseek',
  Doubao = 'doubao'
}

// LLM服务类型
export enum LLMServiceType {
  OpenAI = 'openai',
  Claude = 'claude',
  Google = 'google',
  Minimax = 'minimax',
  Kimi = 'kimi',
  GLM = 'glm',
  Volcano = 'volcano',
  DeepSeek = 'deepseek',
  Doubao = 'doubao'
}

// LLM服务配置
export interface LLMServiceConfig {
  type: LLMServiceType;
  apiKey: string;
  baseUrl?: string;  // 自定义API基础路径
  model: LLMModel;
}

// LLM配置
export interface LLMConfig {
  model: LLMModel;
  apiKey: string;
  temperature: number;
  maxTokens: number;
  requestTimeout: number;
}

// LLM优化请求
export interface LLMStoryOptimizationRequest {
  story: any;
  sourceContext: string;
  optimizationGoals: string[];
  requirements?: string;
}

// LLM优化响应
export interface LLMStoryOptimizationResponse {
  optimizedStory: any;
  changes: string[];
  confidence: number;
  cost: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
    costUSD: number;
  };
  timing: {
    apiCall: number;
    processing: number;
    total: number;
  };
  model: LLMModel;
}

// LLM错误类型
export enum LLMErrorCode {
  API_KEY_MISSING = 'LLM_001',
  API_CALL_FAILED = 'LLM_002',
  TIMEOUT = 'LLM_003',
  INVALID_RESPONSE = 'LLM_004',
  RATE_LIMIT = 'LLM_005',
  QUOTA_EXCEEDED = 'LLM_006'
}

// LLM使用统计
export interface LLMUsageStats {
  requestCount: number;
  successCount: number;
  errorCount: number;
  totalTokens: number;
  totalCost: number;
  averageCostPerRequest: number;
  averageResponseTime: number;
  modelUsage: Record<LLMModel, number>;
  optimizationRate: number;
  confidenceImprovement: number;
}

// LLM API响应数据结构
export interface LLMAPIResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: Array<{
    index: number;
    message: {
      role: string;
      content: string;
    };
    finish_reason: string;
  }>;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}