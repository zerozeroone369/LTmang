# M2 — Cấu trúc Trường 5 Cấp & Cộng đồng

- **Thành viên sở hữu (End-to-End):** Duy (Full-stack Module)
- **Thư mục MVC:** `src/Modules/M02_CongDong_5Cap__Duy`
- **Bảng PostgreSQL:** `Truong`, `Khoa`, `Nganh`, `KhoaHoc`, `Lop`, `CongDong`, `ThanhVienCongDong`
- **Routes API dự kiến:**
  - `GET /api/m02/edu/schools`
  - `GET /api/m02/edu/children`
  - `GET /api/m02/communities/me`
  - `POST /api/m02/communities/sync`
  - `CRUD /api/m02/admin/edu`

## Phạm vi chức năng
Quản lý danh mục 5 cấp (Truong → Khoa → Nganh → KhoaHoc → Lop); tự động ánh xạ sinh viên vào đủ 5 cấp ThanhVienCongDong khi đăng ký/chuyển lớp; màn Admin quản lý danh mục.

## Quy trình 4 Bước hoàn thành
- **B1 (Model & Seed SQL):** Hoàn thiện 7 bảng (Truong → Lop + CongDong + ThanhVienCongDong) & file database/02_seed_5_cap_truong.sql chạy trên Render PostgreSQL.
- **B2 (Controller & Transaction):** Viết API lọc 5 cấp nối tiếp và hàm syncStudentCommunities(maNguoiDung, maLop) dùng BEGIN/COMMIT PostgreSQL khi đăng ký hoặc chuyển lớp.
- **B3 (Views MVC):** Dựng Dropdown nối tiếp 5 cấp cho Đăng ký/Hồ sơ, trang Cộng đồng của tôi và View Admin quản trị trường.
- **B4 (Demo & KPI):** Test đổi lớp của sinh viên → tự động đồng bộ lại 5 cấp cộng đồng trong ThanhVienCongDong.

**KPI:** Trả về chính xác 5 không gian cộng đồng theo cấp bậc, không lỗi khóa ngoại.
