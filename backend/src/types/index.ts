export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: ApiError;
  timestamp: number;
  requestId?: string;
}

export interface ApiError {
  code: string;
  message: string;
  details?: any;
  traceId?: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  avatarUrl?: string;
  role: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface JwtPayload {
  userId: string;
  id?: string;
  email: string;
  name: string;
  role: string;
  iat?: number;
  exp?: number;
}

export interface LLMProxyRequest {
  provider: string;
  model: string;
  messages: LLMMessage[];
  temperature?: number;
  maxTokens?: number;
  stream?: boolean;
}

export interface LLMMessage {
  role: string;
  content: string;
}

export interface LLMProxyResponse {
  id: string;
  model: string;
  choices: LLMCompletionChoice[];
  usage?: LLMUsage;
}

export interface LLMCompletionChoice {
  index: number;
  message: LLMMessage;
  finishReason?: string;
}

export interface LLMUsage {
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
}

export interface Story {
  id: string;
  userId: string;
  documentId: string;
  title: string;
  description: string;
  role: string;
  action: string;
  value: string;
  module: string;
  priority: string;
  status: string;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateStoryInput {
  userId: string;
  documentId: string;
  title: string;
  description: string;
  role: string;
  action: string;
  value: string;
  module: string;
  priority: string;
  status: string;
  tags?: string[];
}

export interface UserConfig {
  id: string;
  userId: string;
  llmProvider: string;
  defaultModel: string;
  temperature: number;
  maxTokens: number;
  autoSave: boolean;
  theme: string;
  notificationsEnabled: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface UpdateConfigInput {
  llmProvider?: string;
  defaultModel?: string;
  temperature?: number;
  maxTokens?: number;
  autoSave?: boolean;
  theme?: string;
  notificationsEnabled?: boolean;
}

// 为 Cloudflare Workers 环境变量添加类型定义
export interface CloudflareBindings {
  DATABASE_URL?: string;
  JWT_SECRET?: string;
  NODE_ENV?: 'development' | 'production' | 'test';
  OPENAI_API_KEY?: string;
  CLAUDE_API_KEY?: string;
  GEMINI_API_KEY?: string;
  SUPABASE_URL?: string;
  SUPABASE_ANON_KEY?: string;
  SUPABASE_KEY?: string;
  STORYWEAVER_KV?: KVNamespace;
  STORYWEAVER_R2?: R2Bucket;
  STORYWEAVER_QUEUE?: Queue;
}

// Hono 上下文类型扩展
declare module 'hono' {
  interface ContextVariableMap {
    user: {
      id: string;
      email: string;
      name: string;
      role: string;
      userId?: string;
    };
    secureHeadersNonce: string;
  }
}

export interface Document {
  id: string;
  userId: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  storagePath: string;
  parsedContent: string;
  status: string;
  parsedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}