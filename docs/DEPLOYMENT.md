# LUMA FASHION — Hướng dẫn Deploy Production (Vercel + PostgreSQL)

## Checklist trước khi deploy

- [ ] `npm run build` pass trên máy local
- [ ] PostgreSQL đã tạo (Supabase / Neon / Railway)
- [ ] Đã chạy migration theo `docs/POSTGRESQL_MIGRATION.md` và verify dữ liệu
- [ ] `.env` không bao giờ được commit (đã có trong `.gitignore`)
- [ ] `AUTH_SECRET` production ngẫu nhiên ≥ 32 ký tự (`openssl rand -base64 32`)

## 1. Đẩy code lên GitHub

```bash
git init && git add . && git commit -m "LUMA Fashion — production"
git remote add origin https://github.com/<ban>/luma-fashion.git && git push -u origin main
```

## 2. Import vào Vercel

1. vercel.com → Add New Project → chọn repo.
2. Framework Preset: **Next.js** (tự nhận). Root directory: mặc định.
3. Environment Variables (Production):

| Biến | Giá trị |
|---|---|
| `DATABASE_URL` | `postgresql://…` (internal/pooler URL của Supabase/Neon) |
| `AUTH_SECRET` | chuỗi random ≥ 32 ký tự |
| `SITE_URL` | `https://shop.tenmien.vn` |
| `RESEND_API_KEY` | (nếu có) — Resend API key |
| `EMAIL_FROM` | `LUMA Fashion <noreply@tenmien.vn>` |
| `EMAIL_REPLY_TO` | `hello@tenmien.vn` |
| `VNPAY_*` / `MOMO_*` / `ZALOPAY_*` | khi ký hợp đồng merchant |
| `GHN_*` / `GHTK_*` / `VIETTELPOST_*` | khi có tài khoản nhà vận chuyển |

4. Deploy.
5. Sau deploy đầu: chạy `npx prisma migrate deploy` (hoặc `db push` lần đầu) với `DATABASE_URL` production — Vercel không tự chạy. Có thể chạy local: `$env:DATABASE_URL="postgresql://…"; npx prisma migrate deploy`.

## 3. Domain & HTTPS

- Vercel → Settings → Domains → thêm `shop.tenmien.vn` → trỏ CNAME `cname.vercel-dns.com` (hoặc A record theo hướng dẫn).
- HTTPS tự động (Let's Encrypt). Khi `SITE_URL=https://…`, cookie session tự bật `Secure` (code đã xử lý).

## 4. Object storage cho ảnh upload (khi cần scale)

Ảnh upload hiện lưu ở `.uploads/` trên cùng server (phù hợp 1 instance / self-host / VPS Docker). Với Vercel serverless (filesystem tạm thời, nhiều instance), ảnh sẽ mất khi redeploy → cần chuyển sang object storage:

- **Khuyến nghị:** Supabase Storage / Cloudflare R2 / S3.
- Thay `app/api/admin/uploads/route.ts`: sau khi validate magic bytes, `put` file lên bucket (private + signed URL, hoặc public bucket với tên random), trả về URL public.
- `/api/files/[name]` chỉ cần xoá khi đã migrate sang storage.
- Không cần đổi schema — ProductImage lưu URL (absolute hay relative đều được).

## 5. Email production (Resend)

1. resend.com → Verify domain (thêm DKIM/SPF vào DNS) → tạo API key.
2. Env: `RESEND_API_KEY`, `EMAIL_FROM="LUMA <noreply@tenmien.vn>"`, `EMAIL_REPLY_TO="hello@tenmien.vn"`.
3. Test: đăng ký tài khoản mới → phải nhận email chào mừng; đặt hàng → email xác nhận đơn; vào Admin đổi trạng thái → email cập nhật.
4. Kiểm tra bảng `NotificationLog` (qua SQL hoặc thêm trang admin): status `SENT` mới là đã gửi; `DISABLED` = chưa cấu hình key; `FAILED` = Resend lỗi (xem cột `error`).

**Không bao giờ tin rằng "đã gửi" khi chưa kiểm tra NotificationLog hoặc hộp thư thật.**

## 6. Thanh toán (khi có merchant)

| Cổng | Env cần | Test |
|---|---|---|
| VNPay | `VNPAY_TMN_CODE`, `VNPAY_HASH_SECRET`, `VNPAY_URL` (sandbox/production) | Đặt đơn → cổng sandbox → quay về `/api/payment/vnpay/return` → đơn tự chuyển PAID (verify chữ ký SHA512) |
| MoMo | `MOMO_PARTNER_CODE`, `MOMO_ACCESS_KEY`, `MOMO_SECRET_KEY`, `MOMO_ENDPOINT` | IPN POST `MoMo` → `/api/payment/momo/ipn` |
| ZaloPay | `ZALOPAY_APP_ID`, `ZALOPAY_KEY1`, `ZALOPAY_KEY2` | Callback POST → `/api/payment/zalopay/callback` |

**Nguyên tắc:** đơn chỉ chuyển PAID khi callback verify chữ ký đúng + số tiền khớp + mã đơn tồn tại. Return URL không bao giờ tự đánh dấu đã thanh toán. Nếu chưa có credential → cổng tự tắt (400 "chưa được cấu hình"), KHÔNG giả vờ thành công.

IPN endpoint phải public (không auth) — module đã verify chữ ký; không cần / không được bypass.

## 7. Vận chuyển (khi có tài khoản)

- GHN: `GHN_TOKEN`, `GHN_SHOP_ID` (+ `GHN_BASE_URL` sandbox/production) — tích hợp quote/create/track đã có trong `lib/shipping/providers.ts`.
- GHTK: `GHTK_TOKEN`, Viettel Post: `VIETTELPOST_TOKEN`.
- Phí ship hiển thị cho khách hiện dùng phí cấu hình trong Admin → Cài đặt (ưu tiên ổn định; quote live chỉ bật khi bạn test xong sandbox thật).
- Mã vận đơn nhập ở Admin → Chi tiết đơn → trường "Mã vận đơn" — khách xem tại `/account/orders/<mã đơn>`; email SHIPPED kèm mã vận đơn.

## 8. Backup & rollback

- **Backup:** `pg_dump` hàng ngày (cron/GitHub Action). Giữ tối thiểu 30 ngày.
- **Rollback deploy:** Vercel → Deployments → chọn bản cũ → Promote/Rollback (vài giây, không downtime).
- **Rollback DB:** restore từ `pg_dump` gần nhất vào database mới, đổi `DATABASE_URL`, redeploy.
- **Ảnh (.uploads):** backup thư mục này cùng lịch backup DB.

## 9. Smoke test sau mỗi deploy

- [ ] Mở trang chủ → 200, ảnh hiển thị
- [ ] `/products` → lọc theo danh mục hoạt động
- [ ] Thêm giỏ → checkout COD → nhận mã đơn
- [ ] Đăng nhập admin → `/admin` → dashboard có số liệu
- [ ] Đổi trạng thái đơn → khách nhận email (nếu đã cấu hình Resend)
- [ ] `/sitemap.xml`, `/robots.txt` trả 200

## 10. Vận hành hàng ngày

- Sáng: xem `/admin` — đơn chờ xác nhận, biến thể sắp hết hàng.
- Mỗi tuần: export CSV đơn hàng lưu trữ ngoài hệ thống.
- Mỗi tháng: rà `NotificationLog` (email lỗi), rà `InventoryTransaction` bất thường, đổi `AUTH_SECRET`? (không cần; chỉ đổi khi lộ).
