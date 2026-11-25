// Controller Express cho M5: Hỏi đáp Học thuật (Q&A & Upvote)
// Phụ trách: Huy
const express = require('express');
const path = require('path');
const Model = require('../Models/m05.model');

const router = express.Router();

// Trang View mẫu của module
router.get('/view', (req, res) => {
  res.sendFile(path.join(__dirname, '../Views/m05.view.html'));
});

// Endpoint kiểm tra trạng thái module
router.get('/status', async (req, res) => {
  try {
    const info = await Model.getModuleHealth();
    res.json({ ok: true, ...info, endpoints: ["CRUD /api/m05/questions", "POST /api/m05/questions/:id/answers", "POST /api/m05/answers/:id/upvote", "PUT /api/m05/answers/:id/correct"] });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

module.exports = router;
