import { randomUUID } from 'crypto';
import { execSync } from 'child_process';
import { existsSync, unlinkSync } from 'fs';
import path from 'path';
import { afterAll } from 'vitest';

process.env.NODE_ENV = 'test';
const schemaPath = path.resolve(process.cwd(), 'prisma', 'schema.prisma');
const databaseFileName = `test-isolated-${process.pid}-${randomUUID()}.db`;
const databasePath = path.join(path.dirname(schemaPath), databaseFileName);
const databaseUrl = `file:./${databaseFileName}`;
process.env.DATABASE_URL = databaseUrl;
process.env.JWT_SECRET = 'test_jwt_secret_for_vitest_only_at_least_32_chars';
process.env.JWT_EXPIRES_IN = '1h';
process.env.BCRYPT_SALT_ROUNDS = '4';
process.env.MAX_LOGIN_ATTEMPTS = '3';
process.env.LOGIN_LOCK_MINUTES = '15';

function removeTestDatabaseFiles() {
  for (const suffix of ['', '-journal', '-wal', '-shm']) {
    const filePath = `${databasePath}${suffix}`;
    if (existsSync(filePath)) {
      unlinkSync(filePath);
    }
  }
}

if (existsSync(databasePath)) {
  throw new Error(`Refusing to overwrite an existing integration-test database: ${databasePath}`);
}
process.once('exit', removeTestDatabaseFiles);

try {
  execSync(`npx prisma db push --skip-generate --schema="${schemaPath}"`, {
    env: {
      ...process.env,
      DATABASE_URL: databaseUrl,
    },
    stdio: 'pipe',
  });
} catch (error) {
  removeTestDatabaseFiles();
  throw error;
}

afterAll(async () => {
  try {
    const { prisma } = await import('../src/config/database');
    await prisma.$disconnect();
  } finally {
    removeTestDatabaseFiles();
  }
});
