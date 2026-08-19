import { NextResponse } from "next/server"
import { runningHubFetch } from "@/lib/runninghub"

export const runtime = "nodejs"

const allowedTypes = new Set(["image/jpeg", "image/png", "image/webp"])
const maxFileSize = 10 * 1024 * 1024

export async function POST(request: Request) {
  try {
    const input = await request.formData()
    const file = input.get("file")
    if (!(file instanceof File)) return NextResponse.json({ error: "请选择图片文件" }, { status: 400 })
    if (!allowedTypes.has(file.type)) return NextResponse.json({ error: "仅支持 JPG、PNG、WebP" }, { status: 400 })
    if (file.size > maxFileSize) return NextResponse.json({ error: "图片不能超过 10MB" }, { status: 400 })

    const body = new FormData()
    body.append("file", file, file.name)
    const data = await runningHubFetch("/openapi/v2/media/upload/binary", { method: "POST", body })
    const downloadUrl = data?.data?.download_url
    if (!downloadUrl) throw new Error("RunningHub 未返回图片地址")
    return NextResponse.json({ url: downloadUrl, fileName: data.data.fileName })
  } catch (error) {
    const message = error instanceof Error ? error.message : "图片上传失败"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
