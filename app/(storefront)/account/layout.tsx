import Link from "next/link";
import { requireUser } from "@/lib/requireUser";
import AccountNav from "@/components/AccountNav";

export default async function AccountLayout({ children }: { children: React.ReactNode }) {
  await requireUser();
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 grid lg:grid-cols-[240px_1fr] gap-6">
      <aside className="card p-4 h-fit lg:sticky lg:top-24">
        <AccountNav />
      </aside>
      <div>{children}</div>
    </div>
  );
}
