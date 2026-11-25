-- =========================================================================
-- CSDL POSTGRESQL 15/16 HOÀN CHỈNH (39 BẢNG: 35 CỐT LÕI + 4 MỞ RỘNG)
-- Chuyển đổi 1-1 từ đặc tả 39 bảng chuẩn 3NF (tables_schema_v2.py)
-- Tương thích Render PostgreSQL / Railway / Koyeb / Supabase
-- =========================================================================

-- Bảng: Truong (Cấp cao nhất trong cấu trúc đào tạo (Trường đại học))
CREATE TABLE IF NOT EXISTS "Truong" (
    "MaTruong" BIGINT GENERATED ALWAYS AS IDENTITY NOT NULL,
    "KyHieuTruong" VARCHAR(30) NOT NULL,
    "TenTruong" VARCHAR(200) NOT NULL,
    "TrangThai" VARCHAR(20) NOT NULL,
    CONSTRAINT "PK_Truong" PRIMARY KEY ("MaTruong")
);

-- Bảng: Khoa (Khoa quản lý chuyên môn trực thuộc trường)
CREATE TABLE IF NOT EXISTS "Khoa" (
    "MaKhoa" BIGINT GENERATED ALWAYS AS IDENTITY NOT NULL,
    "MaTruong" BIGINT NULL,
    "KyHieuKhoa" VARCHAR(30) NOT NULL,
    "TenKhoa" VARCHAR(200) NOT NULL,
    "TrangThai" VARCHAR(20) NOT NULL,
    CONSTRAINT "PK_Khoa" PRIMARY KEY ("MaKhoa")
);

-- Bảng: Nganh (Ngành đào tạo chuyên môn trực thuộc khoa)
CREATE TABLE IF NOT EXISTS "Nganh" (
    "MaNganh" BIGINT GENERATED ALWAYS AS IDENTITY NOT NULL,
    "MaKhoa" BIGINT NULL,
    "KyHieuNganh" VARCHAR(30) NOT NULL,
    "TenNganh" VARCHAR(200) NOT NULL,
    "TrangThai" VARCHAR(20) NOT NULL,
    CONSTRAINT "PK_Nganh" PRIMARY KEY ("MaNganh")
);

-- Bảng: KhoaHoc (Khóa tuyển sinh (niên khóa sinh viên, VD: K2022))
CREATE TABLE IF NOT EXISTS "KhoaHoc" (
    "MaKhoaHoc" BIGINT GENERATED ALWAYS AS IDENTITY NOT NULL,
    "MaNganh" BIGINT NULL,
    "TenKhoaHoc" VARCHAR(100) NOT NULL,
    "NamBatDau" INT NOT NULL,
    "TrangThai" VARCHAR(20) NOT NULL,
    CONSTRAINT "PK_KhoaHoc" PRIMARY KEY ("MaKhoaHoc")
);

-- Bảng: Lop (Lớp học sinh hoạt chính thức của sinh viên)
CREATE TABLE IF NOT EXISTS "Lop" (
    "MaLop" BIGINT GENERATED ALWAYS AS IDENTITY NOT NULL,
    "MaKhoaHoc" BIGINT NULL,
    "TenLop" VARCHAR(100) NOT NULL,
    "TrangThai" VARCHAR(20) NOT NULL,
    CONSTRAINT "PK_Lop" PRIMARY KEY ("MaLop")
);

-- Bảng: VaiTro (Phân quyền người dùng hệ thống (SinhVien, QuanTriVien))
CREATE TABLE IF NOT EXISTS "VaiTro" (
    "MaVaiTro" BIGINT GENERATED ALWAYS AS IDENTITY NOT NULL,
    "TenVaiTro" VARCHAR(30) NOT NULL,
    "NgayTao" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT "PK_VaiTro" PRIMARY KEY ("MaVaiTro")
);

-- Bảng: NguoiDung (Tài khoản sinh viên và quản trị viên trong toàn hệ thống)
CREATE TABLE IF NOT EXISTS "NguoiDung" (
    "MaNguoiDung" BIGINT GENERATED ALWAYS AS IDENTITY NOT NULL,
    "MaVaiTro" BIGINT NOT NULL,
    "MaLop" BIGINT NULL,
    "MaSinhVien" VARCHAR(30) NULL,
    "Email" VARCHAR(254) NOT NULL,
    "MatKhauHash" VARCHAR(255) NOT NULL,
    "HoTen" VARCHAR(100) NOT NULL,
    "SoDienThoai" VARCHAR(20) NULL,
    "AnhDaiDien" VARCHAR(255) NULL,
    "GioiThieu" VARCHAR(500) NULL,
    "SoLanDangNhapSai" INT NOT NULL DEFAULT 0,
    "TrangThai" VARCHAR(20) NOT NULL,
    "NgayTao" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    "NgayCapNhat" TIMESTAMPTZ NULL,
    CONSTRAINT "PK_NguoiDung" PRIMARY KEY ("MaNguoiDung")
);

-- Bảng: PhienDangNhap (Quản lý phiên làm việc TCP Socket và token xác thực)
CREATE TABLE IF NOT EXISTS "PhienDangNhap" (
    "MaPhien" BIGINT GENERATED ALWAYS AS IDENTITY NOT NULL,
    "MaNguoiDung" BIGINT NOT NULL,
    "TokenXacThuc" VARCHAR(255) NOT NULL,
    "DiaChiIP" VARCHAR(45) NOT NULL,
    "ThongTinThietBi" VARCHAR(200) NOT NULL,
    "TrangThai" VARCHAR(20) NOT NULL,
    "NgayTao" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    "NgayHetHan" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    "ThoiDiemThuHoi" TIMESTAMPTZ NULL,
    CONSTRAINT "PK_PhienDangNhap" PRIMARY KEY ("MaPhien")
);

-- Bảng: TuyChonNguoiDung (Cài đặt quyền riêng tư và chủ đề ưu tiên cho Bảng tin thông minh)
CREATE TABLE IF NOT EXISTS "TuyChonNguoiDung" (
    "MaNguoiDung" BIGINT NOT NULL,
    "CaiDatRiengTu" TEXT NOT NULL,
    "NhomNoiDungQuanTam" TEXT NOT NULL,
    "NgayCapNhat" TIMESTAMPTZ NULL,
    CONSTRAINT "PK_TuyChonNguoiDung" PRIMARY KEY ("MaNguoiDung")
);

-- Bảng: MaXacThuc [MỞ RỘNG] ([Mở rộng] Lưu mã OTP 6 số phục vụ Quên mật khẩu & Xác minh Email)
CREATE TABLE IF NOT EXISTS "MaXacThuc" (
    "MaXacThuc" BIGINT GENERATED ALWAYS AS IDENTITY NOT NULL,
    "MaNguoiDung" BIGINT NOT NULL,
    "MaOTP" VARCHAR(10) NOT NULL,
    "LoaiXacThuc" VARCHAR(30) NOT NULL,
    "HetHanLuc" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    "DaSuDung" BOOLEAN NOT NULL DEFAULT FALSE,
    "NgayTao" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT "PK_MaXacThuc" PRIMARY KEY ("MaXacThuc")
);

-- Bảng: ChanNguoiDung [MỞ RỘNG] ([Mở rộng] Danh sách chặn liên lạc và nhắn tin giữa sinh viên)
CREATE TABLE IF NOT EXISTS "ChanNguoiDung" (
    "MaChan" BIGINT GENERATED ALWAYS AS IDENTITY NOT NULL,
    "MaNguoiChan" BIGINT NOT NULL,
    "MaNguoiBiChan" BIGINT NOT NULL,
    "LyDo" VARCHAR(255) NULL,
    "NgayChan" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT "PK_ChanNguoiDung" PRIMARY KEY ("MaChan")
);

-- Bảng: CongDong (Không gian cộng đồng 5 cấp (Trường, Khoa, Ngành, Khóa học, Lớp))
CREATE TABLE IF NOT EXISTS "CongDong" (
    "MaCongDong" BIGINT GENERATED ALWAYS AS IDENTITY NOT NULL,
    "TenCongDong" VARCHAR(200) NOT NULL,
    "LoaiCongDong" VARCHAR(20) NOT NULL,
    "MaTruong" BIGINT NULL,
    "MaKhoa" BIGINT NULL,
    "MaNganh" BIGINT NULL,
    "MaKhoaHoc" BIGINT NULL,
    "MaLop" BIGINT NULL,
    "TrangThai" VARCHAR(20) NOT NULL,
    CONSTRAINT "PK_CongDong" PRIMARY KEY ("MaCongDong")
);

-- Bảng: ThanhVienCongDong (Liên kết sinh viên vào đúng 5 cấp cộng đồng khi đăng ký hoặc chuyển lớp)
CREATE TABLE IF NOT EXISTS "ThanhVienCongDong" (
    "MaCongDong" BIGINT NOT NULL,
    "MaNguoiDung" BIGINT NOT NULL,
    "VaiTro" VARCHAR(20) NOT NULL,
    "NgayThamGia" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT "PK_ThanhVienCongDong" PRIMARY KEY ("MaCongDong", "MaNguoiDung")
);

-- Bảng: BaiViet (Bài đăng chia sẻ kiến thức, thảo luận trên bảng tin cộng đồng)
CREATE TABLE IF NOT EXISTS "BaiViet" (
    "MaBaiViet" BIGINT GENERATED ALWAYS AS IDENTITY NOT NULL,
    "MaNguoiDung" BIGINT NOT NULL,
    "MaCongDong" BIGINT NOT NULL,
    "NoiDung" TEXT NOT NULL,
    "DanhMuc" VARCHAR(30) NOT NULL,
    "SoLuotThich" INT NOT NULL DEFAULT 0,
    "SoBinhLuan" INT NOT NULL DEFAULT 0,
    "PhienBan" INT NOT NULL DEFAULT 1,
    "TrangThai" VARCHAR(20) NOT NULL,
    "NgayTao" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    "NgayCapNhat" TIMESTAMPTZ NULL,
    CONSTRAINT "PK_BaiViet" PRIMARY KEY ("MaBaiViet")
);

-- Bảng: LichSuSuaBaiViet (Lưu vết nội dung cũ trước khi tác giả chỉnh sửa bài viết)
CREATE TABLE IF NOT EXISTS "LichSuSuaBaiViet" (
    "MaLichSu" BIGINT GENERATED ALWAYS AS IDENTITY NOT NULL,
    "MaBaiViet" BIGINT NOT NULL,
    "MaNguoiSua" BIGINT NOT NULL,
    "NoiDungCu" TEXT NOT NULL,
    "NgaySua" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT "PK_LichSuSuaBaiViet" PRIMARY KEY ("MaLichSu")
);

-- Bảng: TepTin (Quản lý metadata tệp đính kèm và tài liệu lưu trên ổ đĩa Server)
CREATE TABLE IF NOT EXISTS "TepTin" (
    "MaTepTin" BIGINT GENERATED ALWAYS AS IDENTITY NOT NULL,
    "MaNguoiTaiLen" BIGINT NOT NULL,
    "TenGoc" VARCHAR(255) NOT NULL,
    "DuongDanLuuTru" VARCHAR(500) NOT NULL,
    "KichThuocByte" BIGINT NOT NULL,
    "LoaiMIME" VARCHAR(100) NOT NULL,
    "MaBamSHA256" VARCHAR(64) NOT NULL,
    "TrangThaiKiemTra" VARCHAR(20) NOT NULL,
    "NgayTaiLen" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT "PK_TepTin" PRIMARY KEY ("MaTepTin")
);

-- Bảng: TepDinhKemBaiViet (Bảng liên kết nhiều–nhiều giữa Bài viết và Tệp tin đính kèm)
CREATE TABLE IF NOT EXISTS "TepDinhKemBaiViet" (
    "MaBaiViet" BIGINT NOT NULL,
    "MaTepTin" BIGINT NOT NULL,
    "ThuTuHienThi" INT NOT NULL,
    CONSTRAINT "PK_TepDinhKemBaiViet" PRIMARY KEY ("MaBaiViet", "MaTepTin")
);

-- Bảng: BinhLuan (Bình luận thảo luận dưới từng bài viết)
CREATE TABLE IF NOT EXISTS "BinhLuan" (
    "MaBinhLuan" BIGINT GENERATED ALWAYS AS IDENTITY NOT NULL,
    "MaBaiViet" BIGINT NOT NULL,
    "MaNguoiDung" BIGINT NOT NULL,
    "NoiDung" VARCHAR(2000) NOT NULL,
    "TrangThai" VARCHAR(20) NOT NULL,
    "NgayTao" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT "PK_BinhLuan" PRIMARY KEY ("MaBinhLuan")
);

-- Bảng: TuongTac (Lưu lượt thả tim / thích bài viết (chống trùng mỗi người/bài))
CREATE TABLE IF NOT EXISTS "TuongTac" (
    "MaTuongTac" BIGINT GENERATED ALWAYS AS IDENTITY NOT NULL,
    "MaBaiViet" BIGINT NOT NULL,
    "MaNguoiDung" BIGINT NOT NULL,
    "LoaiTuongTac" VARCHAR(20) NOT NULL,
    "NgayTao" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT "PK_TuongTac" PRIMARY KEY ("MaTuongTac")
);

-- Bảng: KetBan [MỞ RỘNG] ([Mở rộng] Quản lý lời mời kết bạn và mạng lưới bạn học hai chiều)
CREATE TABLE IF NOT EXISTS "KetBan" (
    "MaKetBan" BIGINT GENERATED ALWAYS AS IDENTITY NOT NULL,
    "MaNguoiGui" BIGINT NOT NULL,
    "MaNguoiNhan" BIGINT NULL,
    "TrangThai" VARCHAR(20) NOT NULL,
    "NgayGui" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    "NgayCapNhat" TIMESTAMPTZ NULL,
    CONSTRAINT "PK_KetBan" PRIMARY KEY ("MaKetBan")
);

-- Bảng: TinNhan [MỞ RỘNG] ([Mở rộng] Lưu lịch sử tin nhắn trò chuyện 1-1 và chat nhóm Realtime)
CREATE TABLE IF NOT EXISTS "TinNhan" (
    "MaTinNhan" BIGINT GENERATED ALWAYS AS IDENTITY NOT NULL,
    "MaNguoiGui" BIGINT NOT NULL,
    "MaNguoiNhan" BIGINT NULL,
    "MaNhomHoc" BIGINT NULL,
    "NoiDung" TEXT NOT NULL,
    "TrangThai" VARCHAR(20) NOT NULL,
    "ThoiGianGui" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT "PK_TinNhan" PRIMARY KEY ("MaTinNhan")
);

-- Bảng: MonHoc (Danh mục môn học theo từng trường (VD: Lập trình mạng))
CREATE TABLE IF NOT EXISTS "MonHoc" (
    "MaMonHoc" BIGINT GENERATED ALWAYS AS IDENTITY NOT NULL,
    "MaTruong" BIGINT NOT NULL,
    "KyHieuMonHoc" VARCHAR(30) NOT NULL,
    "TenMonHoc" VARCHAR(200) NOT NULL,
    "SoTinChi" INT NOT NULL,
    "TrangThai" VARCHAR(20) NOT NULL,
    CONSTRAINT "PK_MonHoc" PRIMARY KEY ("MaMonHoc")
);

-- Bảng: TaiLieu (Tài liệu, slide bài giảng, đề thi sinh viên chia sẻ theo môn học)
CREATE TABLE IF NOT EXISTS "TaiLieu" (
    "MaTaiLieu" BIGINT GENERATED ALWAYS AS IDENTITY NOT NULL,
    "MaNguoiDung" BIGINT NOT NULL,
    "MaMonHoc" BIGINT NOT NULL,
    "MaCongDong" BIGINT NOT NULL,
    "MaTepTin" BIGINT NOT NULL,
    "TieuDe" VARCHAR(255) NOT NULL,
    "MoTa" VARCHAR(1000) NOT NULL,
    "SoLuotTai" INT NOT NULL DEFAULT 0,
    "DiemDanhGiaTB" NUMERIC(3,2) NOT NULL,
    "TrangThai" VARCHAR(20) NOT NULL,
    "NgayTao" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT "PK_TaiLieu" PRIMARY KEY ("MaTaiLieu")
);

-- Bảng: DanhGiaTaiLieu (Chấm điểm sao (1–5 sao) và nhận xét chất lượng tài liệu)
CREATE TABLE IF NOT EXISTS "DanhGiaTaiLieu" (
    "MaTaiLieu" BIGINT NOT NULL,
    "MaNguoiDung" BIGINT NOT NULL,
    "Diem" INT NOT NULL,
    "NhanXet" VARCHAR(500) NOT NULL,
    "NgayDanhGia" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT "PK_DanhGiaTaiLieu" PRIMARY KEY ("MaTaiLieu", "MaNguoiDung")
);

-- Bảng: LuotTai (Nhật ký từng lượt tải tài liệu về máy sinh viên)
CREATE TABLE IF NOT EXISTS "LuotTai" (
    "MaLuotTai" BIGINT GENERATED ALWAYS AS IDENTITY NOT NULL,
    "MaTaiLieu" BIGINT NOT NULL,
    "MaNguoiDung" BIGINT NOT NULL,
    "TrangThai" VARCHAR(20) NOT NULL,
    "ThoiGian" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT "PK_LuotTai" PRIMARY KEY ("MaLuotTai")
);

-- Bảng: CauHoi (Câu hỏi thảo luận bài tập, đồ án theo từng môn học)
CREATE TABLE IF NOT EXISTS "CauHoi" (
    "MaCauHoi" BIGINT GENERATED ALWAYS AS IDENTITY NOT NULL,
    "MaNguoiDung" BIGINT NOT NULL,
    "MaMonHoc" BIGINT NOT NULL,
    "MaCongDong" BIGINT NOT NULL,
    "TieuDe" VARCHAR(255) NOT NULL,
    "NoiDung" TEXT NOT NULL,
    "DaGiaiQuyet" BOOLEAN NOT NULL DEFAULT FALSE,
    "TrangThai" VARCHAR(20) NOT NULL,
    "NgayTao" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT "PK_CauHoi" PRIMARY KEY ("MaCauHoi")
);

-- Bảng: CauTraLoi (Lời giải đáp cho câu hỏi trên diễn đàn Q&A)
CREATE TABLE IF NOT EXISTS "CauTraLoi" (
    "MaCauTraLoi" BIGINT GENERATED ALWAYS AS IDENTITY NOT NULL,
    "MaCauHoi" BIGINT NOT NULL,
    "MaNguoiDung" BIGINT NOT NULL,
    "NoiDung" TEXT NOT NULL,
    "SoUpvote" INT NOT NULL DEFAULT 0,
    "LaCauTraLoiDung" BOOLEAN NOT NULL DEFAULT FALSE,
    "TrangThai" VARCHAR(20) NOT NULL,
    "NgayTao" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT "PK_CauTraLoi" PRIMARY KEY ("MaCauTraLoi")
);

-- Bảng: BinhChonCauTraLoi (Lưu lượt bình chọn hữu ích cho câu trả lời (1 lần/người))
CREATE TABLE IF NOT EXISTS "BinhChonCauTraLoi" (
    "MaBinhChon" BIGINT GENERATED ALWAYS AS IDENTITY NOT NULL,
    "MaCauTraLoi" BIGINT NOT NULL,
    "MaNguoiDung" BIGINT NOT NULL,
    "NgayTao" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT "PK_BinhChonCauTraLoi" PRIMARY KEY ("MaBinhChon")
);

-- Bảng: TheCauHoi (Nhãn từ khóa phân loại câu hỏi (VD: #Socket, #SQL, #CSharp))
CREATE TABLE IF NOT EXISTS "TheCauHoi" (
    "MaTheCauHoi" BIGINT GENERATED ALWAYS AS IDENTITY NOT NULL,
    "MaCauHoi" BIGINT NOT NULL,
    "TenThe" VARCHAR(50) NOT NULL,
    CONSTRAINT "PK_TheCauHoi" PRIMARY KEY ("MaTheCauHoi")
);

-- Bảng: NhomHoc (Nhóm học tập cùng môn học của sinh viên)
CREATE TABLE IF NOT EXISTS "NhomHoc" (
    "MaNhomHoc" BIGINT GENERATED ALWAYS AS IDENTITY NOT NULL,
    "MaMonHoc" BIGINT NOT NULL,
    "MaCongDong" BIGINT NOT NULL,
    "MaTruongNhom" BIGINT NOT NULL,
    "TenNhom" VARCHAR(200) NOT NULL,
    "MucTieu" VARCHAR(500) NOT NULL,
    "SoThanhVienHienTai" INT NOT NULL DEFAULT 0,
    "SoThanhVienToiDa" INT NOT NULL,
    "TrangThai" VARCHAR(20) NOT NULL,
    "NgayTao" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT "PK_NhomHoc" PRIMARY KEY ("MaNhomHoc")
);

-- Bảng: ThanhVienNhom (Danh sách thành viên chính thức trong mỗi nhóm học)
CREATE TABLE IF NOT EXISTS "ThanhVienNhom" (
    "MaNhomHoc" BIGINT NOT NULL,
    "MaNguoiDung" BIGINT NOT NULL,
    "VaiTro" VARCHAR(20) NOT NULL,
    "NgayThamGia" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT "PK_ThanhVienNhom" PRIMARY KEY ("MaNhomHoc", "MaNguoiDung")
);

-- Bảng: YeuCauThamGia (Đơn xin gia nhập nhóm học chờ Trưởng nhóm phê duyệt)
CREATE TABLE IF NOT EXISTS "YeuCauThamGia" (
    "MaYeuCau" BIGINT GENERATED ALWAYS AS IDENTITY NOT NULL,
    "MaNhomHoc" BIGINT NULL,
    "MaNguoiDung" BIGINT NOT NULL,
    "LoiNhan" VARCHAR(500) NOT NULL,
    "TrangThai" VARCHAR(20) NOT NULL,
    "MaNguoiDuyet" BIGINT NULL,
    "NgayGui" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT "PK_YeuCauThamGia" PRIMARY KEY ("MaYeuCau")
);

-- Bảng: LichSuNhomHoc (Nhật ký chuyển quyền trưởng nhóm, rời nhóm, thay đổi sĩ số)
CREATE TABLE IF NOT EXISTS "LichSuNhomHoc" (
    "MaLichSu" BIGINT GENERATED ALWAYS AS IDENTITY NOT NULL,
    "MaNhomHoc" BIGINT NULL,
    "HanhDong" VARCHAR(50) NOT NULL,
    "ChiTiet" VARCHAR(500) NOT NULL,
    "NgayTao" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT "PK_LichSuNhomHoc" PRIMARY KEY ("MaLichSu")
);

-- Bảng: TinTruong (Tin tức Campus: Sự kiện, Học bổng, CLB, Việc làm & Thực tập)
CREATE TABLE IF NOT EXISTS "TinTruong" (
    "MaTinTruong" BIGINT GENERATED ALWAYS AS IDENTITY NOT NULL,
    "MaQuanTriVien" BIGINT NOT NULL,
    "MaCongDong" BIGINT NOT NULL,
    "DanhMuc" VARCHAR(30) NOT NULL,
    "TieuDe" VARCHAR(255) NOT NULL,
    "NoiDung" TEXT NOT NULL,
    "NgayHetHan" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    "TrangThai" VARCHAR(20) NOT NULL,
    "NgayDang" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT "PK_TinTruong" PRIMARY KEY ("MaTinTruong")
);

-- Bảng: ThongBao (Hộp thư thông báo thời gian thực gửi tới từng sinh viên)
CREATE TABLE IF NOT EXISTS "ThongBao" (
    "MaThongBao" BIGINT GENERATED ALWAYS AS IDENTITY NOT NULL,
    "MaNguoiNhan" BIGINT NULL,
    "MaNguoiThucHien" BIGINT NULL,
    "KhoaSuKien" VARCHAR(100) NULL,
    "LoaiThongBao" VARCHAR(30) NOT NULL,
    "NoiDung" VARCHAR(500) NOT NULL,
    "LienKet" VARCHAR(255) NULL,
    "DaDoc" BOOLEAN NOT NULL DEFAULT FALSE,
    "NgayTao" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    "NgayDoc" TIMESTAMPTZ NULL,
    CONSTRAINT "PK_ThongBao" PRIMARY KEY ("MaThongBao")
);

-- Bảng: BaoCaoViPham (Đơn báo cáo nội dung vi phạm từ sinh viên gửi lên Quản trị viên)
CREATE TABLE IF NOT EXISTS "BaoCaoViPham" (
    "MaBaoCao" BIGINT GENERATED ALWAYS AS IDENTITY NOT NULL,
    "MaNguoiBaoCao" BIGINT NOT NULL,
    "LoaiNoiDung" VARCHAR(30) NOT NULL,
    "IdNoiDung" BIGINT NOT NULL,
    "LyDo" VARCHAR(100) NOT NULL,
    "ChiTiet" VARCHAR(1000) NOT NULL,
    "TrangThai" VARCHAR(20) NOT NULL,
    "GhiChuXuLy" VARCHAR(500) NULL,
    "NgayGui" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT "PK_BaoCaoViPham" PRIMARY KEY ("MaBaoCao")
);

-- Bảng: NhatKyKiemDuyet (Lưu quyết định kiểm duyệt của Admin đối với từng báo cáo vi phạm)
CREATE TABLE IF NOT EXISTS "NhatKyKiemDuyet" (
    "MaNhatKy" BIGINT GENERATED ALWAYS AS IDENTITY NOT NULL,
    "MaBaoCao" BIGINT NOT NULL,
    "MaQuanTriVien" BIGINT NOT NULL,
    "QuyetDinh" VARCHAR(30) NOT NULL,
    "GhiChu" VARCHAR(500) NOT NULL,
    "NgayXuLy" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT "PK_NhatKyKiemDuyet" PRIMARY KEY ("MaNhatKy")
);

-- Bảng: NhatKyHeThong (Ghi vết mọi thay đổi quản trị (vai trò, khóa tài khoản, cấu trúc trường))
CREATE TABLE IF NOT EXISTS "NhatKyHeThong" (
    "MaNhatKy" BIGINT GENERATED ALWAYS AS IDENTITY NOT NULL,
    "MaNguoiThucHien" BIGINT NULL,
    "HanhDong" VARCHAR(50) NOT NULL,
    "BangAnhHuong" VARCHAR(50) NOT NULL,
    "BanGhiId" BIGINT NOT NULL,
    "ChiTiet" VARCHAR(1000) NOT NULL,
    "NgayTao" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT "PK_NhatKyHeThong" PRIMARY KEY ("MaNhatKy")
);

-- Bảng: HangDoiThongBao (Hàng đợi Outbox xử lý phát thông báo thời gian thực sau giao dịch)
CREATE TABLE IF NOT EXISTS "HangDoiThongBao" (
    "MaHangDoi" BIGINT GENERATED ALWAYS AS IDENTITY NOT NULL,
    "KhoaSuKien" VARCHAR(100) NULL,
    "DuLieuSuKien" TEXT NOT NULL,
    "SoLanThuLai" INT NOT NULL DEFAULT 0,
    "TrangThai" VARCHAR(20) NOT NULL,
    "NgayTao" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    "ThoiDiemXuLy" TIMESTAMPTZ NULL,
    CONSTRAINT "PK_HangDoiThongBao" PRIMARY KEY ("MaHangDoi")
);

-- =========================================================================
-- PHẦN 2: KHÓA NGOẠI (FOREIGN KEYS)
-- =========================================================================
ALTER TABLE "Khoa" DROP CONSTRAINT IF EXISTS "FK_Khoa_MaTruong_Truong";
ALTER TABLE "Khoa" ADD CONSTRAINT "FK_Khoa_MaTruong_Truong" FOREIGN KEY ("MaTruong") REFERENCES "Truong"("MaTruong");
ALTER TABLE "Nganh" DROP CONSTRAINT IF EXISTS "FK_Nganh_MaKhoa_Khoa";
ALTER TABLE "Nganh" ADD CONSTRAINT "FK_Nganh_MaKhoa_Khoa" FOREIGN KEY ("MaKhoa") REFERENCES "Khoa"("MaKhoa");
ALTER TABLE "KhoaHoc" DROP CONSTRAINT IF EXISTS "FK_KhoaHoc_MaNganh_Nganh";
ALTER TABLE "KhoaHoc" ADD CONSTRAINT "FK_KhoaHoc_MaNganh_Nganh" FOREIGN KEY ("MaNganh") REFERENCES "Nganh"("MaNganh");
ALTER TABLE "Lop" DROP CONSTRAINT IF EXISTS "FK_Lop_MaKhoaHoc_KhoaHoc";
ALTER TABLE "Lop" ADD CONSTRAINT "FK_Lop_MaKhoaHoc_KhoaHoc" FOREIGN KEY ("MaKhoaHoc") REFERENCES "KhoaHoc"("MaKhoaHoc");
ALTER TABLE "NguoiDung" DROP CONSTRAINT IF EXISTS "FK_NguoiDung_MaVaiTro_VaiTro";
ALTER TABLE "NguoiDung" ADD CONSTRAINT "FK_NguoiDung_MaVaiTro_VaiTro" FOREIGN KEY ("MaVaiTro") REFERENCES "VaiTro"("MaVaiTro");
ALTER TABLE "NguoiDung" DROP CONSTRAINT IF EXISTS "FK_NguoiDung_MaLop_Lop";
ALTER TABLE "NguoiDung" ADD CONSTRAINT "FK_NguoiDung_MaLop_Lop" FOREIGN KEY ("MaLop") REFERENCES "Lop"("MaLop");
ALTER TABLE "PhienDangNhap" DROP CONSTRAINT IF EXISTS "FK_PhienDangNhap_MaNguoiDung_NguoiDung";
ALTER TABLE "PhienDangNhap" ADD CONSTRAINT "FK_PhienDangNhap_MaNguoiDung_NguoiDung" FOREIGN KEY ("MaNguoiDung") REFERENCES "NguoiDung"("MaNguoiDung");
ALTER TABLE "TuyChonNguoiDung" DROP CONSTRAINT IF EXISTS "FK_TuyChonNguoiDung_MaNguoiDung_NguoiDung";
ALTER TABLE "TuyChonNguoiDung" ADD CONSTRAINT "FK_TuyChonNguoiDung_MaNguoiDung_NguoiDung" FOREIGN KEY ("MaNguoiDung") REFERENCES "NguoiDung"("MaNguoiDung");
ALTER TABLE "MaXacThuc" DROP CONSTRAINT IF EXISTS "FK_MaXacThuc_MaNguoiDung_NguoiDung";
ALTER TABLE "MaXacThuc" ADD CONSTRAINT "FK_MaXacThuc_MaNguoiDung_NguoiDung" FOREIGN KEY ("MaNguoiDung") REFERENCES "NguoiDung"("MaNguoiDung");
ALTER TABLE "ChanNguoiDung" DROP CONSTRAINT IF EXISTS "FK_ChanNguoiDung_MaNguoiChan_NguoiDung";
ALTER TABLE "ChanNguoiDung" ADD CONSTRAINT "FK_ChanNguoiDung_MaNguoiChan_NguoiDung" FOREIGN KEY ("MaNguoiChan") REFERENCES "NguoiDung"("MaNguoiDung");
ALTER TABLE "ChanNguoiDung" DROP CONSTRAINT IF EXISTS "FK_ChanNguoiDung_MaNguoiBiChan_NguoiDung";
ALTER TABLE "ChanNguoiDung" ADD CONSTRAINT "FK_ChanNguoiDung_MaNguoiBiChan_NguoiDung" FOREIGN KEY ("MaNguoiBiChan") REFERENCES "NguoiDung"("MaNguoiDung");
ALTER TABLE "CongDong" DROP CONSTRAINT IF EXISTS "FK_CongDong_MaTruong_Truong";
ALTER TABLE "CongDong" ADD CONSTRAINT "FK_CongDong_MaTruong_Truong" FOREIGN KEY ("MaTruong") REFERENCES "Truong"("MaTruong");
ALTER TABLE "CongDong" DROP CONSTRAINT IF EXISTS "FK_CongDong_MaKhoa_Khoa";
ALTER TABLE "CongDong" ADD CONSTRAINT "FK_CongDong_MaKhoa_Khoa" FOREIGN KEY ("MaKhoa") REFERENCES "Khoa"("MaKhoa");
ALTER TABLE "CongDong" DROP CONSTRAINT IF EXISTS "FK_CongDong_MaNganh_Nganh";
ALTER TABLE "CongDong" ADD CONSTRAINT "FK_CongDong_MaNganh_Nganh" FOREIGN KEY ("MaNganh") REFERENCES "Nganh"("MaNganh");
ALTER TABLE "CongDong" DROP CONSTRAINT IF EXISTS "FK_CongDong_MaKhoaHoc_KhoaHoc";
ALTER TABLE "CongDong" ADD CONSTRAINT "FK_CongDong_MaKhoaHoc_KhoaHoc" FOREIGN KEY ("MaKhoaHoc") REFERENCES "KhoaHoc"("MaKhoaHoc");
ALTER TABLE "CongDong" DROP CONSTRAINT IF EXISTS "FK_CongDong_MaLop_Lop";
ALTER TABLE "CongDong" ADD CONSTRAINT "FK_CongDong_MaLop_Lop" FOREIGN KEY ("MaLop") REFERENCES "Lop"("MaLop");
ALTER TABLE "ThanhVienCongDong" DROP CONSTRAINT IF EXISTS "FK_ThanhVienCongDong_MaCongDong_CongDong";
ALTER TABLE "ThanhVienCongDong" ADD CONSTRAINT "FK_ThanhVienCongDong_MaCongDong_CongDong" FOREIGN KEY ("MaCongDong") REFERENCES "CongDong"("MaCongDong");
ALTER TABLE "ThanhVienCongDong" DROP CONSTRAINT IF EXISTS "FK_ThanhVienCongDong_MaNguoiDung_NguoiDung";
ALTER TABLE "ThanhVienCongDong" ADD CONSTRAINT "FK_ThanhVienCongDong_MaNguoiDung_NguoiDung" FOREIGN KEY ("MaNguoiDung") REFERENCES "NguoiDung"("MaNguoiDung");
ALTER TABLE "BaiViet" DROP CONSTRAINT IF EXISTS "FK_BaiViet_MaNguoiDung_NguoiDung";
ALTER TABLE "BaiViet" ADD CONSTRAINT "FK_BaiViet_MaNguoiDung_NguoiDung" FOREIGN KEY ("MaNguoiDung") REFERENCES "NguoiDung"("MaNguoiDung");
ALTER TABLE "BaiViet" DROP CONSTRAINT IF EXISTS "FK_BaiViet_MaCongDong_CongDong";
ALTER TABLE "BaiViet" ADD CONSTRAINT "FK_BaiViet_MaCongDong_CongDong" FOREIGN KEY ("MaCongDong") REFERENCES "CongDong"("MaCongDong");
ALTER TABLE "LichSuSuaBaiViet" DROP CONSTRAINT IF EXISTS "FK_LichSuSuaBaiViet_MaBaiViet_BaiViet";
ALTER TABLE "LichSuSuaBaiViet" ADD CONSTRAINT "FK_LichSuSuaBaiViet_MaBaiViet_BaiViet" FOREIGN KEY ("MaBaiViet") REFERENCES "BaiViet"("MaBaiViet");
ALTER TABLE "LichSuSuaBaiViet" DROP CONSTRAINT IF EXISTS "FK_LichSuSuaBaiViet_MaNguoiSua_NguoiDung";
ALTER TABLE "LichSuSuaBaiViet" ADD CONSTRAINT "FK_LichSuSuaBaiViet_MaNguoiSua_NguoiDung" FOREIGN KEY ("MaNguoiSua") REFERENCES "NguoiDung"("MaNguoiDung");
ALTER TABLE "TepTin" DROP CONSTRAINT IF EXISTS "FK_TepTin_MaNguoiTaiLen_NguoiDung";
ALTER TABLE "TepTin" ADD CONSTRAINT "FK_TepTin_MaNguoiTaiLen_NguoiDung" FOREIGN KEY ("MaNguoiTaiLen") REFERENCES "NguoiDung"("MaNguoiDung");
ALTER TABLE "TepDinhKemBaiViet" DROP CONSTRAINT IF EXISTS "FK_TepDinhKemBaiViet_MaBaiViet_BaiViet";
ALTER TABLE "TepDinhKemBaiViet" ADD CONSTRAINT "FK_TepDinhKemBaiViet_MaBaiViet_BaiViet" FOREIGN KEY ("MaBaiViet") REFERENCES "BaiViet"("MaBaiViet");
ALTER TABLE "TepDinhKemBaiViet" DROP CONSTRAINT IF EXISTS "FK_TepDinhKemBaiViet_MaTepTin_TepTin";
ALTER TABLE "TepDinhKemBaiViet" ADD CONSTRAINT "FK_TepDinhKemBaiViet_MaTepTin_TepTin" FOREIGN KEY ("MaTepTin") REFERENCES "TepTin"("MaTepTin");
ALTER TABLE "BinhLuan" DROP CONSTRAINT IF EXISTS "FK_BinhLuan_MaBaiViet_BaiViet";
ALTER TABLE "BinhLuan" ADD CONSTRAINT "FK_BinhLuan_MaBaiViet_BaiViet" FOREIGN KEY ("MaBaiViet") REFERENCES "BaiViet"("MaBaiViet");
ALTER TABLE "BinhLuan" DROP CONSTRAINT IF EXISTS "FK_BinhLuan_MaNguoiDung_NguoiDung";
ALTER TABLE "BinhLuan" ADD CONSTRAINT "FK_BinhLuan_MaNguoiDung_NguoiDung" FOREIGN KEY ("MaNguoiDung") REFERENCES "NguoiDung"("MaNguoiDung");
ALTER TABLE "TuongTac" DROP CONSTRAINT IF EXISTS "FK_TuongTac_MaBaiViet_BaiViet";
ALTER TABLE "TuongTac" ADD CONSTRAINT "FK_TuongTac_MaBaiViet_BaiViet" FOREIGN KEY ("MaBaiViet") REFERENCES "BaiViet"("MaBaiViet");
ALTER TABLE "TuongTac" DROP CONSTRAINT IF EXISTS "FK_TuongTac_MaNguoiDung_NguoiDung";
ALTER TABLE "TuongTac" ADD CONSTRAINT "FK_TuongTac_MaNguoiDung_NguoiDung" FOREIGN KEY ("MaNguoiDung") REFERENCES "NguoiDung"("MaNguoiDung");
ALTER TABLE "KetBan" DROP CONSTRAINT IF EXISTS "FK_KetBan_MaNguoiGui_NguoiDung";
ALTER TABLE "KetBan" ADD CONSTRAINT "FK_KetBan_MaNguoiGui_NguoiDung" FOREIGN KEY ("MaNguoiGui") REFERENCES "NguoiDung"("MaNguoiDung");
ALTER TABLE "KetBan" DROP CONSTRAINT IF EXISTS "FK_KetBan_MaNguoiNhan_NguoiDung";
ALTER TABLE "KetBan" ADD CONSTRAINT "FK_KetBan_MaNguoiNhan_NguoiDung" FOREIGN KEY ("MaNguoiNhan") REFERENCES "NguoiDung"("MaNguoiDung");
ALTER TABLE "TinNhan" DROP CONSTRAINT IF EXISTS "FK_TinNhan_MaNguoiGui_NguoiDung";
ALTER TABLE "TinNhan" ADD CONSTRAINT "FK_TinNhan_MaNguoiGui_NguoiDung" FOREIGN KEY ("MaNguoiGui") REFERENCES "NguoiDung"("MaNguoiDung");
ALTER TABLE "TinNhan" DROP CONSTRAINT IF EXISTS "FK_TinNhan_MaNguoiNhan_NguoiDung";
ALTER TABLE "TinNhan" ADD CONSTRAINT "FK_TinNhan_MaNguoiNhan_NguoiDung" FOREIGN KEY ("MaNguoiNhan") REFERENCES "NguoiDung"("MaNguoiDung");
ALTER TABLE "TinNhan" DROP CONSTRAINT IF EXISTS "FK_TinNhan_MaNhomHoc_NhomHoc";
ALTER TABLE "TinNhan" ADD CONSTRAINT "FK_TinNhan_MaNhomHoc_NhomHoc" FOREIGN KEY ("MaNhomHoc") REFERENCES "NhomHoc"("MaNhomHoc");
ALTER TABLE "MonHoc" DROP CONSTRAINT IF EXISTS "FK_MonHoc_MaTruong_Truong";
ALTER TABLE "MonHoc" ADD CONSTRAINT "FK_MonHoc_MaTruong_Truong" FOREIGN KEY ("MaTruong") REFERENCES "Truong"("MaTruong");
ALTER TABLE "TaiLieu" DROP CONSTRAINT IF EXISTS "FK_TaiLieu_MaNguoiDung_NguoiDung";
ALTER TABLE "TaiLieu" ADD CONSTRAINT "FK_TaiLieu_MaNguoiDung_NguoiDung" FOREIGN KEY ("MaNguoiDung") REFERENCES "NguoiDung"("MaNguoiDung");
ALTER TABLE "TaiLieu" DROP CONSTRAINT IF EXISTS "FK_TaiLieu_MaMonHoc_MonHoc";
ALTER TABLE "TaiLieu" ADD CONSTRAINT "FK_TaiLieu_MaMonHoc_MonHoc" FOREIGN KEY ("MaMonHoc") REFERENCES "MonHoc"("MaMonHoc");
ALTER TABLE "TaiLieu" DROP CONSTRAINT IF EXISTS "FK_TaiLieu_MaCongDong_CongDong";
ALTER TABLE "TaiLieu" ADD CONSTRAINT "FK_TaiLieu_MaCongDong_CongDong" FOREIGN KEY ("MaCongDong") REFERENCES "CongDong"("MaCongDong");
ALTER TABLE "TaiLieu" DROP CONSTRAINT IF EXISTS "FK_TaiLieu_MaTepTin_TepTin";
ALTER TABLE "TaiLieu" ADD CONSTRAINT "FK_TaiLieu_MaTepTin_TepTin" FOREIGN KEY ("MaTepTin") REFERENCES "TepTin"("MaTepTin");
ALTER TABLE "DanhGiaTaiLieu" DROP CONSTRAINT IF EXISTS "FK_DanhGiaTaiLieu_MaTaiLieu_TaiLieu";
ALTER TABLE "DanhGiaTaiLieu" ADD CONSTRAINT "FK_DanhGiaTaiLieu_MaTaiLieu_TaiLieu" FOREIGN KEY ("MaTaiLieu") REFERENCES "TaiLieu"("MaTaiLieu");
ALTER TABLE "DanhGiaTaiLieu" DROP CONSTRAINT IF EXISTS "FK_DanhGiaTaiLieu_MaNguoiDung_NguoiDung";
ALTER TABLE "DanhGiaTaiLieu" ADD CONSTRAINT "FK_DanhGiaTaiLieu_MaNguoiDung_NguoiDung" FOREIGN KEY ("MaNguoiDung") REFERENCES "NguoiDung"("MaNguoiDung");
ALTER TABLE "LuotTai" DROP CONSTRAINT IF EXISTS "FK_LuotTai_MaTaiLieu_TaiLieu";
ALTER TABLE "LuotTai" ADD CONSTRAINT "FK_LuotTai_MaTaiLieu_TaiLieu" FOREIGN KEY ("MaTaiLieu") REFERENCES "TaiLieu"("MaTaiLieu");
ALTER TABLE "LuotTai" DROP CONSTRAINT IF EXISTS "FK_LuotTai_MaNguoiDung_NguoiDung";
ALTER TABLE "LuotTai" ADD CONSTRAINT "FK_LuotTai_MaNguoiDung_NguoiDung" FOREIGN KEY ("MaNguoiDung") REFERENCES "NguoiDung"("MaNguoiDung");
ALTER TABLE "CauHoi" DROP CONSTRAINT IF EXISTS "FK_CauHoi_MaNguoiDung_NguoiDung";
ALTER TABLE "CauHoi" ADD CONSTRAINT "FK_CauHoi_MaNguoiDung_NguoiDung" FOREIGN KEY ("MaNguoiDung") REFERENCES "NguoiDung"("MaNguoiDung");
ALTER TABLE "CauHoi" DROP CONSTRAINT IF EXISTS "FK_CauHoi_MaMonHoc_MonHoc";
ALTER TABLE "CauHoi" ADD CONSTRAINT "FK_CauHoi_MaMonHoc_MonHoc" FOREIGN KEY ("MaMonHoc") REFERENCES "MonHoc"("MaMonHoc");
ALTER TABLE "CauHoi" DROP CONSTRAINT IF EXISTS "FK_CauHoi_MaCongDong_CongDong";
ALTER TABLE "CauHoi" ADD CONSTRAINT "FK_CauHoi_MaCongDong_CongDong" FOREIGN KEY ("MaCongDong") REFERENCES "CongDong"("MaCongDong");
ALTER TABLE "CauTraLoi" DROP CONSTRAINT IF EXISTS "FK_CauTraLoi_MaCauHoi_CauHoi";
ALTER TABLE "CauTraLoi" ADD CONSTRAINT "FK_CauTraLoi_MaCauHoi_CauHoi" FOREIGN KEY ("MaCauHoi") REFERENCES "CauHoi"("MaCauHoi");
ALTER TABLE "CauTraLoi" DROP CONSTRAINT IF EXISTS "FK_CauTraLoi_MaNguoiDung_NguoiDung";
ALTER TABLE "CauTraLoi" ADD CONSTRAINT "FK_CauTraLoi_MaNguoiDung_NguoiDung" FOREIGN KEY ("MaNguoiDung") REFERENCES "NguoiDung"("MaNguoiDung");
ALTER TABLE "BinhChonCauTraLoi" DROP CONSTRAINT IF EXISTS "FK_BinhChonCauTraLoi_MaCauTraLoi_CauTraLoi";
ALTER TABLE "BinhChonCauTraLoi" ADD CONSTRAINT "FK_BinhChonCauTraLoi_MaCauTraLoi_CauTraLoi" FOREIGN KEY ("MaCauTraLoi") REFERENCES "CauTraLoi"("MaCauTraLoi");
ALTER TABLE "BinhChonCauTraLoi" DROP CONSTRAINT IF EXISTS "FK_BinhChonCauTraLoi_MaNguoiDung_NguoiDung";
ALTER TABLE "BinhChonCauTraLoi" ADD CONSTRAINT "FK_BinhChonCauTraLoi_MaNguoiDung_NguoiDung" FOREIGN KEY ("MaNguoiDung") REFERENCES "NguoiDung"("MaNguoiDung");
ALTER TABLE "TheCauHoi" DROP CONSTRAINT IF EXISTS "FK_TheCauHoi_MaCauHoi_CauHoi";
ALTER TABLE "TheCauHoi" ADD CONSTRAINT "FK_TheCauHoi_MaCauHoi_CauHoi" FOREIGN KEY ("MaCauHoi") REFERENCES "CauHoi"("MaCauHoi");
ALTER TABLE "NhomHoc" DROP CONSTRAINT IF EXISTS "FK_NhomHoc_MaMonHoc_MonHoc";
ALTER TABLE "NhomHoc" ADD CONSTRAINT "FK_NhomHoc_MaMonHoc_MonHoc" FOREIGN KEY ("MaMonHoc") REFERENCES "MonHoc"("MaMonHoc");
ALTER TABLE "NhomHoc" DROP CONSTRAINT IF EXISTS "FK_NhomHoc_MaCongDong_CongDong";
ALTER TABLE "NhomHoc" ADD CONSTRAINT "FK_NhomHoc_MaCongDong_CongDong" FOREIGN KEY ("MaCongDong") REFERENCES "CongDong"("MaCongDong");
ALTER TABLE "NhomHoc" DROP CONSTRAINT IF EXISTS "FK_NhomHoc_MaTruongNhom_NguoiDung";
ALTER TABLE "NhomHoc" ADD CONSTRAINT "FK_NhomHoc_MaTruongNhom_NguoiDung" FOREIGN KEY ("MaTruongNhom") REFERENCES "NguoiDung"("MaNguoiDung");
ALTER TABLE "ThanhVienNhom" DROP CONSTRAINT IF EXISTS "FK_ThanhVienNhom_MaNhomHoc_NhomHoc";
ALTER TABLE "ThanhVienNhom" ADD CONSTRAINT "FK_ThanhVienNhom_MaNhomHoc_NhomHoc" FOREIGN KEY ("MaNhomHoc") REFERENCES "NhomHoc"("MaNhomHoc");
ALTER TABLE "ThanhVienNhom" DROP CONSTRAINT IF EXISTS "FK_ThanhVienNhom_MaNguoiDung_NguoiDung";
ALTER TABLE "ThanhVienNhom" ADD CONSTRAINT "FK_ThanhVienNhom_MaNguoiDung_NguoiDung" FOREIGN KEY ("MaNguoiDung") REFERENCES "NguoiDung"("MaNguoiDung");
ALTER TABLE "YeuCauThamGia" DROP CONSTRAINT IF EXISTS "FK_YeuCauThamGia_MaNhomHoc_NhomHoc";
ALTER TABLE "YeuCauThamGia" ADD CONSTRAINT "FK_YeuCauThamGia_MaNhomHoc_NhomHoc" FOREIGN KEY ("MaNhomHoc") REFERENCES "NhomHoc"("MaNhomHoc");
ALTER TABLE "YeuCauThamGia" DROP CONSTRAINT IF EXISTS "FK_YeuCauThamGia_MaNguoiDung_NguoiDung";
ALTER TABLE "YeuCauThamGia" ADD CONSTRAINT "FK_YeuCauThamGia_MaNguoiDung_NguoiDung" FOREIGN KEY ("MaNguoiDung") REFERENCES "NguoiDung"("MaNguoiDung");
ALTER TABLE "YeuCauThamGia" DROP CONSTRAINT IF EXISTS "FK_YeuCauThamGia_MaNguoiDuyet_NguoiDung";
ALTER TABLE "YeuCauThamGia" ADD CONSTRAINT "FK_YeuCauThamGia_MaNguoiDuyet_NguoiDung" FOREIGN KEY ("MaNguoiDuyet") REFERENCES "NguoiDung"("MaNguoiDung");
ALTER TABLE "LichSuNhomHoc" DROP CONSTRAINT IF EXISTS "FK_LichSuNhomHoc_MaNhomHoc_NhomHoc";
ALTER TABLE "LichSuNhomHoc" ADD CONSTRAINT "FK_LichSuNhomHoc_MaNhomHoc_NhomHoc" FOREIGN KEY ("MaNhomHoc") REFERENCES "NhomHoc"("MaNhomHoc");
ALTER TABLE "TinTruong" DROP CONSTRAINT IF EXISTS "FK_TinTruong_MaQuanTriVien_NguoiDung";
ALTER TABLE "TinTruong" ADD CONSTRAINT "FK_TinTruong_MaQuanTriVien_NguoiDung" FOREIGN KEY ("MaQuanTriVien") REFERENCES "NguoiDung"("MaNguoiDung");
ALTER TABLE "TinTruong" DROP CONSTRAINT IF EXISTS "FK_TinTruong_MaCongDong_CongDong";
ALTER TABLE "TinTruong" ADD CONSTRAINT "FK_TinTruong_MaCongDong_CongDong" FOREIGN KEY ("MaCongDong") REFERENCES "CongDong"("MaCongDong");
ALTER TABLE "ThongBao" DROP CONSTRAINT IF EXISTS "FK_ThongBao_MaNguoiNhan_NguoiDung";
ALTER TABLE "ThongBao" ADD CONSTRAINT "FK_ThongBao_MaNguoiNhan_NguoiDung" FOREIGN KEY ("MaNguoiNhan") REFERENCES "NguoiDung"("MaNguoiDung");
ALTER TABLE "ThongBao" DROP CONSTRAINT IF EXISTS "FK_ThongBao_MaNguoiThucHien_NguoiDung";
ALTER TABLE "ThongBao" ADD CONSTRAINT "FK_ThongBao_MaNguoiThucHien_NguoiDung" FOREIGN KEY ("MaNguoiThucHien") REFERENCES "NguoiDung"("MaNguoiDung");
ALTER TABLE "BaoCaoViPham" DROP CONSTRAINT IF EXISTS "FK_BaoCaoViPham_MaNguoiBaoCao_NguoiDung";
ALTER TABLE "BaoCaoViPham" ADD CONSTRAINT "FK_BaoCaoViPham_MaNguoiBaoCao_NguoiDung" FOREIGN KEY ("MaNguoiBaoCao") REFERENCES "NguoiDung"("MaNguoiDung");
ALTER TABLE "NhatKyKiemDuyet" DROP CONSTRAINT IF EXISTS "FK_NhatKyKiemDuyet_MaBaoCao_BaoCaoViPham";
ALTER TABLE "NhatKyKiemDuyet" ADD CONSTRAINT "FK_NhatKyKiemDuyet_MaBaoCao_BaoCaoViPham" FOREIGN KEY ("MaBaoCao") REFERENCES "BaoCaoViPham"("MaBaoCao");
ALTER TABLE "NhatKyKiemDuyet" DROP CONSTRAINT IF EXISTS "FK_NhatKyKiemDuyet_MaQuanTriVien_NguoiDung";
ALTER TABLE "NhatKyKiemDuyet" ADD CONSTRAINT "FK_NhatKyKiemDuyet_MaQuanTriVien_NguoiDung" FOREIGN KEY ("MaQuanTriVien") REFERENCES "NguoiDung"("MaNguoiDung");
ALTER TABLE "NhatKyHeThong" DROP CONSTRAINT IF EXISTS "FK_NhatKyHeThong_MaNguoiThucHien_NguoiDung";
ALTER TABLE "NhatKyHeThong" ADD CONSTRAINT "FK_NhatKyHeThong_MaNguoiThucHien_NguoiDung" FOREIGN KEY ("MaNguoiThucHien") REFERENCES "NguoiDung"("MaNguoiDung");

-- =========================================================================
-- PHẦN 3: RÀNG BUỘC DUY NHẤT (UNIQUE) & CHECK
-- =========================================================================
ALTER TABLE "Truong" DROP CONSTRAINT IF EXISTS "UQ_Truong_KyHieuTruong";
ALTER TABLE "Truong" ADD CONSTRAINT "UQ_Truong_KyHieuTruong" UNIQUE ("KyHieuTruong");
ALTER TABLE "VaiTro" DROP CONSTRAINT IF EXISTS "UQ_VaiTro_TenVaiTro";
ALTER TABLE "VaiTro" ADD CONSTRAINT "UQ_VaiTro_TenVaiTro" UNIQUE ("TenVaiTro");
CREATE UNIQUE INDEX IF NOT EXISTS "UQ_NguoiDung_MaSinhVien" ON "NguoiDung"("MaSinhVien") WHERE "MaSinhVien" IS NOT NULL;
ALTER TABLE "NguoiDung" DROP CONSTRAINT IF EXISTS "UQ_NguoiDung_Email";
ALTER TABLE "NguoiDung" ADD CONSTRAINT "UQ_NguoiDung_Email" UNIQUE ("Email");
ALTER TABLE "PhienDangNhap" DROP CONSTRAINT IF EXISTS "UQ_PhienDangNhap_TokenXacThuc";
ALTER TABLE "PhienDangNhap" ADD CONSTRAINT "UQ_PhienDangNhap_TokenXacThuc" UNIQUE ("TokenXacThuc");
ALTER TABLE "TepTin" DROP CONSTRAINT IF EXISTS "UQ_TepTin_DuongDanLuuTru";
ALTER TABLE "TepTin" ADD CONSTRAINT "UQ_TepTin_DuongDanLuuTru" UNIQUE ("DuongDanLuuTru");
ALTER TABLE "MonHoc" DROP CONSTRAINT IF EXISTS "UQ_MonHoc_KyHieuMonHoc";
ALTER TABLE "MonHoc" ADD CONSTRAINT "UQ_MonHoc_KyHieuMonHoc" UNIQUE ("KyHieuMonHoc");
ALTER TABLE "HangDoiThongBao" DROP CONSTRAINT IF EXISTS "UQ_HangDoiThongBao_KhoaSuKien";
ALTER TABLE "HangDoiThongBao" ADD CONSTRAINT "UQ_HangDoiThongBao_KhoaSuKien" UNIQUE ("KhoaSuKien");
ALTER TABLE "Khoa" DROP CONSTRAINT IF EXISTS "UQ_Khoa_MaTruong_KyHieu";
ALTER TABLE "Khoa" ADD CONSTRAINT "UQ_Khoa_MaTruong_KyHieu" UNIQUE ("MaTruong", "KyHieuKhoa");
ALTER TABLE "Nganh" DROP CONSTRAINT IF EXISTS "UQ_Nganh_MaKhoa_KyHieu";
ALTER TABLE "Nganh" ADD CONSTRAINT "UQ_Nganh_MaKhoa_KyHieu" UNIQUE ("MaKhoa", "KyHieuNganh");
ALTER TABLE "KhoaHoc" DROP CONSTRAINT IF EXISTS "UQ_KhoaHoc_MaNganh_Ten";
ALTER TABLE "KhoaHoc" ADD CONSTRAINT "UQ_KhoaHoc_MaNganh_Ten" UNIQUE ("MaNganh", "TenKhoaHoc");
ALTER TABLE "Lop" DROP CONSTRAINT IF EXISTS "UQ_Lop_MaKhoaHoc_Ten";
ALTER TABLE "Lop" ADD CONSTRAINT "UQ_Lop_MaKhoaHoc_Ten" UNIQUE ("MaKhoaHoc", "TenLop");
ALTER TABLE "TuongTac" DROP CONSTRAINT IF EXISTS "UQ_TuongTac_BaiViet_NguoiDung";
ALTER TABLE "TuongTac" ADD CONSTRAINT "UQ_TuongTac_BaiViet_NguoiDung" UNIQUE ("MaBaiViet", "MaNguoiDung");
ALTER TABLE "BinhChonCauTraLoi" DROP CONSTRAINT IF EXISTS "UQ_BinhChon_CauTraLoi_NguoiDung";
ALTER TABLE "BinhChonCauTraLoi" ADD CONSTRAINT "UQ_BinhChon_CauTraLoi_NguoiDung" UNIQUE ("MaCauTraLoi", "MaNguoiDung");
ALTER TABLE "KetBan" DROP CONSTRAINT IF EXISTS "UQ_KetBan_Gui_Nhan";
ALTER TABLE "KetBan" ADD CONSTRAINT "UQ_KetBan_Gui_Nhan" UNIQUE ("MaNguoiGui", "MaNguoiNhan");
ALTER TABLE "ChanNguoiDung" DROP CONSTRAINT IF EXISTS "UQ_ChanNguoiDung_Chan_BiChan";
ALTER TABLE "ChanNguoiDung" ADD CONSTRAINT "UQ_ChanNguoiDung_Chan_BiChan" UNIQUE ("MaNguoiChan", "MaNguoiBiChan");
ALTER TABLE "DanhGiaTaiLieu" DROP CONSTRAINT IF EXISTS "CK_DanhGiaTaiLieu_Diem";
ALTER TABLE "DanhGiaTaiLieu" ADD CONSTRAINT "CK_DanhGiaTaiLieu_Diem" CHECK ("Diem" BETWEEN 1 AND 5);
ALTER TABLE "NhomHoc" DROP CONSTRAINT IF EXISTS "CK_NhomHoc_SiSo";
ALTER TABLE "NhomHoc" ADD CONSTRAINT "CK_NhomHoc_SiSo" CHECK ("SoThanhVienToiDa" >= 2 AND "SoThanhVienHienTai" <= "SoThanhVienToiDa");
ALTER TABLE "TinNhan" DROP CONSTRAINT IF EXISTS "CK_TinNhan_Dich";
ALTER TABLE "TinNhan" ADD CONSTRAINT "CK_TinNhan_Dich" CHECK (("MaNguoiNhan" IS NOT NULL AND "MaNhomHoc" IS NULL) OR ("MaNguoiNhan" IS NULL AND "MaNhomHoc" IS NOT NULL));
ALTER TABLE "CongDong" DROP CONSTRAINT IF EXISTS "CK_CongDong_DonVi";
ALTER TABLE "CongDong" ADD CONSTRAINT "CK_CongDong_DonVi" CHECK ((CASE WHEN "MaTruong" IS NOT NULL THEN 1 ELSE 0 END + CASE WHEN "MaKhoa" IS NOT NULL THEN 1 ELSE 0 END + CASE WHEN "MaNganh" IS NOT NULL THEN 1 ELSE 0 END + CASE WHEN "MaKhoaHoc" IS NOT NULL THEN 1 ELSE 0 END + CASE WHEN "MaLop" IS NOT NULL THEN 1 ELSE 0 END) = 1);

-- =========================================================================
-- PHẦN 4: CHỈ MỤC TỐI ƯU HIỆU NĂNG (INDEXES)
-- =========================================================================
CREATE INDEX IF NOT EXISTS "IX_BaiViet_CongDong_NgayTao" ON "BaiViet"("MaCongDong", "NgayTao" DESC);
CREATE INDEX IF NOT EXISTS "IX_TaiLieu_MonHoc_CongDong" ON "TaiLieu"("MaMonHoc", "MaCongDong");
CREATE INDEX IF NOT EXISTS "IX_CauHoi_MonHoc_NgayTao" ON "CauHoi"("MaMonHoc", "NgayTao" DESC);
CREATE INDEX IF NOT EXISTS "IX_ThongBao_NguoiNhan_DaDoc" ON "ThongBao"("MaNguoiNhan", "DaDoc", "NgayTao" DESC);
CREATE INDEX IF NOT EXISTS "IX_YeuCauThamGia_Nhom_TrangThai" ON "YeuCauThamGia"("MaNhomHoc", "TrangThai");
CREATE INDEX IF NOT EXISTS "IX_TinNhan_NguoiNhan_ThoiGian" ON "TinNhan"("MaNguoiNhan", "ThoiGianGui" DESC);
CREATE INDEX IF NOT EXISTS "IX_HangDoiThongBao_TrangThai" ON "HangDoiThongBao"("TrangThai", "NgayTao");
