require('dotenv').config();
const http = require('http');
const path = require('path');
const express = require('express');
const cors = require('cors');
const { Server } = require('socket.io');

const db = require('./src/Shared/config/db');
const { initSocket } = require('./src/Shared/middlewares/realtimeHelper');

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: '*' } });
initSocket(io);

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const MODULE_SUMMARY = [{"id": "M1", "code": "m01", "name": "Tài khoản, Phiên JWT & Quên MK (OTP)", "owner": "Nguyễn Ngô Tú Anh", "tables": ["VaiTro", "NguoiDung", "PhienDangNhap", "MaXacThuc"], "folder": "src/Modules/M01_Auth_TaiKhoan__TuAnh"}, {"id": "M2", "code": "m02", "name": "Cấu trúc Trường 5 Cấp & Cộng đồng", "owner": "Duy", "tables": ["Truong", "Khoa", "Nganh", "KhoaHoc", "Lop", "CongDong", "ThanhVienCongDong"], "folder": "src/Modules/M02_CongDong_5Cap__Duy"}, {"id": "M3", "code": "m03", "name": "Bài viết, Tương tác & Kết bạn", "owner": "Duy", "tables": ["BaiViet", "LichSuSuaBaiViet", "TepDinhKemBaiViet", "BinhLuan", "TuongTac", "KetBan"], "folder": "src/Modules/M03_BaiViet_KetBan__Duy"}, {"id": "M4", "code": "m04", "name": "Tài liệu Học tập & Upload Tệp", "owner": "Huy", "tables": ["MonHoc", "TepTin", "TaiLieu", "DanhGiaTaiLieu", "LuotTai"], "folder": "src/Modules/M04_TaiLieu_TepTin__Huy"}, {"id": "M5", "code": "m05", "name": "Hỏi đáp Học thuật (Q&A & Upvote)", "owner": "Huy", "tables": ["CauHoi", "CauTraLoi", "BinhChonCauTraLoi", "TheCauHoi"], "folder": "src/Modules/M05_HoiDap_QA__Huy"}, {"id": "M6", "code": "m06", "name": "Nhóm học Tập (Study Groups)", "owner": "Bảo", "tables": ["NhomHoc", "ThanhVienNhom", "YeuCauThamGia", "LichSuNhomHoc"], "folder": "src/Modules/M06_NhomHoc__Bao"}, {"id": "M7", "code": "m07", "name": "Campus (Tin tức, Sự kiện, Việc làm)", "owner": "Bảo", "tables": ["TinTruong"], "folder": "src/Modules/M07_Campus__Bao"}, {"id": "M8", "code": "m08", "name": "Layout UI Chung, Bảng tin & Riêng tư", "owner": "Thái", "tables": ["TuyChonNguoiDung", "ChanNguoiDung"], "folder": "src/Modules/M08_BangTin_RiengTu__Thai"}, {"id": "M9", "code": "m09", "name": "Chat Realtime, Thông báo & Hàng đợi", "owner": "Thái", "tables": ["TinNhan", "ThongBao", "HangDoiThongBao"], "folder": "src/Modules/M09_Chat_ThongBao_Realtime__Thai"}, {"id": "M10", "code": "m10", "name": "Quản trị Hệ thống & Kiểm duyệt (Admin)", "owner": "Nguyễn Ngô Tú Anh", "tables": ["BaoCaoViPham", "NhatKyKiemDuyet", "NhatKyHeThong"], "folder": "src/Modules/M10_QuanTri_KiemDuyet__TuAnh"}];

// Health check cho Render / Railway / Koyeb
app.get('/health', async (req, res) => {
  const dbStatus = await db.checkDbHealth();
  res.json({
    status: 'ok',
    architecture: 'Modular MVC (Node.js + Express + Socket.io + PostgreSQL)',
    modules: MODULE_SUMMARY.length,
    database: dbStatus,
  });
});

// Tài liệu kiến trúc Workflow + ERD 39 Bảng + Phân công nhóm
app.get('/docs', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Gắn Router Controller của cả 10 Module MVC
app.use('/api/m01', require('./src/Modules/M01_Auth_TaiKhoan__TuAnh/Controllers/m01.controller'));
app.use('/api/m02', require('./src/Modules/M02_CongDong_5Cap__Duy/Controllers/m02.controller'));
app.use('/api/m03', require('./src/Modules/M03_BaiViet_KetBan__Duy/Controllers/m03.controller'));
app.use('/api/m04', require('./src/Modules/M04_TaiLieu_TepTin__Huy/Controllers/m04.controller'));
app.use('/api/m05', require('./src/Modules/M05_HoiDap_QA__Huy/Controllers/m05.controller'));
app.use('/api/m06', require('./src/Modules/M06_NhomHoc__Bao/Controllers/m06.controller'));
app.use('/api/m07', require('./src/Modules/M07_Campus__Bao/Controllers/m07.controller'));
app.use('/api/m08', require('./src/Modules/M08_BangTin_RiengTu__Thai/Controllers/m08.controller'));
app.use('/api/m09', require('./src/Modules/M09_Chat_ThongBao_Realtime__Thai/Controllers/m09.controller'));
app.use('/api/m10', require('./src/Modules/M10_QuanTri_KiemDuyet__TuAnh/Controllers/m10.controller'));

// Trang chủ MVC Dashboard hiển thị tình trạng Cloud & 10 Module
app.get('/', async (req, res) => {
  const dbStatus = await db.checkDbHealth();
  const cards = MODULE_SUMMARY.map(m => `
    <div style="background:#fff;border:1px solid #e2e8f0;border-radius:10px;padding:14px;">
      <div style="font-size:12px;font-weight:700;color:#2563eb;">${m.id} · ${m.owner}</div>
      <div style="font-size:15px;font-weight:700;margin:4px 0;">${m.name}</div>
      <div style="font-size:12px;color:#475569;margin-bottom:8px;">Bảng: ${m.tables.join(', ')}</div>
      <div style="font-size:12px;">
        <a href="/api/${m.code}/view">Xem View</a> ·
        <a href="/api/${m.code}/status">API Status</a>
      </div>
    </div>`).join('');

  res.send(`<!DOCTYPE html>
<html lang="vi">
<head><meta charset="UTF-8"><title>MXH Sinh Viên — Modular MVC Cloud</title></head>
<body style="font-family:system-ui,sans-serif;background:#f1f5f9;color:#0f172a;margin:0;padding:28px;">
  <div style="max-width:1080px;margin:auto;">
    <div style="background:#fff;border:1px solid #e2e8f0;border-radius:12px;padding:20px;margin-bottom:18px;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:12px;">
      <div>
        <h1 style="margin:0;font-size:20px;">Mạng Xã Hội Phục Vụ Đời Sống Sinh Viên</h1>
        <p style="margin:4px 0 0;color:#475569;font-size:13px;">Kiến trúc Modular MVC (Express + Socket.io) • PostgreSQL 39 Bảng • Cloud Ready</p>
      </div>
      <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap;">
        <span style="padding:6px 10px;border-radius:999px;font-size:12px;font-weight:700;background:${dbStatus.connected ? '#dcfce7' : '#fef3c7'};color:${dbStatus.connected ? '#15803d' : '#92400e'};">
          PostgreSQL: ${dbStatus.connected ? 'Đã kết nối (' + dbStatus.tables + ' bảng)' : dbStatus.detail}
        </span>
        <a href="/docs" style="padding:7px 12px;background:#2563eb;color:#fff;text-decoration:none;border-radius:8px;font-size:12.5px;font-weight:600;">Sơ đồ Workflow &amp; CSDL</a>
        <a href="/health" style="padding:7px 12px;background:#fff;border:1px solid #cbd5e1;color:#0f172a;text-decoration:none;border-radius:8px;font-size:12.5px;font-weight:600;">/health JSON</a>
      </div>
    </div>
    <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(300px,1fr));gap:14px;">${cards}</div>
  </div>
</body>
</html>`);
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log('MXH Sinh Vien MVC Server dang chay tai cong ' + PORT);
});
