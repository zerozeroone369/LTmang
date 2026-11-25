// Model PostgreSQL cho M6: Nhóm học Tập (Study Groups)
// Phụ trách: Bảo
const db = require('../../../Shared/config/db');

const TABLES = ["NhomHoc", "ThanhVienNhom", "YeuCauThamGia", "LichSuNhomHoc"];

async function getModuleHealth() {
  return {
    module: 'M6',
    owner: 'Bảo',
    tables: TABLES,
    dbConnected: Boolean(db.pool),
  };
}

module.exports = { TABLES, getModuleHealth };
