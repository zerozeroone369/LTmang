// Model PostgreSQL cho M7: Campus (Tin tức, Sự kiện, Việc làm)
// Phụ trách: Bảo
const db = require('../../../Shared/config/db');

const TABLES = ["TinTruong"];

async function getModuleHealth() {
  return {
    module: 'M7',
    owner: 'Bảo',
    tables: TABLES,
    dbConnected: Boolean(db.pool),
  };
}

module.exports = { TABLES, getModuleHealth };
