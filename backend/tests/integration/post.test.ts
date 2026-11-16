import request from 'supertest';
import { afterAll, beforeEach, describe, expect, it } from 'vitest';
import { createApp } from '../../src/app';
import { prisma } from '../../src/config/database';
import { signAccessToken } from '../../src/utils/jwt';
import { hashPassword } from '../../src/utils/password';

const app = createApp();

describe('Post Module API (Module 3 - Duy)', () => {
  let authorToken: string;
  let otherToken: string;
  let adminToken: string;
  let authorUser: { id: number; email: string };
  let otherUser: { id: number; email: string };
  let adminUser: { id: number; email: string };

  beforeEach(async () => {
    // Dọn dẹp dữ liệu theo thứ tự khóa ngoại
    await prisma.revokedToken.deleteMany();
    await prisma.adminLog.deleteMany();
    await prisma.systemSetting.deleteMany();
    await prisma.notification.deleteMany();
    await prisma.campusPost.deleteMany();
    await prisma.comment.deleteMany();
    await prisma.reaction.deleteMany();
    await prisma.postReport.deleteMany();
    await prisma.post.deleteMany();
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
      data: { code: 'DAU', name: 'Đại học Kiến trúc Đà Nẵng' },
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

    const pwdHash = await hashPassword('Student@123456');

    // Tác giả bài viết: Duy
    authorUser = await prisma.user.create({
      data: {
        email: 'duy_author@dau.edu.vn',
        studentCode: '2351220091',
        fullName: 'Nguyễn Duy (Author)',
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

    // Người dùng khác: Bạn học
    otherUser = await prisma.user.create({
      data: {
        email: 'other_student@dau.edu.vn',
        studentCode: '2351220092',
        fullName: 'Người Dùng Khác',
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

    // Admin: Tú Anh
    adminUser = await prisma.user.create({
      data: {
        email: 'admin_test@dau.edu.vn',
        studentCode: 'ADMIN999',
        fullName: 'Admin Quản Trị',
        passwordHash: pwdHash,
        roleId: adminRole.id,
        schoolId: school.id,
        facultyId: faculty.id,
        status: 'ACTIVE',
      },
    });

    authorToken = signAccessToken(authorUser.id, 'STUDENT').token;
    otherToken = signAccessToken(otherUser.id, 'STUDENT').token;
    adminToken = signAccessToken(adminUser.id, 'ADMIN').token;
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it('POST /api/posts - Đăng bài viết mới thành công', async () => {
    const res = await request(app)
      .post('/api/posts')
      .set('Authorization', `Bearer ${authorToken}`)
      .send({
        title: 'Tài liệu ôn tập Lập trình mạng',
        content: 'Tổng hợp kiến thức Socket TCP và REST API cho cả lớp.',
        category: 'STUDY',
        scope: 'CLASS',
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.id).toBeDefined();
    expect(res.body.data.author.fullName).toBe('Nguyễn Duy (Author)');
    expect(res.body.data.scope).toBe('CLASS');
  });

  it('GET /api/posts - Lấy danh sách bài viết kèm phân trang', async () => {
    // Tạo 2 bài viết mẫu
    await request(app)
      .post('/api/posts')
      .set('Authorization', `Bearer ${authorToken}`)
      .send({ content: 'Bài viết 1', category: 'COMMUNITY', scope: 'SCHOOL' });

    await request(app)
      .post('/api/posts')
      .set('Authorization', `Bearer ${authorToken}`)
      .send({ content: 'Bài viết 2', category: 'STUDY', scope: 'CLASS' });

    const res = await request(app).get('/api/posts?limit=10&page=1');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveLength(2);
    expect(res.body.meta.total).toBe(2);
  });

  it('PUT /api/posts/:id - Chỉ tác giả mới được sửa bài viết, người khác sửa bị 403 Forbidden', async () => {
    const createRes = await request(app)
      .post('/api/posts')
      .set('Authorization', `Bearer ${authorToken}`)
      .send({ content: 'Nội dung ban đầu của Duy' });

    const postId = createRes.body.data.id;

    // Người khác cố sửa bài của Duy -> 403 Forbidden
    const hackerRes = await request(app)
      .put(`/api/posts/${postId}`)
      .set('Authorization', `Bearer ${otherToken}`)
      .send({ content: 'Hacker sửa nội dung' });

    expect(hackerRes.status).toBe(403);
    expect(hackerRes.body.success).toBe(false);

    // Chính Duy sửa bài của mình -> 200 OK
    const ownerRes = await request(app)
      .put(`/api/posts/${postId}`)
      .set('Authorization', `Bearer ${authorToken}`)
      .send({ content: 'Duy đã cập nhật nội dung mới' });

    expect(ownerRes.status).toBe(200);
    expect(ownerRes.body.success).toBe(true);
    expect(ownerRes.body.data.content).toBe('Duy đã cập nhật nội dung mới');
  });

  it('DELETE /api/posts/:id - Người khác xóa bị 403, Chủ bài và Admin xóa thành công', async () => {
    const createRes = await request(app)
      .post('/api/posts')
      .set('Authorization', `Bearer ${authorToken}`)
      .send({ content: 'Bài viết kiểm tra xóa' });

    const postId = createRes.body.data.id;

    // 1. Người khác gọi API xóa bài -> 403 Forbidden
    const unauthorizedRes = await request(app)
      .delete(`/api/posts/${postId}`)
      .set('Authorization', `Bearer ${otherToken}`);

    expect(unauthorizedRes.status).toBe(403);
    expect(unauthorizedRes.body.success).toBe(false);

    // 2. Admin gọi xóa bài -> 200 OK
    const adminDeleteRes = await request(app)
      .delete(`/api/posts/${postId}`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(adminDeleteRes.status).toBe(200);
    expect(adminDeleteRes.body.success).toBe(true);
  });

  it('POST /api/posts/:id/like - Cơ chế Toggle Like và chống trùng lặp', async () => {
    const createRes = await request(app)
      .post('/api/posts')
      .set('Authorization', `Bearer ${authorToken}`)
      .send({ content: 'Bài viết test thả tim' });

    const postId = createRes.body.data.id;

    // Lần 1: Thả like -> liked = true, likesCount = 1
    const likeRes = await request(app)
      .post(`/api/posts/${postId}/like`)
      .set('Authorization', `Bearer ${otherToken}`);

    expect(likeRes.status).toBe(200);
    expect(likeRes.body.data.liked).toBe(true);
    expect(likeRes.body.data.likesCount).toBe(1);

    // Lần 2: Bấm lại -> Toggle bỏ like -> liked = false, likesCount = 0
    const unlikeRes = await request(app)
      .post(`/api/posts/${postId}/like`)
      .set('Authorization', `Bearer ${otherToken}`);

    expect(unlikeRes.status).toBe(200);
    expect(unlikeRes.body.data.liked).toBe(false);
    expect(unlikeRes.body.data.likesCount).toBe(0);
  });

  it('POST & GET /api/posts/:id/comments - Thêm và lấy danh sách bình luận', async () => {
    const createRes = await request(app)
      .post('/api/posts')
      .set('Authorization', `Bearer ${authorToken}`)
      .send({ content: 'Bài viết test bình luận' });

    const postId = createRes.body.data.id;

    // Thêm bình luận
    const commentRes = await request(app)
      .post(`/api/posts/${postId}/comments`)
      .set('Authorization', `Bearer ${otherToken}`)
      .send({ content: 'Bài viết rất hay, cảm ơn bạn!' });

    expect(commentRes.status).toBe(201);
    expect(commentRes.body.data.content).toBe('Bài viết rất hay, cảm ơn bạn!');

    // Lấy danh sách bình luận
    const listRes = await request(app).get(`/api/posts/${postId}/comments`);
    expect(listRes.status).toBe(200);
    expect(listRes.body.data).toHaveLength(1);
    expect(listRes.body.data[0].content).toBe('Bài viết rất hay, cảm ơn bạn!');
  });

  it('POST /api/posts/:id/report - Báo cáo bài viết vi phạm, không cho tự báo cáo bài mình', async () => {
    const createRes = await request(app)
      .post('/api/posts')
      .set('Authorization', `Bearer ${authorToken}`)
      .send({ content: 'Bài viết cần kiểm duyệt' });

    const postId = createRes.body.data.id;

    // Tự báo cáo bài mình -> 400 Bad Request
    const selfReportRes = await request(app)
      .post(`/api/posts/${postId}/report`)
      .set('Authorization', `Bearer ${authorToken}`)
      .send({ reason: 'Spam' });

    expect(selfReportRes.status).toBe(400);

    // Người khác báo cáo vi phạm -> 201 Created
    const validReportRes = await request(app)
      .post(`/api/posts/${postId}/report`)
      .set('Authorization', `Bearer ${otherToken}`)
      .send({
        reason: 'Nội dung spam',
        description: 'Bài viết này chứa nội dung spam không phù hợp.',
      });

    expect(validReportRes.status).toBe(201);
    expect(validReportRes.body.success).toBe(true);
    expect(validReportRes.body.data.reason).toBe('Nội dung spam');
  });
});
