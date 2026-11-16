# PROJECT EXECUTION BOARD — MẠNG XÃ HỘI SINH VIÊN (UniConnect)

## 📋 Backlog (Chờ triển khai)
- [ ] **Huy - Module 4:** Tài liệu học tập (Upload/Download <= 20MB, PDF/DOCX, Rating, Search/Filter) — Branch: `feature/documents`
- [ ] **Huy - Module 5:** Hỏi đáp Q&A (Questions, Answers, Upvote/Downvote, Mark Correct Answer) — Branch: `feature/qa`
- [ ] **Bảo - Module 6:** Nhóm học (StudyGroups, GroupMembers, JoinRequests) — Branch: `feature/study-groups`
- [ ] **Bảo - Module 7:** Campus (CampusPosts, Quản trị tin sự kiện/học bổng) — Branch: `feature/campus`
- [ ] **Thái - Module 8:** Bảng tin thông minh (UserFeedPreferences, thuật toán trộn tin đa nguồn) — Branch: `feature/news-feed`
- [ ] **Thái - Module 9:** Thông báo realtime (Socket.io notification server & client popup) — Branch: `feature/notifications`

## ⏳ In Progress (Đang thực hiện)
- _(Chưa có task đang thực hiện)_

## 🔍 In Review / Testing (Chờ duyệt PR / Kiểm thử)
- [ ] **PR #1 (Tú Anh - Module 1):** `feature/core-auth` -> `main` (Core System, ERD toàn hệ thống, Auth JWT/Bcrypt, Academic APIs, Swagger/Postman)
- [ ] **PR #2 (Tú Anh - Module 10):** `feature/admin-dashboard` -> `feature/core-auth` (AdminLogs, SystemSettings, Admin APIs + React Admin Portal UI + E2E Lock/Unlock Verification)
- [ ] **PR #3 (Duy - Module 2 & 3):** `feature/community` -> `main` (Module Cộng đồng + Module Bài viết: Full-stack DB -> API -> React UI -> 12/12 Tests pass)

## ✅ Completed (Hoàn thành code & test)
- [x] Khởi tạo Repository `LTmang`, `.gitignore`, `README.md`, PR template và `TASK.md` — Branch: `main`
- [x] **Tú Anh - Module 1:** Core System, ERD toàn hệ thống & Module Xác thực (12/12 Vitest tests pass) — Branch: `feature/core-auth`
- [x] **Tú Anh - Module 10:** Admin Dashboard Backend APIs & React Admin Web UI (16/16 Vitest tests pass + E2E browser flow verified) — Branch: `feature/admin-dashboard`
- [x] **Duy - Module 2:** Cộng đồng (Cơ sở dữ liệu cấu trúc trường, seed data phong phú, API `GET /communities/me`, `GET /academic/*`, bộ chọn liên hoàn CascadeSelect, trang Cộng đồng & thành viên lớp) — Branch: `feature/community`
- [x] **Duy - Module 3:** Bài viết (CRUD Posts scope Lớp/Khoa/Trường, Comments, Toggle Like chống trùng lặp, PostReports gửi Admin, bảo mật 403 Forbidden ở Backend, React UI đăng bài & tương tác) — Branch: `feature/community`
