// Model PostgreSQL cho M3: Bài viết, Tương tác & Kết bạn
// Phụ trách: Duy
const db = require('../../../Shared/config/db');

const TABLES = ["BaiViet", "LichSuSuaBaiViet", "TepDinhKemBaiViet", "BinhLuan", "TuongTac", "KetBan"];

async function getModuleHealth() {
  return {
    module: 'M3',
    owner: 'Duy',
    tables: TABLES,
    dbConnected: Boolean(db.pool),
  };
}

module.exports = { TABLES, getModuleHealth };
