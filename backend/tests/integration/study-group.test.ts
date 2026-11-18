import request from 'supertest';
import { beforeAll, describe, expect, it } from 'vitest';
import { createApp } from '../../src/app';
import { prisma } from '../../src/config/database';
import { hashPassword } from '../../src/utils/password';

const app = createApp();

describe('Study Groups & Campus Integration API (Modules 6 & 7 - Bảo + Module 9 Notifications)', () => {
  let leaderToken = '';
  let studentToken = '';
  let thirdStudentToken = '';
  let leaderId = 0;
  let studentId = 0;
  let subjectId = 0;
  let groupId = 0;
  let joinRequestId = 0;

  beforeAll(async () => {
    const studentRole = await prisma.role.upsert({
      where: { name: 'STUDENT' },
      update: {},
      create: { name: 'STUDENT', description: 'Sinh viên' },
    });

    const school = await prisma.school.create({
      data: { code: 'DAU_SG', name: 'Đại học Kiến trúc Đà Nẵng' },
    });
    const faculty = await prisma.faculty.create({
      data: { schoolId: school.id, code: 'CNTT_SG', name: 'Khoa CNTT' },
    });
    const subject = await prisma.subject.create({
      data: { code: 'NET_SG', name: 'Lập trình mạng', facultyId: faculty.id },
    });
    subjectId = subject.id;

    const passwordHash = await hashPassword('Student@123456');
    const leader = await prisma.user.create({
      data: {
        email: 'leader_sg@dau.edu.vn',
        studentCode: '2351220101',
        fullName: 'Trưởng Nhóm Bảo',
        passwordHash,
        roleId: studentRole.id,
        status: 'ACTIVE',
      },
    });
    leaderId = leader.id;

    const student = await prisma.user.create({
      data: {
        email: 'member_sg@dau.edu.vn',
        studentCode: '2351220102',
        fullName: 'Thành Viên A',
        passwordHash,
        roleId: studentRole.id,
        status: 'ACTIVE',
      },
    });
    studentId = student.id;

    await prisma.user.create({
      data: {
        email: 'third_sg@dau.edu.vn',
        studentCode: '2351220103',
        fullName: 'Thành Viên B',
        passwordHash,
        roleId: studentRole.id,
        status: 'ACTIVE',
      },
    });

    await prisma.campusPost.create({
      data: {
        authorId: leader.id,
        title: 'Học bổng IT 2026',
        content: 'Thông tin học bổng dành cho sinh viên CNTT xuất sắc.',
        category: 'SCHOLARSHIP',
        status: 'PUBLISHED',
      },
    });

    const loginLeader = await request(app)
      .post('/api/auth/login')
      .send({ identifier: 'leader_sg@dau.edu.vn', password: 'Student@123456' });
    leaderToken = loginLeader.body.data.accessToken;

    const loginStudent = await request(app)
      .post('/api/auth/login')
      .send({ identifier: 'member_sg@dau.edu.vn', password: 'Student@123456' });
    studentToken = loginStudent.body.data.accessToken;

    const loginThird = await request(app)
      .post('/api/auth/login')
      .send({ identifier: 'third_sg@dau.edu.vn', password: 'Student@123456' });
    thirdStudentToken = loginThird.body.data.accessToken;
  });

  it('POST /api/groups creates a study group with creator as LEADER', async () => {
    const res = await request(app)
      .post('/api/groups')
      .set('Authorization', `Bearer ${leaderToken}`)
      .send({
        name: 'Nhóm Ôn Thi Lập Trình Mạng',
        description: 'Ôn tập TCP/UDP, REST API, Socket.io',
        subjectId,
        goal: 'Đạt điểm A',
        location: 'Thư viện tầng 3',
        maxMembers: 2,
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.name).toBe('Nhóm Ôn Thi Lập Trình Mạng');
    expect(res.body.data.members[0].role).toBe('LEADER');
    groupId = res.body.data.id;
  });

  it('POST /api/groups/:id/join creates pending request and sends realtime notification to leader', async () => {
    const res = await request(app)
      .post(`/api/groups/${groupId}/join`)
      .set('Authorization', `Bearer ${studentToken}`)
      .send({ message: 'Cho mình tham gia ôn thi với nhé!' });

    expect(res.status).toBe(201);
    joinRequestId = res.body.data.id;

    // Verify notification sent to leader (Module 6 -> Module 9 integration)
    const leaderNotifications = await prisma.notification.findMany({
      where: { userId: leaderId, type: 'join_request', referenceId: groupId },
    });
    expect(leaderNotifications.length).toBeGreaterThanOrEqual(1);
  });

  it('PUT /api/groups/join-requests/:id blocks non-leader and allows leader to approve + notify applicant', async () => {
    const forbiddenRes = await request(app)
      .put(`/api/groups/join-requests/${joinRequestId}`)
      .set('Authorization', `Bearer ${studentToken}`)
      .send({ status: 'APPROVED' });
    expect(forbiddenRes.status).toBe(403);

    const approveRes = await request(app)
      .put(`/api/groups/join-requests/${joinRequestId}`)
      .set('Authorization', `Bearer ${leaderToken}`)
      .send({ status: 'APPROVED' });
    expect(approveRes.status).toBe(200);
    expect(approveRes.body.data.status).toBe('APPROVED');

    // Verify notification sent back to applicant
    const studentNotifications = await prisma.notification.findMany({
      where: { userId: studentId, type: 'join_request', referenceId: groupId },
    });
    expect(studentNotifications.length).toBeGreaterThanOrEqual(1);
  });

  it('POST /api/groups/:id/join rejects when group reaches maxMembers', async () => {
    const res = await request(app)
      .post(`/api/groups/${groupId}/join`)
      .set('Authorization', `Bearer ${thirdStudentToken}`)
      .send({ message: 'Mình muốn vào thêm' });

    expect(res.status).toBe(409);
  });

  it('GET /api/campus returns published campus posts with category filter', async () => {
    const res = await request(app).get('/api/campus?category=SCHOLARSHIP&page=1&limit=10');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.length).toBeGreaterThanOrEqual(1);
    expect(res.body.data[0].category).toBe('SCHOLARSHIP');
  });
});
