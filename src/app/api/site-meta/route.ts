import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const url = req.nextUrl.searchParams.get("url");
  if (!url) return NextResponse.json({ error: "Missing url" }, { status: 400 });

  try {
    const res = await fetch(url, {
      headers: { "User-Agent": "Mozilla/5.0 (compatible; BloomBot/1.0)" },
      signal: AbortSignal.timeout(5000),
    });
    const html = await res.text();
    const ogMatch = html.match(/<meta[^>]*property=["']og:title["'][^>]*content=["']([^"']+)["']/i);
    const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
    const title = ogMatch?.[1] || titleMatch?.[1] || "";
    return NextResponse.json({ title: title.trim().slice(0, 100) });
  } catch {
    return NextResponse.json({ title: "" });
  }
}
