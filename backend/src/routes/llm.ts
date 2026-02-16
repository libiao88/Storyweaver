import { Hono } from 'hono';
import type { Env } from '../types/env';

export const llmProxyRoutes = new Hono<{ Bindings: Env }>();

// OpenAI API 代理
llmProxyRoutes.post('/openai/*', async (c) => {
  const path = c.req.path.replace('/api/llm/openai/', '');
  const body = await c.req.json();
  const apiKey = c.env.OPENAI_API_KEY;
  
  if (!apiKey) {
    return c.json({
      success: false,
      error: {
        code: 'LLM_001',
        message: 'API key not configured',
        details: 'OPENAI_API_KEY environment variable is not set'
      }
    }, 500);
  }
  
  try {
    const response = await fetch(`https://api.openai.com/v1/${path}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();
    
    c.status(response.status as any);
    return c.json({
      success: response.ok,
      data: response.ok ? data : undefined,
      error: response.ok ? undefined : {
        code: 'LLM_002',
        message: (data as any).error?.message || 'API call failed',
        details: (data as any).error?.code || 'unknown'
      }
    });
  } catch (error) {
    c.status(500);
    return c.json({
      success: false,
      error: {
        code: 'LLM_003',
        message: 'Network or server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      }
    });
  }
});

// Claude API 代理
llmProxyRoutes.post('/claude/*', async (c) => {
  const path = c.req.path.replace('/api/llm/claude/', '');
  const body = await c.req.json();
  const apiKey = c.env.CLAUDE_API_KEY;
  
  if (!apiKey) {
    return c.json({
      success: false,
      error: {
        code: 'LLM_001',
        message: 'API key not configured',
        details: 'CLAUDE_API_KEY environment variable is not set'
      }
    }, 500);
  }
  
  try {
    const response = await fetch(`https://api.anthropic.com/v1/${path}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();
    
    c.status(response.status as any);
    return c.json({
      success: response.ok,
      data: response.ok ? data : undefined,
      error: response.ok ? undefined : {
        code: 'LLM_002',
        message: (data as any).error?.message || 'API call failed',
        details: (data as any).error?.code || 'unknown'
      }
    });
  } catch (error) {
    c.status(500);
    return c.json({
      success: false,
      error: {
        code: 'LLM_003',
        message: 'Network or server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      }
    });
  }
});