// Model PostgreSQL cho M9: Chat Realtime, Thông báo & Hàng đợi
// Phụ trách: Thái
const db = require('../../../Shared/config/db');

const TABLES = ["TinNhan", "ThongBao", "HangDoiThongBao"];

async function getModuleHealth() {
  return {
    module: 'M9',
    owner: 'Thái',
    tables: TABLES,
    dbConnected: Boolean(db.pool),
  };
}

module.exports = { TABLES, getModuleHealth };
