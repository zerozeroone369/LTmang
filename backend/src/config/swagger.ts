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
    '/api/campus': {
      get: {
        tags: ['Campus'],
        summary: 'Danh sách tin tức Campus đã xuất bản (dùng cho Client)',
        parameters: [
          { in: 'query', name: 'category', schema: { type: 'string' } },
          { in: 'query', name: 'search', schema: { type: 'string' } },
          { in: 'query', name: 'page', schema: { type: 'integer', default: 1 } },
          { in: 'query', name: 'limit', schema: { type: 'integer', default: 12 } },
        ],
        responses: { '200': { description: 'OK' } },
      },
    },
    '/api/campus/{id}': {
      get: {
        tags: ['Campus'],
        summary: 'Chi tiết tin Campus đã xuất bản',
        parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'integer' } }],
        responses: { '200': { description: 'OK' }, '404': { description: 'Không tìm thấy tin' } },
      },
    },
    '/api/groups/subjects': {
      get: {
        tags: ['Study Groups'],
        summary: 'Danh sách môn học để tạo và lọc nhóm học',
        responses: { '200': { description: 'OK' } },
      },
    },
    '/api/groups/search': {
      get: {
        tags: ['Study Groups'],
        summary: 'Tìm nhóm học đang mở',
        security: [{ bearerAuth: [] }],
        parameters: [
          { in: 'query', name: 'q', schema: { type: 'string' } },
          { in: 'query', name: 'subjectId', schema: { type: 'integer' } },
          { in: 'query', name: 'location', schema: { type: 'string' } },
          { in: 'query', name: 'page', schema: { type: 'integer', default: 1 } },
          { in: 'query', name: 'limit', schema: { type: 'integer', default: 12 } },
        ],
        responses: { '200': { description: 'Danh sách nhóm và phân trang' } },
      },
    },
    '/api/groups': {
      get: {
        tags: ['Study Groups'],
        summary: 'Danh sách nhóm học đang mở',
        security: [{ bearerAuth: [] }],
        responses: { '200': { description: 'OK' } },
      },
      post: {
        tags: ['Study Groups'],
        summary: 'Tạo nhóm học (sinh viên đăng nhập; người tạo thành trưởng nhóm)',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['name'],
                properties: {
                  name: { type: 'string', example: 'Ôn thi Lập trình mạng' },
                  description: { type: 'string' },
                  subjectId: { type: 'integer', nullable: true },
                  goal: { type: 'string' },
                  scheduleText: { type: 'string' },
                  location: { type: 'string' },
                  maxMembers: { type: 'integer', minimum: 2, maximum: 100, default: 10 },
                },
              },
            },
          },
        },
        responses: { '201': { description: 'Đã tạo nhóm' }, '401': { description: 'Chưa đăng nhập' } },
      },
    },
    '/api/groups/{id}': {
      get: {
        tags: ['Study Groups'],
        summary: 'Chi tiết nhóm, thành viên và trạng thái yêu cầu của người dùng hiện tại',
        security: [{ bearerAuth: [] }],
        parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'integer' } }],
        responses: { '200': { description: 'OK' }, '404': { description: 'Không tìm thấy nhóm' } },
      },
    },
    '/api/groups/{id}/join': {
      post: {
        tags: ['Study Groups'],
        summary: 'Gửi yêu cầu tham gia nhóm (sinh viên đăng nhập)',
        security: [{ bearerAuth: [] }],
        parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'integer' } }],
        requestBody: {
          content: {
            'application/json': {
              schema: { type: 'object', properties: { message: { type: 'string', maxLength: 500 } } },
            },
          },
        },
        responses: { '201': { description: 'Đã gửi yêu cầu' }, '409': { description: 'Đã là thành viên, đang chờ duyệt hoặc nhóm đã đủ người' } },
      },
    },
    '/api/groups/{id}/join-requests': {
      get: {
        tags: ['Study Groups'],
        summary: 'Danh sách yêu cầu đang chờ (chỉ trưởng nhóm)',
        security: [{ bearerAuth: [] }],
        parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'integer' } }],
        responses: { '200': { description: 'Danh sách yêu cầu' }, '403': { description: 'Không phải trưởng nhóm' } },
      },
    },
    '/api/groups/join-requests/{requestId}': {
      put: {
        tags: ['Study Groups'],
        summary: 'Chấp nhận hoặc từ chối yêu cầu tham gia (chỉ trưởng nhóm)',
        security: [{ bearerAuth: [] }],
        parameters: [{ in: 'path', name: 'requestId', required: true, schema: { type: 'integer' } }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { type: 'object', required: ['status'], properties: { status: { type: 'string', enum: ['APPROVED', 'REJECTED'] } } },
            },
          },
        },
        responses: { '200': { description: 'Yêu cầu đã được xử lý' }, '403': { description: 'Không phải trưởng nhóm' }, '409': { description: 'Yêu cầu đã xử lý hoặc nhóm đã đủ người' } },
      },
    },
    '/api/groups/{id}/leave': {
      delete: {
        tags: ['Study Groups'],
        summary: 'Rời nhóm học (trưởng nhóm sẽ chuyển quyền hoặc đóng nhóm nếu là thành viên cuối)',
        security: [{ bearerAuth: [] }],
        parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'integer' } }],
        responses: { '200': { description: 'Đã rời nhóm' }, '400': { description: 'Người dùng chưa tham gia nhóm' } },
      },
    },
    '/api/groups/{id}/members/{memberId}': {
      delete: {
        tags: ['Study Groups'],
        summary: 'Trưởng nhóm xóa một thành viên khỏi nhóm',
        security: [{ bearerAuth: [] }],
        parameters: [
          { in: 'path', name: 'id', required: true, schema: { type: 'integer' }, description: 'ID nhóm' },
          { in: 'path', name: 'memberId', required: true, schema: { type: 'integer' }, description: 'ID tài khoản thành viên cần xóa' },
        ],
        responses: {
          '200': { description: 'Đã xóa thành viên khỏi nhóm' },
          '403': { description: 'Chỉ trưởng nhóm mới được xóa thành viên' },
          '404': { description: 'Không tìm thấy nhóm hoặc thành viên trong nhóm' },
        },
      },
    },
    '/api/admin/dashboard': {
      get: {
        tags: ['Admin'],
        summary: 'Thống kê tổng quan Admin Dashboard',
        security: [{ bearerAuth: [] }],
        responses: { '200': { description: 'OK' }, '403': { description: 'Không phải Admin' } },
      },
    },
    '/api/admin/users': {
      get: {
        tags: ['Admin'],
        summary: 'Danh sách người dùng (tìm kiếm, lọc trạng thái/vai trò)',
        security: [{ bearerAuth: [] }],
        responses: { '200': { description: 'OK' } },
      },
    },
    '/api/admin/users/{id}/lock': {
      patch: {
        tags: ['Admin'],
        summary: 'Khóa tài khoản người dùng kèm lý do',
        security: [{ bearerAuth: [] }],
        responses: { '200': { description: 'Đã khóa' } },
      },
    },
    '/api/admin/users/{id}/unlock': {
      patch: {
        tags: ['Admin'],
        summary: 'Mở khóa tài khoản người dùng',
        security: [{ bearerAuth: [] }],
        responses: { '200': { description: 'Đã mở khóa' } },
      },
    },
    '/api/admin/reports': {
      get: {
        tags: ['Admin'],
        summary: 'Danh sách báo cáo bài viết vi phạm',
        security: [{ bearerAuth: [] }],
        responses: { '200': { description: 'OK' } },
      },
    },
    '/api/admin/reports/{id}/resolve': {
      patch: {
        tags: ['Admin'],
        summary: 'Xử lý báo cáo vi phạm (HIDE_POST | DELETE_POST | DISMISS)',
        security: [{ bearerAuth: [] }],
        responses: { '200': { description: 'OK' } },
      },
    },
    '/api/admin/campus': {
      get: {
        tags: ['Admin'],
        summary: 'Quản lý danh sách tin Campus',
        security: [{ bearerAuth: [] }],
        responses: { '200': { description: 'OK' } },
      },
      post: {
        tags: ['Admin'],
        summary: 'Đăng tin Campus mới',
        security: [{ bearerAuth: [] }],
        responses: { '201': { description: 'Created' } },
      },
    },
    '/api/admin/campus/{id}': {
      put: {
        tags: ['Admin'],
        summary: 'Chỉnh sửa, ẩn hoặc lưu nháp tin Campus',
        security: [{ bearerAuth: [] }],
        parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'integer' } }],
        responses: { '200': { description: 'Đã cập nhật' }, '403': { description: 'Không phải Admin' } },
      },
      delete: {
        tags: ['Admin'],
        summary: 'Xóa tin Campus',
        security: [{ bearerAuth: [] }],
        parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'integer' } }],
        responses: { '200': { description: 'Đã xóa' }, '403': { description: 'Không phải Admin' } },
      },
    },
    '/api/admin/logs': {
      get: {
        tags: ['Admin'],
        summary: 'Lịch sử thao tác quản trị (AdminLogs)',
        security: [{ bearerAuth: [] }],
        responses: { '200': { description: 'OK' } },
      },
    },
    '/api/admin/settings': {
      get: {
        tags: ['Admin'],
        summary: 'Xem cấu hình hệ thống (SystemSettings)',
        security: [{ bearerAuth: [] }],
        responses: { '200': { description: 'OK' } },
      },
      put: {
        tags: ['Admin'],
        summary: 'Cập nhật cấu hình hệ thống',
        security: [{ bearerAuth: [] }],
        responses: { '200': { description: 'OK' } },
      },
    },
  },
};
