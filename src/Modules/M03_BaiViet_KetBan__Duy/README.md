# M3 — Bài viết, Tương tác & Kết bạn

- **Thành viên sở hữu (End-to-End):** Duy (Full-stack Module)
- **Thư mục MVC:** `src/Modules/M03_BaiViet_KetBan__Duy`
- **Bảng PostgreSQL:** `BaiViet`, `LichSuSuaBaiViet`, `TepDinhKemBaiViet`, `BinhLuan`, `TuongTac`, `KetBan`
- **Routes API dự kiến:**
  - `CRUD /api/m03/posts`
  - `POST /api/m03/posts/:id/comments`
  - `POST /api/m03/posts/:id/like`
  - `POST /api/m03/posts/:id/report`
  - `POST /api/m03/friends/request`
  - `PUT /api/m03/friends/:id/respond`

## Phạm vi chức năng
Đăng, sửa (lưu vết LichSuSuaBaiViet), xóa mềm bài viết theo phạm vi CongDong; đính kèm tệp qua TepTin; Bình luận, Thích (chống trùng), Báo cáo vi phạm; Tìm bạn & Kết bạn 2 chiều (KetBan).

## Quy trình 4 Bước hoàn thành
- **B1 (Model 6 bảng):** Tạo Model truy vấn BaiViet, LichSuSuaBaiViet, TepDinhKemBaiViet, BinhLuan, TuongTac (UNIQUE MaBaiViet+MaNguoiDung), KetBan.
- **B2 (Controller):** Viết Controller kiểm tra chủ sở hữu khi sửa/xóa, giao dịch lưu lịch sử sửa, chống like trùng, gửi BaoCaoViPham và kết bạn 2 chiều.
- **B3 (Views MVC):** Dựng trang tạo/sửa bài, chi tiết bình luận, thích bài viết tức thì và giao diện kết bạn.
- **B4 (Demo & KPI):** Test trọn luồng trên Render: đăng bài có ảnh → sửa bài (lưu vết) → like/comment → kết bạn.

**KPI:** Chỉ chủ bài viết mới sửa/xóa được tại Backend, không trùng lượt thích.
