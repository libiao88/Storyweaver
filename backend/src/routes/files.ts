import { Hono } from 'hono';
import { fileService } from '../services/files';
import type { Env } from '../types/env';

export const fileRoutes = new Hono<{ Bindings: Env }>();

// 文件上传
fileRoutes.post('/upload', async (c) => {
  try {
    const user = c.get('user') as any;
    const formData = await c.req.formData();
    const file = formData.get('file') as any;
    
    if (!file) {
      return c.json({
        success: false,
        error: {
          code: 'MISSING_FILE',
          message: 'File is required',
        },
      }, 400);
    }

    const arrayBuffer = await file.arrayBuffer();
    const fileData = Buffer.from(arrayBuffer);

    const document = await fileService.uploadFile(
      user.userId as string,
      fileData,
      file.name,
      file.type
    );

    fileService.parseDocument(document.id, user.userId as string)
      .catch(error => console.error('Failed to parse document:', error));

    return c.json({
      success: true,
      data: document,
      message: 'File uploaded successfully',
    }, 201);
  } catch (error: any) {
    console.error('Upload file error:', error);
    return c.json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: 'Failed to upload file',
        details: error?.message,
      },
    }, 500);
  }
});

// 获取用户所有文件
fileRoutes.get('/', async (c) => {
  try {
    const user = c.get('user') as any;
    const documents = await fileService.getAllDocuments(user.userId as string);

    return c.json({
      success: true,
      data: documents,
    });
  } catch (error: any) {
    console.error('Get files error:', error);
    return c.json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: 'Failed to get files',
        details: error?.message,
      },
    }, 500);
  }
});

// 获取单个文件
fileRoutes.get('/:id', async (c) => {
  try {
    const user = c.get('user') as any;
    const id = c.req.param('id');
    const document = await fileService.getDocumentById(id, user.userId as string);

    if (!document) {
      return c.json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Document not found',
        },
      }, 404);
    }

    return c.json({
      success: true,
      data: document,
    });
  } catch (error: any) {
    console.error('Get file error:', error);
    return c.json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: 'Failed to get file',
        details: error?.message,
      },
    }, 500);
  }
});

// 删除文件
fileRoutes.delete('/:id', async (c) => {
  try {
    const user = c.get('user') as any;
    const id = c.req.param('id');
    
    const success = await fileService.deleteDocument(id, user.userId as string);

    if (!success) {
      return c.json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Document not found',
        },
      }, 404);
    }

    return c.json({
      success: true,
      message: 'File deleted successfully',
    });
  } catch (error: any) {
    console.error('Delete file error:', error);
    return c.json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: 'Failed to delete file',
        details: error?.message,
      },
    }, 500);
  }
});