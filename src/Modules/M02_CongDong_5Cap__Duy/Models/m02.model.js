// Model PostgreSQL cho M2: Cấu trúc Trường 5 Cấp & Cộng đồng
// Phụ trách: Duy
const db = require('../../../Shared/config/db');

const TABLES = ["Truong", "Khoa", "Nganh", "KhoaHoc", "Lop", "CongDong", "ThanhVienCongDong"];

async function getModuleHealth() {
  return {
    module: 'M2',
    owner: 'Duy',
    tables: TABLES,
    dbConnected: Boolean(db.pool),
  };
}

module.exports = { TABLES, getModuleHealth };
