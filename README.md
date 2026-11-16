# UniConnect — Mạng Xã Hội Phục Vụ Đời Sống Sinh Viên

> **Môn học:** Lập trình mạng (Network Programming)  
> **Repository:** `https://github.com/zerozeroone369/LTmang.git`  
> **Mô hình thực hiện:** Sở hữu trọn gói theo Module (**End-to-End: CSDL → API → UI → Demo & Vấn đáp**)

---

## 1. Mô hình phân công (5 Thành viên — 10 Module)

| STT | Thành viên | Vai trò | 2 Module sở hữu trọn gói | Trách nhiệm chính |
|---|---|---|---|---|
| 1 | **Nguyễn Ngô Tú Anh** | **Leader & Full-stack** | • **Module 1:** Tài khoản & Core Auth<br>• **Module 10:** Quản trị hệ thống (Admin) | Base project, ERD toàn hệ thống, JWT Auth Middleware, Client Auth UI (Login/Register/Profile), Admin Portal UI, Duyệt PR. |
| 2 | **Duy** | Full-stack Module | • **Module 2:** Cộng đồng (Cấu trúc trường)<br>• **Module 3:** Bài viết & Tương tác | Cấu trúc phân cấp Trường → Khoa → Ngành → Khóa → Lớp, CRUD bài viết theo phạm vi, tương tác like, comment, báo cáo. |
| 3 | **Huy** | Full-stack Module | • **Module 4:** Tài liệu học tập<br>• **Module 5:** Hỏi đáp học thuật (Q&A) | Upload/download tài liệu học tập &lt;20MB, đánh giá sao, Q&A theo môn học, upvote, chốt câu trả lời đúng. |
| 4 | **Bảo** | Full-stack Module | • **Module 6:** Nhóm học (Study Groups)<br>• **Module 7:** Campus (Tin tức, Sự kiện, Việc làm) | Tạo & quản lý nhóm học, xin gia nhập, duyệt thành viên; đăng & lọc tin tức Campus, sự kiện, học bổng, việc làm IT. |
| 5 | **Thái** | Full-stack & UI Lead | • **Module 8:** Bảng tin thông minh (News Feed)<br>• **Module 9:** Thông báo Realtime (Socket.io) | Bảng tin thông minh ưu tiên Lớp → Trường, WebSocket Socket.io đẩy thông báo realtime (hàm dùng chung `sendNotification`). |

---

## 2. Cấu trúc Monorepo Dự án

```text
LTmang/
├── backend/          # REST API Server (Node.js + Express + TypeScript + Prisma ORM + SQLite/PG)
├── admin-web/        # Admin Portal (React + Vite + TypeScript + Tailwind CSS + Axios) — Module 10
├── client-web/       # Client Web App (React + Vite + TypeScript + Tailwind CSS + Axios) — Module 1 & Khung chung
├── docs/             # Tài liệu thiết kế ERD, Kiến trúc, DTO, Postman Collection, Hướng dẫn vấn đáp
└── TASK.md           # Bảng Kanban theo dõi tiến độ chi tiết theo chuẩn 4 bước
```

---

## 3. Hướng dẫn khởi chạy dự án (Local Development)

### 3.1. Chạy Backend API Server (`http://localhost:4000`)
```bash
cd backend
npm install
cp .env.example .env
npx prisma generate
npx prisma db push
npm run prisma:seed
npm run dev
```
- **Swagger Docs:** `http://localhost:4000/api-docs`
- **Health Check:** `http://localhost:4000/api/health`
- **Tài khoản Seed sẵn (Dev):**
  - Quản trị viên: `admin@uniconnect.edu.vn` / `Admin@123456`
  - Sinh viên: `anh_2351220089@dau.edu.vn` (hoặc MSSV `2351220089`) / `Student@123456`

### 3.2. Chạy Cổng Quản Trị Admin (`http://localhost:5173`)
```bash
cd admin-web
npm install
npm run dev
```

### 3.3. Chạy Mạng Xã Hội Sinh Viên Client (`http://localhost:5174`)
```bash
cd client-web
npm install
npm run dev
```

---

## 4. Kiểm thử & Đảm bảo chất lượng

```bash
# Kiểm tra Backend
cd backend
npm test          # Chạy 16/16 Unit & Integration Tests (Vitest)
npm run lint      # Kiểm tra ESLint
npm run format:check # Kiểm tra Prettier
npm run build     # Kiểm tra TypeScript

# Kiểm tra Admin Web
cd ../admin-web
npm run lint
npm run build

# Kiểm tra Client Web
cd ../client-web
npm run lint
npm run build
```

---

## 5. Tài liệu quan trọng dành cho nhóm

- Bảng phân công chi tiết & Tiến độ: [`TASK.md`](./TASK.md)
- **Tài liệu chuẩn bị câu hỏi vấn đáp cho Tú Anh:** [`docs/ORAL_EXAM_PREPARATION.md`](./docs/ORAL_EXAM_PREPARATION.md)
- Thiết kế ERD toàn hệ thống (Mermaid): [`docs/ERD.md`](./docs/ERD.md)
- Kiến trúc hệ thống & bảo mật mạng: [`docs/API_ARCHITECTURE.md`](./docs/API_ARCHITECTURE.md)
- Hợp đồng DTO giao tiếp Backend - Frontend: [`docs/DTO_CONTRACTS.md`](./docs/DTO_CONTRACTS.md)
- Bộ API Postman Collection xuất sẵn: [`docs/postman_collection.json`](./docs/postman_collection.json)
