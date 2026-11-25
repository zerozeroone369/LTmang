// Controller Express cho M6: Nhóm học Tập (Study Groups)
// Phụ trách: Bảo
const express = require('express');
const path = require('path');
const Model = require('../Models/m06.model');

const router = express.Router();

// Trang View mẫu của module
router.get('/view', (req, res) => {
  res.sendFile(path.join(__dirname, '../Views/m06.view.html'));
});

// Endpoint kiểm tra trạng thái module
router.get('/status', async (req, res) => {
  try {
    const info = await Model.getModuleHealth();
    res.json({ ok: true, ...info, endpoints: ["POST /api/m06/groups", "GET /api/m06/groups/search", "POST /api/m06/groups/:id/join", "PUT /api/m06/join-requests/:id", "PUT /api/m06/groups/:id/capacity", "POST /api/m06/groups/:id/transfer-leave"] });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

module.exports = router;
