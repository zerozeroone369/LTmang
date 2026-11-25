# M4 — Tài liệu Học tập & Upload Tệp

- **Thành viên sở hữu (End-to-End):** Huy (Full-stack Module)
- **Thư mục MVC:** `src/Modules/M04_TaiLieu_TepTin__Huy`
- **Bảng PostgreSQL:** `MonHoc`, `TepTin`, `TaiLieu`, `DanhGiaTaiLieu`, `LuotTai`
- **Routes API dự kiến:**
  - `GET /api/m04/subjects`
  - `POST /api/m04/documents/upload`
  - `GET /api/m04/documents/search`
  - `GET /api/m04/documents/:id/download`
  - `POST /api/m04/documents/:id/rate`

## Phạm vi chức năng
Danh mục MonHoc; Upload file multipart/form-data (<20MB, check Magic Bytes PDF/DOCX + băm SHA-256) lưu TepTin; Download ghi nhật ký LuotTai & tăng SoLuotTai; Tìm/lọc & Đánh giá 1–5★.

## Quy trình 4 Bước hoàn thành
- **B1 (Model & Multer Storage):** Tạo Model cho MonHoc, TepTin, TaiLieu, DanhGiaTaiLieu (CHECK 1–5), LuotTai; cấu hình Multer giới hạn <20MB & kiểm tra Magic Bytes.
- **B2 (Controller):** Viết Controller upload lưu file + SHA-256 vào TepTin, download ghi LuotTai & cộng SoLuotTai, tính lại DiemDanhGiaTB.
- **B3 (Views MVC):** Dựng danh sách thẻ tài liệu có bộ lọc môn/điểm cao, form upload có thanh % tiến trình và giao diện chấm 1–5 sao.
- **B4 (Demo & KPI):** Test upload .exe (bị Server từ chối), upload PDF hợp lệ, tải về & chấm sao.

**KPI:** Không hỏng file, chặn tệp giả mạo định dạng tại Backend, CSDL chỉ lưu metadata.
