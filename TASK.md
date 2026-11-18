# PROJECT EXECUTION BOARD — MẠNG XÃ HỘI SINH VIÊN (UniConnect)
> **Mô hình vận hành:** Sở hữu trọn gói theo Module (End-to-End: DB → API → UI → Demo & Vấn đáp)
> **Quy mô:** 5 Thành viên — 10 Module (Mỗi người 2 Module) — 40 Bước triển khai

---

## 👥 BẢNG TỔNG HỢP TIẾN ĐỘ 10 MODULE

| STT | Thành viên & Vai trò | Module sở hữu | Trách nhiệm cốt lõi, Bảng DB & Phối hợp | Tiến độ | Trạng thái |
|---|---|---|---|---|---|
| **1** | **Nguyễn Ngô Tú Anh**<br>*(Leader & Full-stack)* | • **Module 1:** Tài khoản & Core Auth<br>• **Module 10:** Quản trị hệ thống (Admin) | • Base project, ERD toàn hệ thống, JWT Auth Middleware, Client Auth UI (Login/Register/Profile), Admin Portal UI, AdminLogs, SystemSettings.<br>• Phối hợp: Duyệt PR, tích hợp toàn bộ 10 module & kiểm thử 71/71 tests. | **100%**<br>*(M1: 100%, M10: 100%)* | **Hoàn thành** (Sẵn sàng demo) |
| **2** | **Duy**<br>*(Full-stack Module)* | • **Module 2:** Cộng đồng (Cấu trúc trường)<br>• **Module 3:** Bài viết & Tương tác | • Cấu trúc Trường → Khoa → Ngành → Khóa → Lớp, CRUD bài viết, like, comment, báo cáo vi phạm, giao diện Desktop/Mobile.<br>• Bảng DB: Schools, Faculties, Majors, Courses, Classes, Posts, Comments, Reactions, PostReports. | **100%**<br>*(M2: 100%, M3: 100%)* | **Hoàn thành** (Đã tích hợp) |
| **3** | **Huy**<br>*(Full-stack Module)* | • **Module 4:** Tài liệu học tập<br>• **Module 5:** Hỏi đáp học thuật (Q&A) | • Upload/download tài liệu &lt;20MB (Multer), đánh giá sao, Q&A theo môn học, upvote/downvote, chốt câu trả lời đúng, gắn realtime `new_answer`.<br>• Bảng DB: Subjects, Documents, DocumentRatings, Questions, Answers, Votes. | **100%**<br>*(M4: 100%, M5: 100%)* | **Hoàn thành** (Đã tích hợp) |
| **4** | **Bảo**<br>*(Full-stack Module)* | • **Module 6:** Nhóm học (Study Groups)<br>• **Module 7:** Campus (Tin tức, Việc làm) | • Tạo nhóm học, tìm kiếm, xin gia nhập, duyệt thành viên (gắn realtime `join_request`); đăng/lọc tin tức Campus & quản trị Campus nâng cao trong Admin.<br>• Bảng DB: StudyGroups, GroupMembers, JoinRequests, CampusPosts. | **100%**<br>*(M6: 100%, M7: 100%)* | **Hoàn thành** (Đã tích hợp) |
| **5** | **Thái**<br>*(Full-stack & UI Lead)* | • **Module 8:** Bảng tin thông minh (News Feed)<br>• **Module 9:** Thông báo Realtime (Socket.io) | • Bảng tin thông minh lọc 4 nhóm & ưu tiên theo lớp, Socket.io Server xác thực JWT, chuông thông báo `NotificationBell` & hàm `sendNotification()`.<br>• Bảng DB: UserFeedPreferences, Notifications. | **100%**<br>*(M8: 100%, M9: 100%)* | **Hoàn thành** (Đã tích hợp) |

---

## 📋 CHI TIẾT THEO DÕI TASK (KANBAN)

### ✅ Toàn bộ 10 Module đã tích hợp & kiểm thử (71/71 Vitest Tests Passed)
- [x] **Tú Anh - Module 1 & 10:** Tài khoản, Core Auth, JWT Middleware, Admin Dashboard — Branch: `feature/auth`, `feature/admin-dashboard`
- [x] **Duy - Module 2 & 3:** Cộng đồng (Schools → Classes) & Bài viết/Tương tác (Posts, Comments, Reactions, Reports) — Branch: `feature/community`
- [x] **Huy - Module 4 & 5:** Tài liệu học tập (Multer &lt;20MB, Rating sao) & Q&A học thuật (Questions, Answers, Votes, Accept + `new_answer`) — Branch: `feature/documents`
- [x] **Bảo - Module 6 & 7:** Nhóm học Study Groups (Leader duyệt đơn, giới hạn sĩ số + `join_request`) & Campus (Client + Admin fields) — Commit: `043918f`
- [x] **Thái - Module 8 & 9:** Bảng tin thông minh News Feed (4 nhóm + ưu tiên Lớp → Trường) & Thông báo Realtime Socket.io (`NotificationBell` + `sendNotification`) — Branch: `feed-notifications`

### 🔍 Pull Requests & Gộp Nhánh (Leader Tú Anh)
- [x] **PR #2 & #3 (Tú Anh + Duy):** Đã gộp vào `main` (Modules 1, 2, 3, 10 + README).
- [x] **PR tích hợp tổng hợp (`feature/integrate-all-modules` → `main`):** Hợp nhất chuẩn chỉnh cả 10 Module của Tú Anh, Duy, Huy, Bảo, Thái, nối đầy đủ 4 sự kiện thông báo realtime (`new_comment`, `new_answer`, `join_request`, `campus_post`), 71/71 Vitest tests pass, 3 app build 0 errors.

### ✅ Hoàn thành trọn gói của Tú Anh (Leader & Full-stack)
- [x] **B1 (ERD & Base):**
  - Khởi tạo Base Project Backend Clean Architecture (Node.js + Express + TypeScript + Prisma).
  - Hoàn thiện ERD 24 bảng cho toàn bộ 10 module (`docs/ERD.md` + `backend/prisma/schema.prisma`).
- [x] **B2 (API & Bảo mật):**
  - Viết bộ API Auth: Đăng ký, Đăng nhập, Đổi mật khẩu, Hồ sơ cá nhân (`/api/auth/*`, `/api/users/*`).
  - Viết bộ API Quản trị Admin: Thống kê KPI, Quản lý người dùng, Khóa/Mở khóa, Phân quyền, Xử lý vi phạm, Nhật ký AdminLogs, Cấu hình SystemSettings (`/api/admin/*`).
  - Viết Middleware JWT (`authenticate`), Role Guard (`requireRole`), Rate Limiting, Zod Validators.
  - Viết 16/16 Unit & Integration Tests (Vitest + Supertest) pass 100%.
- [x] **B3 (Màn hình UI End-to-End):**
  - **Màn hình Client Web (`client-web/`):**
    - Trang Đăng nhập (`/login`) bằng Email hoặc MSSV.
    - Trang Đăng ký (`/register`) với cascading dropdowns chọn Trường → Khoa → Ngành → Khóa → Lớp.
    - Trang Hồ sơ cá nhân (`/profile`) với Thẻ sinh viên ảo, cập nhật thông tin và form Đổi mật khẩu.
    - Layout Shell chung cho toàn nhóm (`ClientLayout.tsx`) với Header và Sidebar định vị sẵn 10 module.
  - **Màn hình Admin Web (`admin-web/`):**
    - Trang Đăng nhập Admin (`/login`) chặn tài khoản sinh viên.
    - Trang Tổng quan Dashboard (`/`), Quản lý người dùng (`/users`), Kiểm duyệt vi phạm (`/moderation`), Quản lý Campus (`/campus`), Cấu trúc đào tạo (`/academic`), Nhật ký & Cài đặt (`/settings`).
- [x] **B4 (Demo & Vấn đáp):**
  - Kiểm thử E2E trên trình duyệt thật (Chrome DevTools): Sinh viên đăng ký → Đăng nhập → Sửa hồ sơ → Admin khóa tài khoản sinh viên → Sinh viên bị chặn đăng nhập và chặn token (`403`) → Admin mở khóa → Sinh viên đăng nhập lại thành công.
  - Soạn tài liệu hướng dẫn vấn đáp 100% câu hỏi lý thuyết & bảo mật: [`docs/ORAL_EXAM_PREPARATION.md`](./docs/ORAL_EXAM_PREPARATION.md).
