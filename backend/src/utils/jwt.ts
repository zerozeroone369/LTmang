import jwt, { SignOptions } from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import { env } from '../config/env';

export interface AccessTokenPayload {
  sub: string;
  role: string;
  jti: string;
  iat?: number;
  exp?: number;
}

export function signAccessToken(
  userId: number,
  role: string,
): {
  token: string;
  jti: string;
  expiresIn: string;
} {
  const jti = uuidv4();
  const payload = {
    sub: String(userId),
    role,
    jti,
  };

  const options: SignOptions = {
    expiresIn: env.JWT_EXPIRES_IN as SignOptions['expiresIn'],
  };

  const token = jwt.sign(payload, env.JWT_SECRET, options);

  return {
    token,
    jti,
    expiresIn: env.JWT_EXPIRES_IN,
  };
}

export function verifyAccessToken(token: string): AccessTokenPayload {
  return jwt.verify(token, env.JWT_SECRET) as AccessTokenPayload;
}
