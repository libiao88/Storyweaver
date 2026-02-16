import { Hono } from 'hono';
import { sign } from 'jsonwebtoken';
import { hash, compare } from 'bcryptjs';
import { createClient } from '@supabase/supabase-js';
import type { Env } from '../types/env';

export const authRoutes = new Hono<{ Bindings: Env }>();

const getSupabaseClient = (env: Env) => {
  return createClient(
    env.SUPABASE_URL || 'https://dqmwpihbwggsjwmpktmo.supabase.co',
    env.SUPABASE_KEY || ''
  );
};

// 用户注册
authRoutes.post('/signup', async (c) => {
  const { email, password, name } = await c.req.json();

  if (!email || !password || !name) {
    return c.json({
      success: false,
      error: {
        code: 'INVALID_INPUT',
        message: 'Email, password, and name are required',
      },
    }, 400);
  }

  try {
    const supabase = getSupabaseClient(c.env);
    console.log('Signup attempt for:', email);
    const { data: existingUser, error: checkError } = await supabase
      .from('users')
      .select('id')
      .eq('email', email)
      .single();

    if (checkError && checkError.code !== 'PGRST116') {
      console.log('Check error:', checkError);
    }

    if (existingUser) {
      return c.json({
        success: false,
        error: {
          code: 'USER_EXISTS',
          message: 'User with this email already exists',
        },
      }, 409);
    }

    console.log('Hashing password...');
    const passwordHash = await hash(password, 10).catch(err => {
      console.log('Hash error:', err);
      return password;
    });
    console.log('Password hashed, length:', passwordHash.length);

    const { data: newUser, error: insertError } = await supabase
      .from('users')
      .insert({
        email,
        password_hash: passwordHash,
        name,
        role: 'user',
      })
      .select()
      .single();

    if (insertError) {
      console.log('Insert error:', insertError);
      return c.json({
        success: false,
        error: {
          code: 'SERVER_ERROR',
          message: 'Failed to create user',
          details: insertError.message,
        },
      }, 500);
    }

    console.log('User created:', newUser);

    const jwtSecret = c.env.JWT_SECRET;
    if (!jwtSecret) {
      return c.json({
        success: false,
        error: {
          code: 'CONFIG_ERROR',
          message: 'JWT secret not configured',
          details: 'JWT_SECRET environment variable is not set'
        }
      }, 500);
    }

    const token = sign(
      {
        userId: newUser?.id,
        email: newUser?.email,
        name: newUser?.name,
        role: newUser?.role,
      },
      jwtSecret,
      { expiresIn: '24h' }
    );

    return c.json({
      success: true,
      data: {
        user: {
          id: newUser?.id,
          email: newUser?.email,
          name: newUser?.name,
          role: newUser?.role,
        },
        token,
      },
      message: 'User created successfully',
    });
  } catch (error) {
    console.error('Signup error:', error);
    return c.json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: 'Failed to create user',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
    }, 500);
  }
});

// 用户登录
authRoutes.post('/login', async (c) => {
  const { email, password } = await c.req.json();

  if (!email || !password) {
    return c.json({
      success: false,
      error: {
        code: 'INVALID_INPUT',
        message: 'Email and password are required',
      },
    }, 400);
  }

  try {
    const supabase = getSupabaseClient(c.env);
    console.log('Login attempt for:', email);
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();

    if (userError || !user) {
      console.log('User not found or error:', userError);
      return c.json({
        success: false,
        error: {
          code: 'INVALID_CREDENTIALS',
          message: 'Invalid email or password',
        },
      }, 401);
    }

    console.log('Found user:', user);

    const isValidPassword = await compare(password, user.password_hash).catch(() => {
      return password === user.password_hash;
    });

    if (!isValidPassword) {
      console.log('Password mismatch:', { input: password, stored: user.password_hash });
      return c.json({
        success: false,
        error: {
          code: 'INVALID_CREDENTIALS',
          message: 'Invalid email or password',
        },
      }, 401);
    }

    const jwtSecret = c.env.JWT_SECRET;
    if (!jwtSecret) {
      return c.json({
        success: false,
        error: {
          code: 'CONFIG_ERROR',
          message: 'JWT secret not configured',
          details: 'JWT_SECRET environment variable is not set'
        }
      }, 500);
    }

    const token = sign(
      {
        userId: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
      jwtSecret,
      { expiresIn: '24h' }
    );

    return c.json({
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        },
        token,
      },
      message: 'Login successful',
    });
  } catch (error) {
    console.error('Login error:', error);
    return c.json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: 'Failed to login',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
    }, 500);
  }
});