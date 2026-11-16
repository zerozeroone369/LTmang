# Tài Liệu Ôn Tập Vấn Đáp — Nguyễn Ngô Tú Anh (Leader)

> **Môn học:** Lập trình mạng  
> **Dự án:** Mạng xã hội phục vụ đời sống sinh viên (UniConnect)  
> **Module sở hữu:** **Module 1** (Tài khoản & Core Auth) & **Module 10** (Quản trị hệ thống - Admin Dashboard)

---

## 1. NẮM VỮNG TRONG 1 PHÚT: LUỒNG HỆ THỐNG TỔNG QUÁT

```text
[ Client Web (React) / Admin Web (React) ]
                 │
      HTTP Request (Header: Authorization: Bearer <JWT>)
                 ▼
[ Express API Server (Node.js + TypeScript) ]
    ├── 1. Helmet & CORS & RateLimiter (Bảo mật mạng, chống spam)
    ├── 2. Auth Middleware (Giải mã JWT, kiểm tra RevokedTokens, check user.status !== 'LOCKED')
    ├── 3. Role Guard (Kiểm tra vai trò ADMIN/STUDENT tại server)
    ├── 4. Zod Validator (Kiểm tra tính hợp lệ của dữ liệu đầu vào)
    ├── 5. Controller (Trích xuất DTO, gọi Service)
    ├── 6. Service (Xử lý Business Logic, băm mật khẩu, ghi AdminLogs)
    └── 7. Repository & Prisma ORM (Parametrized queries chống SQL Injection)
                 ▼
          [ Database SQLite / PostgreSQL ]
```

---

## 2. CÂU HỎI VẤN ĐÁP: MODULE 1 — TÀI KHOẢN & CORE AUTH

### Câu 1: Vì sao tuyệt đối không lưu mật khẩu gốc (plaintext) trong cơ sở dữ liệu?
- **Trả lời:** Nếu cơ sở dữ liệu bị lộ (qua lỗ hổng SQLi, tấn công dump file, hoặc lộ bản backup), kẻ tấn công sẽ có ngay mật khẩu gốc của tất cả người dùng và dùng để đăng nhập vào tài khoản trên UniConnect hoặc các dịch vụ khác (do người dùng thường dùng chung mật khẩu).
- **Giải pháp:** Hệ thống sử dụng thuật toán **Bcrypt** với Salt Rounds = 10 (`backend/src/utils/password.ts`). Khi đăng ký, mật khẩu được băm (hash) một chiều kèm chuỗi ngẫu nhiên (salt) rồi mới lưu vào cột `passwordHash`. Băm là hàm một chiều, không thể giải mã ngược lại.

### Câu 2: Bcrypt băm mật khẩu kèm Salt để làm gì?
- **Trả lời:**
  1. **Salt là một chuỗi ngẫu nhiên** được tạo ra cho từng mật khẩu. Dù hai sinh viên đặt cùng mật khẩu `Student@123`, giá trị băm trong CSDL vẫn hoàn toàn khác nhau.
  2. **Chống tấn công Rainbow Table:** Kẻ tấn công không thể dùng bảng băm tính sẵn (Rainbow Table) để tra cứu ngược mật khẩu.
  3. **Chống tấn công Brute-force:** Bcrypt là thuật toán có chi phí tính toán có thể điều chỉnh (adaptive work factor), làm chậm tốc độ thử mật khẩu hàng triệu lần so với MD5 hay SHA-256.

### Câu 3: JWT (JSON Web Token) gồm những phần nào? Cơ chế xác thực qua Header ra sao?
- **Trả lời:**
  - JWT gồm 3 phần ngăn cách bởi dấu chấm: `Header.Payload.Signature`
    - **Header:** Thuật toán ký (ví dụ `HS256`) và loại token (`JWT`).
    - **Payload:** Chứa thông tin định danh không nhạy cảm: `sub` (userId), `role` (ADMIN/STUDENT), `jti` (mã định danh duy nhất của token để thu hồi khi logout), `iat` và `exp` (thời gian hết hạn).
    - **Signature:** Chữ ký tạo bởi `HMAC-SHA256(Base64(Header) + "." + Base64(Payload), JWT_SECRET)`. Chỉ có Server giữ `JWT_SECRET` mới có thể tạo và xác thực chữ ký này.
  - **Gửi qua Header:** Client lưu token trong `localStorage` và gửi lên qua Header:
    ```http
    Authorization: Bearer <token>
    ```
  - Server dùng middleware [`authenticate`](file:///c:/Users/ADMIN/Downloads/LAPTRINHMANG/backend/src/middlewares/auth.middleware.ts) để giải mã, nếu token bị sửa đổi hoặc hết hạn thì thư viện `jsonwebtoken` sẽ ném lỗi và middleware trả về `401 Unauthorized`.

### Câu 4: Middleware chặn người chưa đăng nhập và người bị khóa như thế nào?
- **Trả lời:**
  1. Trích xuất chuỗi token sau chữ `Bearer `. Nếu thiếu → trả về `401 Unauthorized`.
  2. Dùng `jwt.verify(token, JWT_SECRET)` để kiểm tra tính toàn vẹn và hạn sử dụng.
  3. Kiểm tra xem `jti` của token có nằm trong bảng `revoked_tokens` hay không (nếu user đã bấm Đăng xuất → token bị vô hiệu hóa ngay dù chưa hết hạn).
  4. Truy vấn CSDL để lấy thông tin mới nhất của người dùng. **Nếu `user.status === 'LOCKED'`, middleware lập tức trả về `403 ACCOUNT_LOCKED` kèm lý do khóa**, ngăn chặn toàn bộ thao tác ngay cả khi token vẫn còn hạn.

### Câu 5: Khi Token hết hạn thì hệ thống xử lý thế nào?
- **Trả lời:**
  - Khi token hết hạn (`exp < now`), `verifyAccessToken` sẽ trả về lỗi `TokenExpiredError`.
  - Server trả mã HTTP `401 Unauthorized`.
  - Phía Client, Axios Interceptor (`client-web/src/api/client.ts`) bắt được mã `401`, tự động xóa token trong `localStorage` và chuyển hướng người dùng về màn hình `/login` để yêu cầu xác thực lại.

---

## 3. CÂU HỎI VẤN ĐÁP: MODULE 10 — QUẢN TRỊ HỆ THỐNG (ADMIN)

### Câu 1: Vì sao phân quyền Admin phải kiểm tra ở Backend Middleware chứ không chỉ ẩn nút trên giao diện?
- **Trả lời:**
  - Giao diện (Frontend) chạy hoàn toàn trên trình duyệt của người dùng, người dùng có thể mở F12 (DevTools) để chỉnh sửa mã JavaScript, sửa thuộc tính disabled, bỏ ẩn nút bấm hoặc dùng công cụ như Postman/cURL để gửi trực tiếp HTTP Request đến endpoint Admin (`PATCH /api/admin/users/1/lock`).
  - Do đó, việc ẩn nút trên giao diện chỉ phục vụ trải nghiệm người dùng (UX). **Tính bảo mật bắt buộc phải được bảo vệ tại Backend Middleware** ([`requireRole('ADMIN')`](file:///c:/Users/ADMIN/Downloads/LAPTRINHMANG/backend/src/middlewares/auth.middleware.ts#L65-L79)): Server trích xuất role từ token đã được ký bảo mật, nếu không phải `ADMIN` thì lập tức trả về `403 Forbidden`.

### Câu 2: Luồng chặn tài khoản bị khóa diễn ra cụ thể thế nào?
- **Trả lời (đã kiểm chứng bằng test tự động và trên trình duyệt thật):**
  1. Admin gọi `PATCH/PUT /api/admin/users/:id/lock` kèm lý do khóa.
  2. Server cập nhật `status = 'LOCKED'`, ghi vết vào bảng `admin_logs` với action `LOCK_USER`.
  3. **Chặn token đang hoạt động:** Khi sinh viên đó gửi bất kỳ request nào, middleware [`authenticate`](file:///c:/Users/ADMIN/Downloads/LAPTRINHMANG/backend/src/middlewares/auth.middleware.ts) kiểm tra CSDL thấy `user.status === 'LOCKED'` → chặn ngay với mã `403 ACCOUNT_LOCKED`.
  4. **Chặn đăng nhập mới:** Nếu sinh viên cố đăng nhập lại tại `/api/auth/login`, AuthService kiểm tra `status === 'LOCKED'` trước khi kiểm tra mật khẩu và từ chối cấp token với mã `403`.

### Câu 3: Nếu sinh viên biết đường dẫn API Admin và dùng Postman gọi thẳng thì hệ thống xử lý ra sao?
- **Trả lời:**
  - Mọi route trong [`adminRoutes`](file:///c:/Users/ADMIN/Downloads/LAPTRINHMANG/backend/src/modules/admin/admin.routes.ts) đều được bảo vệ bởi `router.use(authenticate, requireRole(RoleName.ADMIN))`.
  - Khi sinh viên dùng Postman gọi, request sẽ đi qua `authenticate` (xác định sinh viên hợp lệ) rồi đến `requireRole`.
  - `requireRole` thấy `req.auth.role === 'STUDENT'` không khớp với danh sách quyền `ADMIN` cho phép, lập tức trả về mã `403 Forbidden` với message: `"Bạn không có quyền truy cập chức năng này"`. Request không bao giờ chạm được vào Controller quản trị.
