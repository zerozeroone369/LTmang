const jwt = require('jsonwebtoken');
const db = require('../config/db');

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-in-env';

async function verifyToken(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) {
    return res.status(401).json({ error: 'Thiếu token xác thực (Bearer Token).' });
  }
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    if (db.pool) {
      const check = await db.query(
        'SELECT p."TrangThai", n."TrangThai" AS "UserStatus", v."TenVaiTro" ' +
        'FROM "PhienDangNhap" p ' +
        'JOIN "NguoiDung" n ON p."MaNguoiDung" = n."MaNguoiDung" ' +
        'JOIN "VaiTro" v ON n."MaVaiTro" = v."MaVaiTro" ' +
        'WHERE p."TokenXacThuc" = $1',
        [token]
      );
      if (!check.rows.length || check.rows[0].TrangThai !== 'DangHoatDong' || check.rows[0].UserStatus !== 'HoatDong') {
        return res.status(401).json({ error: 'Phiên đăng nhập đã bị thu hồi hoặc tài khoản bị khóa.' });
      }
    }
    req.user = decoded;
    return next();
  } catch (err) {
    return res.status(401).json({ error: 'Token không hợp lệ hoặc đã hết hạn.' });
  }
}

function requireAdmin(req, res, next) {
  if (!req.user || req.user.role !== 'QuanTriVien') {
    return res.status(403).json({ error: 'Chức năng chỉ dành cho Quản trị viên (QuanTriVien).' });
  }
  return next();
}

module.exports = { verifyToken, requireAdmin, JWT_SECRET };
