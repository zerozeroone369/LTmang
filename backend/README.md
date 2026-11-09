# UniConnect Backend API

Backend REST API cho dự án **UniConnect — Mạng xã hội sinh viên**, xây dựng theo kiến trúc **Clean Architecture (Routes -> Validators -> Controllers -> Services -> Repositories)** sử dụng **Node.js + Express + TypeScript + Prisma ORM**.

## 1. Cài đặt & Khởi chạy

```bash
cd backend
npm install
cp .env.example .env
npx prisma generate
npx prisma migrate dev
npm run prisma:seed
npm run dev
```

- API Server: `http://localhost:4000`
- Swagger UI: `http://localhost:4000/api-docs`
- Health Check: `http://localhost:4000/api/health`

## 2. Tài khoản mẫu sau khi Seed (chỉ dùng cho môi trường dev)

- **Admin:** `admin@uniconnect.edu.vn` / `Admin@123456` (có thể cấu hình qua `SEED_ADMIN_PASSWORD`)
- **Sinh viên:** `anh_2351220089@dau.edu.vn` (hoặc MSSV `2351220089`) / `Student@123456`

## 3. Kiểm thử & Chất lượng mã nguồn

```bash
npm test          # Chạy Unit + Integration tests (Vitest + Supertest)
npm run lint      # Kiểm tra ESLint
npm run format    # Định dạng code bằng Prettier
npm run build     # Kiểm tra biên dịch TypeScript
```
