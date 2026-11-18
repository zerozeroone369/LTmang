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
        responses: { '200': { description: 'OK' } },
      },
    },
    '/api/feed': {
      get: {
        tags: ['Feed'],
        summary: 'Lấy Smart News Feed tổng hợp và phân trang',
        description:
          'Yêu cầu Bearer JWT. Tổng hợp Posts đang hoạt động và CampusPosts đã xuất bản. Documents và Questions hiện chưa được tích hợp do chính sách truy cập chưa xác nhận.',
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: 'page',
            in: 'query',
            description: 'Trang bắt đầu từ 1.',
            schema: { type: 'integer', minimum: 1, default: 1 },
          },
          {
            name: 'limit',
            in: 'query',
            description: 'Số item mỗi trang, tối đa 100.',
            schema: { type: 'integer', minimum: 1, maximum: 100, default: 10 },
          },
          {
            name: 'category',
            in: 'query',
            description: 'Nhóm nội dung cần lọc.',
            schema: {
              type: 'string',
              enum: ['STUDY', 'COMMUNITY', 'ACTIVITY', 'OPPORTUNITY'],
            },
          },
          {
            name: 'scope',
            in: 'query',
            description:
              'Phạm vi dùng để ưu tiên sắp xếp; nội dung ở scope khác vẫn hiển thị nếu người dùng có quyền.',
            schema: {
              type: 'string',
              enum: ['CLASS', 'COURSE', 'MAJOR', 'FACULTY', 'SCHOOL', 'GLOBAL'],
            },
          },
          {
            name: 'search',
            in: 'query',
            description: 'Tìm trong tiêu đề và nội dung, tối đa 200 ký tự.',
            schema: { type: 'string', maxLength: 200 },
          },
        ],
        responses: {
          '200': {
            description: 'Danh sách feed đã sắp xếp và phân trang.',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    message: { type: 'string', example: 'Danh sách Smart News Feed' },
                    data: {
                      type: 'object',
                      properties: {
                        items: {
                          type: 'array',
                          items: {
                            type: 'object',
                            required: [
                              'id',
                              'sourceType',
                              'sourceId',
                              'category',
                              'subtype',
                              'title',
                              'excerpt',
                              'createdAt',
                              'isPinned',
                              'author',
                              'scopeLevel',
                              'payload',
                            ],
                            properties: {
                              id: { type: 'string', example: 'POST:42' },
                              sourceType: { type: 'string', enum: ['POST', 'CAMPUS_POST'] },
                              sourceId: { type: 'integer' },
                              category: {
                                type: 'string',
                                enum: ['COMMUNITY', 'ACTIVITY', 'OPPORTUNITY'],
                              },
                              subtype: { type: 'string' },
                              title: { type: 'string', nullable: true },
                              excerpt: { type: 'string' },
                              createdAt: { type: 'string', format: 'date-time' },
                              isPinned: { type: 'boolean' },
                              author: {
                                type: 'object',
                                properties: {
                                  id: { type: 'integer' },
                                  fullName: { type: 'string' },
                                  avatarUrl: { type: 'string', nullable: true },
                                },
                              },
                              scopeLevel: {
                                type: 'string',
                                enum: ['CLASS', 'COURSE', 'MAJOR', 'FACULTY', 'SCHOOL', 'GLOBAL'],
                              },
                              payload: { type: 'object', additionalProperties: true },
                            },
                          },
                        },
                        unavailableSources: {
                          type: 'array',
                          items: {
                            type: 'object',
                            properties: {
                              sourceType: { type: 'string', enum: ['DOCUMENT', 'QUESTION'] },
                              reason: { type: 'string', enum: ['ACCESS_POLICY_UNCONFIRMED'] },
                            },
                          },
                        },
                      },
                    },
                    meta: {
                      type: 'object',
                      properties: {
                        page: { type: 'integer' },
                        limit: { type: 'integer' },
                        total: { type: 'integer' },
                        totalPages: { type: 'integer' },
                      },
                    },
                  },
                },
              },
            },
          },
          '400': { description: 'Query parameter không hợp lệ.' },
          '401': { description: 'Thiếu JWT hoặc token không hợp lệ/hết hạn.' },
          '403': { description: 'Tài khoản đã bị khóa.' },
          '404': { description: 'Không tìm thấy hồ sơ người dùng.' },
          '500': { description: 'Preference đã lưu không hợp lệ hoặc lỗi máy chủ.' },
        },
      },
    },
    '/api/feed/preferences': {
      put: {
        tags: ['Feed'],
        summary: 'Lưu tùy chọn danh mục và phạm vi Smart News Feed',
        description:
          'Yêu cầu Bearer JWT. userId được lấy từ token hiện tại; không truyền userId trong request body. Gửi categories là ALL hoặc mảng danh mục không trùng lặp.',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                oneOf: [
                  {
                    type: 'object',
                    required: ['categories', 'scope'],
                    properties: {
                      categories: { type: 'string', enum: ['ALL'] },
                      scope: {
                        type: 'string',
                        enum: ['CLASS', 'COURSE', 'MAJOR', 'FACULTY', 'SCHOOL'],
                      },
                    },
                  },
                  {
                    type: 'object',
                    required: ['categories', 'scope'],
                    properties: {
                      categories: {
                        type: 'array',
                        minItems: 1,
                        maxItems: 4,
                        uniqueItems: true,
                        items: {
                          type: 'string',
                          enum: ['STUDY', 'COMMUNITY', 'ACTIVITY', 'OPPORTUNITY'],
                        },
                      },
                      scope: {
                        type: 'string',
                        enum: ['CLASS', 'COURSE', 'MAJOR', 'FACULTY', 'SCHOOL'],
                      },
                    },
                  },
                ],
                example: { categories: ['STUDY', 'COMMUNITY'], scope: 'CLASS' },
              },
            },
          },
        },
        responses: {
          '200': {
            description: 'Preference đã được tạo hoặc cập nhật.',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    message: { type: 'string' },
                    data: {
                      type: 'object',
                      properties: {
                        id: { type: 'integer' },
                        userId: { type: 'integer' },
                        categories: {
                          oneOf: [
                            { type: 'string', enum: ['ALL'] },
                            {
                              type: 'array',
                              items: {
                                type: 'string',
                                enum: ['STUDY', 'COMMUNITY', 'ACTIVITY', 'OPPORTUNITY'],
                              },
                            },
                          ],
                        },
                        scope: {
                          type: 'string',
                          enum: ['CLASS', 'COURSE', 'MAJOR', 'FACULTY', 'SCHOOL'],
                        },
                        updatedAt: { type: 'string', format: 'date-time' },
                      },
                    },
                  },
                },
              },
            },
          },
          '400': {
            description: 'Body không hợp lệ, category trùng hoặc scope/category không được hỗ trợ.',
          },
          '401': { description: 'Thiếu JWT hoặc token không hợp lệ/hết hạn.' },
          '403': { description: 'Tài khoản đã bị khóa.' },
          '500': { description: 'Lỗi máy chủ khi lưu tùy chọn.' },
        },
      },
    },
    '/api/notifications': {
      get: {
        tags: ['Notifications'],
        summary: 'Lấy danh sách thông báo của người dùng hiện tại',
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: 'page',
            in: 'query',
            schema: { type: 'integer', minimum: 1, default: 1 },
          },
          {
            name: 'limit',
            in: 'query',
            schema: { type: 'integer', minimum: 1, maximum: 100, default: 20 },
          },
        ],
        responses: {
          '200': {
            description: 'Danh sách thông báo, số chưa đọc và metadata phân trang.',
          },
          '400': { description: 'Query không hợp lệ.' },
          '401': { description: 'Thiếu JWT hoặc token không hợp lệ/hết hạn.' },
          '403': { description: 'Tài khoản đã bị khóa.' },
        },
      },
    },
    '/api/notifications/read-all': {
      put: {
        tags: ['Notifications'],
        summary: 'Đánh dấu tất cả thông báo của người dùng hiện tại đã đọc',
        description: 'Chỉ cập nhật các thông báo thuộc userId từ JWT đang xác thực.',
        security: [{ bearerAuth: [] }],
        responses: {
          '200': {
            description: 'Trả về số lượng thông báo chưa đọc đã được cập nhật.',
          },
          '401': { description: 'Thiếu JWT hoặc token không hợp lệ/hết hạn.' },
          '403': { description: 'Tài khoản đã bị khóa.' },
        },
      },
    },
    '/api/notifications/{id}/read': {
      put: {
        tags: ['Notifications'],
        summary: 'Đánh dấu một thông báo của người dùng hiện tại đã đọc',
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'integer', minimum: 1 },
          },
        ],
        responses: {
          '200': { description: 'Thông báo đã được đánh dấu đã đọc.' },
          '400': { description: 'Notification ID không hợp lệ.' },
          '401': { description: 'Thiếu JWT hoặc token không hợp lệ/hết hạn.' },
          '403': { description: 'Tài khoản đã bị khóa.' },
          '404': { description: 'Không tìm thấy thông báo thuộc người dùng hiện tại.' },
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
    '/api/documents': {
      get: {
        tags: ['Documents'],
        summary: 'Danh sách tài liệu học tập (lọc theo môn, loại tài liệu, tìm kiếm)',
        responses: { '200': { description: 'OK' } },
      },
      post: {
        tags: ['Documents'],
        summary: 'Đăng tải tài liệu học tập mới',
        security: [{ bearerAuth: [] }],
        responses: { '201': { description: 'Created' } },
      },
    },
    '/api/documents/upload': {
      post: {
        tags: ['Documents'],
        summary: 'Tải tệp tài liệu lên server (<20MB, PDF/DOCX/PPTX)',
        security: [{ bearerAuth: [] }],
        responses: { '201': { description: 'File uploaded' } },
      },
    },
    '/api/documents/subjects': {
      get: {
        tags: ['Documents'],
        summary: 'Danh sách môn học',
        responses: { '200': { description: 'OK' } },
      },
    },
    '/api/documents/{id}/download': {
      get: {
        tags: ['Documents'],
        summary: 'Tải tài liệu và tăng lượt tải',
        responses: { '200': { description: 'OK' } },
      },
    },
    '/api/documents/{id}/ratings': {
      post: {
        tags: ['Documents'],
        summary: 'Đánh giá sao tài liệu (1-5 sao kèm nhận xét)',
        security: [{ bearerAuth: [] }],
        responses: { '200': { description: 'OK' } },
      },
    },
    '/api/qa/questions': {
      get: {
        tags: ['Q&A'],
        summary: 'Danh sách câu hỏi học thuật (lọc theo môn, tìm kiếm, đã giải quyết)',
        responses: { '200': { description: 'OK' } },
      },
      post: {
        tags: ['Q&A'],
        summary: 'Đặt câu hỏi học thuật mới',
        security: [{ bearerAuth: [] }],
        responses: { '201': { description: 'Created' } },
      },
    },
    '/api/qa/questions/{id}/answers': {
      post: {
        tags: ['Q&A'],
        summary: 'Trả lời câu hỏi và gửi thông báo realtime new_answer cho tác giả',
        security: [{ bearerAuth: [] }],
        responses: { '201': { description: 'Created' } },
      },
    },
    '/api/qa/answers/{answerId}/vote': {
      post: {
        tags: ['Q&A'],
        summary: 'Upvote (+1) hoặc Downvote (-1) câu trả lời',
        security: [{ bearerAuth: [] }],
        responses: { '200': { description: 'OK' } },
      },
    },
    '/api/qa/answers/{answerId}/accept': {
      post: {
        tags: ['Q&A'],
        summary: 'Đánh dấu câu trả lời đúng (chỉ tác giả câu hỏi hoặc Admin)',
        security: [{ bearerAuth: [] }],
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
        summary: 'Tìm kiếm nhóm học đang mở',
        security: [{ bearerAuth: [] }],
        responses: { '200': { description: 'OK' } },
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
        summary: 'Tạo nhóm học mới (người tạo tự động làm Leader)',
        security: [{ bearerAuth: [] }],
        responses: { '201': { description: 'Created' } },
      },
    },
    '/api/groups/{id}/join': {
      post: {
        tags: ['Study Groups'],
        summary: 'Gửi yêu cầu tham gia nhóm học (gửi thông báo realtime cho Leader)',
        security: [{ bearerAuth: [] }],
        responses: { '201': { description: 'Created' } },
      },
    },
    '/api/groups/join-requests/{requestId}': {
      put: {
        tags: ['Study Groups'],
        summary: 'Trưởng nhóm duyệt/từ chối yêu cầu tham gia (gửi thông báo realtime cho SV)',
        security: [{ bearerAuth: [] }],
        responses: { '200': { description: 'OK' } },
      },
    },
    '/api/groups/{id}/leave': {
      delete: {
        tags: ['Study Groups'],
        summary: 'Rời nhóm học (chuyển quyền Leader nếu trưởng nhóm rời)',
        security: [{ bearerAuth: [] }],
        responses: { '200': { description: 'OK' } },
      },
    },
  },
};
