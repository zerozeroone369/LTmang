// Controller Express cho M9: Chat Realtime, Thông báo & Hàng đợi
// Phụ trách: Thái
const express = require('express');
const path = require('path');
const Model = require('../Models/m09.model');

const router = express.Router();

// Trang View mẫu của module
router.get('/view', (req, res) => {
  res.sendFile(path.join(__dirname, '../Views/m09.view.html'));
});

// Endpoint kiểm tra trạng thái module
router.get('/status', async (req, res) => {
  try {
    const info = await Model.getModuleHealth();
    res.json({ ok: true, ...info, endpoints: ["GET /api/m09/chat/history", "POST /api/m09/chat/send", "GET /api/m09/notifications", "PUT /api/m09/notifications/:id/read", "Socket.io: join_room, chat_message, new_comment, new_answer, join_request, campus_post"] });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

module.exports = router;
