import { NextRequest, NextResponse } from "next/server";

function cleanNewsImageUrl(url: string): string {
  if (!url || typeof url !== "string") return url;
  try {
    let raw = url.replace(/&amp;/g, "&").trim();
    if (raw.includes("%2F") || raw.includes("%2f")) {
      try {
        const temp = new URL(raw);
        temp.pathname = decodeURIComponent(temp.pathname);
        raw = temp.toString();
      } catch {
        raw = raw.replace(/%2F/gi, "/");
      }
    }
    if (
      raw.includes("overlay=") ||
      raw.includes("ogImage=") ||
      raw.includes("watermark=") ||
      raw.includes("wm=") ||
      raw.includes("logo=")
    ) {
      const u = new URL(raw);
      u.searchParams.delete("overlay");
      u.searchParams.delete("overlay_position");
      u.searchParams.delete("overlay_width_pct");
      u.searchParams.delete("overlay_height_pct");
      u.searchParams.delete("ogImage");
      u.searchParams.delete("watermark");
      u.searchParams.delete("wm");
      u.searchParams.delete("logo");
      raw = u.toString();
    }
    return raw;
  } catch {
    return url
      .replace(/%2F/gi, "/")
      .replace(/[?&]overlay=[^&]+/gi, "")
      .replace(/[?&]overlay_position=[^&]+/gi, "")
      .replace(/[?&]overlay_width_pct=[^&]+/gi, "")
      .replace(/[?&]ogImage=[^&]+/gi, "")
      .replace(/[?&]watermark=[^&]+/gi, "")
      .replace(/[?&]wm=[^&]+/gi, "");
  }
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const articleUrl = searchParams.get("url");

  if (!articleUrl) {
    return NextResponse.json(
      { success: false, message: "URL is required" },
      { status: 400 }
    );
  }

  try {
    const res = await fetch(articleUrl, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      },
      next: { revalidate: 300 },
    });

    const html = await res.text();

    // 1. Check og:image
    const ogMatch =
      html.match(/<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i) ||
      html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:image["']/i);

    if (ogMatch && ogMatch[1] && !ogMatch[1].includes("/null")) {
      const cleanUrl = cleanNewsImageUrl(ogMatch[1].replace(/&amp;/g, "&"));
      return NextResponse.json({ success: true, imageUrl: cleanUrl });
    }

    // 2. Check twitter:image
    const twMatch =
      html.match(/<meta[^>]+name=["']twitter:image["'][^>]+content=["']([^"']+)["']/i) ||
      html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+name=["']twitter:image["']/i);

    if (twMatch && twMatch[1] && !twMatch[1].includes("/null")) {
      const cleanUrl = cleanNewsImageUrl(twMatch[1].replace(/&amp;/g, "&"));
      return NextResponse.json({ success: true, imageUrl: cleanUrl });
    }

    // 3. For Prothom Alo, extract slug and query API
    const slugMatch = articleUrl.match(/prothomalo\.com\/(?:[a-z0-9\-]+\/)*([a-z0-9]{8,})/i);
    if (slugMatch) {
      try {
        const pRes = await fetch(
          `https://www.prothomalo.com/api/v1/advanced-search?q=${slugMatch[1]}`
        );
        const pJson = await pRes.json();
        const story = pJson.items?.[0];
        if (story) {
          if (story["hero-image-s3-key"] && !story["hero-image-s3-key"].includes("null")) {
            return NextResponse.json({
              success: true,
              imageUrl: `https://media.prothomalo.com/${story["hero-image-s3-key"]}?w=1200&h=675&auto=format,compress&fit=max`,
            });
          }
          for (const card of story.cards || []) {
            for (const el of card["story-elements"] || []) {
              if (el.type === "image" && el["image-s3-key"] && !el["image-s3-key"].includes("null")) {
                return NextResponse.json({
                  success: true,
                  imageUrl: `https://media.prothomalo.com/${el["image-s3-key"]}?w=1200&h=675&auto=format,compress&fit=max`,
                });
              }
            }
          }
        }
      } catch {}
    }

    // 4. Look for the first large <img> tag inside html
    const imgMatches = html.matchAll(/<img[^>]+src=["'](https?:\/\/[^"']+)["'][^>]*>/gi);
    for (const match of imgMatches) {
      const src = match[1];
      if (
        src &&
        !src.includes("icon") &&
        !src.includes("logo") &&
        !src.includes("placeholder") &&
        !src.includes("/null") &&
        (src.includes(".jpg") || src.includes(".jpeg") || src.includes(".png") || src.includes(".webp"))
      ) {
        return NextResponse.json({ success: true, imageUrl: src });
      }
    }

    return NextResponse.json(
      { success: false, message: "No valid image found" },
      { status: 404 }
    );
  } catch (err: any) {
    return NextResponse.json(
      { success: false, message: err.message || "Failed to fetch article image" },
      { status: 500 }
    );
  }
}

