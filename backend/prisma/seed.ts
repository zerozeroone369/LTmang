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

  // 1. Khoa CNTT
  const facultyCNTT = await prisma.faculty.upsert({
    where: { schoolId_code: { schoolId: school.id, code: 'CNTT' } },
    update: {},
    create: {
      schoolId: school.id,
      code: 'CNTT',
      name: 'Khoa Công nghệ Thông tin',
    },
  });

  // 2. Khoa Kiến trúc
  const facultyKT = await prisma.faculty.upsert({
    where: { schoolId_code: { schoolId: school.id, code: 'KT' } },
    update: {},
    create: {
      schoolId: school.id,
      code: 'KT',
      name: 'Khoa Kiến trúc',
    },
  });

  // Ngành CNTT thuộc Khoa CNTT
  const majorCNTT = await prisma.major.upsert({
    where: { facultyId_code: { facultyId: facultyCNTT.id, code: 'CNTT' } },
    update: {},
    create: {
      facultyId: facultyCNTT.id,
      code: 'CNTT',
      name: 'Công nghệ thông tin',
    },
  });

  // Ngành Kỹ thuật Phần mềm thuộc Khoa CNTT
  const majorKTPM = await prisma.major.upsert({
    where: { facultyId_code: { facultyId: facultyCNTT.id, code: 'KTPM' } },
    update: {},
    create: {
      facultyId: facultyCNTT.id,
      code: 'KTPM',
      name: 'Kỹ thuật phần mềm',
    },
  });

  // Ngành Kiến trúc công trình thuộc Khoa Kiến trúc
  const majorKTCTR = await prisma.major.upsert({
    where: { facultyId_code: { facultyId: facultyKT.id, code: 'KTCTR' } },
    update: {},
    create: {
      facultyId: facultyKT.id,
      code: 'KTCTR',
      name: 'Kiến trúc công trình',
    },
  });

  // Khóa K22
  const course22 = await prisma.course.upsert({
    where: { schoolId_code: { schoolId: school.id, code: 'K22' } },
    update: {},
    create: {
      schoolId: school.id,
      code: 'K22',
      name: 'Khóa 2022',
      startYear: 2022,
      endYear: 2026,
    },
  });

  // Khóa K23
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

  // Lớp 23CT1 (Ngành CNTT, Khóa K23)
  const class23CT1 = await prisma.class.upsert({
    where: {
      majorId_courseId_code: {
        majorId: majorCNTT.id,
        courseId: course23.id,
        code: '23CT1',
      },
    },
    update: {},
    create: {
      majorId: majorCNTT.id,
      courseId: course23.id,
      code: '23CT1',
      name: 'Lớp 23CT1 - CNTT K23',
    },
  });

  // Lớp 23CT2 (Ngành CNTT, Khóa K23)
  const class23CT2 = await prisma.class.upsert({
    where: {
      majorId_courseId_code: {
        majorId: majorCNTT.id,
        courseId: course23.id,
        code: '23CT2',
      },
    },
    update: {},
    create: {
      majorId: majorCNTT.id,
      courseId: course23.id,
      code: '23CT2',
      name: 'Lớp 23CT2 - CNTT K23',
    },
  });

  // Lớp 23PM1 (Ngành KTPM, Khóa K23)
  const class23PM1 = await prisma.class.upsert({
    where: {
      majorId_courseId_code: {
        majorId: majorKTPM.id,
        courseId: course23.id,
        code: '23PM1',
      },
    },
    update: {},
    create: {
      majorId: majorKTPM.id,
      courseId: course23.id,
      code: '23PM1',
      name: 'Lớp 23PM1 - Phần mềm K23',
    },
  });

  // Lớp 22CT1 (Ngành CNTT, Khóa K22)
  const class22CT1 = await prisma.class.upsert({
    where: {
      majorId_courseId_code: {
        majorId: majorCNTT.id,
        courseId: course22.id,
        code: '22CT1',
      },
    },
    update: {},
    create: {
      majorId: majorCNTT.id,
      courseId: course22.id,
      code: '22CT1',
      name: 'Lớp 22CT1 - CNTT K22',
    },
  });

  // Lớp 23KT1 (Ngành Kiến trúc công trình, Khóa K23)
  const class23KT1 = await prisma.class.upsert({
    where: {
      majorId_courseId_code: {
        majorId: majorKTCTR.id,
        courseId: course23.id,
        code: '23KT1',
      },
    },
    update: {},
    create: {
      majorId: majorKTCTR.id,
      courseId: course23.id,
      code: '23KT1',
      name: 'Lớp 23KT1 - Kiến trúc K23',
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
      facultyId: facultyCNTT.id,
      status: 'ACTIVE',
      bio: 'Leader & Quản trị viên hệ thống UniConnect',
    },
  });

  const studentTuAnh = await prisma.user.upsert({
    where: { email: 'anh_2351220089@dau.edu.vn' },
    update: {},
    create: {
      email: 'anh_2351220089@dau.edu.vn',
      studentCode: '2351220089',
      fullName: 'Nguyễn Ngô Tú Anh',
      passwordHash: studentPasswordHash,
      roleId: studentRole.id,
      schoolId: school.id,
      facultyId: facultyCNTT.id,
      majorId: majorCNTT.id,
      courseId: course23.id,
      classId: class23CT1.id,
      status: 'ACTIVE',
      bio: 'Leader - Lớp 23CT1',
    },
  });

  const studentThai = await prisma.user.upsert({
    where: { email: 'thai_2351220090@dau.edu.vn' },
    update: {},
    create: {
      email: 'thai_2351220090@dau.edu.vn',
      studentCode: '2351220090',
      fullName: 'Trần Minh Thái',
      passwordHash: studentPasswordHash,
      roleId: studentRole.id,
      schoolId: school.id,
      facultyId: facultyCNTT.id,
      majorId: majorCNTT.id,
      courseId: course23.id,
      classId: class23CT1.id,
      status: 'ACTIVE',
      bio: 'Frontend Developer - Lớp 23CT1',
    },
  });

  const studentDuy = await prisma.user.upsert({
    where: { email: 'duy_2351220091@dau.edu.vn' },
    update: {},
    create: {
      email: 'duy_2351220091@dau.edu.vn',
      studentCode: '2351220091',
      fullName: 'Nguyễn Duy',
      passwordHash: studentPasswordHash,
      roleId: studentRole.id,
      schoolId: school.id,
      facultyId: facultyCNTT.id,
      majorId: majorCNTT.id,
      courseId: course23.id,
      classId: class23CT1.id,
      status: 'ACTIVE',
      bio: 'Module Cộng đồng & Bài viết - Lớp 23CT1',
    },
  });

  const studentHuy = await prisma.user.upsert({
    where: { email: 'huy_2351220092@dau.edu.vn' },
    update: {},
    create: {
      email: 'huy_2351220092@dau.edu.vn',
      studentCode: '2351220092',
      fullName: 'Lê Quang Huy',
      passwordHash: studentPasswordHash,
      roleId: studentRole.id,
      schoolId: school.id,
      facultyId: facultyCNTT.id,
      majorId: majorCNTT.id,
      courseId: course23.id,
      classId: class23CT1.id,
      status: 'ACTIVE',
      bio: 'Module Tài liệu & Hỏi đáp - Lớp 23CT1',
    },
  });

  const studentBao = await prisma.user.upsert({
    where: { email: 'bao_2351220093@dau.edu.vn' },
    update: {},
    create: {
      email: 'bao_2351220093@dau.edu.vn',
      studentCode: '2351220093',
      fullName: 'Trần Quốc Bảo',
      passwordHash: studentPasswordHash,
      roleId: studentRole.id,
      schoolId: school.id,
      facultyId: facultyCNTT.id,
      majorId: majorCNTT.id,
      courseId: course23.id,
      classId: class23CT2.id,
      status: 'ACTIVE',
      bio: 'Module Nhóm học & Campus - Lớp 23CT2',
    },
  });

  const studentHoa = await prisma.user.upsert({
    where: { email: 'hoa_2351220095@dau.edu.vn' },
    update: {},
    create: {
      email: 'hoa_2351220095@dau.edu.vn',
      studentCode: '2351220095',
      fullName: 'Phạm Thị Hoa',
      passwordHash: studentPasswordHash,
      roleId: studentRole.id,
      schoolId: school.id,
      facultyId: facultyKT.id,
      majorId: majorKTCTR.id,
      courseId: course23.id,
      classId: class23KT1.id,
      status: 'ACTIVE',
      bio: 'Sinh viên Khoa Kiến trúc - Lớp 23KT1',
    },
  });

  await prisma.subject.upsert({
    where: { code: 'NET101' },
    update: {},
    create: {
      code: 'NET101',
      name: 'Lập trình mạng',
      facultyId: facultyCNTT.id,
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
        authorId: studentTuAnh.id,
        title: 'Chia sẻ đề cương ôn tập Lập trình mạng K23',
        content:
          'Mình vừa tổng hợp xong phần Socket TCP, HTTP/HTTPS và REST API cho lớp 23CT1. Các bạn vào xem nhé!',
        category: 'STUDY',
        scope: 'CLASS',
        schoolId: school.id,
        facultyId: facultyCNTT.id,
        majorId: majorCNTT.id,
        courseId: course23.id,
        classId: class23CT1.id,
        status: 'ACTIVE',
      },
    });

    const duyPost = await prisma.post.create({
      data: {
        authorId: studentDuy.id,
        title: 'Chào mừng các bạn đến với mạng xã hội sinh viên UniConnect!',
        content:
          'Dự án UniConnect được xây dựng cho môn Lập trình mạng. Rất mong nhận được đóng góp ý kiến từ thầy cô và các bạn sinh viên!',
        category: 'COMMUNITY',
        scope: 'SCHOOL',
        schoolId: school.id,
        facultyId: facultyCNTT.id,
        status: 'ACTIVE',
      },
    });

    // Thêm bình luận mẫu từ bạn bè vào bài viết của Duy
    await prisma.comment.create({
      data: {
        postId: duyPost.id,
        authorId: studentThai.id,
        content: 'Dự án xịn quá Duy ơi! Giao diện client mình đang hoàn thiện nhé!',
      },
    });

    await prisma.comment.create({
      data: {
        postId: duyPost.id,
        authorId: studentTuAnh.id,
        content: 'Hệ thống auth và bảo mật đã sẵn sàng cho cả nhóm kết nối.',
      },
    });

    // Thêm reaction like mẫu
    await prisma.reaction.create({
      data: {
        postId: duyPost.id,
        userId: studentThai.id,
        type: 'LIKE',
      },
    });

    await prisma.reaction.create({
      data: {
        postId: duyPost.id,
        userId: studentTuAnh.id,
        type: 'LIKE',
      },
    });

    // Cập nhật số like và comment
    await prisma.post.update({
      where: { id: duyPost.id },
      data: { likesCount: 2, commentsCount: 2 },
    });

    const spamPost = await prisma.post.create({
      data: {
        authorId: studentThai.id,
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
        reporterId: studentDuy.id,
        reason: 'Vi phạm quy chế học thuật / Spam',
        description: 'Nội dung quảng cáo làm bài hộ không phù hợp với cộng đồng sinh viên.',
        status: 'PENDING',
      },
    });

    console.log('Created sample posts:', samplePost.id, duyPost.id, spamPost.id);
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
