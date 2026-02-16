import { Context, Next } from 'hono';
import { verify } from 'jsonwebtoken';
import type { Env } from '../types/env';
import type { JwtPayload } from '../types';

export const authMiddleware = async (c: Context<{ Bindings: Env }>, next: Next) => {
  const authHeader = c.req.header('Authorization');
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return c.json({
      success: false,
      error: {
        code: 'UNAUTHORIZED',
        message: 'Authorization header is missing or invalid',
      },
    }, 401);
  }

  const token = authHeader.slice(7);
  const jwtSecret = c.env.JWT_SECRET;

  if (!jwtSecret) {
    return c.json({
      success: false,
      error: {
        code: 'CONFIG_ERROR',
        message: 'JWT secret not configured',
      },
    }, 500);
  }

  try {
    const decoded = verify(token, jwtSecret) as unknown as JwtPayload;
    c.set('user', {
      id: decoded.userId,
      userId: decoded.userId,
      email: decoded.email,
      name: decoded.name,
      role: decoded.role,
    });
    await next();
  } catch (error) {
    return c.json({
      success: false,
      error: {
        code: 'INVALID_TOKEN',
        message: 'Invalid or expired token',
      },
    }, 401);
  }
};