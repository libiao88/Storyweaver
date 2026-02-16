import { sign, verify } from 'jsonwebtoken';

export function generateToken(payload: any, secret: string, expiresIn: string = '24h'): string {
  const options: any = { expiresIn };
  return sign(payload, secret, options);
}

export function verifyToken(token: string, secret: string): any {
  try {
    return verify(token, secret);
  } catch (error) {
    return null;
  }
}