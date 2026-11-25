// Controller Express cho M8: Layout UI Chung, Bảng tin & Riêng tư
// Phụ trách: Thái
const express = require('express');
const path = require('path');
const Model = require('../Models/m08.model');

const router = express.Router();

// Trang View mẫu của module
router.get('/view', (req, res) => {
  res.sendFile(path.join(__dirname, '../Views/m08.view.html'));
});

// Endpoint kiểm tra trạng thái module
router.get('/status', async (req, res) => {
  try {
    const info = await Model.getModuleHealth();
    res.json({ ok: true, ...info, endpoints: ["GET /api/m08/feed", "PUT /api/m08/preferences", "POST /api/m08/block", "DELETE /api/m08/block/:targetId"] });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

module.exports = router;
