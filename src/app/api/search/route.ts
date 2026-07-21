import { NextRequest, NextResponse } from "next/server";
import { searchArticlesPaged } from "@/lib/data";

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get("q")?.trim() ?? "";
  if (!q) return NextResponse.json({ items: [] });

  const { items } = await searchArticlesPaged(q, 1, 6);
  return NextResponse.json({
    items: items.map((a) => ({
      id: a.id,
      title: a.title,
      author: a.author,
      category: a.category,
    })),
  });
}
