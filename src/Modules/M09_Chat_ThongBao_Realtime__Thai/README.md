# M9 — Chat Realtime, Thông báo & Hàng đợi

- **Thành viên sở hữu (End-to-End):** Thái (UI Lead)
- **Thư mục MVC:** `src/Modules/M09_Chat_ThongBao_Realtime__Thai`
- **Bảng PostgreSQL:** `TinNhan`, `ThongBao`, `HangDoiThongBao`
- **Routes API dự kiến:**
  - `GET /api/m09/chat/history`
  - `POST /api/m09/chat/send`
  - `GET /api/m09/notifications`
  - `PUT /api/m09/notifications/:id/read`
  - `Socket.io: join_room, chat_message, new_comment, new_answer, join_request, campus_post`

## Phạm vi chức năng
Cấu hình Socket.io WebSocket xác thực JWT handshake (userId ↔ socketId); Nhắn tin Chat 1-1 & Chat nhóm Realtime (lưu 'ChoNhan' nếu offline); Chuông thông báo + Toast + Outbox HangDoiThongBao chống gửi trùng; cung cấp sendNotification().

## Quy trình 4 Bước hoàn thành
- **B1 (Model & Hàm chung):** Tạo Model cho TinNhan, ThongBao, HangDoiThongBao (UNIQUE KhoaSuKien); chốt sớm hàm sendNotification() để Duy, Huy, Bảo gọi.
- **B2 (Socket.io Server & Worker):** Xác thực JWT khi Socket handshake để ánh xạ userId ↔ socketId; code Chat 1-1/Nhóm (check ChanNguoiDung) & worker đọc HangDoiThongBao + dọn phiên hết hạn.
- **B3 (Client Socket & Views):** Nhúng Socket.io Client vào Layout chung, lắng nghe sự kiện cập nhật chuông, bật Toast popup và khung Chat 1-1/Nhóm.
- **B4 (Demo & KPI):** Mở 2 trình duyệt trên link Render test Chat & thông báo tức thì không cần F5.

**KPI:** Chat & thông báo tức thì qua WebSocket, không mất tin khi offline, chống trùng qua HangDoiThongBao.
