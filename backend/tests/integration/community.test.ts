import request from 'supertest';
import { afterAll, beforeEach, describe, expect, it } from 'vitest';
import { createApp } from '../../src/app';
import { prisma } from '../../src/config/database';
import { signAccessToken } from '../../src/utils/jwt';
import { hashPassword } from '../../src/utils/password';

const app = createApp();

describe('Community Module API', () => {
  let studentToken: string;
  let testClassId: number;
  let testFacultyId: number;
  let studentUser: { id: number; email: string };

  beforeEach(async () => {
    // Clean up
    await prisma.revokedToken.deleteMany();
    await prisma.adminLog.deleteMany();
    await prisma.systemSetting.deleteMany();
    await prisma.notification.deleteMany();
    await prisma.campusPost.deleteMany();
    await prisma.comment.deleteMany();
    await prisma.reaction.deleteMany();
    await prisma.postReport.deleteMany();
    await prisma.post.deleteMany();
    await prisma.vote.deleteMany();
    await prisma.answer.deleteMany();
    await prisma.question.deleteMany();
    await prisma.documentRating.deleteMany();
    await prisma.document.deleteMany();
    await prisma.subject.deleteMany();
    await prisma.user.deleteMany();
    await prisma.class.deleteMany();
    await prisma.course.deleteMany();
    await prisma.major.deleteMany();
    await prisma.faculty.deleteMany();
    await prisma.school.deleteMany();
    await prisma.role.deleteMany();

    const role = await prisma.role.create({
      data: { name: 'STUDENT', description: 'Student' },
    });

    const school = await prisma.school.create({
      data: { code: 'DAU', name: 'Đại học Kiến trúc Đà Nẵng' },
    });

    const faculty = await prisma.faculty.create({
      data: { schoolId: school.id, code: 'CNTT', name: 'Khoa CNTT' },
    });
    testFacultyId = faculty.id;

    const major = await prisma.major.create({
      data: { facultyId: faculty.id, code: 'CNTT', name: 'Công nghệ thông tin' },
    });

    const course = await prisma.course.create({
      data: { schoolId: school.id, code: 'K23', name: 'Khóa 23', startYear: 2023, endYear: 2027 },
    });

    const classRoom = await prisma.class.create({
      data: { majorId: major.id, courseId: course.id, code: '23CT1', name: 'Lớp 23CT1' },
    });
    testClassId = classRoom.id;

    const passwordHash = await hashPassword('Student@123456');

    studentUser = await prisma.user.create({
      data: {
        email: 'duy_test@dau.edu.vn',
        studentCode: '2351220091',
        fullName: 'Nguyễn Duy',
        passwordHash,
        roleId: role.id,
        schoolId: school.id,
        facultyId: faculty.id,
        majorId: major.id,
        courseId: course.id,
        classId: classRoom.id,
        status: 'ACTIVE',
      },
    });

    // Tạo bạn cùng lớp
    await prisma.user.create({
      data: {
        email: 'tuanh_test@dau.edu.vn',
        studentCode: '2351220089',
        fullName: 'Nguyễn Ngô Tú Anh',
        passwordHash,
        roleId: role.id,
        schoolId: school.id,
        facultyId: faculty.id,
        majorId: major.id,
        courseId: course.id,
        classId: classRoom.id,
        status: 'ACTIVE',
      },
    });

    studentToken = signAccessToken(studentUser.id, 'STUDENT').token;
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it('GET /api/communities/overview - nên trả về danh sách cây phân cấp đào tạo', async () => {
    const res = await request(app).get('/api/communities/overview');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toBeInstanceOf(Array);
    expect(res.body.data[0].code).toBe('DAU');
  });

  it('GET /api/communities/me - từ chối khi không có JWT token (401)', async () => {
    const res = await request(app).get('/api/communities/me');
    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it('GET /api/communities/me - trả về đúng thông tin 5 cấp đào tạo và bạn cùng lớp', async () => {
    const res = await request(app)
      .get('/api/communities/me')
      .set('Authorization', `Bearer ${studentToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.hierarchy.school.code).toBe('DAU');
    expect(res.body.data.hierarchy.faculty.code).toBe('CNTT');
    expect(res.body.data.hierarchy.major.code).toBe('CNTT');
    expect(res.body.data.hierarchy.course.code).toBe('K23');
    expect(res.body.data.hierarchy.class.code).toBe('23CT1');
    expect(res.body.data.stats.totalStudentsInClass).toBe(2);
    expect(res.body.data.classmates).toHaveLength(1);
    expect(res.body.data.classmates[0].fullName).toBe('Nguyễn Ngô Tú Anh');
  });

  it('GET /api/communities/classes/:id/members - trả về danh sách thành viên của lớp', async () => {
    const res = await request(app)
      .get(`/api/communities/classes/${testClassId}/members`)
      .set('Authorization', `Bearer ${studentToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toBeInstanceOf(Array);
    expect(res.body.data).toHaveLength(1);
    expect(res.body.meta.total).toBe(1);
  });

  it('GET /api/communities/faculties/:id/members - trả về danh sách sinh viên của khoa', async () => {
    const res = await request(app)
      .get(`/api/communities/faculties/${testFacultyId}/members`)
      .set('Authorization', `Bearer ${studentToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toBeInstanceOf(Array);
    expect(res.body.data.length).toBeGreaterThanOrEqual(2);
  });
});
