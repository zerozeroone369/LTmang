import { prisma } from '../../config/database';

export class AuthRepository {
  async findRoleByName(name: string) {
    return prisma.role.findUnique({ where: { name } });
  }

  async ensureRole(name: string, description?: string) {
    return prisma.role.upsert({
      where: { name },
      update: {},
      create: { name, description },
    });
  }

  async revokeToken(jti: string, userId: number, expiresAt: Date) {
    return prisma.revokedToken.upsert({
      where: { jti },
      update: { expiresAt },
      create: { jti, userId, expiresAt },
    });
  }

  async getSystemSettingNumber(key: string, fallback: number): Promise<number> {
    const setting = await prisma.systemSetting.findUnique({ where: { key } });
    if (!setting) return fallback;
    const parsed = Number(setting.value);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
  }
}

export const authRepository = new AuthRepository();
