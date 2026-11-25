// Controller Express cho M2: Cấu trúc Trường 5 Cấp & Cộng đồng
// Phụ trách: Duy
const express = require('express');
const path = require('path');
const Model = require('../Models/m02.model');

const router = express.Router();

// Trang View mẫu của module
router.get('/view', (req, res) => {
  res.sendFile(path.join(__dirname, '../Views/m02.view.html'));
});

// Endpoint kiểm tra trạng thái module
router.get('/status', async (req, res) => {
  try {
    const info = await Model.getModuleHealth();
    res.json({ ok: true, ...info, endpoints: ["GET /api/m02/edu/schools", "GET /api/m02/edu/children", "GET /api/m02/communities/me", "POST /api/m02/communities/sync", "CRUD /api/m02/admin/edu"] });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

module.exports = router;
