import request from 'supertest';
import { afterAll, beforeEach, describe, expect, it } from 'vitest';
import { createApp } from '../../src/app';
import { prisma } from '../../src/config/database';
import { hashPassword } from '../../src/utils/password';

const app = createApp();

async function seedAdminTestEnvironment() {
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

  const adminRole = await prisma.role.create({ data: { name: 'ADMIN', description: 'Admin' } });
  const studentRole = await prisma.role.create({
    data: { name: 'STUDENT', description: 'Student' },
  });

  const adminHash = await hashPassword('Admin@123456');
  const studentHash = await hashPassword('Student@123456');

  const admin = await prisma.user.create({
    data: {
      email: 'admin@uniconnect.edu.vn',
      studentCode: 'ADMIN001',
      fullName: 'Tú Anh Admin',
      passwordHash: adminHash,
      roleId: adminRole.id,
      status: 'ACTIVE',
    },
  });

  const student = await prisma.user.create({
    data: {
      email: 'sv1@dau.edu.vn',
      studentCode: '2351220001',
      fullName: 'Sinh viên Kiểm Thử',
      passwordHash: studentHash,
      roleId: studentRole.id,
      status: 'ACTIVE',
    },
  });

  const post = await prisma.post.create({
    data: {
      authorId: student.id,
      title: 'Bài viết vi phạm mẫu',
      content: 'Nội dung spam test moderation',
      category: 'COMMUNITY',
      scope: 'SCHOOL',
      status: 'ACTIVE',
    },
  });

  const report = await prisma.postReport.create({
    data: {
      postId: post.id,
      reporterId: admin.id,
      reason: 'Spam',
      description: 'Quảng cáo trái phép',
      status: 'PENDING',
    },
  });

  await prisma.systemSetting.create({
    data: {
      key: 'MAX_FILE_UPLOAD_MB',
      value: '20',
      group: 'DOCUMENTS',
      updatedById: admin.id,
    },
  });

  return { admin, student, post, report };
}

describe('Admin Dashboard Integration API & Lock Student Flow', () => {
  let ctx: Awaited<ReturnType<typeof seedAdminTestEnvironment>>;
  let adminToken: string;
  let studentToken: string;

  beforeEach(async () => {
    ctx = await seedAdminTestEnvironment();

    const adminLogin = await request(app).post('/api/auth/login').send({
      identifier: 'admin@uniconnect.edu.vn',
      password: 'Admin@123456',
    });
    adminToken = adminLogin.body.data.accessToken;

    const studentLogin = await request(app).post('/api/auth/login').send({
      identifier: '2351220001',
      password: 'Student@123456',
    });
    studentToken = studentLogin.body.data.accessToken;
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it('rejects STUDENT accessing /api/admin/* endpoints', async () => {
    const res = await request(app)
      .get('/api/admin/dashboard')
      .set('Authorization', `Bearer ${studentToken}`);

    expect(res.status).toBe(403);
    expect(res.body.error.code).toBe('FORBIDDEN');
  });

  it('KPI Flow: Admin locks student -> student login and active JWT are blocked -> Admin unlocks -> student can login again', async () => {
    // 1. Admin locks student account
    const lockRes = await request(app)
      .patch(`/api/admin/users/${ctx.student.id}/lock`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ reason: 'Đăng bài spam nhiều lần' });

    expect(lockRes.status).toBe(200);
    expect(lockRes.body.data.status).toBe('LOCKED');
    expect(lockRes.body.data.lockedReason).toBe('Đăng bài spam nhiều lần');

    // 2. Existing student token is immediately rejected by authenticate middleware
    const meBlocked = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${studentToken}`);
    expect(meBlocked.status).toBe(403);
    expect(meBlocked.body.error.code).toBe('ACCOUNT_LOCKED');

    // 3. Student login attempt is blocked
    const loginBlocked = await request(app).post('/api/auth/login').send({
      identifier: 'sv1@dau.edu.vn',
      password: 'Student@123456',
    });
    expect(loginBlocked.status).toBe(403);
    expect(loginBlocked.body.error.code).toBe('ACCOUNT_LOCKED');

    // 4. Admin unlocks student account
    const unlockRes = await request(app)
      .patch(`/api/admin/users/${ctx.student.id}/unlock`)
      .set('Authorization', `Bearer ${adminToken}`);
    expect(unlockRes.status).toBe(200);
    expect(unlockRes.body.data.status).toBe('ACTIVE');

    // 5. Student can log in again
    const loginRestored = await request(app).post('/api/auth/login').send({
      identifier: '2351220001',
      password: 'Student@123456',
    });
    expect(loginRestored.status).toBe(200);
    expect(loginRestored.body.data.accessToken).toBeTruthy();

    // 6. AdminLogs recorded both LOCK_USER and UNLOCK_USER
    const logsRes = await request(app)
      .get('/api/admin/logs')
      .set('Authorization', `Bearer ${adminToken}`);
    expect(logsRes.status).toBe(200);
    const actions = logsRes.body.data.map((log: { action: string }) => log.action);
    expect(actions).toContain('LOCK_USER');
    expect(actions).toContain('UNLOCK_USER');
  });

  it('Admin resolves violation report by hiding post and creates/publishes Campus post synced with /api/campus', async () => {
    const resolveRes = await request(app)
      .patch(`/api/admin/reports/${ctx.report.id}/resolve`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ action: 'HIDE_POST', note: 'Vi phạm nội quy cộng đồng' });

    expect(resolveRes.status).toBe(200);
    expect(resolveRes.body.data.status).toBe('RESOLVED_HIDDEN');
    expect(resolveRes.body.data.post.status).toBe('HIDDEN');

    const createCampusRes = await request(app)
      .post('/api/admin/campus')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        title: 'Ngày hội Việc làm IT 2026',
        content: 'Cơ hội phỏng vấn trực tiếp cùng 20 doanh nghiệp phần mềm tại Đà Nẵng.',
        category: 'EVENT',
        location: 'Hội trường A',
        isPinned: true,
        status: 'PUBLISHED',
      });
    expect(createCampusRes.status).toBe(201);

    // Public client endpoint /api/campus reflects the created post
    const publicCampusRes = await request(app).get('/api/campus');
    expect(publicCampusRes.status).toBe(200);
    expect(publicCampusRes.body.data).toHaveLength(1);
    expect(publicCampusRes.body.data[0].title).toBe('Ngày hội Việc làm IT 2026');
  });

  it('Admin manages Academic hierarchy & SystemSettings and views Dashboard stats', async () => {
    const schoolRes = await request(app)
      .post('/api/admin/academic/schools')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ code: 'BKDN', name: 'Đại học Bách Khoa Đà Nẵng', shortName: 'DUT' });
    expect(schoolRes.status).toBe(201);

    const settingsRes = await request(app)
      .put('/api/admin/settings')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        settings: [{ key: 'MAX_FILE_UPLOAD_MB', value: '25' }],
      });
    expect(settingsRes.status).toBe(200);
    expect(settingsRes.body.data[0].value).toBe('25');

    const dashRes = await request(app)
      .get('/api/admin/dashboard')
      .set('Authorization', `Bearer ${adminToken}`);
    expect(dashRes.status).toBe(200);
    expect(dashRes.body.data.stats.totalUsers).toBe(2);
    expect(dashRes.body.data.stats.pendingReports).toBe(1);
  });
});
