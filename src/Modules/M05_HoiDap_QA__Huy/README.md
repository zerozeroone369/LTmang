# M5 — Hỏi đáp Học thuật (Q&A & Upvote)

- **Thành viên sở hữu (End-to-End):** Huy (Full-stack Module)
- **Thư mục MVC:** `src/Modules/M05_HoiDap_QA__Huy`
- **Bảng PostgreSQL:** `CauHoi`, `CauTraLoi`, `BinhChonCauTraLoi`, `TheCauHoi`
- **Routes API dự kiến:**
  - `CRUD /api/m05/questions`
  - `POST /api/m05/questions/:id/answers`
  - `POST /api/m05/answers/:id/upvote`
  - `PUT /api/m05/answers/:id/correct`

## Phạm vi chức năng
Đặt câu hỏi gắn MonHoc, CongDong và thẻ TheCauHoi (#Socket, #SQL...); Gửi câu trả lời; Upvote câu trả lời (1 lần/người); Chủ câu hỏi đánh dấu 'Câu trả lời đúng'; Tìm kiếm câu hỏi cũ.

## Quy trình 4 Bước hoàn thành
- **B1 (Model Q&A):** Tạo Model cho CauHoi (cờ DaGiaiQuyet), CauTraLoi (SoUpvote, LaCauTraLoiDung), BinhChonCauTraLoi (UNIQUE), TheCauHoi.
- **B2 (Controller):** Viết API tạo câu hỏi kèm thẻ, trả lời, toggle Upvote an toàn chống vote 2 lần và API chốt đáp án đúng (kiểm tra chủ câu hỏi).
- **B3 (Views MVC):** Dựng trang Q&A trực quan, lọc môn/thẻ, nút Upvote & nút 'Câu trả lời đúng' chỉ hiện với tác giả.
- **B4 (Demo & KPI):** Test trọn luồng đặt câu hỏi → trả lời → Upvote → chốt đáp án đúng.

**KPI:** Chống Upvote trùng lặp ở DB & Backend, xếp hạng đáp án đúng/nhiều Upvote chính xác.
