declare module 'express-serve-static-core' {
  interface Request {
    auth?: {
      userId: number;
      role: string;
      jti: string;
      exp?: number;
    };
  }
}

export {};
