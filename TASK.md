# PROJECT EXECUTION BOARD — MẠNG XÃ HỘI SINH VIÊN (UniConnect)
> **Mô hình vận hành:** Sở hữu trọn gói theo Module (End-to-End: DB → API → UI → Demo & Vấn đáp)
> **Quy mô:** 5 Thành viên — 10 Module (Mỗi người 2 Module) — 40 Bước triển khai

---

## 👥 BẢNG TỔNG HỢP TIẾN ĐỘ 10 MODULE

| STT | Thành viên & Vai trò | Module sở hữu | Trách nhiệm cốt lõi, Bảng DB & Phối hợp | Tiến độ | Trạng thái |
|---|---|---|---|---|---|
| **1** | **Nguyễn Ngô Tú Anh**<br>*(Leader & Full-stack)* | • **Module 1:** Tài khoản & Core Auth<br>• **Module 10:** Quản trị hệ thống (Admin) | • Base project, ERD toàn hệ thống, JWT Auth Middleware, Client Auth UI (Login/Register/Profile), Admin Portal UI, AdminLogs, SystemSettings.<br>• Phối hợp: Duyệt PR, tích hợp trang quản trị của Duy & Bảo vào Admin Dashboard. | **100%**<br>*(M1: 100%, M10: 100%)* | **Hoàn thành** (Sẵn sàng demo) |
| **2** | **Duy**<br>*(Full-stack Module)* | • **Module 2:** Cộng đồng (Cấu trúc trường)<br>• **Module 3:** Bài viết & Tương tác | • Cấu trúc Trường → Khoa → Ngành → Khóa → Lớp, CRUD bài viết, like, comment, báo cáo vi phạm.<br>• Bảng DB: Schools, Faculties, Majors, Courses, Classes, Posts, Comments, Reactions, PostReports. | M2: 25%<br>M3: 25% | Đang thực hiện |
| **3** | **Huy**<br>*(Full-stack Module)* | • **Module 4:** Tài liệu học tập<br>• **Module 5:** Hỏi đáp học thuật (Q&A) | • Upload/download tài liệu &lt;20MB, đánh giá sao, Q&A theo môn học, upvote, chốt câu trả lời đúng.<br>• Bảng DB: Subjects, Documents, DocumentRatings, Questions, Answers, Votes. | M4: 25%<br>M5: 25% | Đang thực hiện |
| **4** | **Bảo**<br>*(Full-stack Module)* | • **Module 6:** Nhóm học (Study Groups)<br>• **Module 7:** Campus (Tin tức, Việc làm) | • Tạo nhóm học, xin gia nhập, duyệt thành viên; đăng/lọc tin tức Campus, sự kiện, học bổng.<br>• Bảng DB: StudyGroups, GroupMembers, JoinRequests, CampusPosts. | M6: 25%<br>M7: 25% | Đang thực hiện |
| **5** | **Thái**<br>*(Full-stack & UI Lead)* | • **Module 8:** Bảng tin thông minh (News Feed)<br>• **Module 9:** Thông báo Realtime (Socket.io) | • Bảng tin thông minh lọc 4 nhóm & ưu tiên theo lớp, Socket.io Server & chuông thông báo realtime.<br>• Bảng DB: UserFeedPreferences, Notifications. Cung cấp hàm sendNotification(). | M8: 25%<br>M9: 0% | Đang thực hiện |

---

## 📋 CHI TIẾT THEO DÕI TASK (KANBAN)

### ⏳ Chờ triển khai / Đang chạy của các thành viên khác
- [ ] **Duy - Module 2:** Cộng đồng (Cấu trúc trường học: Schools → Classes) — Branch: `feature/community`
- [ ] **Duy - Module 3:** Bài viết & Tương tác (CRUD Posts, Comments, Reactions, PostReports) — Branch: `feature/posts`
- [ ] **Huy - Module 4:** Tài liệu học tập (Upload &lt;20MB, Download, Rating sao, Filter môn học) — Branch: `feature/documents`
- [ ] **Huy - Module 5:** Hỏi đáp học thuật Q&A (Questions, Answers, Upvote, Chốt câu đúng) — Branch: `feature/qa`
- [ ] **Bảo - Module 6:** Nhóm học Study Groups (StudyGroups, GroupMembers, JoinRequests) — Branch: `feature/study-groups`
- [ ] **Bảo - Module 7:** Campus Tin tức, Sự kiện, Việc làm (CampusPosts API & Client UI) — Branch: `feature/campus`
- [ ] **Thái - Module 8:** Bảng tin thông minh News Feed (Thuật toán ưu tiên Lớp → Trường, UserFeedPreferences) — Branch: `feature/news-feed`
- [ ] **Thái - Module 9:** Thông báo Realtime Socket.io (Socket Handshake JWT, new_comment, new_answer, popup Toast) — Branch: `feature/notifications`

### 🔍 In Review / Pull Requests của Tú Anh (Leader)
- [x] **PR #1 (Tú Anh - Module 1 Core):** `feature/core-auth` → `main` (ERD toàn hệ thống, Base Backend, JWT/Bcrypt, Academic APIs, Swagger, Postman, Vitest tests)
- [x] **PR #2 (Tú Anh - Module 10 Admin & Module 1 Client UI):** `feature/admin-dashboard` → `main` (Admin Dashboard API & UI, Client Web Login/Register/Profile UI, Lock/Unlock Student E2E verification)

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
