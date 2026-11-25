// Model PostgreSQL cho M8: Layout UI Chung, Bảng tin & Riêng tư
// Phụ trách: Thái
const db = require('../../../Shared/config/db');

const TABLES = ["TuyChonNguoiDung", "ChanNguoiDung"];

async function getModuleHealth() {
  return {
    module: 'M8',
    owner: 'Thái',
    tables: TABLES,
    dbConnected: Boolean(db.pool),
  };
}

module.exports = { TABLES, getModuleHealth };
