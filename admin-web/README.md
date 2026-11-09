# UniConnect Admin Web Dashboard

Giao diện quản trị dành cho Admin (Nhiệm vụ 2 — Nguyễn Ngô Tú Anh), xây dựng bằng **React + TypeScript + Vite + Tailwind CSS + Axios**.

## Khởi chạy

```bash
cd admin-web
npm install
cp .env.example .env
npm run dev
```

Truy cập: `http://localhost:5173` (đảm bảo Backend đang chạy tại `http://localhost:4000`).

## Các màn hình chính
- `/login`: Đăng nhập Admin (chặn tài khoản Sinh viên).
- `/`: Tổng quan KPI hệ thống, báo cáo vi phạm chờ duyệt, nhật ký gần đây.
- `/users`: Quản lý người dùng, khóa/mở khóa tài khoản kèm lý do, phân quyền Admin/Sinh viên.
- `/moderation`: Kiểm duyệt bài viết & xử lý báo cáo vi phạm.
- `/campus`: Đăng, chỉnh sửa, ghim, ẩn/hiện và xóa tin tức Campus.
- `/academic`: Quản lý cấu trúc Trường → Khoa → Ngành → Khóa → Lớp.
- `/settings`: Nhật ký Admin (`AdminLogs`) và Cấu hình hệ thống (`SystemSettings`).
