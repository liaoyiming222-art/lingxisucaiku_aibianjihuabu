"use client"

import Image from "next/image"
import { X, Star, ThumbsUp, ThumbsDown, Sparkles } from "lucide-react"

const tags = ["杂物架", "儿童房", "撞色拼接", "实木", "其他材质", "儿童", "清拍图"]

const related = [
  "彩色收纳城堡",
  "黄色儿童游乐区",
  "蓝色积木收纳",
  "绿色书架墙",
  "拱形木质展架",
]

export function InspirationDetail({
  onClose,
  onOpenEditor,
}: {
  onClose: () => void
  onOpenEditor: () => void
}) {
  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/30 p-4">
      <div className="relative flex max-h-[90vh] w-full max-w-6xl gap-5 overflow-hidden rounded-2xl bg-[var(--color-zhimo-mint)] p-5 shadow-2xl">
        {/* 标题 + 关闭 */}
        <div className="absolute left-6 top-4 text-base font-semibold text-neutral-800">
          灵感集详情
        </div>
        <button
          onClick={onClose}
          className="absolute right-4 top-4 flex size-8 items-center justify-center rounded-full text-neutral-500 hover:bg-black/5"
          aria-label="关闭"
        >
          <X className="size-5" />
        </button>

        {/* 左：主图 */}
        <div className="mt-10 flex flex-[1.4] items-center justify-center rounded-xl bg-white/60 p-6">
          <div className="group relative w-full overflow-hidden rounded-lg">
            <Image
              src="/images/kids-shelf.png"
              alt="撞色实木儿童杂物架"
              width={720}
              height={520}
              className="h-auto w-full rounded-lg object-cover"
            />
            <span className="absolute bottom-3 right-3 rounded-md bg-black/50 px-2 py-1 text-xs text-white">
              3D66 · 2026.07.10
            </span>

            {/* AI 编辑入口（步骤 1） */}
            <button
              onClick={onOpenEditor}
              className="absolute right-3 top-3 flex items-center gap-1.5 rounded-full bg-[var(--color-zhimo-teal)] px-4 py-2 text-sm font-medium text-neutral-900 shadow-lg transition-transform hover:scale-105"
            >
              <Sparkles className="size-4" />
              AI 编辑
            </button>
          </div>
        </div>

        {/* 中：信息 */}
        <div className="mt-10 flex flex-1 flex-col gap-4 overflow-y-auto">
          <p className="text-xs text-neutral-500">
            更新于 <span>2026-07-10 14:03:54</span>
          </p>
          <h2 className="text-xl font-bold text-neutral-800 text-balance">
            撞色实木儿童杂物架，童趣收纳好帮手
          </h2>

          <div className="flex flex-wrap gap-2">
            {tags.map((t) => (
              <span
                key={t}
                className="rounded-full bg-white px-3 py-1 text-xs text-neutral-600"
              >
                {t}
              </span>
            ))}
          </div>

          <div className="flex gap-2">
            <ActionChip icon={Star} label="收藏" />
            <ActionChip icon={ThumbsUp} label="喜欢" />
            <ActionChip icon={ThumbsDown} label="不喜欢" />
          </div>

          <div className="rounded-xl bg-white p-4">
            <p className="mb-2 text-sm font-semibold text-neutral-800">灵感描述</p>
            <p className="text-sm leading-relaxed text-neutral-600">
              杂物架，儿童风格，实木材质，撞色拼接主色调，多格开放式设计搭配可拆卸收纳篮，灵活适配儿童房玩具与书籍分类整理需求。
            </p>
          </div>


        </div>

        {/* 右：相似推荐 */}
        <div className="mt-10 hidden w-40 shrink-0 flex-col gap-3 overflow-y-auto lg:flex">
          <p className="text-sm font-medium text-neutral-700">相似灵感推荐</p>
          {related.map((r, i) => (
            <div
              key={i}
              className="overflow-hidden rounded-lg bg-white"
            >
              <div className="flex aspect-video items-center justify-center bg-gradient-to-br from-neutral-100 to-neutral-200 text-[10px] text-neutral-400">
                {r}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function ActionChip({
  icon: Icon,
  label,
}: {
  icon: typeof Star
  label: string
}) {
  return (
    <button className="flex items-center gap-1.5 rounded-lg border border-neutral-200 bg-white px-4 py-2 text-sm text-neutral-600 hover:border-neutral-300">
      <Icon className="size-4" />
      {label}
    </button>
  )
}
