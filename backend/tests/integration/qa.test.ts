import request from 'supertest';
import { afterAll, beforeEach, describe, expect, it } from 'vitest';
import { createApp } from '../../src/app';
import { prisma } from '../../src/config/database';
import { signAccessToken } from '../../src/utils/jwt';
import { hashPassword } from '../../src/utils/password';

const app = createApp();

describe('Q&A Module API (Module 5 - Huy)', () => {
  let authorToken: string;
  let answererToken: string;
  let otherToken: string;
  let authorUser: { id: number; email: string };
  let answererUser: { id: number; email: string };
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

    // Tác giả câu hỏi: Huy
    authorUser = await prisma.user.create({
      data: {
        email: 'huy_asker@dau.edu.vn',
        studentCode: '2351220092',
        fullName: 'Lê Quang Huy (Asker)',
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

    // Người trả lời: Duy
    answererUser = await prisma.user.create({
      data: {
        email: 'duy_answerer@dau.edu.vn',
        studentCode: '2351220091',
        fullName: 'Nguyễn Duy (Answerer)',
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

    // Người thứ ba để vote
    otherUser = await prisma.user.create({
      data: {
        email: 'thai_voter@dau.edu.vn',
        studentCode: '2351220094',
        fullName: 'Thái Voter',
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

    authorToken = signAccessToken(authorUser.id, 'STUDENT').token;
    answererToken = signAccessToken(answererUser.id, 'STUDENT').token;
    otherToken = signAccessToken(otherUser.id, 'STUDENT').token;
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it('1. POST /api/qa/questions - Đặt câu hỏi học thuật thành công', async () => {
    const res = await request(app)
      .post('/api/qa/questions')
      .set('Authorization', `Bearer ${authorToken}`)
      .send({
        title: 'Sự khác biệt giữa TCP Socket và UDP Socket là gì?',
        content:
          'Các bạn cho mình hỏi khi nào nên dùng TCP và khi nào nên dùng UDP trong ứng dụng game realtime?',
        subjectId: testSubject.id,
        tags: 'Socket,TCP,UDP,Network',
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.title).toContain('TCP Socket và UDP Socket');
    expect(res.body.data.isSolved).toBe(false);
    expect(res.body.data.authorId).toBe(authorUser.id);
  });

  it('2. GET /api/qa/questions - Lấy danh sách câu hỏi và lọc theo môn học', async () => {
    await prisma.question.create({
      data: {
        title: 'Cơ chế 3-way handshake trong TCP hoạt động thế nào?',
        content: 'Em chưa hiểu rõ ý nghĩa cờ SYN, ACK trong quá trình thiết lập kết nối.',
        subjectId: testSubject.id,
        authorId: authorUser.id,
        tags: 'TCP,Handshake',
      },
    });

    const res = await request(app).get(`/api/qa/questions?subjectId=${testSubject.id}`);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.length).toBe(1);
    expect(res.body.data[0].title).toContain('3-way handshake');
  });

  it('3. POST /api/qa/questions/:id/answers - Thêm câu trả lời cho câu hỏi', async () => {
    const q = await prisma.question.create({
      data: {
        title: 'WebSocket khác gì so với HTTP Polling?',
        content: 'Xin được giải đáp ưu nhược điểm của hai phương pháp khi làm chat realtime.',
        subjectId: testSubject.id,
        authorId: authorUser.id,
      },
    });

    const res = await request(app)
      .post(`/api/qa/questions/${q.id}/answers`)
      .set('Authorization', `Bearer ${answererToken}`)
      .send({
        content:
          'WebSocket duy trì kết nối song công hai chiều (full-duplex) liên tục qua 1 TCP socket duy nhất, giảm tải overhead so với HTTP polling phải gửi request liên tục.',
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.authorId).toBe(answererUser.id);
    expect(res.body.data.isCorrect).toBe(false);
  });

  it('4. POST /api/qa/answers/:id/vote - Upvote điểm hữu ích (+1)', async () => {
    const q = await prisma.question.create({
      data: {
        title: 'Khái niệm CORS trong lập trình mạng Web là gì?',
        content: 'Vì sao gọi API từ port 5174 sang 4000 lại dính lỗi CORS?',
        subjectId: testSubject.id,
        authorId: authorUser.id,
      },
    });

    const ans = await prisma.answer.create({
      data: {
        questionId: q.id,
        authorId: answererUser.id,
        content:
          'CORS (Cross-Origin Resource Sharing) là cơ chế bảo mật của trình duyệt chặn truy cập tài nguyên khác Origin nếu server không cấp phép qua header Access-Control-Allow-Origin.',
      },
    });

    // Người khác vote +1
    const res = await request(app)
      .post(`/api/qa/answers/${ans.id}/vote`)
      .set('Authorization', `Bearer ${otherToken}`)
      .send({ value: 1 });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.score).toBe(1);
    expect(res.body.data.userVote).toBe(1);

    // Không cho phép tác giả tự vote câu trả lời của mình
    const resSelf = await request(app)
      .post(`/api/qa/answers/${ans.id}/vote`)
      .set('Authorization', `Bearer ${answererToken}`)
      .send({ value: 1 });
    expect(resSelf.status).toBe(400);
  });

  it('5. POST /api/qa/answers/:id/accept - Chốt câu trả lời chính xác nhất (Best Answer)', async () => {
    const q = await prisma.question.create({
      data: {
        title: 'Mã HTTP Status 401 và 403 khác nhau ở điểm nào?',
        content: 'Em hay bị nhầm lẫn giữa Unauthorized và Forbidden.',
        subjectId: testSubject.id,
        authorId: authorUser.id,
        isSolved: false,
      },
    });

    const ans = await prisma.answer.create({
      data: {
        questionId: q.id,
        authorId: answererUser.id,
        content:
          '401 Unauthorized nghĩa là bạn chưa đăng nhập (chưa có token hoặc token sai/hết hạn). 403 Forbidden nghĩa là bạn đã đăng nhập nhưng không có quyền hạn (ví dụ sinh viên gọi API của admin).',
        isCorrect: false,
      },
    });

    // Người khác không phải người hỏi cố chốt câu trả lời -> Bị chặn 403
    const resForbidden = await request(app)
      .post(`/api/qa/answers/${ans.id}/accept`)
      .set('Authorization', `Bearer ${otherToken}`);
    expect(resForbidden.status).toBe(403);

    // Người hỏi chốt câu trả lời đúng thành công
    const resSuccess = await request(app)
      .post(`/api/qa/answers/${ans.id}/accept`)
      .set('Authorization', `Bearer ${authorToken}`);

    expect(resSuccess.status).toBe(200);
    expect(resSuccess.body.success).toBe(true);
    expect(resSuccess.body.data.isCorrect).toBe(true);

    // Câu hỏi tự động cập nhật isSolved = true
    const updatedQuestion = await prisma.question.findUnique({ where: { id: q.id } });
    expect(updatedQuestion?.isSolved).toBe(true);
  });
});
