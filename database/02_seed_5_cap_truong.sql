-- =========================================================================
-- DỮ LIỆU MẪU KHỞI TẠO (SEED DATA) - POSTGRESQL
-- Phụ trách Giai đoạn 1: Tú Anh (VaiTro) & Duy (Cây 5 cấp + CongDong) & Huy (MonHoc)
-- =========================================================================

INSERT INTO "VaiTro" ("TenVaiTro") VALUES ('SinhVien') ON CONFLICT ("TenVaiTro") DO NOTHING;
INSERT INTO "VaiTro" ("TenVaiTro") VALUES ('QuanTriVien') ON CONFLICT ("TenVaiTro") DO NOTHING;

INSERT INTO "Truong" ("KyHieuTruong", "TenTruong", "TrangThai")
VALUES ('CNTT-DEMO', 'Đại học Công Nghệ Thông Tin (Demo)', 'DangHoatDong')
ON CONFLICT ("KyHieuTruong") DO NOTHING;

DO $$
DECLARE
    v_truong BIGINT;
    v_khoa BIGINT;
    v_nganh BIGINT;
    v_khoahoc BIGINT;
    v_lop BIGINT;
BEGIN
    SELECT "MaTruong" INTO v_truong FROM "Truong" WHERE "KyHieuTruong" = 'CNTT-DEMO';

    IF NOT EXISTS (SELECT 1 FROM "Khoa" WHERE "MaTruong" = v_truong AND "KyHieuKhoa" = 'CNTT') THEN
        INSERT INTO "Khoa" ("MaTruong", "KyHieuKhoa", "TenKhoa", "TrangThai")
        VALUES (v_truong, 'CNTT', 'Khoa Công nghệ Thông tin', 'DangHoatDong');
    END IF;
    SELECT "MaKhoa" INTO v_khoa FROM "Khoa" WHERE "MaTruong" = v_truong AND "KyHieuKhoa" = 'CNTT';

    IF NOT EXISTS (SELECT 1 FROM "Nganh" WHERE "MaKhoa" = v_khoa AND "KyHieuNganh" = 'MMT') THEN
        INSERT INTO "Nganh" ("MaKhoa", "KyHieuNganh", "TenNganh", "TrangThai")
        VALUES (v_khoa, 'MMT', 'Mạng máy tính & Truyền thông', 'DangHoatDong');
    END IF;
    SELECT "MaNganh" INTO v_nganh FROM "Nganh" WHERE "MaKhoa" = v_khoa AND "KyHieuNganh" = 'MMT';

    IF NOT EXISTS (SELECT 1 FROM "KhoaHoc" WHERE "MaNganh" = v_nganh AND "TenKhoaHoc" = 'Khóa 2022') THEN
        INSERT INTO "KhoaHoc" ("MaNganh", "TenKhoaHoc", "NamBatDau", "TrangThai")
        VALUES (v_nganh, 'Khóa 2022', 2022, 'DangHoatDong');
    END IF;
    SELECT "MaKhoaHoc" INTO v_khoahoc FROM "KhoaHoc" WHERE "MaNganh" = v_nganh AND "TenKhoaHoc" = 'Khóa 2022';

    IF NOT EXISTS (SELECT 1 FROM "Lop" WHERE "MaKhoaHoc" = v_khoahoc AND "TenLop" = 'D22CQCN01') THEN
        INSERT INTO "Lop" ("MaKhoaHoc", "TenLop", "TrangThai")
        VALUES (v_khoahoc, 'D22CQCN01', 'DangHoatDong');
    END IF;
    SELECT "MaLop" INTO v_lop FROM "Lop" WHERE "MaKhoaHoc" = v_khoahoc AND "TenLop" = 'D22CQCN01';

    -- Tự động tạo đủ 5 cấp CongDong tương ứng
    IF NOT EXISTS (SELECT 1 FROM "CongDong" WHERE "MaTruong" = v_truong) THEN
        INSERT INTO "CongDong" ("TenCongDong", "LoaiCongDong", "MaTruong", "TrangThai")
        VALUES ('Cộng đồng Trường ĐH CNTT', 'Truong', v_truong, 'DangHoatDong');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM "CongDong" WHERE "MaKhoa" = v_khoa) THEN
        INSERT INTO "CongDong" ("TenCongDong", "LoaiCongDong", "MaKhoa", "TrangThai")
        VALUES ('Cộng đồng Khoa CNTT', 'Khoa', v_khoa, 'DangHoatDong');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM "CongDong" WHERE "MaNganh" = v_nganh) THEN
        INSERT INTO "CongDong" ("TenCongDong", "LoaiCongDong", "MaNganh", "TrangThai")
        VALUES ('Cộng đồng Ngành MMT', 'Nganh', v_nganh, 'DangHoatDong');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM "CongDong" WHERE "MaKhoaHoc" = v_khoahoc) THEN
        INSERT INTO "CongDong" ("TenCongDong", "LoaiCongDong", "MaKhoaHoc", "TrangThai")
        VALUES ('Cộng đồng Khóa 2022', 'KhoaHoc', v_khoahoc, 'DangHoatDong');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM "CongDong" WHERE "MaLop" = v_lop) THEN
        INSERT INTO "CongDong" ("TenCongDong", "LoaiCongDong", "MaLop", "TrangThai")
        VALUES ('Cộng đồng Lớp D22CQCN01', 'Lop', v_lop, 'DangHoatDong');
    END IF;

    INSERT INTO "MonHoc" ("MaTruong", "KyHieuMonHoc", "TenMonHoc", "SoTinChi", "TrangThai")
    VALUES
      (v_truong, 'LTM01', 'Lập trình mạng', 3, 'DangMo'),
      (v_truong, 'CSDL01', 'Cơ sở dữ liệu', 3, 'DangMo'),
      (v_truong, 'LTW01', 'Phát triển ứng dụng Web MVC', 3, 'DangMo')
    ON CONFLICT ("KyHieuMonHoc") DO NOTHING;
END $$;
