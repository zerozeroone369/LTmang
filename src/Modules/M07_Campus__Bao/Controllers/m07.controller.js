// Controller Express cho M7: Campus (Tin tức, Sự kiện, Việc làm)
// Phụ trách: Bảo
const express = require('express');
const path = require('path');
const Model = require('../Models/m07.model');

const router = express.Router();

// Trang View mẫu của module
router.get('/view', (req, res) => {
  res.sendFile(path.join(__dirname, '../Views/m07.view.html'));
});

// Endpoint kiểm tra trạng thái module
router.get('/status', async (req, res) => {
  try {
    const info = await Model.getModuleHealth();
    res.json({ ok: true, ...info, endpoints: ["GET /api/m07/campus", "POST /api/m07/admin/campus", "PUT /api/m07/admin/campus/:id", "DELETE /api/m07/admin/campus/:id"] });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

module.exports = router;
