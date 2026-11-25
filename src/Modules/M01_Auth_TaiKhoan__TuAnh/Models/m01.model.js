// Model PostgreSQL cho M1: Tài khoản, Phiên JWT & Quên MK (OTP)
// Phụ trách: Nguyễn Ngô Tú Anh
const db = require('../../../Shared/config/db');

const TABLES = ["VaiTro", "NguoiDung", "PhienDangNhap", "MaXacThuc"];

async function getModuleHealth() {
  return {
    module: 'M1',
    owner: 'Nguyễn Ngô Tú Anh',
    tables: TABLES,
    dbConnected: Boolean(db.pool),
  };
}

module.exports = { TABLES, getModuleHealth };
