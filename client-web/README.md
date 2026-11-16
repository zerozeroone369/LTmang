# UniConnect Client Web & Desktop Application

Mạng xã hội học tập và cộng đồng dành cho sinh viên đại học UniConnect, xây dựng bằng **React 19 + TypeScript + Vite + Tailwind CSS v4 + Axios + Electron**.

## 1. Các Module Đã Triển Khai Trong Client

- **Module 1: Tài khoản & Core Auth (Tú Anh - Leader):**
  - Đăng ký tài khoản cascading dropdowns: Chọn Trường → Tự động nạp Khoa & Khóa → Chọn Ngành → Lọc danh sách Lớp sinh viên từ API CSDL.
  - Đăng nhập linh hoạt bằng Email trường hoặc Mã sinh viên (MSSV); tích hợp nút chọn nhanh tài khoản mẫu để chấm thi.
  - Hồ sơ cá nhân: **Thẻ sinh viên ảo (Virtual Student ID Card)** có mã vạch mô phỏng, avatar, bio, thông tin lớp học; form đổi mật khẩu.
- **Module 2: Cộng đồng sinh viên (Duy):**
  - Không gian cộng đồng phân cấp (Trường, Khoa, Ngành, Khóa, Lớp).
  - Tự động hiển thị danh sách sinh viên cùng lớp/khoa.
- **Module 3: Bài viết & Tương tác (Duy):**
  - Soạn bài viết kèm phạm vi chia sẻ (Lớp, Khóa, Khoa, Trường).
  - Tương tác thả tim Like realtime (toggle chống trùng lặp), bình luận trao đổi.
  - Nút Báo cáo vi phạm gửi về Admin Dashboard.
- **Khung giao diện đa nền tảng:**
  - Khung Web chuẩn mạng xã hội (`ClientLayout.tsx`).
  - Khung ứng dụng máy tính Desktop App (`DesktopAppLayout.tsx`).
  - Khung giả lập ứng dụng di động Mobile App (`MobileLayout.tsx`).

## 2. Khởi chạy ứng dụng

### Chạy trên trình duyệt Web (Port `5174`):
```bash
npm install
npm run dev
```
Truy cập: `http://localhost:5174` (yêu cầu Backend chạy tại `http://localhost:4000`).

### Chạy ứng dụng máy tính nguyên bản (Electron):
```bash
npm run electron
```

## 3. Kiểm thử & Đóng gói
```bash
npm run lint      # Kiểm tra cú pháp ESLint
npm run build     # Biên dịch TypeScript và đóng gói Vite production
```
