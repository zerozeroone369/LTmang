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
    '/api/communities/overview': {
      get: {
        tags: ['Communities'],
        summary: 'Tổng quan cây phân cấp đào tạo toàn trường',
        responses: { '200': { description: 'Danh sách trường và cây phân cấp' } },
      },
    },
    '/api/communities/me': {
      get: {
        tags: ['Communities'],
        summary: 'Thông tin cộng đồng của sinh viên đang đăng nhập và bạn cùng lớp',
        security: [{ bearerAuth: [] }],
        responses: { '200': { description: 'Cây phân cấp học tập, sĩ số và bạn cùng lớp' } },
      },
    },
    '/api/communities/classes/{id}/members': {
      get: {
        tags: ['Communities'],
        summary: 'Danh sách thành viên của một lớp học',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'integer' } },
          { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
          { name: 'limit', in: 'query', schema: { type: 'integer', default: 20 } },
          { name: 'search', in: 'query', schema: { type: 'string' } },
        ],
        responses: { '200': { description: 'Danh sách thành viên lớp học' } },
      },
    },
    '/api/communities/faculties/{id}/members': {
      get: {
        tags: ['Communities'],
        summary: 'Danh sách sinh viên trực thuộc một khoa',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'integer' } },
          { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
          { name: 'limit', in: 'query', schema: { type: 'integer', default: 20 } },
          { name: 'search', in: 'query', schema: { type: 'string' } },
        ],
        responses: { '200': { description: 'Danh sách sinh viên trong khoa' } },
      },
    },
    '/api/posts': {
      get: {
        tags: ['Posts'],
        summary: 'Danh sách bài viết (phân trang, lọc theo category, scope, classId...)',
        parameters: [
          { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
          { name: 'limit', in: 'query', schema: { type: 'integer', default: 10 } },
          { name: 'category', in: 'query', schema: { type: 'string', enum: ['STUDY', 'COMMUNITY', 'ACTIVITY', 'OPPORTUNITY'] } },
          { name: 'scope', in: 'query', schema: { type: 'string', enum: ['CLASS', 'COURSE', 'MAJOR', 'FACULTY', 'SCHOOL', 'PUBLIC'] } },
          { name: 'search', in: 'query', schema: { type: 'string' } },
        ],
        responses: { '200': { description: 'Danh sách bài viết' } },
      },
      post: {
        tags: ['Posts'],
        summary: 'Đăng bài viết mới',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['content'],
                properties: {
                  title: { type: 'string', example: 'Đề cương ôn tập Lập trình mạng' },
                  content: { type: 'string', example: 'Tài liệu chi tiết Socket TCP và REST API...' },
                  category: { type: 'string', enum: ['STUDY', 'COMMUNITY', 'ACTIVITY', 'OPPORTUNITY'], default: 'COMMUNITY' },
                  scope: { type: 'string', enum: ['CLASS', 'COURSE', 'MAJOR', 'FACULTY', 'SCHOOL', 'PUBLIC'], default: 'SCHOOL' },
                  mediaUrls: { type: 'array', items: { type: 'string' } },
                },
              },
            },
          },
        },
        responses: { '201': { description: 'Tạo bài viết thành công' } },
      },
    },
    '/api/posts/{id}': {
      get: {
        tags: ['Posts'],
        summary: 'Xem chi tiết bài viết',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
        responses: { '200': { description: 'Chi tiết bài viết' }, '404': { description: 'Không tìm thấy' } },
      },
      put: {
        tags: ['Posts'],
        summary: 'Chỉnh sửa bài viết (chỉ chủ bài viết)',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  title: { type: 'string' },
                  content: { type: 'string' },
                  category: { type: 'string' },
                  scope: { type: 'string' },
                },
              },
            },
          },
        },
        responses: { '200': { description: 'Cập nhật thành công' }, '403': { description: 'Không có quyền' } },
      },
      delete: {
        tags: ['Posts'],
        summary: 'Xóa bài viết (chủ bài viết hoặc Admin)',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
        responses: { '200': { description: 'Đã xóa bài viết' }, '403': { description: 'Không có quyền' } },
      },
    },
    '/api/posts/{id}/like': {
      post: {
        tags: ['Posts'],
        summary: 'Thả tim / Bỏ thích bài viết (Toggle Like)',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
        responses: { '200': { description: 'Kết quả thích/bỏ thích' } },
      },
    },
    '/api/posts/{id}/comments': {
      get: {
        tags: ['Posts'],
        summary: 'Danh sách bình luận của bài viết',
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'integer' } },
          { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
          { name: 'limit', in: 'query', schema: { type: 'integer', default: 20 } },
        ],
        responses: { '200': { description: 'Danh sách bình luận' } },
      },
      post: {
        tags: ['Posts'],
        summary: 'Thêm bình luận cho bài viết (hỗ trợ parentId)',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['content'],
                properties: {
                  content: { type: 'string', example: 'Bài viết rất hữu ích!' },
                  parentId: { type: 'integer' },
                },
              },
            },
          },
        },
        responses: { '201': { description: 'Bình luận thành công' } },
      },
    },
    '/api/posts/{id}/report': {
      post: {
        tags: ['Posts'],
        summary: 'Báo cáo bài viết vi phạm lên Admin',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['reason'],
                properties: {
                  reason: { type: 'string', example: 'Nội dung spam / quảng cáo' },
                  description: { type: 'string' },
                },
              },
            },
          },
        },
        responses: { '201': { description: 'Báo cáo thành công' }, '400': { description: 'Không thể báo cáo bài của mình' } },
      },
    },
    '/api/campus': {
      get: {
        tags: ['Campus'],
        summary: 'Danh sách tin tức Campus đã xuất bản (dùng cho Client)',
        responses: { '200': { description: 'OK' } },
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
