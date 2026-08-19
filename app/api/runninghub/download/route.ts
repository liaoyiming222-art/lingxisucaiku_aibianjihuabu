import { NextRequest, NextResponse } from "next/server"

function isAllowedImageHost(hostname: string) {
  return hostname === "runninghub.ai"
    || hostname.endsWith(".runninghub.ai")
    || hostname === "runninghub.cn"
    || hostname.endsWith(".runninghub.cn")
    || hostname.endsWith(".myqcloud.com")
}

export async function GET(request: NextRequest) {
  const rawUrl = request.nextUrl.searchParams.get("url")
  if (!rawUrl) return NextResponse.json({ error: "缺少图片地址" }, { status: 400 })

  let imageUrl: URL
  try {
    imageUrl = new URL(rawUrl)
  } catch {
    return NextResponse.json({ error: "图片地址无效" }, { status: 400 })
  }

  if (imageUrl.protocol !== "https:" || !isAllowedImageHost(imageUrl.hostname)) {
    return NextResponse.json({ error: "不支持下载该图片地址" }, { status: 403 })
  }

  const response = await fetch(imageUrl, { cache: "no-store" })
  const contentType = response.headers.get("content-type") || ""
  if (!response.ok || !contentType.startsWith("image/")) {
    return NextResponse.json({ error: "图片下载失败" }, { status: 502 })
  }

  return new Response(response.body, {
    headers: {
      "Content-Type": contentType,
      "Content-Disposition": 'attachment; filename="runninghub-result.png"',
      "Cache-Control": "private, no-store",
    },
  })
}
