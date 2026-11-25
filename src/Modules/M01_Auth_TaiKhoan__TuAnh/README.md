# M1 — Tài khoản, Phiên JWT & Quên MK (OTP)

- **Thành viên sở hữu (End-to-End):** Nguyễn Ngô Tú Anh (Leader)
- **Thư mục MVC:** `src/Modules/M01_Auth_TaiKhoan__TuAnh`
- **Bảng PostgreSQL:** `VaiTro`, `NguoiDung`, `PhienDangNhap`, `MaXacThuc`
- **Routes API dự kiến:**
  - `POST /api/m01/auth/register`
  - `POST /api/m01/auth/login`
  - `POST /api/m01/auth/logout`
  - `PUT /api/m01/users/password`
  - `POST /api/m01/auth/forgot-otp`
  - `POST /api/m01/auth/reset-pw`
  - `PUT /api/m01/users/profile`

## Phạm vi chức năng
Đăng ký (kiểm tra email SV/MSSV, gọi đồng bộ 5 cấp), Đăng nhập cấp JWT + lưu PhienDangNhap, Đăng xuất thu hồi phiên, Đổi mật khẩu (Force Logout phiên khác), Quên MK OTP Email (5 phút), Sửa hồ sơ.

## Quy trình 4 Bước hoàn thành
- **B1 (Base MVC & PostgreSQL):** Dựng khung Express MVC + kết nối PostgreSQL Pool (DATABASE_URL trên Render), tạo bảng VaiTro, NguoiDung, PhienDangNhap, MaXacThuc.
- **B2 (Controller & Middleware):** Code AuthController (bcryptjs + Salt, JWT Access Token, lưu PhienDangNhap), authMiddleware chặn request chưa đăng nhập/phiên bị thu hồi.
- **B3 (Views MVC):** Dựng Views Đăng ký, Đăng nhập, Quên mật khẩu OTP, Hồ sơ; lưu Token phía trình duyệt & gắn Authorization Bearer Header.
- **B4 (Demo & KPI):** Chạy thông luồng trên link Render: Đăng ký → Đăng nhập → Quên MK OTP → Đổi MK thu hồi phiên cũ.

**KPI:** Deploy Render ổn định, thu hồi được phiên trong PhienDangNhap, không lộ mật khẩu gốc.
