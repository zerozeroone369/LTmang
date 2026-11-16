import { describe, expect, it } from 'vitest';
import { signAccessToken, verifyAccessToken } from '../../src/utils/jwt';
import { comparePassword, hashPassword, validatePasswordStrength } from '../../src/utils/password';

describe('Security Utilities (Password & JWT)', () => {
  it('should hash password with Bcrypt and verify correctly', async () => {
    const plain = 'Student@2026!';
    const hash = await hashPassword(plain);

    expect(hash).not.toBe(plain);
    expect(hash.startsWith('$2')).toBe(true);
    expect(await comparePassword(plain, hash)).toBe(true);
    expect(await comparePassword('WrongPassword@1', hash)).toBe(false);
  });

  it('should validate password strength requirements', () => {
    expect(validatePasswordStrength('weak').valid).toBe(false);
    expect(validatePasswordStrength('alllowercase1!').valid).toBe(false);
    expect(validatePasswordStrength('ALLUPPERCASE1!').valid).toBe(false);
    expect(validatePasswordStrength('NoNumberPass!').valid).toBe(false);
    expect(validatePasswordStrength('NoSpecial123').valid).toBe(false);
    expect(validatePasswordStrength('StrongPass@2026').valid).toBe(true);
  });

  it('should sign and verify JWT access token with sub, role, and jti', () => {
    const { token, jti } = signAccessToken(42, 'STUDENT');
    const decoded = verifyAccessToken(token);

    expect(decoded.sub).toBe('42');
    expect(decoded.role).toBe('STUDENT');
    expect(decoded.jti).toBe(jti);
  });
});
