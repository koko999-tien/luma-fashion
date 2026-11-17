# LUMA FASHION — Hướng dẫn migrate SQLite → PostgreSQL

**Nguyên tắc: KHÔNG đụng vào SQLite gốc.** Mọi bước làm trên database PostgreSQL mới; SQLite được giữ làm backup.

---

## 0. Trước khi migrate

- [ ] File `prisma/dev.db` còn nguyên (backup sẵn có `prisma/dev.db.backup-*`)
- [ ] PostgreSQL đã chạy (local hoặc Supabase/Neon/Railway)
- [ ] Đã tạo database rỗng, ví dụ: `luma_fashion`

## 1. Đếm dữ liệu hiện tại (SQLite)

```bash
cd D:\luma-fashion
node -e "const{PrismaClient}=require('@prisma/client');const p=new PrismaClient();(async()=>{for(const m of ['user','product','productVariant','productImage','category','collection','order','orderItem','coupon','review','banner','setting']){console.log(m, await p[m].count())}})().catch(e=>{console.error(e);process.exit(1)}).finally(()=>p.\$disconnect())"
```

Ghi lại các con số.

## 2. Tạo baseline migration (thay cho `db push`)

```bash
# Tạm đổi provider trong prisma/schema.prisma:
#   provider = "sqlite"  →  "postgresql"
# Và .env:
#   DATABASE_URL = "postgresql://user:password@localhost:5432/luma_fashion?schema=public"
mkdir prisma\migrations
npx prisma migrate dev --name init_postgres
```

`migrate dev` sinh thư mục `prisma/migrations/<timestamp>_init_postgres/migration.sql` — đây là migration file cần commit.

## 3. Chuyển dữ liệu

Dùng [pgloader](https://pgloader.io) (khuyến nghị, tự xử lý kiểu dữ liệu):

```bash
pgloader sqlite:///D:/luma-fashion/prisma/dev.db postgresql://user:pass@localhost:5432/luma_fashion
```

**Nếu không dùng được pgloader**, dùng script dump/restore thủ công:
1. Export từng bảng từ SQLite ra JSON (`node` + `@prisma/client`).
2. Sau khi trỏ `.env` sang Postgres và `migrate dev` xong (schema rỗng), import theo thứ tự phụ thuộc:
   `User → Address → Category → Collection → Product → ProductImage → ProductVariant → Cart → CartItem → WishlistItem → Coupon → CouponUsage → Order → OrderItem → OrderStatusHistory → Review → NewsletterSubscriber → Banner → Setting → ContactMessage → NotificationLog → InventoryTransaction → PasswordResetToken`
3. Cần giữ **nguyên ID** (cuid) để khóa ngoại không hỏng.

## 4. Kiểm chứng sau migrate

```bash
# Đổi .env.example/DATABASE_URL sang Postgres, rồi:
npm run build && npm start
```

Checklist bắt buộc:
- [ ] Đếm lại: `user`, `product`, `productVariant`, `order` … khớp bước 1
- [ ] Đăng nhập admin + user demo (`admin@luma.vn`, `user@luma.vn`)
- [ ] Mở 1 đơn hàng cũ trong `/admin/orders/[id]` — items, tổng tiền, địa chỉ đúng
- [ ] Tồn kho biến thể khớp SQLite
- [ ] Wishlist/reviews của tài khoản demo còn đủ
- [ ] Vào `/account/orders` — timeline trạng thái hiển thị đúng

**Chỉ tuyên bố hoàn tất khi mọi mục trên đều pass.**

## 5. Rollback

Nếu lỗi: đổi `.env` trỏ lại `DATABASE_URL="file:./dev.db"` và `provider = "sqlite"` — SQLite gốc chưa hề bị sửa. Không xóa database PostgreSQL mới cho đến khi chạy production ổn định ≥ 7 ngày.

## 6. Khác biệt SQLite → PostgreSQL cần lưu ý

- `@default(cuid())` sinh ở application layer — không phụ thuộc DB, giữ nguyên.
- Không có enum — schema dùng `String`, không ảnh hưởng.
- JSON không dùng trong dự án này — an toàn.
- `Boolean` ở Postgres là `BOOLEAN` thật — tương thích.
- **Backup định kỳ:** `pg_dump -U user luma_fashion > backup.sql` (thêm vào cron hàng ngày).
