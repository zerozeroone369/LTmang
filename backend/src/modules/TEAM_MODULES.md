# Hướng dẫn tích hợp Module cho các thành viên Backend

Kiến trúc chung đã được Tú Anh chuẩn hóa trong `backend/src/modules/`. Mỗi module mới tạo theo cấu trúc:

```text
backend/src/modules/<module-name>/
├── <module>.validator.ts   # Zod schemas kiểm tra input
├── <module>.repository.ts  # Truy vấn Prisma (Parametrized queries)
├── <module>.service.ts     # Xử lý nghiệp vụ & gọi socket/notification nếu cần
├── <module>.controller.ts  # Nhận HTTP req/res
└── <module>.routes.ts      # Khai báo Express Router + gắn authenticate / requireRole
```

## Phân chia thư mục module:
- **Tú Anh (Leader):** `auth/`, `users/`, `academic/` (read), `admin/`
- **Duy (Backend):** `communities/` (nhiệm vụ 3), `posts/` (nhiệm vụ 4)
- **Huy (Backend):** `documents/` (nhiệm vụ 5), `qa/` (nhiệm vụ 6)
- **Bảo (Backend & Realtime):** `study-groups/` (nhiệm vụ 7), `campus/` & `notifications/` & Socket.io (`src/socket/`) (nhiệm vụ 8)

Sau khi code module, đăng ký router vào `backend/src/app.ts` và bổ sung endpoints vào `backend/src/config/swagger.ts` + `docs/postman_collection.json`.
