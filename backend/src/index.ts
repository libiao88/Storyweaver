import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { secureHeaders } from 'hono/secure-headers';
import { authMiddleware } from './middleware/auth';
import { llmProxyRoutes } from './routes/llm';
import { authRoutes } from './routes/auth';
import { storyRoutes } from './routes/stories';
import { configRoutes } from './routes/config';
import { fileRoutes } from './routes/files';
import type { Env } from './types/env';

const app = new Hono<{ Bindings: Env }>();

// 全局中间件
app.use('*', cors());
app.use('*', logger());
app.use('*', secureHeaders());

// 健康检查
app.get('/health', (c) => {
  return c.json({
    success: true,
    message: 'Service is healthy',
    timestamp: Date.now(),
  });
});

// 认证路由 (不需要鉴权)
app.route('/api/auth', authRoutes);

// 需要鉴权的路由
app.use('/api/*', authMiddleware);

// LLM 代理路由
app.route('/api/llm', llmProxyRoutes);

// 用户故事管理路由
app.route('/api/stories', storyRoutes);

// 配置管理路由
app.route('/api/config', configRoutes);

// 文件处理路由
app.route('/api/files', fileRoutes);

export default app;