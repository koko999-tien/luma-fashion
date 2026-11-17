import { NextResponse } from "next/server";
import { randomBytes } from "crypto";
import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { requireAdmin } from "@/lib/auth";

const UPLOAD_DIR = path.join(process.cwd(), ".uploads");
const MAX_BYTES = 5 * 1024 * 1024;
const ALLOWED: { ext: string; mime: string; sniff: (buf: Buffer) => boolean }[] = [
  { ext: "jpg", mime: "image/jpeg", sniff: (b) => b.length > 3 && b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff },
  { ext: "png", mime: "image/png", sniff: (b) => b.length > 8 && b[0] === 0x89 && b[1] === 0x50 && b[2] === 0x4e && b[3] === 0x47 },
  { ext: "webp", mime: "image/webp", sniff: (b) => b.length > 12 && b.toString("ascii", 0, 4) === "RIFF" && b.toString("ascii", 8, 12) === "WEBP" },
  { ext: "gif", mime: "image/gif", sniff: (b) => b.length > 6 && b.toString("ascii", 0, 4) === "GIF8" },
];

export async function POST(req: Request) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ message: "Không có quyền truy cập" }, { status: 403 });

  const form = await req.formData().catch(() => null);
  if (!form) return NextResponse.json({ message: "Thiếu dữ liệu form" }, { status: 400 });

  const files = form.getAll("files").filter((v): v is File => v instanceof File);
  if (files.length === 0) return NextResponse.json({ message: "Chưa chọn file" }, { status: 400 });
  if (files.length > 10) return NextResponse.json({ message: "Tối đa 10 ảnh mỗi lần upload" }, { status: 400 });

  await mkdir(UPLOAD_DIR, { recursive: true });
  const urls: string[] = [];
  for (const file of files) {
    if (file.size > MAX_BYTES) return NextResponse.json({ message: `Ảnh "${file.name}" quá lớn (tối đa 5MB)` }, { status: 400 });
    const buf = Buffer.from(await file.arrayBuffer());
    // Kiểm tra loại file THẬT qua magic bytes, không tin extension/MIME từ client
    const match = ALLOWED.find((a) => a.sniff(buf));
    if (!match) return NextResponse.json({ message: `Ảnh "${file.name}" không phải JPG/PNG/WEBP/GIF hợp lệ` }, { status: 400 });
    const name = `${Date.now().toString(36)}-${randomBytes(8).toString("hex")}.${match.ext}`;
    await writeFile(path.join(UPLOAD_DIR, name), buf);
    urls.push(`/api/files/${name}`);
  }
  return NextResponse.json({ ok: true, urls });
}
