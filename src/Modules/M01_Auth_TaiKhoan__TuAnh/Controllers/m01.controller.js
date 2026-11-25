// Controller Express cho M1: Tài khoản, Phiên JWT & Quên MK (OTP)
// Phụ trách: Nguyễn Ngô Tú Anh
const express = require('express');
const path = require('path');
const Model = require('../Models/m01.model');

const router = express.Router();

// Trang View mẫu của module
router.get('/view', (req, res) => {
  res.sendFile(path.join(__dirname, '../Views/m01.view.html'));
});

// Endpoint kiểm tra trạng thái module
router.get('/status', async (req, res) => {
  try {
    const info = await Model.getModuleHealth();
    res.json({ ok: true, ...info, endpoints: ["POST /api/m01/auth/register", "POST /api/m01/auth/login", "POST /api/m01/auth/logout", "PUT /api/m01/users/password", "POST /api/m01/auth/forgot-otp", "POST /api/m01/auth/reset-pw", "PUT /api/m01/users/profile"] });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

module.exports = router;
