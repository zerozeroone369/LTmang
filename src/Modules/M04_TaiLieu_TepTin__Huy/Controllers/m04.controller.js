// Controller Express cho M4: Tài liệu Học tập & Upload Tệp
// Phụ trách: Huy
const express = require('express');
const path = require('path');
const Model = require('../Models/m04.model');

const router = express.Router();

// Trang View mẫu của module
router.get('/view', (req, res) => {
  res.sendFile(path.join(__dirname, '../Views/m04.view.html'));
});

// Endpoint kiểm tra trạng thái module
router.get('/status', async (req, res) => {
  try {
    const info = await Model.getModuleHealth();
    res.json({ ok: true, ...info, endpoints: ["GET /api/m04/subjects", "POST /api/m04/documents/upload", "GET /api/m04/documents/search", "GET /api/m04/documents/:id/download", "POST /api/m04/documents/:id/rate"] });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

module.exports = router;
