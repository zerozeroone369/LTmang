# M8 — Layout UI Chung, Bảng tin & Riêng tư

- **Thành viên sở hữu (End-to-End):** Thái (UI Lead)
- **Thư mục MVC:** `src/Modules/M08_BangTin_RiengTu__Thai`
- **Bảng PostgreSQL:** `TuyChonNguoiDung`, `ChanNguoiDung`
- **Routes API dự kiến:**
  - `GET /api/m08/feed`
  - `PUT /api/m08/preferences`
  - `POST /api/m08/block`
  - `DELETE /api/m08/block/:targetId`

## Phạm vi chức năng
Dựng khung Layout MVC chung (Header, Sidebar, Footer, Design System) cho cả nhóm; Bảng tin thông minh lọc 4 nhóm (HocTap, CongDong, HoatDong, CoHoi) ưu tiên 5 cấp (Lop → Truong); Cài đặt riêng tư & Chặn liên lạc.

## Quy trình 4 Bước hoàn thành
- **B1 (Model 2 bảng):** Tạo Model TuyChonNguoiDung (JSON CaiDatRiengTu & NhomNoiDungQuanTam) và ChanNguoiDung; thống nhất truy vấn tổng hợp với M3, M4, M5, M7.
- **B2 (Controller & Thuật toán):** Viết Controller GET /api/m08/feed phân trang, lọc bỏ MaNguoiBiChan ngay trong SQL và sắp ưu tiên Lớp → Khóa → Ngành → Khoa → Trường.
- **B3 (Layout Chung & Views):** Dựng khung giao diện MVC chung cho toàn app; code trang chủ News Feed & màn hình Quyền riêng tư/Chặn.
- **B4 (Demo & KPI):** Test chặn một người dùng (kiểm tra ẩn bài/chặn nhắn tin) và lọc 4 nhóm chủ đề trên Bảng tin.

**KPI:** UI đồng nhất toàn hệ thống, Bảng tin phản hồi nhanh (<1s) và lọc đúng riêng tư.
