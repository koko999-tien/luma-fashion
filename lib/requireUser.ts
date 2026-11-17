import { redirect } from "next/navigation";
import { getSession } from "./auth";

/** Layout account yêu cầu đăng nhập — redirect về login nếu chưa */
export async function requireUser() {
  const session = await getSession();
  if (!session) redirect("/login?next=/account");
  return session;
}
