import { Hono } from 'hono';
import { configService } from '../services/config';
import type { Env } from '../types/env';

export const configRoutes = new Hono<{ Bindings: Env }>();

// 获取用户配置
configRoutes.get('/', async (c) => {
  try {
    const user = c.get('user') as any;
    const config = await configService.getUserConfig(user.userId as string);

    return c.json({
      success: true,
      data: config,
    });
  } catch (error: any) {
    console.error('Get config error:', error);
    return c.json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: 'Failed to get user config',
        details: error?.message,
      },
    }, 500);
  }
});

// 更新用户配置
configRoutes.put('/', async (c) => {
  try {
    const user = c.get('user') as any;
    const updates = await c.req.json();

    const config = await configService.updateUserConfig(user.userId as string, updates);

    return c.json({
      success: true,
      data: config,
      message: 'Config updated successfully',
    });
  } catch (error: any) {
    console.error('Update config error:', error);
    return c.json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: 'Failed to update user config',
        details: error?.message,
      },
    }, 500);
  }
});

// 重置用户配置
configRoutes.post('/reset', async (c) => {
  try {
    const user = c.get('user') as any;
    const config = await configService.resetUserConfig(user.userId as string);

    return c.json({
      success: true,
      data: config,
      message: 'Config reset to defaults',
    });
  } catch (error: any) {
    console.error('Reset config error:', error);
    return c.json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: 'Failed to reset config',
        details: error?.message,
      },
    }, 500);
  }
});