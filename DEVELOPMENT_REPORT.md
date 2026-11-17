# LUMA FASHION — DEVELOPMENT REPORT (tiếp quản → v1.1, 2026-11-04)

**Phạm vi:** D:\luma-fashion (không đụng D:\shop-thoi-trang). Không nâng major dependency (Next 15.5.29, Prisma 6.19.3, React 19.3, Tailwind 3.4).

---

## A. Đã hoàn thành / cải thiện

| # | Hạng mục | Chi tiết |
|---|---|---|
| 1 | **Audit** | `docs/AUDIT.md` — kiểm tra cấu trúc, schema, API, auth, tests (không có), tìm 24 vấn đề + kế hoạch theo stage |
| 2 | **Schema mở rộng (additive, backup trước khi push)** | `Category.description/sort/active`, `Collection.sort/active/isFeatured`, `Product.tags`, `InventoryTransaction.previousQty/newQty/type/adminId`, `NotificationLog` (mới), `Coupon.perCustomerLimit`, `Order.shippingTracking`, `CouponUsage.userId` |
| 3 | **Quản lý Danh mục** (`/admin/categories`) | CRUD + ẩn/hiện + thứ tự + slug tự sinh; xoá danh mục có sản phẩm → ẩn (không xoá); API + UI + storefront chỉ hiện danh mục active |
| 4 | **Quản lý Bộ sưu tập** (`/admin/collections`) | CRUD + Featured + gán/gỡ sản phẩm qua UI (tìm/thêm/xoá khỏi collection không xoá sản phẩm); xoá collection → gỡ liên kết |
| 5 | **Import sản phẩm CSV** | Template tải về (`/api/admin/products/import/template`), parse CSV chuẩn (hỗ trợ quoted fields), validate theo dòng (file trống dòng 1, thiếu cột, category/collection tồn tại, gender hợp lệ, basePrice/salePrice, colorHex, URL ảnh, SKU trùng trong file + DB), **preview** rồi **commit trong 1 transaction — 1 lỗi = rollback toàn bộ**; ghi `InventoryTransaction(type=INITIAL)` |
| 6 | **Export đơn hàng CSV** | `/api/admin/orders/export` — BOM UTF-8, escape chuẩn, chống CSV injection (`'` prefix cho cell bắt đầu `=+-@`), lọc q/status/paymentStatus/paymentMethod/from/to, admin-only, không lộ dữ liệu thừa |
| 7 | **Upload ảnh thật** | `POST /api/admin/uploads` — requireAdmin, kiểm **magic bytes** (JPEG/PNG/WEBP/GIF), ≤5MB, ≤10 file, tên random; lưu `.uploads/` ngoài public; phục vụ qua `GET /api/files/<name>` (chặn path traversal, nosniff, cache immutable); UI upload + preview trong form thêm/sửa sản phẩm; ảnh gắn vào sản phẩm qua PATCH images (đặt lại ảnh chính bằng thứ tự dòng) |
| 8 | **Kho hàng chuẩn hoá** | Mọi biến động kho ghi `previousQty/newQty/type/adminId`: `INITIAL` (import), `MANUAL_ADJUST` (admin sửa tồn), `ORDER_DEDUCTION`, `ORDER_CANCEL_RESTORE` (chỉ 1 lần — CANCELLED là trạng thái cuối) |
| 9 | **Chuyển trạng thái đơn hợp lệ** | `lib/orderStatus.ts`: PENDING→CONFIRMED→PROCESSING→PACKED→SHIPPED→DELIVERED→(RETURNED/REFUNDED), CANCELLED/REFUNDED terminal; API trả 400 nếu chuyển sai; client hiển thị lỗi tiếng Việt |
| 10 | **Email thật (Resend) + NotificationLog** | `lib/email.ts` (modular — đổi provider dễ), templates HTML thương hiệu LUMA; gắn vào: đăng ký (WELCOME), quên MK (PASSWORD_RESET), đặt hàng (ORDER_CONFIRMATION), đổi trạng thái admin (ORDER_STATUS/SHIPPED/DELIVERED/CANCELLED), xác nhận thanh toán (PAYMENT_CONFIRMED); lỗi email KHÔNG phá đơn hàng; mọi lượt gửi được ghi log với status SENT/FAILED/DISABLED |
| 11 | **Thanh toán online — module thật** | `lib/payments/{types,vnpay,momo,zalopay,index}.ts` + callback routes `/api/payment/{vnpay/return,momo/ipn,zalopay/callback}` — verify HMAC đúng spec công khai (VNPay SHA512 sorted params; MoMo SHA256 raw signature; ZaloPay SHA256), đối chiếu số tiền với đơn, **idempotent** (đã PAID → không gửi lại), orderId+amount bắt buộc; chưa cấu hình → cổng tự tắt (checkout trả 400 tiếng Việt), **không bao giờ tự đánh dấu PAID** |
| 12 | **Vận chuyển** | `lib/shipping/providers.ts`: GHN/GHTK/Viettel Post — interface quote/createShipment/track, configured=false khi thiếu env (không giả vờ); phí theo vùng miền qua Settings (`shipFeeRemote`): HCM/HN phí chuẩn, tỉnh khác phí vùng xa; mã vận đơn `shippingTracking` nhập ở admin, hiển thị cho khách, kèm trong email SHIPPED |
| 13 | **Bảo mật** | Rate limit (in-memory): login 10/5p, register 20/h, forgot 5/5p, checkout 10/p, coupon-validate 30/p (429 + Retry-After); `AUTH_SECRET` bắt buộc ở production (kiểm tra lúc chạy — build không ảnh hưởng); CSV injection escape; coupon **perCustomerLimit** (dùng CouponUsage.userId) |
| 14 | **Tài liệu** | `docs/AUDIT.md`, `docs/POSTGRESQL_MIGRATION.md`, `docs/DEPLOYMENT.md`, README cập nhật (v1.1 + env + cấu trúc), `.env.example` đầy đủ mọi biến |
| 15 | **Dọn dẹp** | Xoá 7 thư mục rỗng ở root (`about/`, `contact/`… — rác từ lệnh PowerShell trước) |

## B. Bug đã phát hiện & sửa

| Bug | Ảnh hưởng | Cách sửa |
|---|---|---|
| DB seed đặt SKU/variant ↔ email gửi sai nhánh `getSession()!` → crash `wishlist/page` | 500 ở /account/wishlist khi phiên cũ | `requireUser()` + redirect `/login` (đã fix ở bản trước, giữ nguyên) |
| `next.config.ts` → Next 15.5 không load được (lỗi `fileExists`) | Build fail | Chuyển sang `next.config.mjs` |
| Alias `@/*` không resolve trong client bundle | Build fail (4 file) | Khai báo `webpack.resolve.alias["@"]` trong `next.config.mjs` (giữ tsconfig paths) |
| `export function slugify` trong route handler → Next type check fail | Build fail | Tách `lib/slug.ts` |
| TypeScript 7.0.2 không tương thích Next 15.5 | Build fail | Ghim `typescript@~5.9.3` |
| 4 ảnh Unsplash 404 runtime (`1523381210434`, `1507680434567`, `1488160702438`, `1515886657613`) | Ảnh vỡ | Thay ID ảnh biết-tốt + build/test lại |
| Cookie `Secure` set trên HTTP localhost | Đăng nhập qua HTTP bị trình duyệt coi là không hợp lệ | `secure` chỉ bật khi `SITE_URL` bắt đầu bằng `https` |
| `getSession` JWT secret fallback yếu | Rủi ro production | Fail-fast ở production (`lib/auth.ts`) |
| Export CSV thiếu BOM + không escape + CSV injection | Excel vỡ chữ, nguy cơ công thức | `lib/csv.ts` (BOM, quote, `'` prefix) |
| Import CSV nửa vời nếu lỗi giữa chừng | Hỏng dữ liệu | Validate toàn bộ trước + `$transaction` + rollback |
| Hoàn kho 2 lần khi huỷ đơn nhiều lần | Sai tồn kho | CANCELLED terminal trong `ORDER_TRANSITIONS`; test đã chứng minh stock 39→40→(huỷ lần 2)→40, restoreTxCount giữ nguyên 1 |
| Đơn DELIVERED có thể "lùi" về PENDING/SHIPPED | Vô nghĩa nghiệp vụ | Transition guard trả 400 |

## C. Test đã chạy (thực tế, trên server đang chạy)

**Build:** `npx next build` → **exit 0**, 48 routes, không lỗi TypeScript.

**API/luồng (PowerShell + curl, server thật):**

| Test | Kết quả |
|---|---|
| Tất cả trang admin (12 trang) | 200 OK |
| Tạo/sửa/ẩn/xoá danh mục | OK; xoá danh mục có sản phẩm → `archived:true` |
| Tạo/sửa/gán sản phẩm/xoá bộ sưu tập | OK; sản phẩm giữ nguyên khi xoá collection |
| Export CSV | 200, `text/csv; charset=utf-8`, BOM có, header VN đúng, escape dấu phẩy/quote đúng |
| Import CSV lỗi (category không tồn tại + sale>gốc) | **422**, `{errors:[...]}` chỉ rõ dòng/field, DB không tạo gì |
| Import CSV hợp lệ (2 biến thể) | 200, 1 sản phẩm + 2 variants + inventory INITIAL |
| Import lại SKU đã tồn tại | **422** SKU trùng |
| Upload file không phải ảnh | chặn (magic bytes) |
| Upload PNG thật + GET `/api/files/<name>` | round-trip bytes khớp 100% |
| Path traversal `/api/files/../../evil.png` và file `.txt` | **404** |
| Guest: add → checkout COD (LM7185313651) → stock 40→39 | OK |
| Admin huỷ đơn → stock 39→40, `restoreTxCount=1` | OK |
| Huỷ lần 2 → stock giữ 40, `restoreTxCount` vẫn =1 | OK |
| Transition DELIVERED→PENDING / SHIPPED | **400** `Không thể chuyển từ "DELIVERED" sang …` |
| Email khi chưa có RESEND_API_KEY | Ghi NotificationLog `DISABLED`, không báo gửi |
| Khách thường gọi API admin | **403** |
| `/admin` với khách | **307 redirect** (không vào được) |

## D. Bảo mật — kết quả rà soát

- ✅ Password bcrypt 10 rounds; session JWT httpOnly; `Secure` tự bật khi HTTPS; `SameSite=lax`; hết hạn 30 ngày
- ✅ Admin check ở **server** mọi route `/api/admin/*` (không dựa vào ẩn nút)
- ✅ Khách chỉ đọc đơn của chính mình (`/account/orders/[orderNumber]` kiểm `userId`)
- ✅ Rate limit các endpoint nhạy cảm (429 + Retry-After)
- ✅ Upload: magic bytes, size ≤5MB, tên random, ngoài public, path traversal chặn, nosniff
- ✅ Payment callbacks verify HMAC trước khi đổi trạng thái; idempotent; đối chiếu amount/orderNumber
- ✅ Coupon: min order, max discount, expiry, usage limit, per-customer limit, validate server
- ✅ SQL injection: Prisma parameterized toàn bộ (không raw SQL)
- ✅ CSV injection escape; không trả stack trace ra client (chỉ message chuẩn hoá); secrets không vào bundle (chỉ `NEXT_PUBLIC_*`/`SITE_URL` lộ)
- ⚠️ Chưa test webhook/callback VNPay/MoMo/ZaloPay với merchant thật (không có credential); GHN/GHTK/ViettelPost `createShipment` Viettel Post cố ý trả lỗi "chưa triển khai" thay vì giả vờ
- ⚠️ Rate limit in-memory (1 instance); multi-instance → Redis

## E. Cần credential bên ngoài để hoàn tất

| Tính năng | Cần | Hành vi hiện tại |
|---|---|---|
| Email gửi thật | `RESEND_API_KEY` (+ verify domain) | Không gửi; NotificationLog `DISABLED`; log server |
| VNPay | `VNPAY_TMN_CODE`, `VNPAY_HASH_SECRET` | Cổng TẮT (400 tiếng Việt); không giả vờ |
| MoMo | `MOMO_PARTNER_CODE`, `MOMO_ACCESS_KEY`, `MOMO_SECRET_KEY` | Cổng TẮT |
| ZaloPay | `ZALOPAY_APP_ID`, `ZALOPAY_KEY1`, `ZALOPAY_KEY2` | Cổng TẮT |
| GHN / GHTK / Viettel Post | token (+ shop/id) | Provider `configured=false`; admin nhập mã vận đơn thủ công; phí ship theo Settings |
| Production DB | PostgreSQL (Supabase/Neon/Railway) | SQLite dev; migration: `docs/POSTGRESQL_MIGRATION.md` |
| Object storage (nhiều instance) | Supabase Storage / R2 / S3 | `.uploads/` local (đủ cho VPS/1 instance) |

## F. Giới hạn còn lại / việc tương lai

- Chưa có quản lý người dùng admin (phân quyền theo permission — hiện single ADMIN role)
- Chưa có audit log cho thao tác admin ngoài order/inventory (Settings/banner/product edit không lưu ai làm)
- `rating` filter sort in-memory
- NotificationLog chưa có trang xem trong admin (query SQL hoặc thêm trang — đề xuất việc tiếp)
- Email HTML chưa test render thật (Gmail/Outlook) — template chuẩn table-layout, nhưng chưa screenshot
- Test tự động: chưa có unit/e2e runner; smoke test thủ công ghi ở mục C (nên thêm Playwright khi CI sẵn sàng)
