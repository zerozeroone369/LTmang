// Controller Express cho M10: Quản trị Hệ thống & Kiểm duyệt (Admin)
// Phụ trách: Nguyễn Ngô Tú Anh
const express = require('express');
const path = require('path');
const Model = require('../Models/m10.model');

const router = express.Router();

// Trang View mẫu của module
router.get('/view', (req, res) => {
  res.sendFile(path.join(__dirname, '../Views/m10.view.html'));
});

// Endpoint kiểm tra trạng thái module
router.get('/status', async (req, res) => {
  try {
    const info = await Model.getModuleHealth();
    res.json({ ok: true, ...info, endpoints: ["GET /api/m10/admin/users", "PUT /api/m10/admin/users/:id/lock", "PUT /api/m10/admin/users/:id/role", "GET /api/m10/admin/reports", "PUT /api/m10/admin/reports/:id", "GET /api/m10/admin/logs"] });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

module.exports = router;
