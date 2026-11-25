// Model PostgreSQL cho M5: Hỏi đáp Học thuật (Q&A & Upvote)
// Phụ trách: Huy
const db = require('../../../Shared/config/db');

const TABLES = ["CauHoi", "CauTraLoi", "BinhChonCauTraLoi", "TheCauHoi"];

async function getModuleHealth() {
  return {
    module: 'M5',
    owner: 'Huy',
    tables: TABLES,
    dbConnected: Boolean(db.pool),
  };
}

module.exports = { TABLES, getModuleHealth };
