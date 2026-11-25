// Controller Express cho M3: Bài viết, Tương tác & Kết bạn
// Phụ trách: Duy
const express = require('express');
const path = require('path');
const Model = require('../Models/m03.model');

const router = express.Router();

// Trang View mẫu của module
router.get('/view', (req, res) => {
  res.sendFile(path.join(__dirname, '../Views/m03.view.html'));
});

// Endpoint kiểm tra trạng thái module
router.get('/status', async (req, res) => {
  try {
    const info = await Model.getModuleHealth();
    res.json({ ok: true, ...info, endpoints: ["CRUD /api/m03/posts", "POST /api/m03/posts/:id/comments", "POST /api/m03/posts/:id/like", "POST /api/m03/posts/:id/report", "POST /api/m03/friends/request", "PUT /api/m03/friends/:id/respond"] });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

module.exports = router;
