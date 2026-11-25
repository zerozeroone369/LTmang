# M6 — Nhóm học Tập (Study Groups)

- **Thành viên sở hữu (End-to-End):** Bảo (Full-stack Module)
- **Thư mục MVC:** `src/Modules/M06_NhomHoc__Bao`
- **Bảng PostgreSQL:** `NhomHoc`, `ThanhVienNhom`, `YeuCauThamGia`, `LichSuNhomHoc`
- **Routes API dự kiến:**
  - `POST /api/m06/groups`
  - `GET /api/m06/groups/search`
  - `POST /api/m06/groups/:id/join`
  - `PUT /api/m06/join-requests/:id`
  - `PUT /api/m06/groups/:id/capacity`
  - `POST /api/m06/groups/:id/transfer-leave`

## Phạm vi chức năng
Tạo nhóm học (người tạo tự làm Trưởng nhóm); Tìm nhóm theo môn/khu vực; Gửi YeuCauThamGia; Trưởng nhóm duyệt/từ chối (khóa FOR UPDATE chống vượt sĩ số); Cập nhật sức chứa, Rời nhóm & Bàn giao trưởng nhóm.

## Quy trình 4 Bước hoàn thành
- **B1 (Model 4 bảng):** Tạo Model cho NhomHoc, ThanhVienNhom, YeuCauThamGia ('ChoDuyet'/'ChapNhan'/'TuChoi'), LichSuNhomHoc.
- **B2 (Controller & Locking):** Viết Controller tạo nhóm, gửi đơn, duyệt đơn dùng PostgreSQL Transaction + SELECT ... FOR UPDATE chống vượt SoThanhVienToiDa, bàn giao trưởng nhóm.
- **B3 (Views MVC):** Dựng giao diện tìm nhóm, nút xin gia nhập theo trạng thái, màn duyệt đơn & chuyển quyền trưởng nhóm.
- **B4 (Demo & KPI):** Test duyệt thành viên sát sĩ số tối đa và luồng Trưởng nhóm chuyển quyền rồi rời nhóm.

**KPI:** Không vượt sĩ số tối đa khi duyệt đồng thời, chỉ MaTruongNhom mới duyệt/đổi sĩ số.
