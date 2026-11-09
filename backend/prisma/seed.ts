import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding UniConnect database...');

  const adminRole = await prisma.role.upsert({
    where: { name: 'ADMIN' },
    update: {},
    create: {
      name: 'ADMIN',
      description: 'Quản trị viên hệ thống UniConnect',
    },
  });

  const studentRole = await prisma.role.upsert({
    where: { name: 'STUDENT' },
    update: {},
    create: {
      name: 'STUDENT',
      description: 'Sinh viên sử dụng mạng xã hội học tập',
    },
  });

  const school = await prisma.school.upsert({
    where: { code: 'DAU' },
    update: {},
    create: {
      code: 'DAU',
      name: 'Đại học Kiến trúc Đà Nẵng',
      shortName: 'DAU',
      address: '566 Núi Thành, Hải Châu, Đà Nẵng',
    },
  });

  const faculty = await prisma.faculty.upsert({
    where: { schoolId_code: { schoolId: school.id, code: 'CNTT' } },
    update: {},
    create: {
      schoolId: school.id,
      code: 'CNTT',
      name: 'Khoa Công nghệ Thông tin',
    },
  });

  const major = await prisma.major.upsert({
    where: { facultyId_code: { facultyId: faculty.id, code: 'CNTT' } },
    update: {},
    create: {
      facultyId: faculty.id,
      code: 'CNTT',
      name: 'Công nghệ thông tin',
    },
  });

  const course23 = await prisma.course.upsert({
    where: { schoolId_code: { schoolId: school.id, code: 'K23' } },
    update: {},
    create: {
      schoolId: school.id,
      code: 'K23',
      name: 'Khóa 2023',
      startYear: 2023,
      endYear: 2027,
    },
  });

  const class23CT1 = await prisma.class.upsert({
    where: {
      majorId_courseId_code: {
        majorId: major.id,
        courseId: course23.id,
        code: '23CT1',
      },
    },
    update: {},
    create: {
      majorId: major.id,
      courseId: course23.id,
      code: '23CT1',
      name: 'Lớp 23CT1 - CNTT',
    },
  });

  const defaultAdminPwd = process.env.SEED_ADMIN_PASSWORD || 'Admin@123456';
  const defaultStudentPwd = process.env.SEED_STUDENT_PASSWORD || 'Student@123456';

  const adminPasswordHash = await bcrypt.hash(defaultAdminPwd, 10);
  const studentPasswordHash = await bcrypt.hash(defaultStudentPwd, 10);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@uniconnect.edu.vn' },
    update: {},
    create: {
      email: 'admin@uniconnect.edu.vn',
      studentCode: 'ADMIN001',
      fullName: 'Nguyễn Ngô Tú Anh (Admin)',
      passwordHash: adminPasswordHash,
      roleId: adminRole.id,
      schoolId: school.id,
      facultyId: faculty.id,
      status: 'ACTIVE',
      bio: 'Leader & Quản trị viên hệ thống UniConnect',
    },
  });

  const student1 = await prisma.user.upsert({
    where: { email: 'anh_2351220089@dau.edu.vn' },
    update: {},
    create: {
      email: 'anh_2351220089@dau.edu.vn',
      studentCode: '2351220089',
      fullName: 'Nguyễn Ngô Tú Anh',
      passwordHash: studentPasswordHash,
      roleId: studentRole.id,
      schoolId: school.id,
      facultyId: faculty.id,
      majorId: major.id,
      courseId: course23.id,
      classId: class23CT1.id,
      status: 'ACTIVE',
      bio: 'Sinh viên lớp 23CT1 - Yêu thích Lập trình mạng',
    },
  });

  const student2 = await prisma.user.upsert({
    where: { email: 'thai_2351220090@dau.edu.vn' },
    update: {},
    create: {
      email: 'thai_2351220090@dau.edu.vn',
      studentCode: '2351220090',
      fullName: 'Trần Minh Thái',
      passwordHash: studentPasswordHash,
      roleId: studentRole.id,
      schoolId: school.id,
      facultyId: faculty.id,
      majorId: major.id,
      courseId: course23.id,
      classId: class23CT1.id,
      status: 'ACTIVE',
      bio: 'Frontend Developer - Lớp 23CT1',
    },
  });

  await prisma.subject.upsert({
    where: { code: 'NET101' },
    update: {},
    create: {
      code: 'NET101',
      name: 'Lập trình mạng',
      facultyId: faculty.id,
      description: 'Socket TCP/UDP, HTTP, REST API, WebSocket và hệ thống phân tán',
    },
  });

  const defaultSettings = [
    {
      key: 'SITE_NAME',
      value: 'UniConnect - Mạng xã hội Sinh viên',
      description: 'Tên hiển thị toàn hệ thống',
      group: 'GENERAL',
    },
    {
      key: 'MAX_LOGIN_ATTEMPTS',
      value: '5',
      description: 'Số lần nhập sai mật khẩu tối đa trước khi tạm khóa',
      group: 'SECURITY',
    },
    {
      key: 'LOGIN_LOCK_MINUTES',
      value: '15',
      description: 'Thời gian tạm khóa khi nhập sai mật khẩu quá số lần quy định (phút)',
      group: 'SECURITY',
    },
    {
      key: 'MAX_FILE_UPLOAD_MB',
      value: '20',
      description: 'Dung lượng tài liệu học tập tối đa cho phép tải lên (MB)',
      group: 'DOCUMENTS',
    },
    {
      key: 'MAINTENANCE_MODE',
      value: 'false',
      description: 'Bật/tắt chế độ bảo trì hệ thống',
      group: 'GENERAL',
    },
  ];

  for (const setting of defaultSettings) {
    await prisma.systemSetting.upsert({
      where: { key: setting.key },
      update: {},
      create: {
        ...setting,
        updatedById: admin.id,
      },
    });
  }

  const existingCampusCount = await prisma.campusPost.count();
  if (existingCampusCount === 0) {
    await prisma.campusPost.createMany({
      data: [
        {
          authorId: admin.id,
          title: 'Thông báo lịch thi cuối kỳ học kỳ I môn Lập trình mạng',
          content:
            'Sinh viên các lớp 23CT1 theo dõi lịch bảo vệ đồ án mạng xã hội sinh viên và ôn tập Socket TCP/REST API.',
          category: 'ANNOUNCEMENT',
          location: 'Giảng đường Khu A',
          isPinned: true,
          status: 'PUBLISHED',
        },
        {
          authorId: admin.id,
          title: 'Học bổng Khuyến khích học tập dành cho sinh viên CNTT năm 2026',
          content:
            'Khoa CNTT mở cổng tiếp nhận hồ sơ xét học bổng học kỳ mới cho sinh viên có GPA từ 3.2 trở lên.',
          category: 'SCHOLARSHIP',
          location: 'Phòng Công tác Sinh viên',
          isPinned: false,
          status: 'PUBLISHED',
        },
        {
          authorId: admin.id,
          title: 'Tuyển thực tập sinh Node.js & ReactJS tại Đà Nẵng',
          content:
            'Cơ hội thực tập có lương và tham gia dự án thực tế cho sinh viên năm 3, năm 4 khoa CNTT.',
          category: 'JOB_INTERNSHIP',
          location: 'Khu Công viên Phần mềm Đà Nẵng',
          isPinned: false,
          status: 'PUBLISHED',
        },
      ],
    });
  }

  const existingPostsCount = await prisma.post.count();
  if (existingPostsCount === 0) {
    const samplePost = await prisma.post.create({
      data: {
        authorId: student1.id,
        title: 'Chia sẻ đề cương ôn tập Lập trình mạng K23',
        content:
          'Mình vừa tổng hợp xong phần Socket TCP, HTTP/HTTPS và REST API cho lớp 23CT1. Các bạn vào xem nhé!',
        category: 'STUDY',
        scope: 'CLASS',
        schoolId: school.id,
        facultyId: faculty.id,
        majorId: major.id,
        courseId: course23.id,
        classId: class23CT1.id,
        status: 'ACTIVE',
      },
    });

    const spamPost = await prisma.post.create({
      data: {
        authorId: student2.id,
        title: 'Quảng cáo dịch vụ làm bài hộ (Nội dung mẫu chờ kiểm duyệt)',
        content: 'Bài viết vi phạm quy định học thuật dùng để test luồng kiểm duyệt của Admin.',
        category: 'COMMUNITY',
        scope: 'SCHOOL',
        schoolId: school.id,
        status: 'ACTIVE',
      },
    });

    await prisma.postReport.create({
      data: {
        postId: spamPost.id,
        reporterId: student1.id,
        reason: 'Vi phạm quy chế học thuật / Spam',
        description: 'Nội dung quảng cáo làm bài hộ không phù hợp với cộng đồng sinh viên.',
        status: 'PENDING',
      },
    });

    console.log('Created sample posts:', samplePost.id, spamPost.id);
  }

  console.log('Seed completed successfully.');
}

main()
  .catch((error) => {
    console.error('Seed failed:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
