import request from 'supertest';
import { afterAll, beforeEach, describe, expect, it } from 'vitest';
import { createApp } from '../../src/app';
import { prisma } from '../../src/config/database';
import { signAccessToken } from '../../src/utils/jwt';
import { hashPassword } from '../../src/utils/password';

const app = createApp();

describe('Document Module API (Module 4 - Huy)', () => {
  let uploaderToken: string;
  let otherToken: string;
  let uploaderUser: { id: number; email: string };
  let otherUser: { id: number; email: string };
  let testSubject: { id: number; code: string; name: string };

  beforeEach(async () => {
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

    const studentRole = await prisma.role.create({
      data: { name: 'STUDENT', description: 'Student' },
    });

    const school = await prisma.school.create({
      data: { code: 'DAU', name: 'Đại học Kiến trúc Đà Nẵng' },
    });
    const faculty = await prisma.faculty.create({
      data: { schoolId: school.id, code: 'CNTT', name: 'Khoa CNTT' },
    });
    const major = await prisma.major.create({
      data: { facultyId: faculty.id, code: 'CNTT', name: 'Công nghệ thông tin' },
    });
    const course = await prisma.course.create({
      data: { schoolId: school.id, code: 'K23', name: 'Khóa 23' },
    });
    const classRoom = await prisma.class.create({
      data: { majorId: major.id, courseId: course.id, code: '23CT1', name: 'Lớp 23CT1' },
    });

    testSubject = await prisma.subject.create({
      data: {
        code: 'NET101',
        name: 'Lập trình mạng',
        facultyId: faculty.id,
        description: 'Socket TCP/UDP, HTTP, REST API',
      },
    });

    const pwdHash = await hashPassword('Student@123456');

    uploaderUser = await prisma.user.create({
      data: {
        email: 'huy_uploader@dau.edu.vn',
        studentCode: '2351220092',
        fullName: 'Lê Quang Huy',
        passwordHash: pwdHash,
        roleId: studentRole.id,
        schoolId: school.id,
        facultyId: faculty.id,
        majorId: major.id,
        courseId: course.id,
        classId: classRoom.id,
        status: 'ACTIVE',
      },
    });

    otherUser = await prisma.user.create({
      data: {
        email: 'student_rater@dau.edu.vn',
        studentCode: '2351220099',
        fullName: 'Sinh Viên Rater',
        passwordHash: pwdHash,
        roleId: studentRole.id,
        schoolId: school.id,
        facultyId: faculty.id,
        majorId: major.id,
        courseId: course.id,
        classId: classRoom.id,
        status: 'ACTIVE',
      },
    });

    uploaderToken = signAccessToken(uploaderUser.id, 'STUDENT').token;
    otherToken = signAccessToken(otherUser.id, 'STUDENT').token;
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it('1. GET /api/documents/subjects - Lấy danh sách môn học thành công', async () => {
    const res = await request(app).get('/api/documents/subjects');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBeGreaterThan(0);
    expect(res.body.data[0].code).toBe('NET101');
  });

  it('2. POST /api/documents - Đăng tải tài liệu học tập thành công', async () => {
    const res = await request(app)
      .post('/api/documents')
      .set('Authorization', `Bearer ${uploaderToken}`)
      .send({
        title: 'Slide bài giảng Socket TCP và REST API',
        description: 'Tài liệu ôn tập chương 1 và chương 2 môn Lập trình mạng',
        docType: 'SLIDE',
        subjectId: testSubject.id,
        fileName: 'lap-trinh-mang-socket.pdf',
        fileType: 'application/pdf',
        fileSize: 2048000,
        fileUrl: '/uploads/documents/lap-trinh-mang-socket.pdf',
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.title).toBe('Slide bài giảng Socket TCP và REST API');
    expect(res.body.data.uploaderId).toBe(uploaderUser.id);
    expect(res.body.data.subject.code).toBe('NET101');
  });

  it('3. GET /api/documents - Lấy danh sách tài liệu và lọc theo môn học', async () => {
    // Tạo tài liệu mẫu
    await prisma.document.create({
      data: {
        title: 'Đề thi trắc nghiệm Lập trình mạng 2025',
        description: 'Bộ câu hỏi trắc nghiệm ôn tập',
        docType: 'EXAM',
        subjectId: testSubject.id,
        uploaderId: uploaderUser.id,
        fileName: 'de-thi-ltm.pdf',
        fileType: 'application/pdf',
        fileSize: 1024000,
        fileUrl: '/uploads/documents/de-thi-ltm.pdf',
        status: 'ACTIVE',
      },
    });

    const res = await request(app)
      .get(`/api/documents?subjectId=${testSubject.id}`)
      .set('Authorization', `Bearer ${uploaderToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.length).toBe(1);
    expect(res.body.data[0].title).toContain('Đề thi trắc nghiệm');
  });

  it('4. POST /api/documents/:id/ratings - Đánh giá sao (1-5) và tính trung bình avgRating', async () => {
    const doc = await prisma.document.create({
      data: {
        title: 'Tài liệu hướng dẫn thực hành LTM',
        docType: 'REFERENCE',
        subjectId: testSubject.id,
        uploaderId: uploaderUser.id,
        fileName: 'thuc-hanh-ltm.pdf',
        fileType: 'application/pdf',
        fileSize: 500000,
        fileUrl: '/uploads/documents/thuc-hanh-ltm.pdf',
        status: 'ACTIVE',
      },
    });

    const res = await request(app)
      .post(`/api/documents/${doc.id}/ratings`)
      .set('Authorization', `Bearer ${otherToken}`)
      .send({
        rating: 5,
        comment: 'Tài liệu rất hay và dễ hiểu, cám ơn tác giả!',
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.avgRating).toBe(5);
    expect(res.body.data.ratingsCount).toBe(1);

    // Kiểm tra trong CSDL avgRating đã được cập nhật
    const updatedDoc = await prisma.document.findUnique({ where: { id: doc.id } });
    expect(updatedDoc?.avgRating).toBe(5);
  });

  it('5. GET /api/documents/:id/download - Tăng biến đếm downloadsCount khi tải', async () => {
    const doc = await prisma.document.create({
      data: {
        title: 'Bộ đề thi thử cuối kỳ LTM',
        docType: 'EXAM',
        subjectId: testSubject.id,
        uploaderId: uploaderUser.id,
        fileName: 'de-thi-thu.pdf',
        fileType: 'application/pdf',
        fileSize: 800000,
        fileUrl: '/uploads/documents/de-thi-thu.pdf',
        downloadsCount: 0,
        status: 'ACTIVE',
      },
    });

    const res = await request(app).get(`/api/documents/${doc.id}/download`);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.downloadsCount).toBe(1);
  });

  it('6. DELETE /api/documents/:id - Xóa tài liệu của mình thành công, chặn người khác', async () => {
    const doc = await prisma.document.create({
      data: {
        title: 'Tài liệu nháp cần xóa',
        docType: 'REFERENCE',
        subjectId: testSubject.id,
        uploaderId: uploaderUser.id,
        fileName: 'nhap.pdf',
        fileType: 'application/pdf',
        fileSize: 10000,
        fileUrl: '/uploads/documents/nhap.pdf',
        status: 'ACTIVE',
      },
    });

    // Sinh viên khác không được phép xóa
    const resForbidden = await request(app)
      .delete(`/api/documents/${doc.id}`)
      .set('Authorization', `Bearer ${otherToken}`);
    expect(resForbidden.status).toBe(403);

    // Tác giả xóa thành công
    const resSuccess = await request(app)
      .delete(`/api/documents/${doc.id}`)
      .set('Authorization', `Bearer ${uploaderToken}`);
    expect(resSuccess.status).toBe(200);
    expect(resSuccess.body.success).toBe(true);
  });
});
