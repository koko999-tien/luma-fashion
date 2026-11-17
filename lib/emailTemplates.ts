/** HTML email templates — định dạng thương hiệu LUMA (đen/kem/cam đất, serif) */
import { formatVND, ORDER_STATUS_LABEL, PAYMENT_METHOD_LABEL } from "./format";
import { BRAND } from "./brand";

const VND = formatVND;

function layout(preheader: string, body: string): string {
  return `<!DOCTYPE html><html lang="vi"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${BRAND.name}</title></head>
<body style="margin:0;padding:0;background:#F7F6F2;font-family:'Be Vietnam Pro',Arial,sans-serif;color:#111111;">
<span style="display:none;max-height:0;overflow:hidden;">${preheader}</span>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#F7F6F2;padding:24px 12px;">
  <tr><td align="center">
    <table role="presentation" width="560" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%;background:#ffffff;border:1px solid #EAEAEA;border-radius:16px;overflow:hidden;">
      <tr><td style="background:#111111;padding:18px 28px;"><span style="font-family:Georgia,'Times New Roman',serif;font-size:26px;font-weight:800;letter-spacing:4px;color:#ffffff;">${BRAND.name}<span style="color:#B4532A;">.</span></span></td></tr>
      <tr><td style="padding:28px;">${body}</td></tr>
      <tr><td style="border-top:1px solid #EAEAEA;padding:16px 28px;font-size:11px;color:#555555;">
        ${BRAND.name} Fashion — ${BRAND.address}<br>Hotline: ${BRAND.phone} • ${BRAND.email}<br><a href="${process.env.SITE_URL ?? "http://localhost:3000"}" style="color:#B4532A;text-decoration:none;">${(process.env.SITE_URL ?? "http://localhost:3000").replace(/^https?:\/\//, "")}</a>
      </td></tr>
    </table>
  </td></tr>
</table></body></html>`;
}

const h1 = (t: string) => `<h1 style="font-family:Georgia,'Times New Roman',serif;font-size:22px;margin:0 0 12px;color:#111111;">${t}</h1>`;
const p = (t: string) => `<p style="font-size:14px;line-height:22px;margin:0 0 14px;color:#333333;">${t}</p>`;
const btn = (href: string, t: string) => `<a href="${href}" style="display:inline-block;background:#B4532A;color:#ffffff;text-decoration:none;font-size:13px;font-weight:700;letter-spacing:1px;text-transform:uppercase;padding:13px 26px;border-radius:999px;">${t}</a>`;
const infoBox = (content: string) => `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#F7F6F2;border-radius:12px;margin:14px 0;"><tr><td style="padding:14px 18px;font-size:12px;line-height:20px;color:#333333;">${content}</td></tr></table>`;

type OrderLike = {
  orderNumber: string; customerName: string; email: string; phone: string;
  addressLine: string; ward: string | null; district: string; city: string;
  paymentMethod: string; shippingMethod: string; subtotal: number; discount: number; shippingFee: number; total: number;
  couponCode: string | null; note: string | null; shippingTracking?: string | null;
  items: { productName: string; sku: string; size: string; color: string; quantity: number; price: number }[];
};

function itemsTable(order: OrderLike): string {
  const rows = order.items.map((i) => `<tr>
    <td style="padding:8px 0;border-bottom:1px solid #EAEAEA;font-size:12px;">${i.productName}<br><span style="color:#888888;font-size:10px;">Size ${i.size} • ${i.color} • SKU ${i.sku} • x${i.quantity}</span></td>
    <td style="padding:8px 0;border-bottom:1px solid #EAEAEA;font-size:12px;text-align:right;white-space:nowrap;">${VND(i.price * i.quantity)}</td>
  </tr>`).join("");
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:14px 0;">${rows}</table>`;
}
function totalsBox(order: OrderLike): string {
  const line = (l: string, v: string, bold = false) => `<tr><td style="padding:3px 0;font-size:12px;color:#555555;${bold ? "font-weight:800;color:#111111;font-size:14px;" : ""}">${l}</td><td style="padding:3px 0;font-size:12px;text-align:right;${bold ? "font-weight:800;color:#B4532A;font-size:14px;" : ""}">${v}</td></tr>`;
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0">
    ${line("Tạm tính", VND(order.subtotal))}
    ${order.discount > 0 ? line(`Giảm giá${order.couponCode ? ` (${order.couponCode})` : ""}`, "-" + VND(order.discount)) : ""}
    ${line("Phí vận chuyển", order.shippingFee === 0 ? "Miễn phí" : VND(order.shippingFee))}
    ${line("Tổng cộng", VND(order.total), true)}
  </table>`;
}
const addressBlock = (order: OrderLike) => infoBox(`<b>Giao đến:</b><br>${order.customerName} — ${order.phone}<br>${order.addressLine}${order.ward ? `, ${order.ward}` : ""}, ${order.district}, ${order.city}${order.note ? `<br><i>Ghi chú: ${order.note}</i>` : ""}<br><b>Thanh toán:</b> ${PAYMENT_METHOD_LABEL[order.paymentMethod] ?? order.paymentMethod}<br><b>Vận chuyển:</b> ${order.shippingMethod === "EXPRESS" ? "Hoả tốc" : "Tiêu chuẩn"}`);

export function welcomeEmail(name: string): { subject: string; html: string } {
  return { subject: `Chào mừng bạn đến với ${BRAND.name}! 🎉`, html: layout("Chào mừng thành viên mới", h1(`Chào mừng, ${name}!`) + p("Cảm ơn bạn đã trở thành thành viên LUMA. Bạn được nhận <b>ưu đãi 10%</b> cho đơn đầu tiên khi đăng ký nhận tin — và nhiều chương trình dành riêng cho thành viên.") + `<p style="margin-top:20px;">${btn(`${process.env.SITE_URL ?? ""}/products`, "Khám phá sản phẩm")}</p>`) };
}

export function passwordResetEmail(link: string): { subject: string; html: string } {
  return { subject: "Đặt lại mật khẩu LUMA", html: layout("Đặt lại mật khẩu", h1("Đặt lại mật khẩu") + p("Chúng tôi nhận được yêu cầu đặt lại mật khẩu cho tài khoản của bạn. Bấm nút dưới đây trong vòng <b>1 giờ</b>:") + `<p style="margin:20px 0;">${btn(link, "Đặt lại mật khẩu")}</p>` + p("Nếu bạn không yêu cầu điều này, hãy bỏ qua email — mật khẩu của bạn không thay đổi.")) };
}

export function orderConfirmationEmail(order: OrderLike): { subject: string; html: string } {
  return { subject: `[${BRAND.name}] Xác nhận đơn hàng ${order.orderNumber}`, html: layout(`Xác nhận đơn hàng ${order.orderNumber}`, h1("Đặt hàng thành công!") + p(`Cảm ơn <b>${order.customerName}</b>! Chúng tôi đã nhận đơn <b>${order.orderNumber}</b> và sẽ sớm liên hệ xác nhận.`) + itemsTable(order) + totalsBox(order) + addressBlock(order) + `<p style="margin-top:18px;">${btn(`${process.env.SITE_URL ?? ""}/order-confirmation?order=${order.orderNumber}`, "Xem đơn hàng")}</p>`) };
}

export function orderStatusEmail(order: OrderLike, status: string): { subject: string; html: string } {
  const label = ORDER_STATUS_LABEL[status] ?? status;
  const extra = status === "SHIPPED" && order.shippingTracking ? infoBox(`<b>Mã vận đơn:</b> ${order.shippingTracking}`) : "";
  return { subject: `[${BRAND.name}] Đơn ${order.orderNumber}: ${label}`, html: layout(`Đơn ${order.orderNumber} — ${label}`, h1(label) + p(`Đơn hàng <b>${order.orderNumber}</b> của bạn vừa cập nhật trạng thái: <b>${label}</b>.`) + extra + addressBlock(order)) };
}

export function paymentConfirmedEmail(order: OrderLike): { subject: string; html: string } {
  return { subject: `[${BRAND.name}] Đã nhận thanh toán — ${order.orderNumber}`, html: layout(`Đã nhận thanh toán ${order.orderNumber}`, h1("Thanh toán thành công") + p(`Chúng tôi đã nhận thanh toán cho đơn <b>${order.orderNumber}</b>. Cảm ơn bạn! Đơn hàng sẽ được xử lý ngay.`) + totalsBox(order) + addressBlock(order)) };
}

export function cancelledEmail(order: OrderLike): { subject: string; html: string } {
  return { subject: `[${BRAND.name}] Đơn ${order.orderNumber} đã huỷ`, html: layout(`Đơn ${order.orderNumber} đã huỷ`, h1("Đơn hàng đã huỷ") + p(`Đơn hàng <b>${order.orderNumber}</b> của bạn đã được huỷ. Nếu bạn thanh toán chuyển khoản mà tiền đã trừ, LUMA sẽ hoàn tiền trong 3–5 ngày làm việc.`) + infoBox(`Thắc mắc? Gọi ${BRAND.phone} hoặc reply email này.`)) };
}
