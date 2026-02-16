import { Hono } from 'hono';
import { storyService } from '../services/stories';
import type { Env } from '../types/env';

export const storyRoutes = new Hono<{ Bindings: Env }>();

// 获取用户的所有故事
storyRoutes.get('/', async (c) => {
  try {
    const user = c.get('user') as any;
    const stories = await storyService.getAllStories(user.userId as string);

    return c.json({
      success: true,
      data: stories,
    });
  } catch (error: any) {
    console.error('Get stories error:', error);
    return c.json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: 'Failed to get stories',
        details: error?.message,
      },
    }, 500);
  }
});

// 获取单个故事
storyRoutes.get('/:id', async (c) => {
  try {
    const user = c.get('user') as any;
    const id = c.req.param('id');
    const story = await storyService.getStoryById(id, user.userId as string);

    if (!story) {
      return c.json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Story not found',
        },
      }, 404);
    }

    return c.json({
      success: true,
      data: story,
    });
  } catch (error: any) {
    console.error('Get story error:', error);
    return c.json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: 'Failed to get story',
        details: error?.message,
      },
    }, 500);
  }
});

// 创建故事
storyRoutes.post('/', async (c) => {
  try {
    const user = c.get('user') as any;
    const input = await c.req.json();

    const story = await storyService.createStory({
      ...input,
      userId: user.userId as string,
    });

    return c.json({
      success: true,
      data: story,
      message: 'Story created successfully',
    }, 201);
  } catch (error: any) {
    console.error('Create story error:', error);
    return c.json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: 'Failed to create story',
        details: error?.message,
      },
    }, 500);
  }
});

// 更新故事
storyRoutes.put('/:id', async (c) => {
  try {
    const user = c.get('user') as any;
    const id = c.req.param('id');
    const updates = await c.req.json();

    const story = await storyService.updateStory(id, user.userId as string, updates);

    if (!story) {
      return c.json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Story not found',
        },
      }, 404);
    }

    return c.json({
      success: true,
      data: story,
      message: 'Story updated successfully',
    });
  } catch (error: any) {
    console.error('Update story error:', error);
    return c.json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: 'Failed to update story',
        details: error?.message,
      },
    }, 500);
  }
});

// 删除故事
storyRoutes.delete('/:id', async (c) => {
  try {
    const user = c.get('user') as any;
    const id = c.req.param('id');

    const success = await storyService.deleteStory(id, user.userId as string);

    if (!success) {
      return c.json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Story not found',
        },
      }, 404);
    }

    return c.json({
      success: true,
      message: 'Story deleted successfully',
    });
  } catch (error: any) {
    console.error('Delete story error:', error);
    return c.json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: 'Failed to delete story',
        details: error?.message,
      },
    }, 500);
  }
});

// 搜索故事
storyRoutes.get('/search', async (c) => {
  try {
    const user = c.get('user') as any;
    const query = c.req.query('q') || '';

    const stories = await storyService.searchStories(user.userId as string, query);

    return c.json({
      success: true,
      data: stories,
    });
  } catch (error: any) {
    console.error('Search stories error:', error);
    return c.json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: 'Failed to search stories',
        details: error?.message,
      },
    }, 500);
  }
});