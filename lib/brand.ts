// Cấu hình thương hiệu — đổi qua biến môi trường, không hardcode lung tung
export const BRAND = {
  name: process.env.NEXT_PUBLIC_BRAND_NAME ?? "LUMA",
  tagline: "Định hình phong cách mỗi ngày",
  phone: "0901 234 567",
  email: "hello@luma.vn",
  address: "123 Nguyễn Thị Minh Khai, Quận 3, TP. Hồ Chí Minh",
  hours: "8:00 – 21:00 mỗi ngày",
  social: { facebook: "https://facebook.com/lumafashion", instagram: "https://instagram.com/lumafashion", tiktok: "https://tiktok.com/@lumafashion", youtube: "https://youtube.com/@lumafashion" },
};
