import { NextResponse } from "next/server"
import { runningHubFetch } from "@/lib/runninghub"

export const runtime = "nodejs"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    if (!body.taskId) return NextResponse.json({ error: "缺少任务 ID" }, { status: 400 })
    const data = await runningHubFetch("/openapi/v2/query", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ taskId: body.taskId }),
    })
    return NextResponse.json(data)
  } catch (error) {
    const message = error instanceof Error ? error.message : "任务状态查询失败"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
