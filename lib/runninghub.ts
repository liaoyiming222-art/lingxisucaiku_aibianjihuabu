const RUNNINGHUB_BASE_URL = "https://www.runninghub.ai"

export function getRunningHubApiKey() {
  const apiKey = process.env.RUNNINGHUB_API_KEY
  if (!apiKey) throw new Error("RUNNINGHUB_API_KEY 未配置")
  return apiKey
}

export async function runningHubFetch(path: string, init: RequestInit) {
  const response = await fetch(`${RUNNINGHUB_BASE_URL}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${getRunningHubApiKey()}`,
      ...init.headers,
    },
    cache: "no-store",
  })

  const data = await response.json().catch(() => null)
  if (!response.ok) {
    const message = data?.errorMessage || data?.message || `RunningHub 请求失败（${response.status}）`
    throw new Error(message)
  }
  return data
}
