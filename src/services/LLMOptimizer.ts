import { LLMModel, LLMConfig, LLMAPIResponse, LLMStoryOptimizationRequest, LLMStoryOptimizationResponse, LLMErrorCode, LLMServiceType } from './LLMService';
import { generateUUID } from '@/types/storyweaver';

// LLM服务接口
export interface LLMService {
  callAPI(prompt: string): Promise<string>;
  calculateCost(promptTokens: number, completionTokens: number): number;
  getModel(): LLMModel;
}

// OpenAI服务实现
export class OpenAIService implements LLMService {
  private apiKey: string;
  private model: LLMModel;
  private temperature: number;
  private maxTokens: number;
  private requestTimeout: number;
  private baseUrl: string;

  constructor(config: LLMConfig) {
    this.apiKey = config.apiKey;
    this.model = config.model;
    this.temperature = config.temperature;
    this.maxTokens = config.maxTokens;
    this.requestTimeout = config.requestTimeout;
    this.baseUrl = 'https://api.openai.com/v1';
  }

  getModel(): LLMModel {
    return this.model;
  }

  async callAPI(prompt: string): Promise<string> {
    if (!this.apiKey || this.apiKey.trim() === '') {
      throw new Error(LLMErrorCode.API_KEY_MISSING);
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.requestTimeout);

    try {
      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: this.model,
          messages: [
            {
              role: 'system',
              content: '你是一个专业的用户故事优化助手。你的任务是优化和完善用户故事，提升其清晰度、准确性和可读性，同时保持核心含义不变。',
            },
            {
              role: 'user',
              content: prompt,
            },
          ],
          temperature: this.temperature,
          max_tokens: this.maxTokens,
          top_p: 0.95,
          frequency_penalty: 0.5,
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        if (response.status === 429) {
          throw new Error(LLMErrorCode.RATE_LIMIT);
        } else if (response.status === 403) {
          throw new Error(LLMErrorCode.QUOTA_EXCEEDED);
        } else {
          throw new Error(LLMErrorCode.API_CALL_FAILED);
        }
      }

      const data: LLMAPIResponse = await response.json();

      if (!data.choices || data.choices.length === 0) {
        throw new Error(LLMErrorCode.INVALID_RESPONSE);
      }

      return data.choices[0].message.content;
    } catch (error: any) {
      clearTimeout(timeoutId);

      if (error.name === 'AbortError') {
        throw new Error(LLMErrorCode.TIMEOUT);
      }

      throw error;
    }
  }

  calculateCost(promptTokens: number, completionTokens: number): number {
    const costs: Record<LLMModel, number> = {
      [LLMModel.GPT4oMini]: 0.15,  // $0.15 per 1K tokens
      [LLMModel.GPT4o]: 2.5,       // $2.5 per 1K tokens
      [LLMModel.Claude3Haiku]: 0.25, // $0.25 per 1K tokens
      [LLMModel.Claude3Sonnet]: 3,  // $3 per 1K tokens
      [LLMModel.Claude3Opus]: 15,  // $15 per 1K tokens
      [LLMModel.Gemini15Flash]: 0.075, // $0.075 per 1K tokens
      [LLMModel.Gemini15Pro]: 1.25,  // $1.25 per 1K tokens
      // 国内大模型成本（假设值，实际需要根据官方定价调整）
      [LLMModel.MinimaxCodingPlan]: 0.3,
      [LLMModel.Kimi]: 0.25,
      [LLMModel.GLMCodingPlan]: 0.4,
      [LLMModel.VolcanoCodingPlan]: 0.35,
      [LLMModel.DeepSeek]: 0.2,
      [LLMModel.Doubao]: 0.18
    };

    const costPer1KTokens = costs[this.model] || 0.15;
    const totalTokens = promptTokens + completionTokens;
    return (totalTokens / 1000) * costPer1KTokens;
  }
}

// Minimax服务实现
export class MinimaxService implements LLMService {
  private apiKey: string;
  private model: LLMModel;
  private temperature: number;
  private maxTokens: number;
  private requestTimeout: number;
  private baseUrl: string;

  constructor(config: LLMConfig) {
    this.apiKey = config.apiKey;
    this.model = config.model;
    this.temperature = config.temperature;
    this.maxTokens = config.maxTokens;
    this.requestTimeout = config.requestTimeout;
    this.baseUrl = 'https://api.minimax.chat/v1';
  }

  getModel(): LLMModel {
    return this.model;
  }

  async callAPI(prompt: string): Promise<string> {
    if (!this.apiKey || this.apiKey.trim() === '') {
      throw new Error(LLMErrorCode.API_KEY_MISSING);
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.requestTimeout);

    try {
      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: 'codellama-34b', // Minimax Coding Plan模型
          messages: [
            {
              role: 'system',
              content: '你是一个专业的用户故事优化助手。你的任务是优化和完善用户故事，提升其清晰度、准确性和可读性，同时保持核心含义不变。',
            },
            {
              role: 'user',
              content: prompt,
            },
          ],
          temperature: this.temperature,
          max_tokens: this.maxTokens,
          top_p: 0.95,
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        if (response.status === 429) {
          throw new Error(LLMErrorCode.RATE_LIMIT);
        } else if (response.status === 403) {
          throw new Error(LLMErrorCode.QUOTA_EXCEEDED);
        } else {
          throw new Error(LLMErrorCode.API_CALL_FAILED);
        }
      }

      const data: LLMAPIResponse = await response.json();

      if (!data.choices || data.choices.length === 0) {
        throw new Error(LLMErrorCode.INVALID_RESPONSE);
      }

      return data.choices[0].message.content;
    } catch (error: any) {
      clearTimeout(timeoutId);

      if (error.name === 'AbortError') {
        throw new Error(LLMErrorCode.TIMEOUT);
      }

      throw error;
    }
  }

  calculateCost(promptTokens: number, completionTokens: number): number {
    const costs: Record<string, number> = {
      [LLMModel.MinimaxCodingPlan]: 0.3,  // $0.3 per 1K tokens
    };

    const costPer1KTokens = costs[this.model] || 0.3;
    const totalTokens = promptTokens + completionTokens;
    return (totalTokens / 1000) * costPer1KTokens;
  }
}

// Kimi服务实现
export class KimiService implements LLMService {
  private apiKey: string;
  private model: LLMModel;
  private temperature: number;
  private maxTokens: number;
  private requestTimeout: number;
  private baseUrl: string;

  constructor(config: LLMConfig) {
    this.apiKey = config.apiKey;
    this.model = config.model;
    this.temperature = config.temperature;
    this.maxTokens = config.maxTokens;
    this.requestTimeout = config.requestTimeout;
    this.baseUrl = 'https://api.moonshot.cn/v1';
  }

  getModel(): LLMModel {
    return this.model;
  }

  async callAPI(prompt: string): Promise<string> {
    if (!this.apiKey || this.apiKey.trim() === '') {
      throw new Error(LLMErrorCode.API_KEY_MISSING);
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.requestTimeout);

    try {
      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: 'moonshot-v1-8k', // Kimi模型
          messages: [
            {
              role: 'system',
              content: '你是一个专业的用户故事优化助手。你的任务是优化和完善用户故事，提升其清晰度、准确性和可读性，同时保持核心含义不变。',
            },
            {
              role: 'user',
              content: prompt,
            },
          ],
          temperature: this.temperature,
          max_tokens: this.maxTokens,
          top_p: 0.95,
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        if (response.status === 429) {
          throw new Error(LLMErrorCode.RATE_LIMIT);
        } else if (response.status === 403) {
          throw new Error(LLMErrorCode.QUOTA_EXCEEDED);
        } else {
          throw new Error(LLMErrorCode.API_CALL_FAILED);
        }
      }

      const data: LLMAPIResponse = await response.json();

      if (!data.choices || data.choices.length === 0) {
        throw new Error(LLMErrorCode.INVALID_RESPONSE);
      }

      return data.choices[0].message.content;
    } catch (error: any) {
      clearTimeout(timeoutId);

      if (error.name === 'AbortError') {
        throw new Error(LLMErrorCode.TIMEOUT);
      }

      throw error;
    }
  }

  calculateCost(promptTokens: number, completionTokens: number): number {
    const costs: Record<string, number> = {
      [LLMModel.Kimi]: 0.25,  // $0.25 per 1K tokens
    };

    const costPer1KTokens = costs[this.model] || 0.25;
    const totalTokens = promptTokens + completionTokens;
    return (totalTokens / 1000) * costPer1KTokens;
  }
}

// GLM服务实现
export class GLMService implements LLMService {
  private apiKey: string;
  private model: LLMModel;
  private temperature: number;
  private maxTokens: number;
  private requestTimeout: number;
  private baseUrl: string;

  constructor(config: LLMConfig) {
    this.apiKey = config.apiKey;
    this.model = config.model;
    this.temperature = config.temperature;
    this.maxTokens = config.maxTokens;
    this.requestTimeout = config.requestTimeout;
    this.baseUrl = 'https://open.bigmodel.cn/api/paas/v4';
  }

  getModel(): LLMModel {
    return this.model;
  }

  async callAPI(prompt: string): Promise<string> {
    if (!this.apiKey || this.apiKey.trim() === '') {
      throw new Error(LLMErrorCode.API_KEY_MISSING);
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.requestTimeout);

    try {
      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: 'glm-4', // GLM模型
          messages: [
            {
              role: 'system',
              content: '你是一个专业的用户故事优化助手。你的任务是优化和完善用户故事，提升其清晰度、准确性和可读性，同时保持核心含义不变。',
            },
            {
              role: 'user',
              content: prompt,
            },
          ],
          temperature: this.temperature,
          max_tokens: this.maxTokens,
          top_p: 0.95,
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        if (response.status === 429) {
          throw new Error(LLMErrorCode.RATE_LIMIT);
        } else if (response.status === 403) {
          throw new Error(LLMErrorCode.QUOTA_EXCEEDED);
        } else {
          throw new Error(LLMErrorCode.API_CALL_FAILED);
        }
      }

      const data: LLMAPIResponse = await response.json();

      if (!data.choices || data.choices.length === 0) {
        throw new Error(LLMErrorCode.INVALID_RESPONSE);
      }

      return data.choices[0].message.content;
    } catch (error: any) {
      clearTimeout(timeoutId);

      if (error.name === 'AbortError') {
        throw new Error(LLMErrorCode.TIMEOUT);
      }

      throw error;
    }
  }

  calculateCost(promptTokens: number, completionTokens: number): number {
    const costs: Record<string, number> = {
      [LLMModel.GLMCodingPlan]: 0.4,  // $0.4 per 1K tokens
    };

    const costPer1KTokens = costs[this.model] || 0.4;
    const totalTokens = promptTokens + completionTokens;
    return (totalTokens / 1000) * costPer1KTokens;
  }
}

// 火山引擎服务实现
export class VolcanoService implements LLMService {
  private apiKey: string;
  private model: LLMModel;
  private temperature: number;
  private maxTokens: number;
  private requestTimeout: number;
  private baseUrl: string;

  constructor(config: LLMConfig) {
    this.apiKey = config.apiKey;
    this.model = config.model;
    this.temperature = config.temperature;
    this.maxTokens = config.maxTokens;
    this.requestTimeout = config.requestTimeout;
    this.baseUrl = 'https://ark.cn-beijing.volces.com/api/v3';
  }

  getModel(): LLMModel {
    return this.model;
  }

  async callAPI(prompt: string): Promise<string> {
    if (!this.apiKey || this.apiKey.trim() === '') {
      throw new Error(LLMErrorCode.API_KEY_MISSING);
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.requestTimeout);

    try {
      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: 'volcano-coding-plan', // 火山Coding Plan模型
          messages: [
            {
              role: 'system',
              content: '你是一个专业的用户故事优化助手。你的任务是优化和完善用户故事，提升其清晰度、准确性和可读性，同时保持核心含义不变。',
            },
            {
              role: 'user',
              content: prompt,
            },
          ],
          temperature: this.temperature,
          max_tokens: this.maxTokens,
          top_p: 0.95,
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        if (response.status === 429) {
          throw new Error(LLMErrorCode.RATE_LIMIT);
        } else if (response.status === 403) {
          throw new Error(LLMErrorCode.QUOTA_EXCEEDED);
        } else {
          throw new Error(LLMErrorCode.API_CALL_FAILED);
        }
      }

      const data: LLMAPIResponse = await response.json();

      if (!data.choices || data.choices.length === 0) {
        throw new Error(LLMErrorCode.INVALID_RESPONSE);
      }

      return data.choices[0].message.content;
    } catch (error: any) {
      clearTimeout(timeoutId);

      if (error.name === 'AbortError') {
        throw new Error(LLMErrorCode.TIMEOUT);
      }

      throw error;
    }
  }

  calculateCost(promptTokens: number, completionTokens: number): number {
    const costs: Record<string, number> = {
      [LLMModel.VolcanoCodingPlan]: 0.35,  // $0.35 per 1K tokens
    };

    const costPer1KTokens = costs[this.model] || 0.35;
    const totalTokens = promptTokens + completionTokens;
    return (totalTokens / 1000) * costPer1KTokens;
  }
}

// DeepSeek服务实现
export class DeepSeekService implements LLMService {
  private apiKey: string;
  private model: LLMModel;
  private temperature: number;
  private maxTokens: number;
  private requestTimeout: number;
  private baseUrl: string;

  constructor(config: LLMConfig) {
    this.apiKey = config.apiKey;
    this.model = config.model;
    this.temperature = config.temperature;
    this.maxTokens = config.maxTokens;
    this.requestTimeout = config.requestTimeout;
    this.baseUrl = 'https://api.deepseek.com';
  }

  getModel(): LLMModel {
    return this.model;
  }

  async callAPI(prompt: string): Promise<string> {
    if (!this.apiKey || this.apiKey.trim() === '') {
      throw new Error(LLMErrorCode.API_KEY_MISSING);
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.requestTimeout);

    try {
      const response = await fetch(`${this.baseUrl}/v1/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: 'deepseek-coder', // DeepSeek模型
          messages: [
            {
              role: 'system',
              content: '你是一个专业的用户故事优化助手。你的任务是优化和完善用户故事，提升其清晰度、准确性和可读性，同时保持核心含义不变。',
            },
            {
              role: 'user',
              content: prompt,
            },
          ],
          temperature: this.temperature,
          max_tokens: this.maxTokens,
          top_p: 0.95,
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        if (response.status === 429) {
          throw new Error(LLMErrorCode.RATE_LIMIT);
        } else if (response.status === 403) {
          throw new Error(LLMErrorCode.QUOTA_EXCEEDED);
        } else {
          throw new Error(LLMErrorCode.API_CALL_FAILED);
        }
      }

      const data: LLMAPIResponse = await response.json();

      if (!data.choices || data.choices.length === 0) {
        throw new Error(LLMErrorCode.INVALID_RESPONSE);
      }

      return data.choices[0].message.content;
    } catch (error: any) {
      clearTimeout(timeoutId);

      if (error.name === 'AbortError') {
        throw new Error(LLMErrorCode.TIMEOUT);
      }

      throw error;
    }
  }

  calculateCost(promptTokens: number, completionTokens: number): number {
    const costs: Record<string, number> = {
      [LLMModel.DeepSeek]: 0.2,  // $0.2 per 1K tokens
    };

    const costPer1KTokens = costs[this.model] || 0.2;
    const totalTokens = promptTokens + completionTokens;
    return (totalTokens / 1000) * costPer1KTokens;
  }
}

// 豆包服务实现
export class DoubaoService implements LLMService {
  private apiKey: string;
  private model: LLMModel;
  private temperature: number;
  private maxTokens: number;
  private requestTimeout: number;
  private baseUrl: string;

  constructor(config: LLMConfig) {
    this.apiKey = config.apiKey;
    this.model = config.model;
    this.temperature = config.temperature;
    this.maxTokens = config.maxTokens;
    this.requestTimeout = config.requestTimeout;
    this.baseUrl = 'https://ark.cn-beijing.volces.com/api/v3';
  }

  getModel(): LLMModel {
    return this.model;
  }

  async callAPI(prompt: string): Promise<string> {
    if (!this.apiKey || this.apiKey.trim() === '') {
      throw new Error(LLMErrorCode.API_KEY_MISSING);
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.requestTimeout);

    try {
      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: 'ep-20240115121258-i7x27', // 豆包模型
          messages: [
            {
              role: 'system',
              content: '你是一个专业的用户故事优化助手。你的任务是优化和完善用户故事，提升其清晰度、准确性和可读性，同时保持核心含义不变。',
            },
            {
              role: 'user',
              content: prompt,
            },
          ],
          temperature: this.temperature,
          max_tokens: this.maxTokens,
          top_p: 0.95,
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        if (response.status === 429) {
          throw new Error(LLMErrorCode.RATE_LIMIT);
        } else if (response.status === 403) {
          throw new Error(LLMErrorCode.QUOTA_EXCEEDED);
        } else {
          throw new Error(LLMErrorCode.API_CALL_FAILED);
        }
      }

      const data: LLMAPIResponse = await response.json();

      if (!data.choices || data.choices.length === 0) {
        throw new Error(LLMErrorCode.INVALID_RESPONSE);
      }

      return data.choices[0].message.content;
    } catch (error: any) {
      clearTimeout(timeoutId);

      if (error.name === 'AbortError') {
        throw new Error(LLMErrorCode.TIMEOUT);
      }

      throw error;
    }
  }

  calculateCost(promptTokens: number, completionTokens: number): number {
    const costs: Record<string, number> = {
      [LLMModel.Doubao]: 0.18,  // $0.18 per 1K tokens
    };

    const costPer1KTokens = costs[this.model] || 0.18;
    const totalTokens = promptTokens + completionTokens;
    return (totalTokens / 1000) * costPer1KTokens;
  }
}

// LLM服务工厂
export class LLMServiceFactory {
  static createService(config: LLMConfig): LLMService {
    // 根据模型类型选择对应的服务
    switch (config.model) {
      case LLMModel.MinimaxCodingPlan:
        return new MinimaxService(config);
      case LLMModel.Kimi:
        return new KimiService(config);
      case LLMModel.GLMCodingPlan:
        return new GLMService(config);
      case LLMModel.VolcanoCodingPlan:
        return new VolcanoService(config);
      case LLMModel.DeepSeek:
        return new DeepSeekService(config);
      case LLMModel.Doubao:
        return new DoubaoService(config);
      default:
        return new OpenAIService(config);
    }
  }
}

export class LLMOptimizer {
  private service: LLMService;

  constructor(config: LLMConfig) {
    this.service = LLMServiceFactory.createService(config);
  }

  // 判断是否需要LLM优化
  shouldOptimize(story: any): boolean {
    if (!story || !story.confidence) return false;

    return (
      story.confidence.overall < 0.7 ||
      story.confidence.needsReview ||
      (story.description && story.description.includes('待补充')) ||
      this.containsComplexPatterns(story.description)
    );
  }

  private containsComplexPatterns(text: string): boolean {
    if (!text) return false;

    const complexPatterns = [
      /\([^)]*\)/g,  // 括号内容
      /【[^】]*】/g,  // 中文括号
      /待补充|TBD|TODO/gi,
      /[^\u4e00-\u9fa5a-zA-Z0-9，。！？；：,.!?;:\s]+/g // 复杂特殊字符
    ];

    return complexPatterns.some(pattern => pattern.test(text));
  }

  // 优化用户故事
  async optimizeStory(request: LLMStoryOptimizationRequest): Promise<LLMStoryOptimizationResponse> {
    const startTime = Date.now();

    try {
      const prompt = this.createOptimizationPrompt(request);
      const apiStartTime = Date.now();
      const response = await this.service.callAPI(prompt);
      const apiCallTime = Date.now() - apiStartTime;

      const optimizedStory = this.parseLLMResponse(response, request.story);
      const processingTime = Date.now() - startTime - apiCallTime;
      const totalTime = Date.now() - startTime;

      const cost = {
        promptTokens: this.estimateTokens(prompt),
        completionTokens: this.estimateTokens(response),
        totalTokens: this.estimateTokens(prompt) + this.estimateTokens(response),
        costUSD: this.service.calculateCost(
          this.estimateTokens(prompt),
          this.estimateTokens(response)
        ),
      };

      return {
        optimizedStory,
        changes: this.detectChanges(request.story, optimizedStory),
        confidence: optimizedStory.confidence?.overall || 0.9,
        cost,
        timing: {
          apiCall: apiCallTime,
          processing: processingTime,
          total: totalTime,
        },
        model: this.service.getModel(),
      };
    } catch (error: any) {
      console.warn('LLM优化失败:', error.message);
      throw error;
    }
  }

  // 创建优化提示
  private createOptimizationPrompt(request: LLMStoryOptimizationRequest): string {
    const { story, sourceContext, optimizationGoals } = request;

    return `# 用户故事优化任务

## 原始故事信息
- 角色：${story.role}
- 功能：${story.action}
- 价值：${story.value}
- 模块：${story.module}
- 优先级：${story.priority}
- 置信度：${(story.confidence?.overall * 100 || 0).toFixed(0)}%
- 原始描述：${story.description}

## 优化目标
${optimizationGoals.map(goal => `- ${goal}`).join('\n')}

## 上下文信息
${sourceContext}

## 优化要求
1. 保持角色、功能、价值的核心含义不变
2. 提升描述的清晰度和准确性
3. 优化语言表达，符合用户故事标准格式
4. 补充缺失的信息（如发现"待补充"）
5. 提供详细的优化说明

## 输出格式
严格返回JSON格式，不要包含其他内容：
{
  "title": "优化后的标题",
  "description": "优化后的详细描述",
  "role": "优化后的角色",
  "action": "优化后的功能",
  "value": "优化后的价值",
  "module": "优化后的模块",
  "priority": "优化后的优先级",
  "changes": ["优化项1", "优化项2"],
  "confidence": 0.95
}
`;
  }

  // 解析LLM响应
  private parseLLMResponse(response: string, originalStory: any): any {
    try {
      // 提取JSON部分
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error(LLMErrorCode.INVALID_RESPONSE);
      }

      const parsed = JSON.parse(jsonMatch[0]);

      // 合并优化结果到原始故事
      const optimizedStory = {
        ...originalStory,
        title: parsed.title || originalStory.title,
        description: parsed.description || originalStory.description,
        role: parsed.role || originalStory.role,
        action: parsed.action || originalStory.action,
        value: parsed.value || originalStory.value,
        module: parsed.module || originalStory.module,
        priority: parsed.priority || originalStory.priority,
        confidence: {
          ...originalStory.confidence,
          overall: parsed.confidence || originalStory.confidence.overall,
          reasons: [
            ...(originalStory.confidence?.reasons || []),
            'LLM优化提升',
          ],
        },
      };

      return optimizedStory;
    } catch (error) {
      console.warn('LLM响应解析失败:', error);
      throw new Error(LLMErrorCode.INVALID_RESPONSE);
    }
  }

  // 检测变化
  private detectChanges(original: any, optimized: any): string[] {
    const changes: string[] = [];

    if (original.title !== optimized.title) {
      changes.push('优化了标题');
    }

    if (original.description !== optimized.description) {
      changes.push('优化了描述');
    }

    if (original.role !== optimized.role) {
      changes.push('优化了角色');
    }

    if (original.action !== optimized.action) {
      changes.push('优化了功能');
    }

    if (original.value !== optimized.value) {
      changes.push('优化了价值');
    }

    if (original.module !== optimized.module) {
      changes.push('优化了模块');
    }

    if (original.priority !== optimized.priority) {
      changes.push('优化了优先级');
    }

    return changes.length > 0 ? changes : ['优化了语言表达'];
  }

  // 估算token数量
  private estimateTokens(text: string): number {
    if (!text) return 0;

    // 简单估算：每个中文字符约2个token，其他字符约1个token
    const chineseChars = text.match(/[\u4e00-\u9fa5]/g)?.length || 0;
    const otherChars = text.length - chineseChars;

    return Math.round(chineseChars * 2 + otherChars * 1.2);
  }
}

export class CostMonitor {
  private static instance: CostMonitor;
  private totalTokens: number = 0;
  private totalCost: number = 0;
  private usageHistory: Array<{
    timestamp: number;
    model: LLMModel;
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
    costUSD: number;
    requestTime: number;
  }> = [];

  static getInstance(): CostMonitor {
    if (!CostMonitor.instance) {
      CostMonitor.instance = new CostMonitor();
    }
    return CostMonitor.instance;
  }

  trackUsage(model: LLMModel, promptTokens: number, completionTokens: number, requestTime: number) {
    const service = LLMServiceFactory.createService({
      model,
      apiKey: '',
      temperature: 0.3,
      maxTokens: 2000,
      requestTimeout: 30000,
    });

    const costUSD = service.calculateCost(promptTokens, completionTokens);
    const totalTokens = promptTokens + completionTokens;

    this.totalTokens += totalTokens;
    this.totalCost += costUSD;

    this.usageHistory.push({
      timestamp: Date.now(),
      model,
      promptTokens,
      completionTokens,
      totalTokens,
      costUSD,
      requestTime,
    });

    // 保留最近100条记录
    if (this.usageHistory.length > 100) {
      this.usageHistory = this.usageHistory.slice(-100);
    }
  }

  getUsageStats() {
    return {
      requestCount: this.usageHistory.length,
      totalTokens: this.totalTokens,
      totalCost: this.totalCost,
      averageCostPerRequest: this.usageHistory.length > 0
        ? this.totalCost / this.usageHistory.length
        : 0,
      averageResponseTime: this.usageHistory.length > 0
        ? this.usageHistory.reduce((sum, entry) => sum + entry.requestTime, 0) / this.usageHistory.length
        : 0,
      history: this.usageHistory,
    };
  }

  clearHistory() {
    this.totalTokens = 0;
    this.totalCost = 0;
    this.usageHistory = [];
  }
}