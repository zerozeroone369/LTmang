# UniConnect — Mạng Xã Hội Phục Vụ Đời Sống Sinh Viên

> **Môn học:** Lập trình mạng (Network Programming)
> **Repository:** `https://github.com/zerozeroone369/LTmang.git`

## 1. Tổng quan đề tài

**UniConnect** là ứng dụng mạng xã hội chuyên biệt dành cho đời sống sinh viên đại học, kết hợp 4 trụ cột:
- **Social & Community:** Kết nối cộng đồng phân cấp theo `Trường → Khoa → Ngành → Khóa → Lớp`, bảng tin thông minh ưu tiên nội dung từ lớp đến trường.
- **Study (Kho tài liệu & Hỏi đáp Q&A):** Upload/download tài liệu theo môn học, đánh giá sao, hỏi đáp theo môn học với upvote và đánh dấu câu trả lời đúng.
- **Study Groups (Nhóm học):** Tìm bạn học cùng mục tiêu/môn học, tạo nhóm, duyệt thành viên.
- **Campus & Realtime:** Tin tức sự kiện, học bổng, câu lạc bộ, việc làm/thực tập và thông báo realtime qua Socket.io.

## 2. Phân công thành viên & Kiến trúc hệ thống

| Thành viên | Vai trò | Phạm vi công việc chính |
|---|---|---|
| **Nguyễn Ngô Tú Anh** | Leader & Full-stack | Core System, Auth (JWT/Bcrypt), ERD toàn hệ thống, Admin Dashboard (API + UI) |
| **Duy** | Backend Developer | Module Cộng đồng (Cấu trúc đào tạo), Module Bài viết & Thuật toán Bảng tin |
| **Huy** | Backend Developer | Module Tài liệu học tập (Upload/Download/Rating), Module Hỏi đáp (Q&A) |
| **Bảo** | Backend & Realtime | Module Nhóm học (Study Groups), Module Campus & Thông báo Realtime (Socket.io) |
| **Thái** | Frontend Developer | Client Web/Mobile UI (Social, Auth, Study, Campus, Socket.io Client) |

## 3. Cấu trúc thư mục

```text
LTmang/
├── backend/          # REST API Server (Node.js, Express, TypeScript, Prisma, Socket.io ready)
├── admin-web/        # Admin Dashboard Portal (React, Vite, TypeScript, Tailwind CSS, Axios)
├── client-web/       # Client App workspace (dành cho Frontend Developer - Thái)
├── docs/             # Thiết kế ERD, Kiến trúc hệ thống, DTO Contracts, Postman Collection
└── TASK.md           # Bảng Kanban theo dõi tiến độ toàn nhóm
```

## 4. Hướng dẫn chạy nhanh (Local Dev)

### Backend API (`http://localhost:4000`)
```bash
cd backend
npm install
cp .env.example .env
npx prisma generate
npx prisma migrate dev
npm run prisma:seed
npm run dev
```
- Swagger Docs: `http://localhost:4000/api-docs`

### Admin Dashboard (`http://localhost:5173`)
```bash
cd admin-web
npm install
cp .env.example .env
npm run dev
```

## 5. Quy tắc Git Flow của nhóm

1. **Không push trực tiếp lên nhánh `main` hoặc `master`.**
2. Khi thực hiện mỗi nhiệm vụ, rẽ nhánh riêng từ `main`:
   - `feature/core-auth` (Tú Anh - Core System & Auth)
   - `feature/admin-dashboard` (Tú Anh - Admin Dashboard)
   - `feature/community` / `feature/news-feed` (Duy)
   - `feature/documents` / `feature/qa` (Huy)
   - `feature/study-groups` / `feature/realtime-campus` (Bảo)
   - `feature/client-ui` (Thái)
3. Viết test & chạy lint/format trước khi tạo Pull Request vào `main`.
4. Tạo **Pull Request (PR)** vào `main` kèm mô tả, checklist test, và đợi Leader (**Tú Anh**) review & merge.

## 6. Tài liệu tham khảo nhanh

- Chi tiết bảng nhiệm vụ & tiến độ: [`TASK.md`](./TASK.md)
- Sơ đồ ERD toàn hệ thống: [`docs/ERD.md`](./docs/ERD.md)
- Kiến trúc hệ thống & bảo mật: [`docs/API_ARCHITECTURE.md`](./docs/API_ARCHITECTURE.md)
- Hợp đồng DTO cho Frontend & Backend: [`docs/DTO_CONTRACTS.md`](./docs/DTO_CONTRACTS.md)
- Postman Collection: [`docs/postman_collection.json`](./docs/postman_collection.json)
