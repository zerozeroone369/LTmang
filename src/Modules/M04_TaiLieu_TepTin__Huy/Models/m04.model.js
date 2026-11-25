// Model PostgreSQL cho M4: Tài liệu Học tập & Upload Tệp
// Phụ trách: Huy
const db = require('../../../Shared/config/db');

const TABLES = ["MonHoc", "TepTin", "TaiLieu", "DanhGiaTaiLieu", "LuotTai"];

async function getModuleHealth() {
  return {
    module: 'M4',
    owner: 'Huy',
    tables: TABLES,
    dbConnected: Boolean(db.pool),
  };
}

module.exports = { TABLES, getModuleHealth };
