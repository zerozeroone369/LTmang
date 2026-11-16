import express from 'express';
import request from 'supertest';
import { afterAll, beforeEach, describe, expect, it } from 'vitest';
import { createApp } from '../../src/app';
import { prisma } from '../../src/config/database';
import { authenticate, requireRole } from '../../src/middlewares/auth.middleware';
import { errorHandler } from '../../src/middlewares/error.middleware';
import { hashPassword } from '../../src/utils/password';

const app = createApp();
const guardTestApp = express();
guardTestApp.get('/api/test-admin-only', authenticate, requireRole('ADMIN'), (_req, res) => {
  res.json({ success: true, data: 'admin-ok' });
});
guardTestApp.use(errorHandler);

async function resetAndSeedTestDb() {
  await prisma.revokedToken.deleteMany();
  await prisma.adminLog.deleteMany();
  await prisma.postReport.deleteMany();
  await prisma.comment.deleteMany();
  await prisma.reaction.deleteMany();
  await prisma.post.deleteMany();
  await prisma.campusPost.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.systemSetting.deleteMany();
  await prisma.user.deleteMany();
  await prisma.class.deleteMany();
  await prisma.course.deleteMany();
  await prisma.major.deleteMany();
  await prisma.faculty.deleteMany();
  await prisma.school.deleteMany();
  await prisma.role.deleteMany();

  const studentRole = await prisma.role.create({
    data: { name: 'STUDENT', description: 'Student' },
  });
  const adminRole = await prisma.role.create({
    data: { name: 'ADMIN', description: 'Admin' },
  });

  const school = await prisma.school.create({
    data: { code: 'DAU', name: 'Đại học Kiến trúc Đà Nẵng', shortName: 'DAU' },
  });
  const faculty = await prisma.faculty.create({
    data: { schoolId: school.id, code: 'CNTT', name: 'Khoa CNTT' },
  });
  const major = await prisma.major.create({
    data: { facultyId: faculty.id, code: 'CNTT', name: 'Công nghệ thông tin' },
  });
  const course = await prisma.course.create({
    data: { schoolId: school.id, code: 'K23', name: 'Khóa 23', startYear: 2023, endYear: 2027 },
  });
  const classRoom = await prisma.class.create({
    data: { majorId: major.id, courseId: course.id, code: '23CT1', name: 'Lớp 23CT1' },
  });

  return { studentRole, adminRole, school, faculty, major, course, classRoom };
}

describe('Core System & Auth Integration API', () => {
  let seedData: Awaited<ReturnType<typeof resetAndSeedTestDb>>;

  beforeEach(async () => {
    seedData = await resetAndSeedTestDb();
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it('GET /api/health returns healthy status', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.status).toBe('healthy');
  });

  it('GET /api/academic/* returns seeded school hierarchy', async () => {
    const schoolsRes = await request(app).get('/api/academic/schools');
    expect(schoolsRes.status).toBe(200);
    expect(schoolsRes.body.data).toHaveLength(1);

    const classesRes = await request(app).get(
      `/api/academic/classes?majorId=${seedData.major.id}&courseId=${seedData.course.id}`,
    );
    expect(classesRes.status).toBe(200);
    expect(classesRes.body.data[0].code).toBe('23CT1');
  });

  it('POST /api/auth/register creates student with Bcrypt hash and returns JWT without leaking passwordHash', async () => {
    const res = await request(app).post('/api/auth/register').send({
      fullName: 'Sinh viên Test',
      email: 'svtest@dau.edu.vn',
      studentCode: '2351220999',
      password: 'Password@123',
      classId: seedData.classRoom.id,
    });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.accessToken).toBeTruthy();
    expect(res.body.data.user.role).toBe('STUDENT');
    expect(res.body.data.user.classInfo.code).toBe('23CT1');
    expect(res.body.data.user.school.code).toBe('DAU');
    expect(res.body.data.user.passwordHash).toBeUndefined();

    const dbUser = await prisma.user.findUnique({ where: { email: 'svtest@dau.edu.vn' } });
    expect(dbUser).not.toBeNull();
    expect(dbUser?.passwordHash).not.toBe('Password@123');
  });

  it('POST /api/auth/register rejects duplicate email/studentCode and weak password', async () => {
    const weakRes = await request(app).post('/api/auth/register').send({
      fullName: 'Weak Pass',
      email: 'weak@dau.edu.vn',
      password: '123',
    });
    expect(weakRes.status).toBe(400);

    await request(app).post('/api/auth/register').send({
      fullName: 'First User',
      email: 'dup@dau.edu.vn',
      studentCode: '2351220111',
      password: 'Password@123',
    });

    const dupEmailRes = await request(app).post('/api/auth/register').send({
      fullName: 'Second User',
      email: 'dup@dau.edu.vn',
      studentCode: '2351220222',
      password: 'Password@123',
    });
    expect(dupEmailRes.status).toBe(409);

    const dupCodeRes = await request(app).post('/api/auth/register').send({
      fullName: 'Third User',
      email: 'unique@dau.edu.vn',
      studentCode: '2351220111',
      password: 'Password@123',
    });
    expect(dupCodeRes.status).toBe(409);
  });

  it('POST /api/auth/login works with email or studentCode and protects against brute-force attempts', async () => {
    await request(app).post('/api/auth/register').send({
      fullName: 'Login User',
      email: 'login@dau.edu.vn',
      studentCode: '2351220888',
      password: 'Password@123',
    });

    const loginByEmail = await request(app).post('/api/auth/login').send({
      identifier: 'login@dau.edu.vn',
      password: 'Password@123',
    });
    expect(loginByEmail.status).toBe(200);

    const loginByCode = await request(app).post('/api/auth/login').send({
      identifier: '2351220888',
      password: 'Password@123',
    });
    expect(loginByCode.status).toBe(200);

    // 3 wrong attempts (MAX_LOGIN_ATTEMPTS=3 in test setup)
    await request(app)
      .post('/api/auth/login')
      .send({ identifier: '2351220888', password: 'Wrong@123' })
      .expect(401);
    await request(app)
      .post('/api/auth/login')
      .send({ identifier: '2351220888', password: 'Wrong@123' })
      .expect(401);
    const lockedAttempt = await request(app)
      .post('/api/auth/login')
      .send({ identifier: '2351220888', password: 'Wrong@123' });
    expect(lockedAttempt.status).toBe(429);
    expect(lockedAttempt.body.error.code).toBe('TOO_MANY_ATTEMPTS');
  });

  it('POST /api/auth/logout revokes JWT token immediately', async () => {
    const reg = await request(app).post('/api/auth/register').send({
      fullName: 'Logout User',
      email: 'logout@dau.edu.vn',
      password: 'Password@123',
    });
    const token = reg.body.data.accessToken;

    await request(app).get('/api/auth/me').set('Authorization', `Bearer ${token}`).expect(200);

    await request(app).post('/api/auth/logout').set('Authorization', `Bearer ${token}`).expect(200);

    const afterLogout = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${token}`);
    expect(afterLogout.status).toBe(401);
    expect(afterLogout.body.error.code).toBe('TOKEN_REVOKED');
  });

  it('PUT /api/auth/change-password validates current password and updates hash', async () => {
    const reg = await request(app).post('/api/auth/register').send({
      fullName: 'Change Pwd User',
      email: 'pwd@dau.edu.vn',
      password: 'Password@123',
    });
    const token = reg.body.data.accessToken;

    await request(app)
      .put('/api/auth/change-password')
      .set('Authorization', `Bearer ${token}`)
      .send({ currentPassword: 'Wrong@123', newPassword: 'NewPassword@456' })
      .expect(400);

    await request(app)
      .put('/api/auth/change-password')
      .set('Authorization', `Bearer ${token}`)
      .send({ currentPassword: 'Password@123', newPassword: 'NewPassword@456' })
      .expect(200);

    await request(app)
      .post('/api/auth/login')
      .send({ identifier: 'pwd@dau.edu.vn', password: 'Password@123' })
      .expect(401);

    await request(app)
      .post('/api/auth/login')
      .send({ identifier: 'pwd@dau.edu.vn', password: 'NewPassword@456' })
      .expect(200);
  });

  it('PUT /api/users/profile updates personal details and academic hierarchy', async () => {
    const reg = await request(app).post('/api/auth/register').send({
      fullName: 'Profile User',
      email: 'profile@dau.edu.vn',
      password: 'Password@123',
    });
    const token = reg.body.data.accessToken;

    const updateRes = await request(app)
      .put('/api/users/profile')
      .set('Authorization', `Bearer ${token}`)
      .send({
        fullName: 'Profile Updated',
        bio: 'Học lập trình mạng',
        phone: '0905123456',
        classId: seedData.classRoom.id,
      });

    expect(updateRes.status).toBe(200);
    expect(updateRes.body.data.fullName).toBe('Profile Updated');
    expect(updateRes.body.data.classInfo.code).toBe('23CT1');
  });

  it('Role guard blocks STUDENT from ADMIN endpoints and blocks LOCKED accounts', async () => {
    const studentHash = await hashPassword('Password@123');
    await prisma.user.create({
      data: {
        email: 'locked@dau.edu.vn',
        fullName: 'Locked Student',
        passwordHash: studentHash,
        roleId: seedData.studentRole.id,
        status: 'LOCKED',
        lockedReason: 'Vi phạm nội quy',
      },
    });

    const lockedLogin = await request(app).post('/api/auth/login').send({
      identifier: 'locked@dau.edu.vn',
      password: 'Password@123',
    });
    expect(lockedLogin.status).toBe(403);
    expect(lockedLogin.body.error.code).toBe('ACCOUNT_LOCKED');

    const reg = await request(app).post('/api/auth/register').send({
      fullName: 'Normal Student',
      email: 'normal@dau.edu.vn',
      password: 'Password@123',
    });

    const adminRes = await request(guardTestApp)
      .get('/api/test-admin-only')
      .set('Authorization', `Bearer ${reg.body.data.accessToken}`);
    expect(adminRes.status).toBe(403);
    expect(adminRes.body.error.code).toBe('FORBIDDEN');
  });
});
