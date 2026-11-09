## Mô tả thay đổi
<!-- Mô tả ngắn gọn chức năng hoặc bản sửa lỗi trong PR này -->

## Nhiệm vụ liên quan
- Thành viên thực hiện:
- Nhiệm vụ / Module:
- Nhánh nguồn -> đích: `feature/...` -> `main`

## Checklist bắt buộc trước khi gửi PR
- [ ] Đã rẽ nhánh riêng từ `main`, không push trực tiếp lên `main`
- [ ] Code tuân thủ Clean Architecture (Controller -> Service -> Repository)
- [ ] Không hardcode secrets/token/password (đã sử dụng `.env`)
- [ ] Đã chạy linter / formatter (`npm run lint`, `npm run format:check`)
- [ ] Đã chạy unit/integration tests và tất cả đều pass (`npm test`)
- [ ] Đã cập nhật Swagger / Postman Collection / DTO docs (nếu có thay đổi API)
