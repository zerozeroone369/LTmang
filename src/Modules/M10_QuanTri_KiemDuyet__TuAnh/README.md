# M10 — Quản trị Hệ thống & Kiểm duyệt (Admin)

- **Thành viên sở hữu (End-to-End):** Nguyễn Ngô Tú Anh (Leader)
- **Thư mục MVC:** `src/Modules/M10_QuanTri_KiemDuyet__TuAnh`
- **Bảng PostgreSQL:** `BaoCaoViPham`, `NhatKyKiemDuyet`, `NhatKyHeThong`
- **Routes API dự kiến:**
  - `GET /api/m10/admin/users`
  - `PUT /api/m10/admin/users/:id/lock`
  - `PUT /api/m10/admin/users/:id/role`
  - `GET /api/m10/admin/reports`
  - `PUT /api/m10/admin/reports/:id`
  - `GET /api/m10/admin/logs`

## Phạm vi chức năng
Quản lý tài khoản (đổi vai trò, khóa/mở khóa chống khóa Admin cuối cùng & thu hồi phiên ngay); Kiểm duyệt BaoCaoViPham (giữ, ẩn, xóa mềm, cảnh cáo); Lưu NhatKyKiemDuyet & NhatKyHeThong; tích hợp View của Duy (M2) & Bảo (M7).

## Quy trình 4 Bước hoàn thành
- **B1 (Model 3 bảng Admin):** Tạo Model BaoCaoViPham, NhatKyKiemDuyet, NhatKyHeThong; lên khung Admin Dashboard.
- **B2 (Controller Quản trị):** Viết Controller quản lý tài khoản (chặn khóa Admin cuối), xử lý báo cáo vi phạm (giao dịch ẩn/xóa nội dung + ghi NhatKyKiemDuyet), bảo vệ bằng requireAdmin.
- **B3 (Views & Ghép Dashboard):** Dựng Admin Dashboard, nhúng Views quản trị Cấu trúc 5 cấp (Duy M2) và Campus (Bảo M7) vào menu Admin chung.
- **B4 (Demo & KPI):** Test khóa 1 tài khoản sinh viên → bị thu hồi PhienDangNhap ngay & ghi log vào NhatKyHeThong.

**KPI:** Không thể khóa Admin cuối cùng, thu hồi phiên tức thì, truy vết đầy đủ lịch sử quản trị.
