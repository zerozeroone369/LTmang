import { execSync } from 'child_process';
import path from 'path';

process.env.NODE_ENV = 'test';
process.env.DATABASE_URL = 'file:./test.db';
process.env.JWT_SECRET = 'test_jwt_secret_for_vitest_only_at_least_32_chars';
process.env.JWT_EXPIRES_IN = '1h';
process.env.BCRYPT_SALT_ROUNDS = '4';
process.env.MAX_LOGIN_ATTEMPTS = '3';
process.env.LOGIN_LOCK_MINUTES = '15';

const schemaPath = path.resolve(process.cwd(), 'prisma', 'schema.prisma');

execSync(`npx prisma db push --skip-generate --schema="${schemaPath}"`, {
  env: {
    ...process.env,
    DATABASE_URL: 'file:./test.db',
  },
  stdio: 'pipe',
});
