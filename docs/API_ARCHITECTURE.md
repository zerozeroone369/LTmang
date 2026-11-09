# Kiến Trúc Hệ Thống Client–Server — UniConnect

## 1. Mô Hình Tổng Quan

```text
+-----------------------+         HTTPS / REST API         +-------------------------+
|  Client App (Thái)    | <------------------------------> |  Express API Server     |
|  Admin Portal (Tú Anh)|         WebSocket (Socket.io)    |  (Clean Architecture)   |
+-----------------------+                                  +------------+------------+
                                                                        |
                                                              Prisma ORM (Parametrized)
                                                                        |
                                                           +------------v------------+
                                                           |  Database (SQLite/PG)   |
                                                           +-------------------------+
```

## 2. Phân Tầng Backend (Clean Architecture)

Mỗi module trong `backend/src/modules/<module>/` tuân thủ 4 lớp tách biệt:
1. **Routes & Validators (`*.routes.ts`, `*.validator.ts`)**: Định tuyến HTTP, gắn middleware xác thực/phân quyền và validate đầu vào bằng Zod.
2. **Controllers (`*.controller.ts`)**: Nhận request HTTP, trích xuất DTO, gọi Service và chuẩn hóa response JSON.
3. **Services (`*.service.ts`)**: Chứa toàn bộ Business Logic (kiểm tra trạng thái tài khoản, tính toán Bcrypt/JWT, kiểm tra phân cấp, ghi log Admin).
4. **Repositories (`*.repository.ts`)**: Giao tiếp với Prisma ORM (parametrized queries chống SQL Injection), tách biệt truy vấn DB khỏi logic nghiệp vụ.

## 3. Cơ Chế Bảo Mật & Xác Thực

- **Mật khẩu**: Băm bằng `bcryptjs` (salt rounds từ `.env`), kiểm tra độ mạnh mật khẩu (tối thiểu 8 ký tự, gồm chữ hoa, chữ thường, chữ số, ký tự đặc biệt).
- **JWT + Token Revocation**: Token ký bằng `JWT_SECRET` (`.env`), chứa `sub` (userId), `role`, và `jti` (UUID). Khi người dùng đăng xuất, `jti` được ghi vào bảng `revoked_tokens`.
- **Chống Brute-Force & Khóa Tài Khoản**:
  - Đăng nhập sai quá `MAX_LOGIN_ATTEMPTS` lần sẽ khóa đăng nhập tạm thời trong `LOGIN_LOCK_MINUTES` phút.
  - Tài khoản có `status = 'LOCKED'` (bị Admin khóa) sẽ bị từ chối đăng nhập (`403 ACCOUNT_LOCKED`) và mọi token hiện tại cũng bị Middleware `authenticate` chặn ngay lập tức.
- **Chuẩn Hóa Response API**:
  - Thành công: `{ "success": true, "message": "...", "data": ..., "meta": ... }`
  - Lỗi: `{ "success": false, "error": { "code": "...", "message": "...", "details": ... } }`
