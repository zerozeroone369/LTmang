# UniConnect — Mạng Xã Hội Phục Vụ Đời Sống Sinh Viên

> **Môn học:** Lập trình mạng (Network Programming)  
> **Repository:** `https://github.com/zerozeroone369/LTmang.git`  
> **Mô hình vận hành:** Sở hữu trọn gói theo Module (**End-to-End: CSDL → API → UI → Demo & Vấn đáp**)  
> **Quy mô:** 5 Thành viên — 10 Module — 40 Bước triển khai  
> **Tiến độ tích hợp hiện tại:** **6/10 Module hoàn thành 100%** (Module 1, 2, 3, 4, 5, 10 — Vượt qua 39/39 Unit & Integration Tests)
---

## 1. Bảng Phân Công Nhiệm Vụ 10 Module (5 Thành Viên)

Mỗi thành viên làm chủ trọn vẹn 02 module từ thiết kế bảng CSDL, viết REST API, dựng giao diện UI đến tự tin demo và trả lời vấn đáp:

| STT | Thành viên & Vai trò | Module sở hữu (2 Module/người) | Trách nhiệm cốt lõi & Bảng CSDL | Tiến độ | Trạng thái |
|:---:|---|---|---|:---:|:---:|
| **1** | **Nguyễn Ngô Tú Anh**<br>*(Leader & Full-stack)* | • **Module 1:** Tài khoản & Core Auth<br>• **Module 10:** Quản trị hệ thống (Admin Dashboard) | • Base project, ERD toàn hệ thống 24 bảng, JWT Auth & Middleware, UI Đăng ký cascading / Đăng nhập / Profile thẻ SV ảo, Admin Web Portal, Duyệt PR.<br>• Bảng DB: `Users`, `Roles`, `AdminLogs`, `SystemSettings`. | **100%** | **Hoàn thành** (Đã sẵn sàng bảo vệ) |
| **2** | **Nguyễn Lê Bảo Duy**<br>*(Full-stack Module)* | • **Module 2:** Cộng đồng (Cấu trúc trường)<br>• **Module 3:** Bài viết & Tương tác | • Cấu trúc Trường → Khoa → Ngành → Khóa → Lớp, CRUD bài viết theo phạm vi, Like/Comment/Report, Giao diện Desktop/Mobile.<br>• Bảng DB: `Schools`, `Faculties`, `Majors`, `Courses`, `Classes`, `Posts`, `Comments`, `Reactions`, `PostReports`. | **100%** | **Hoàn thành** (Đã duyệt PR #1) |
| **3** | **Huy**<br>*(Full-stack Module)* | • **Module 4:** Tài liệu học tập<br>• **Module 5:** Hỏi đáp học thuật (Q&A) | • Kho tài liệu môn học (&lt;20MB, PDF/DOCX), chấm điểm 1-5 sao, Q&A theo môn học, upvote/downvote (+1/-1), chốt câu trả lời đúng (Best Answer), giao diện DocumentsPage & QAPage.<br>• Bảng DB: `Subjects`, `Documents`, `DocumentRatings`, `Questions`, `Answers`, `Votes`. | **100%** | **Hoàn thành** (11/11 Tests Passed) |
| **4** | **Bảo**<br>*(Full-stack Module)* | • **Module 6:** Nhóm học (Study Groups)<br>• **Module 7:** Campus (Tin tức, Sự kiện, Việc làm) | • Tạo & quản lý nhóm học, xin gia nhập, duyệt thành viên; đăng/lọc tin tức Campus, sự kiện, học bổng, việc làm IT.<br>• Bảng DB: `StudyGroups`, `GroupMembers`, `JoinRequests`, `CampusPosts`. | 25% | Đang thực hiện |
| **5** | **Thái**<br>*(Full-stack & UI Lead)* | • **Module 8:** Bảng tin thông minh (News Feed)<br>• **Module 9:** Thông báo Realtime (Socket.io) | • Bảng tin thông minh ưu tiên Lớp → Trường, WebSocket Socket.io đẩy thông báo realtime (hàm dùng chung `sendNotification`).<br>• Bảng DB: `UserFeedPreferences`, `Notifications`. | 12.5% | Đang thực hiện |

---

## 2. Phần Chi Tiết Của Leader Nguyễn Ngô Tú Anh (Module 1 & 10)

Nguyễn Ngô Tú Anh đảm nhận vai trò **Trưởng nhóm (Leader)** kiêm **Kỹ sư Full-stack**, phụ trách toàn bộ nền tảng cốt lõi và 2 module quan trọng nhất của hệ sinh thái:

### 2.1. Nền tảng cốt lõi & Kiến trúc hệ thống chung (Base Architecture)
- **Kiến trúc phân tầng Clean Architecture:** Tách biệt rõ ràng tầng Routing (`routes`), Kiểm soát request (`controllers`), Nghiệp vụ logic (`services`), Truy vấn CSDL (`repositories`), Xác thực schema (`validators` bằng Zod) và Xử lý trung gian (`middlewares`).
- **Lược đồ CSDL 24 bảng:** Thiết kế toàn diện và nạp sẵn trong [`backend/prisma/schema.prisma`](./backend/prisma/schema.prisma), phục vụ trọn vẹn cho cả 10 module của 5 thành viên.
- **Bảo mật mạng & CSDL:**
  - Mã hóa mật khẩu một chiều bằng thuật toán **Bcrypt (12 rounds)** kèm chuỗi salt ngẫu nhiên chống tấn công Rainbow Table.
  - Cơ chế xác thực **JWT chuẩn kép:** Cấp **Access Token (15 phút)** truyền qua HTTP Header `Authorization: Bearer <token>` và **Refresh Token (7 ngày)**.
  - Cơ chế thu hồi token ngay lập tức (**Token Revocation**) lưu bảng `RevokedTokens` khi người dùng Đăng xuất hoặc Đổi mật khẩu.
  - Phòng chống tấn công SQL Injection thông qua ORM Prisma với Parametrized Queries.
  - Middleware bảo vệ: `authenticate`, `requireRole`, `apiRateLimiter` (chống brute-force / DDoS), `validateBody`.

### 2.2. Module 1: Tài khoản & Core Auth (End-to-End)
- **CSDL:** Bảng `Users`, `Roles`, `RevokedTokens`.
- **Backend API:**
  - `POST /api/auth/register`: Đăng ký tài khoản với email trường (`@*.edu.vn`) và MSSV độc nhất.
  - `POST /api/auth/login`: Đăng nhập linh hoạt bằng Email hoặc MSSV, trả về JWT và thông tin người dùng.
  - `POST /api/auth/logout`: Đăng xuất và thu hồi Access Token tức thì.
  - `GET /api/auth/me`: Lấy thông tin cá nhân của phiên đăng nhập hiện tại.
  - `PUT /api/auth/change-password`: Xác thực mật khẩu cũ và cập nhật hash mật khẩu mới.
  - `PUT /api/users/profile`: Cập nhật bio, số điện thoại, avatar và thông tin học vụ.
  - `GET /api/academic/schools`, `faculties`, `majors`, `courses`, `classes`: API danh mục học vụ phục vụ lựa chọn phân cấp.
- **Client Web UI ([`client-web/`](./client-web)):**
  - **Màn hình Đăng nhập ([`LoginPage.tsx`](./client-web/src/pages/LoginPage.tsx)):** Đăng nhập nhanh bằng Email/MSSV, hỗ trợ nút chọn 1-click tài khoản mẫu (Tú Anh, Duy, Bảo, Admin) giúp thầy cô test nhanh khi chấm thi.
  - **Màn hình Đăng ký ([`RegisterPage.tsx`](./client-web/src/pages/RegisterPage.tsx)):** Dropdown liên hoàn cascading (Chọn Trường → tự động load Khoa/Khóa → Ngành → Lớp thật từ API CSDL); thanh đo độ mạnh mật khẩu realtime.
  - **Màn hình Hồ sơ cá nhân ([`ProfilePage.tsx`](./client-web/src/pages/ProfilePage.tsx)):** **Thẻ sinh viên ảo (Virtual Student ID Card)** hiển thị mã vạch, trường khoa, lớp học; form sửa thông tin và form đổi mật khẩu.
  - **Khung giao diện mạng xã hội ([`ClientLayout.tsx`](./client-web/src/components/ClientLayout.tsx)):** Header, tìm kiếm, chuông thông báo, menu điều hướng 10 module.

### 2.3. Module 10: Quản trị hệ thống — Admin Dashboard (End-to-End)
- **CSDL:** Bảng `AdminLogs` (ghi vết hành vi), `SystemSettings` (cấu hình hệ thống).
- **Backend API:**
  - `GET /api/admin/dashboard/stats`: Thống kê KPI tổng thể (tổng user, sinh viên active, bài viết, báo cáo vi phạm chờ duyệt).
  - `GET /api/admin/users`: Danh sách người dùng toàn trường, lọc theo vai trò, tìm kiếm MSSV/tên.
  - `PUT /api/admin/users/:id/lock`: Khóa tài khoản sinh viên vi phạm kèm lý do; tài khoản bị khóa sẽ bị chặn đăng nhập và thu hồi phiên ngay lập tức (mã HTTP `403 ACCOUNT_LOCKED`).
  - `PUT /api/admin/users/:id/unlock`: Mở khóa tài khoản sinh viên.
  - `PUT /api/admin/users/:id/role`: Cấp/hạ quyền Quản trị viên, Giảng viên, Sinh viên.
  - `GET /api/admin/reports` & `PUT /api/admin/posts/:id/moderation`: Xử lý báo cáo vi phạm từ sinh viên (Ẩn bài viết, Xóa bài viết, Giữ nguyên).
  - `POST/PUT/DELETE /api/admin/campus`: Đăng tin tức, thông báo, sự kiện toàn trường và ghim bài viết lên đầu trang.
  - `CRUD /api/admin/academic/*`: Quản lý danh mục Trường, Khoa, Ngành, Khóa, Lớp (điểm nối bàn giao cho Duy Module 2).
  - `GET /api/admin/logs` & `GET/PUT /api/admin/settings`: Xem nhật ký thao tác và điều chỉnh tham số hệ thống.
- **Admin Web Portal ([`admin-web/`](./admin-web)):**
  - **Màn hình Đăng nhập Admin ([`LoginPage.tsx`](./admin-web/src/pages/LoginPage.tsx)):** Chặn tài khoản sinh viên thường truy cập.
  - **Tổng quan KPI ([`DashboardPage.tsx`](./admin-web/src/pages/DashboardPage.tsx)):** Thống kê số liệu, danh sách báo cáo khẩn cấp, dòng thời gian thao tác.
  - **Quản lý người dùng ([`UsersPage.tsx`](./admin-web/src/pages/UsersPage.tsx)):** Bảng danh sách sinh viên, Modal khóa tài khoản nhập lý do vi phạm, nút mở khóa tức thì.
  - **Kiểm duyệt nội dung ([`ModerationPage.tsx`](./admin-web/src/pages/ModerationPage.tsx)):** Xử lý bài viết phản cảm/vi phạm quy chế.
  - **Tin tức Campus ([`CampusPage.tsx`](./admin-web/src/pages/CampusPage.tsx)):** Đăng tin học vụ, ghim tin tức quan trọng.
  - **Cơ cấu đào tạo ([`AcademicPage.tsx`](./admin-web/src/pages/AcademicPage.tsx)):** Quản trị danh mục trường lớp.
  - **Nhật ký & Cài đặt ([`LogsSettingsPage.tsx`](./admin-web/src/pages/LogsSettingsPage.tsx)):** Truy vết lịch sử thao tác của các Admin.

### 2.4. Bộ tài liệu vấn đáp & Kịch bản Demo dành cho Tú Anh
- **Tài liệu câu hỏi & trả lời vấn đáp ([`docs/ORAL_EXAM_PREPARATION.md`](./docs/ORAL_EXAM_PREPARATION.md)):** 12 câu hỏi chuyên sâu về kiến trúc mạng, cơ chế băm Bcrypt kèm salt, cấu trúc 3 phần của JWT, Middleware RBAC, chống SQL Injection, và kịch bản demo 2 phút đạt điểm tối đa.

---

## 3. Phần Tích Hợp Hiện Tại Của Nhóm (Module 2 & 3 của Duy)

Toàn bộ mã nguồn từ Pull Request #1 của Duy (`baonin0610`) đã được kiểm tra, gộp và tích hợp hoàn chỉnh:

### 3.1. Module 2: Cộng đồng sinh viên (Cấu trúc trường)
- **Backend API:** `GET /api/communities/overview`, `GET /api/communities/me`, `GET /api/communities/classes/:id/members`, `GET /api/communities/faculties/:id/members`.
- **Client UI ([`CommunitiesPage.tsx`](./client-web/src/pages/CommunitiesPage.tsx)):** Hiển thị không gian cộng đồng phân cấp (Trường → Khoa → Ngành → Khóa → Lớp), tự động ánh xạ sinh viên vào đúng lớp, hiển thị danh sách bạn bè cùng lớp/khoa.

### 3.2. Module 3: Bài viết & Tương tác
- **Backend API:** `GET/POST /api/posts`, `GET/PUT/DELETE /api/posts/:id`, `POST /api/posts/:id/like` (toggle like chống trùng lặp), `POST/GET/DELETE /api/posts/:id/comments`, `POST /api/posts/:id/report` (báo cáo vi phạm gửi về Admin Module 10).
- **Client UI ([`PostsPage.tsx`](./client-web/src/pages/PostsPage.tsx)):** Soạn thảo bài viết kèm chọn phạm vi (Lớp/Khóa/Khoa/Trường), thả tim realtime, bình luận trao đổi, nút báo cáo vi phạm.

### 3.3. Trải nghiệm nâng cao & Desktop App
- **Giao diện đa nền tảng:** Hỗ trợ khung Desktop App chuẩn doanh nghiệp ([`DesktopAppLayout.tsx`](./client-web/src/components/DesktopAppLayout.tsx)) và khung giả lập Mobile App ([`MobileLayout.tsx`](./client-web/src/components/MobileLayout.tsx)).
- **Khởi chạy ứng dụng máy tính với Electron:** Chạy ứng dụng desktop nguyên bản cho Windows/macOS qua cấu hình [`client-web/electron/main.cjs`](./client-web/electron/main.cjs).
- **Thành phần UI nâng cao:** Thông báo toast nổi với `sonner`, hộp thoại xác nhận `ConfirmModal`, hiệu ứng tải trang `SkeletonPost`, trạng thái trống `EmptyState`.

---

## 4. Cấu Trúc Mã Nguồn (Monorepo)

```text
LTmang/
├── backend/                  # REST API Server (Node.js + Express + TypeScript + Prisma)
│   ├── prisma/
│   │   ├── schema.prisma     # Lược đồ CSDL 24 bảng cho cả 10 module
│   │   └── seed.ts           # Dữ liệu mẫu (Trường, Khoa, Ngành, Lớp, Môn, Posts, Reports, Users)
│   ├── src/
│   │   ├── config/           # Cấu hình database, env, swagger
│   │   ├── middlewares/      # auth (JWT), rateLimit, validate (Zod), error
│   │   ├── modules/
│   │   │   ├── auth/         # [Module 1 - Tú Anh] Đăng ký, Đăng nhập, Logout, Me
│   │   │   ├── users/        # [Module 1 - Tú Anh] Profile, Đổi mật khẩu
│   │   │   ├── academic/     # [Module 1 - Tú Anh] Cascading dropdown học vụ
│   │   │   ├── admin/        # [Module 10 - Tú Anh] Dashboard KPI, User Lock/Unlock, Moderation, Logs
│   │   │   ├── campus/       # [Module 10 - Tú Anh] CRUD tin tức & sự kiện trường
│   │   │   ├── communities/  # [Module 2 - Duy] Cấu trúc cộng đồng & danh sách thành viên
│   │   │   └── posts/        # [Module 3 - Duy] CRUD bài viết, Like, Comment, Report
│   │   └── utils/            # apiResponse, jwt, password (Bcrypt), errors
│   └── tests/                # 28 Tests Vitest (Auth, Security, Admin, Community, Post)
│
├── client-web/               # Mạng Xã Hội Sinh Viên (React 19 + Vite + Tailwind CSS v4)
│   ├── electron/             # File runner Electron desktop app
│   ├── src/
│   │   ├── api/              # Axios client & Auth/Posts/Community APIs
│   │   ├── components/       # ClientLayout, DesktopAppLayout, MobileLayout, CascadeSelect, ConfirmModal
│   │   ├── context/          # AuthContext (quản lý token JWT và phiên làm việc)
│   │   └── pages/
│   │       ├── LoginPage.tsx        # [Module 1] Đăng nhập Email/MSSV & Nút chọn nhanh Demo
│   │       ├── RegisterPage.tsx     # [Module 1] Đăng ký cascading dropdowns Trường → Lớp
│   │       ├── ProfilePage.tsx      # [Module 1] Thẻ sinh viên ảo & Đổi mật khẩu
│   │       ├── CommunitiesPage.tsx  # [Module 2] Xem cộng đồng Lớp/Khoa/Trường
│   │       └── PostsPage.tsx        # [Module 3] Bảng tin bài viết, Like, Bình luận
│
├── admin-web/                # Cổng Quản Trị Hệ Thống (React 19 + Vite + Tailwind CSS v4)
│   └── src/pages/
│       ├── LoginPage.tsx            # [Module 10] Đăng nhập Admin
│       ├── DashboardPage.tsx        # [Module 10] KPI Stats, Báo cáo vi phạm khẩn cấp
│       ├── UsersPage.tsx            # [Module 10] Quản lý sinh viên, Khóa/Mở khóa tài khoản
│       ├── ModerationPage.tsx       # [Module 10] Kiểm duyệt nội dung vi phạm
│       ├── CampusPage.tsx           # [Module 10] Đăng và ghim thông báo toàn trường
│       ├── AcademicPage.tsx         # [Module 10] Quản lý Trường, Khoa, Ngành, Lớp
│       └── LogsSettingsPage.tsx     # [Module 10] Nhật ký AdminLogs và Tham số hệ thống
│
├── docs/                     # Tài liệu kỹ thuật chi tiết
│   ├── ERD.md                       # Lược đồ CSDL chi tiết kèm sơ đồ Mermaid
│   ├── API_ARCHITECTURE.md          # Kiến trúc phân tầng & bảo mật Bcrypt/JWT
│   ├── DTO_CONTRACTS.md             # Hợp đồng dữ liệu API cho 5 thành viên
│   ├── ORAL_EXAM_PREPARATION.md     # Bộ câu hỏi & trả lời vấn đáp môn Lập trình mạng
│   └── postman_collection.json      # Bộ sưu tập 28+ Postman requests test sẵn
└── TASK.md                   # Bảng Kanban phân công tiến độ 10 Module
```

---

## 5. Hướng Dẫn Cài Đặt & Khởi Chạy Dự Án

### Yêu cầu môi trường
- **Node.js:** `>= 18.x` (khuyên dùng Node 20+ hoặc Node 24)
- **NPM:** `>= 9.x`
- **Git**

### 5.1. Khởi chạy Backend API Server (Port `4000`)
```bash
cd backend
npm install
cp .env.example .env
npx prisma generate
npx prisma db push
npm run prisma:seed
npm run dev
```
- **Base URL:** `http://localhost:4000/api`
- **Tài liệu Swagger UI:** `http://localhost:4000/api-docs`
- **Kiểm tra trạng thái:** `http://localhost:4000/api/health`

### 5.2. Khởi chạy Cổng Quản Trị Admin Web (Port `5173`)
```bash
cd admin-web
npm install
npm run dev
```
- **Truy cập:** `http://localhost:5173`

### 5.3. Khởi chạy Mạng Xã Hội Sinh Viên Client Web (Port `5174`)
```bash
cd client-web
npm install
npm run dev
```
- **Truy cập:** `http://localhost:5174`

### 5.4. (Tùy chọn) Chạy ứng dụng Desktop App bằng Electron
```bash
cd client-web
npm run electron
```

---

## 6. Danh Sách Tài Khoản Mẫu Để Demo & Chấm Thi

Hệ thống đã nạp sẵn dữ liệu mẫu thực tế, có thể đăng nhập bằng **Email** hoặc **MSSV**, hoặc bấm trực tiếp vào **Nút tài khoản mẫu** trên màn hình Đăng nhập:

| Vai trò / Người dùng | Email | MSSV | Mật khẩu | Chức năng nổi bật |
|---|---|---|---|---|
| **Quản trị viên (Admin)** | `admin@uniconnect.edu.vn` | `ADMIN01` | `Admin@123456` | Khóa/mở khóa SV, duyệt báo cáo vi phạm, đăng tin Campus |
| **Tú Anh (Leader)** | `anh_2351220089@dau.edu.vn` | `2351220089` | `Student@123456` | Lớp 23CT1 — Thẻ SV ảo, đổi mật khẩu, đăng bài |
| **Duy (Module 2 & 3)** | `duy_2351220091@dau.edu.vn` | `2351220091` | `Student@123456` | Lớp 23CT1 — Xem cộng đồng lớp/khoa, viết bài, thả like |
| **Bảo (Module 6 & 7)** | `bao_2351220093@dau.edu.vn` | `2351220093` | `Student@123456` | Lớp 23CT2 — Test tương tác chéo khác lớp học |
| **Thái (Module 8 & 9)** | `thai_2351220092@dau.edu.vn` | `2351220092` | `Student@123456` | Lớp 23CT1 — Test bình luận và thông báo |

---

## 7. Kịch Bản Demo 2 Phút Ghi Điểm Với Giảng Viên

1. **Bước 1 (Đăng ký cascading — Module 1 Tú Anh):**
   - Mở `http://localhost:5174/register`. Chọn trường *Đại học Kiến trúc Đà Nẵng* → chọn khoa *Khoa CNTT* & khóa *K23* → chọn ngành *Công nghệ thông tin* → chọn lớp *23CT1*.
   - Điền email sinh viên mới, kiểm tra thanh đo độ mạnh mật khẩu realtime → Bấm **Đăng ký**.
2. **Bước 2 (Thẻ sinh viên ảo & Hồ sơ — Module 1 Tú Anh):**
   - Đăng nhập tài khoản vừa tạo → Vào mục **Hồ sơ cá nhân** (`/profile`).
   - Giảng viên thấy ngay **Thẻ sinh viên ảo (Virtual Student ID Card)** hiển thị mã vạch, trường khoa, lớp học chuẩn chỉ.
3. **Bước 3 (Cộng đồng & Bài viết — Module 2 & 3 Duy):**
   - Vào mục **Cộng đồng** (`/communities`): Xem danh sách thành viên cùng lớp `23CT1`.
   - Vào mục **Bài viết** (`/posts`): Đăng bài mới với phạm vi *Chỉ trong Lớp*, thử bấm nút Thả tim và viết bình luận.
   - Bấm nút **Báo cáo vi phạm** trên bài viết quảng cáo spam.
4. **Bước 4 (Admin Dashboard kiểm duyệt — Module 10 Tú Anh):**
   - Mở tab ẩn danh vào `http://localhost:5173`, đăng nhập Admin (`admin@uniconnect.edu.vn` / `Admin@123456`).
   - Vào mục **Kiểm duyệt**: Thấy ngay bài viết bị sinh viên báo cáo ở Bước 3 → Bấm **Ẩn bài viết vi phạm**.
5. **Bước 5 (Khóa tài khoản realtime — Bảo mật Module 1 & 10 Tú Anh):**
   - Vào trang **Người dùng** trong Admin Web, tìm sinh viên vừa tạo, bấm **Khóa tài khoản**, nhập lý do: *"Vi phạm nội quy học tập"*.
   - Quay lại Client Web (`:5174`), đăng xuất và thử đăng nhập lại bằng sinh viên đó: Hệ thống báo lỗi đỏ **"Tài khoản đã bị tạm khóa: Vi phạm nội quy học tập"** (HTTP `403 ACCOUNT_LOCKED`).
   - Sang Admin bấm **Mở khóa** → Sinh viên đăng nhập lại bình thường.
   - Vào mục **Nhật ký hệ thống** xem lại toàn bộ vết thao tác đã được lưu vào bảng `AdminLogs` kèm thời gian và IP chi tiết.

---

## 8. Kết Quả Kiểm Thử Tự Động (Quality Assurance)

```bash
# Kiểm tra bộ 39 bài test tự động của Backend
cd backend && npm test
```
```text
✓ tests/integration/auth.test.ts (9 tests) - Passed (Module 1 Auth, Bcrypt, Token Revocation)
✓ tests/integration/document.test.ts (6 tests) - Passed (Module 4 Documents, Upload, Rating, Downloads)
✓ tests/integration/post.test.ts (7 tests) - Passed (Module 3 Posts, Toggle Like, Comments, Reports)
✓ tests/integration/qa.test.ts (5 tests) - Passed (Module 5 Q&A, Best Answer, Upvote/Downvote)
✓ tests/integration/admin.test.ts (4 tests) - Passed (Module 10 Admin RBAC, Lock/Unlock Flow)
✓ tests/integration/community.test.ts (5 tests) - Passed (Module 2 Schools, Faculties, Classes)
✓ tests/unit/security.test.ts (3 tests) - Passed (Bcrypt salt rounds, JWT sign/verify)

Test Files:  7 passed (7)
Tests:       39 passed (39)
Time:        ~48s
```

```bash
# Kiểm tra build production
cd ../client-web && npm run build    # Vite build dist thành công trong ~4s (0 errors)
cd ../admin-web && npm run build     # Vite build dist thành công trong ~4s (0 errors)
```

---

## 9. Quy Tắc Git Flow Nhóm

- **Quy tắc phân nhánh:** Tuyệt đối không push trực tiếp lên nhánh `main`. Mọi tính năng phải rẽ nhánh riêng theo cú pháp: `feature/<tên-tính-năng>` (VD: `feature/auth`, `feature/community`, `feature/admin-dashboard`).
- **Quy trình gộp code:** Tạo Pull Request trên GitHub → Leader Nguyễn Ngô Tú Anh kiểm tra, chạy test xác minh độ tương thích → Bấm **Merge Pull Request** vào nhánh `main`.
