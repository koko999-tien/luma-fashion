"use client";
import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, FileUp, Download, Loader2, CheckCircle2, AlertTriangle } from "lucide-react";

export default function ProductImportPage() {
  const [csvText, setCsvText] = useState("");
  const [fileName, setFileName] = useState("");
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<{ ok: boolean; mode?: string; products?: number; variants?: number; errors?: { line: number; field: string; message: string }[]; message?: string; imported?: { name: string }[] } | null>(null);

  const field = "w-full rounded-lg border border-white/15 bg-white/5 px-3 py-2.5 text-[11px] font-mono text-white outline-none focus:border-accent placeholder-white/25";

  const readFile = async (f: File) => {
    if (!f.name.toLowerCase().endsWith(".csv")) { setResult({ ok: false, message: "Chỉ nhận file .csv" }); return; }
    if (f.size > 2_000_000) { setResult({ ok: false, message: "File quá lớn (tối đa 2MB)" }); return; }
    setFileName(f.name);
    setCsvText(await f.text());
    setResult(null);
  };

  const run = async (mode: "preview" | "commit") => {
    if (!csvText || busy) return;
    setBusy(true);
    try {
      const res = await fetch("/api/admin/products/import", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ csv: csvText, mode }) });
      setResult(await res.json());
    } catch {
      setResult({ ok: false, message: "Lỗi kết nối" });
    } finally { setBusy(false); }
  };

  return (
    <div className="max-w-4xl">
      <Link href="/admin/products" className="text-[12px] text-white/50 flex items-center gap-1.5 hover:text-white"><ArrowLeft size={14} /> Danh sách sản phẩm</Link>
      <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-white mt-2">Nhập sản phẩm từ CSV</h1>
      <p className="text-[11px] text-white/40 mt-1">Mỗi dòng = 1 biến thể (size/màu). Các dòng cùng <code className="text-amber-300">name</code> được gom thành 1 sản phẩm. Luôn kiểm tra ở bước Preview trước khi ghi.</p>

      <div className="mt-5 grid lg:grid-cols-2 gap-5">
        <div className="rounded-2xl bg-white/5 border border-white/10 p-5">
          <a href="/api/admin/products/import/template" download className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-sky-300 hover:text-sky-200"><Download size={15} /> Tải file mẫu (template.csv)</a>
          <div className="mt-4">
            <label htmlFor="csvfile" className="flex flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-white/15 py-8 cursor-pointer hover:border-accent transition-colors">
              <FileUp size={28} className="text-white/35" />
              <span className="text-xs text-white/60">{fileName ? <>Đã chọn: <b className="text-white">{fileName}</b></> : "Bấm để chọn file .csv"}</span>
            </label>
            <input id="csvfile" type="file" accept=".csv,text/csv" className="hidden" onChange={(e) => e.target.files?.[0] && readFile(e.target.files[0])} />
          </div>
          <details className="mt-3 text-[11px] text-white/40">
            <summary className="cursor-pointer">Hoặc dán nội dung CSV trực tiếp</summary>
            <textarea className={`${field} mt-2 min-h-[140px]`} value={csvText} onChange={(e) => { setCsvText(e.target.value); setFileName("paste"); }} placeholder={"name,description,categorySlug,...\nÁo Thun,Mô tả...,ao,basic-essentials,UNISEX,199000,,true,false,false,https://…,M,Đen,#111111,30,SKU-001"} />
          </details>
          <div className="mt-4 flex gap-2">
            <button onClick={() => run("preview")} disabled={!csvText || busy} className="flex-1 rounded-xl border border-sky-400/40 text-sky-300 py-3 text-xs font-bold uppercase tracking-wider hover:bg-sky-400/10 disabled:opacity-40">{busy ? <Loader2 size={15} className="animate-spin mx-auto" /> : "1. Preview"}</button>
            <button onClick={() => { if (confirm("Ghi dữ liệu vào database? Nếu có bất kỳ lỗi nào, toàn bộ import sẽ bị hủy (rollback).")) run("commit"); }} disabled={!csvText || busy} className="flex-1 rounded-xl bg-accent text-white py-3 text-xs font-bold uppercase tracking-wider hover:bg-accentdark disabled:opacity-40">{busy ? <Loader2 size={15} className="animate-spin mx-auto" /> : "2. Import"}</button>
          </div>
        </div>

        <div className="rounded-2xl bg-white/5 border border-white/10 p-5">
          <h2 className="text-[10px] font-bold uppercase tracking-widest text-white/45">Kết quả</h2>
          {!result && <p className="mt-3 text-[12px] text-white/35">Preview sẽ hiển thị số sản phẩm/biến thể hợp lệ hoặc danh sách lỗi theo từng dòng.</p>}
          {result?.ok && result.mode === "preview" && (
            <p className="mt-3 flex items-start gap-2 text-emerald-400 text-sm font-semibold"><CheckCircle2 size={18} className="shrink-0" /> Hợp lệ: {result.products} sản phẩm • {result.variants} biến thể. Bấm “2. Import” để ghi.</p>
          )}
          {result?.ok && result.mode === "commit" && (
            <div className="mt-3 text-emerald-400 text-sm font-semibold"><p className="flex items-center gap-2"><CheckCircle2 size={18} /> Import thành công {result.imported?.length ?? 0} sản phẩm!</p><ul className="mt-2 text-[11px] text-white/60 list-disc pl-6">{result.imported?.slice(0, 8).map((p) => <li key={p.name}>{p.name}</li>)}</ul></div>
          )}
          {result && !result.ok && (
            <div className="mt-3">
              <p className="flex items-center gap-2 text-orange-400 text-sm font-semibold"><AlertTriangle size={17} /> {result.message ?? `Dữ liệu chưa hợp lệ${result.errors ? ` — ${result.errors.length} lỗi` : ""}`}</p>
              {result.errors && <ul className="mt-2 max-h-64 overflow-y-auto space-y-1 text-[11px] font-mono text-orange-200/80">{result.errors.map((e, i) => <li key={i}>Dòng {e.line} • {e.field}: {e.message}</li>)}</ul>}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
