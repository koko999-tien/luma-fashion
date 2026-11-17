import { prisma } from "@/lib/prisma";
import HeaderClient from "./HeaderClient";

export default async function Header() {
  const [announcement, categories, collections] = await Promise.all([
    prisma.setting.findUnique({ where: { key: "announcement" } }),
    prisma.category.findMany({ where: { active: true }, orderBy: [{ sort: "asc" }, { name: "asc" }] }),
    prisma.collection.findMany({ take: 6, orderBy: { name: "asc" } }),
  ]);
  return <HeaderClient announcement={announcement?.value ?? "Chào mừng bạn đến với LUMA"} categories={categories.map(c => ({ slug: c.slug, name: c.name }))} collections={collections.map(c => ({ slug: c.slug, name: c.name }))} />;
}
