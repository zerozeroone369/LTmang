// Model PostgreSQL cho M10: Quản trị Hệ thống & Kiểm duyệt (Admin)
// Phụ trách: Nguyễn Ngô Tú Anh
const db = require('../../../Shared/config/db');

const TABLES = ["BaoCaoViPham", "NhatKyKiemDuyet", "NhatKyHeThong"];

async function getModuleHealth() {
  return {
    module: 'M10',
    owner: 'Nguyễn Ngô Tú Anh',
    tables: TABLES,
    dbConnected: Boolean(db.pool),
  };
}

module.exports = { TABLES, getModuleHealth };
