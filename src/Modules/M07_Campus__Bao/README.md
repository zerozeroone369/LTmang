# M7 — Campus (Tin tức, Sự kiện, Việc làm)

- **Thành viên sở hữu (End-to-End):** Bảo (Full-stack Module)
- **Thư mục MVC:** `src/Modules/M07_Campus__Bao`
- **Bảng PostgreSQL:** `TinTruong`
- **Routes API dự kiến:**
  - `GET /api/m07/campus`
  - `POST /api/m07/admin/campus`
  - `PUT /api/m07/admin/campus/:id`
  - `DELETE /api/m07/admin/campus/:id`

## Phạm vi chức năng
Sinh viên xem & lọc tin nhà trường (SuKien, HocBong, ThucTap, CLB, ThongBao) theo CongDong; Admin đăng mới, chỉnh sửa, ẩn/xóa tin qua View gắn vào Admin Dashboard.

## Quy trình 4 Bước hoàn thành
- **B1 (Model TinTruong):** Tạo Model truy vấn bảng TinTruong (lọc TrangThai = 'CongBo' & NgayHetHan >= NOW()).
- **B2 (Controller):** Viết API phân trang LIMIT/OFFSET cho sinh viên và bộ API Admin được bảo vệ bởi Middleware requireAdmin.
- **B3 (Views MVC):** Dựng tab Campus cho sinh viên và View quản trị Campus tích hợp vào Admin Dashboard của Tú Anh.
- **B4 (Demo & KPI):** Test Admin đăng tin → bắn Socket.io thông báo qua Thái (M9) → sinh viên thấy ngay.

**KPI:** Phân trang SQL nhanh, dữ liệu đồng bộ tức thì từ Admin sang Client.
