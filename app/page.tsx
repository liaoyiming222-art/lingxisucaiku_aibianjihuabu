"use client"

import { useState } from "react"
import Image from "next/image"
import { Star, ThumbsUp, ThumbsDown, Sparkles } from "lucide-react"
import { TopNav } from "@/components/site/top-nav"
import { LeftRail } from "@/components/site/left-rail"
import { InspirationDetail } from "@/components/gallery/inspiration-detail"
import { AiEditModal } from "@/components/ai-editor/ai-edit-modal"

const categories = ["全部", "卧室", "客厅", "餐厅", "儿童房", "办公室"]

const gallery = [
  { title: "现代客厅 · 落地窗", img: "/images/living-room.png", featured: true },
  { title: "撞色实木儿童杂物架", img: "/images/kids-shelf.png", detail: true },
  { title: "现代厨房 · 大理石岛台", img: "/images/kitchen.png" },
  { title: "简约客厅设计", img: "/images/living-room.png" },
  { title: "开放式厨房", img: "/images/kitchen.png" },
  { title: "儿童收纳方案", img: "/images/kids-shelf.png" },
]

export default function Page() {
  const [showDetail, setShowDetail] = useState(true)
  const [showEditor, setShowEditor] = useState(false)

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-[var(--color-zhimo-mint)]">
      <TopNav />

      <div className="flex min-h-0 flex-1">
        <LeftRail />

        {/* 画廊 */}
        <main className="flex-1 overflow-y-auto p-6">
          <div className="mb-5 flex flex-wrap items-center gap-2">
            {categories.map((c, i) => (
              <button
                key={c}
                className={`rounded-full px-4 py-1.5 text-sm transition-colors ${
                  i === 0
                    ? "bg-neutral-900 text-white"
                    : "bg-white text-neutral-600 hover:bg-neutral-100"
                }`}
              >
                {c}
              </button>
            ))}
          </div>

          <div className="columns-2 gap-4 sm:columns-3 lg:columns-4 [&>*]:mb-4">
            {gallery.map((item, i) => (
              <button
                key={i}
                onClick={() => item.detail && setShowDetail(true)}
                className="group relative block w-full overflow-hidden rounded-xl bg-white text-left shadow-sm transition-shadow hover:shadow-md"
              >
                <Image
                  src={item.img || "/placeholder.svg"}
                  alt={item.title}
                  width={400}
                  height={300}
                  className="h-auto w-full object-cover"
                />
                <div className="pointer-events-none absolute inset-0 flex items-end bg-gradient-to-t from-black/40 to-transparent p-3 opacity-0 transition-opacity group-hover:opacity-100">
                  <span className="text-sm font-medium text-white">{item.title}</span>
                </div>
                <div className="flex items-center gap-3 px-3 py-2 text-neutral-400">
                  <Star className="size-4" />
                  <ThumbsUp className="size-4" />
                  <ThumbsDown className="size-4" />
                  {item.detail && (
                    <span className="ml-auto flex items-center gap-1 rounded-full bg-[var(--color-zhimo-teal)]/15 px-2 py-0.5 text-[11px] font-medium text-[var(--color-zhimo-teal-soft)]">
                      <Sparkles className="size-3" />
                      可 AI 编辑
                    </span>
                  )}
                </div>
              </button>
            ))}
          </div>
        </main>
      </div>

      {showDetail && !showEditor && (
        <InspirationDetail
          onClose={() => setShowDetail(false)}
          onOpenEditor={() => setShowEditor(true)}
        />
      )}

      {showEditor && (
        <AiEditModal
          onClose={() => setShowEditor(false)}
          sourceImage="/images/kids-shelf.png"
          sourceImageAlt="撞色实木儿童杂物架"
          sourceImageWidth={1024}
          sourceImageHeight={1024}
        />
      )}
    </div>
  )
}
