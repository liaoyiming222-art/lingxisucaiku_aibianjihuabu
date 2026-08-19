import { NextResponse } from "next/server"
import { runningHubFetch } from "@/lib/runninghub"

export const runtime = "nodejs"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const prompt = typeof body.prompt === "string" ? body.prompt.trim() : ""
    const imageUrls = Array.isArray(body.imageUrls) ? body.imageUrls.filter((url: unknown) => typeof url === "string") : []
    if (!prompt) return NextResponse.json({ error: "请输入替换描述" }, { status: 400 })
    if (imageUrls.length === 0 || imageUrls.length > 10) return NextResponse.json({ error: "请输入 1 至 10 张图片" }, { status: 400 })

    const data = await runningHubFetch("/openapi/v2/rhart-image-g-2/image-to-image", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        prompt,
        imageUrls,
        aspectRatio: body.aspectRatio || "4:3",
        resolution: body.resolution || "1k",
      }),
    })
    if (!data?.taskId) throw new Error(data?.errorMessage || "RunningHub 未返回任务 ID")
    return NextResponse.json(data)
  } catch (error) {
    const message = error instanceof Error ? error.message : "生成任务提交失败"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
