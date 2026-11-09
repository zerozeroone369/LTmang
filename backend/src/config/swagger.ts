export const swaggerDocument = {
  openapi: '3.0.3',
  info: {
    title: 'UniConnect — Student Social Network API',
    version: '1.0.0',
    description:
      'REST API tài liệu hóa cho hệ thống mạng xã hội sinh viên UniConnect (phục vụ Frontend & nhóm Backend).',
  },
  servers: [
    {
      url: 'http://localhost:4000',
      description: 'Local Development Server',
    },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
    },
  },
  paths: {
    '/api/health': {
      get: {
        tags: ['System'],
        summary: 'Kiểm tra trạng thái hoạt động của server',
        responses: {
          '200': { description: 'Server hoạt động bình thường' },
        },
      },
    },
    '/api/auth/register': {
      post: {
        tags: ['Auth'],
        summary: 'Đăng ký tài khoản sinh viên mới',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['fullName', 'email', 'password'],
                properties: {
                  fullName: { type: 'string', example: 'Nguyễn Văn An' },
                  email: { type: 'string', example: 'an_2351220001@dau.edu.vn' },
                  studentCode: { type: 'string', example: '2351220001' },
                  password: { type: 'string', example: 'Student@123' },
                  schoolId: { type: 'integer', example: 1 },
                  facultyId: { type: 'integer', example: 1 },
                  majorId: { type: 'integer', example: 1 },
                  courseId: { type: 'integer', example: 1 },
                  classId: { type: 'integer', example: 1 },
                },
              },
            },
          },
        },
        responses: {
          '201': { description: 'Đăng ký thành công, trả về accessToken và UserDTO' },
          '409': { description: 'Email hoặc mã sinh viên đã tồn tại' },
        },
      },
    },
    '/api/auth/login': {
      post: {
        tags: ['Auth'],
        summary: 'Đăng nhập bằng Email hoặc Mã sinh viên',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['identifier', 'password'],
                properties: {
                  identifier: { type: 'string', example: '2351220089' },
                  password: { type: 'string', example: 'Student@123' },
                },
              },
            },
          },
        },
        responses: {
          '200': { description: 'Đăng nhập thành công' },
          '401': { description: 'Sai thông tin xác thực' },
          '403': { description: 'Tài khoản đã bị Admin khóa' },
        },
      },
    },
    '/api/auth/logout': {
      post: {
        tags: ['Auth'],
        summary: 'Đăng xuất và thu hồi JWT hiện tại',
        security: [{ bearerAuth: [] }],
        responses: {
          '200': { description: 'Đăng xuất thành công' },
          '401': { description: 'Chưa đăng nhập' },
        },
      },
    },
    '/api/auth/change-password': {
      put: {
        tags: ['Auth'],
        summary: 'Đổi mật khẩu người dùng hiện tại',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['currentPassword', 'newPassword'],
                properties: {
                  currentPassword: { type: 'string' },
                  newPassword: { type: 'string' },
                },
              },
            },
          },
        },
        responses: {
          '200': { description: 'Đổi mật khẩu thành công' },
        },
      },
    },
    '/api/auth/me': {
      get: {
        tags: ['Auth'],
        summary: 'Lấy thông tin tài khoản hiện tại từ JWT',
        security: [{ bearerAuth: [] }],
        responses: {
          '200': { description: 'Thông tin UserDTO' },
        },
      },
    },
    '/api/users/profile': {
      get: {
        tags: ['Users'],
        summary: 'Xem hồ sơ cá nhân',
        security: [{ bearerAuth: [] }],
        responses: { '200': { description: 'Hồ sơ cá nhân' } },
      },
      put: {
        tags: ['Users'],
        summary: 'Cập nhật hồ sơ cá nhân & Trường/Khoa/Ngành/Khóa/Lớp',
        security: [{ bearerAuth: [] }],
        responses: { '200': { description: 'Cập nhật thành công' } },
      },
    },
    '/api/academic/schools': {
      get: {
        tags: ['Academic'],
        summary: 'Danh sách trường học',
        responses: { '200': { description: 'OK' } },
      },
    },
    '/api/academic/faculties': {
      get: {
        tags: ['Academic'],
        summary: 'Danh sách khoa (lọc theo schoolId)',
        responses: { '200': { description: 'OK' } },
      },
    },
    '/api/academic/majors': {
      get: {
        tags: ['Academic'],
        summary: 'Danh sách ngành (lọc theo facultyId)',
        responses: { '200': { description: 'OK' } },
      },
    },
    '/api/academic/courses': {
      get: {
        tags: ['Academic'],
        summary: 'Danh sách khóa học (lọc theo schoolId)',
        responses: { '200': { description: 'OK' } },
      },
    },
    '/api/academic/classes': {
      get: {
        tags: ['Academic'],
        summary: 'Danh sách lớp (lọc theo majorId, courseId)',
        responses: { '200': { description: 'OK' } },
      },
    },
  },
};
