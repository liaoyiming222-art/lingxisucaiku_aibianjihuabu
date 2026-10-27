"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import {
  ChevronDown,
  Crown,
  Upload,
  MousePointer2,
  Move,
  Brush,
  Wand2,
  PenTool,
  Lasso,
  Eraser,
  Undo2,
  Redo2,
  RotateCcw,
  History,
  MessageSquare,
  Command,
  Columns2,
  Plus,
  Sparkles,
  ArrowLeft,
  Settings2,
  Sofa,
  Package,
  Palette,
  Wand,
  Layers,
  ImagePlus,
  Sun,
  CloudSun,
  Maximize,
  Droplet,
  Expand,
  Eye,
  FileStack,
  UserCog,
} from "lucide-react"
import { fullEditorTools } from "@/lib/editor-data"

const toolIcons: Record<string, typeof Sofa> = {
  智能修改: Settings2,
  换家具: Sofa,
  换硬装: Package,
  换材质: Layers,
  换颜色: Palette,
  换风格: Wand,
  素材植入: ImagePlus,
  调光影: Sun,
  调氛围: CloudSun,
  擦除: Eraser,
  高清增强: Maximize,
  去水印: Droplet,
  扩图: Expand,
  换视角: Eye,
  拆PSD: FileStack,
  修复人物: UserCog,
}

const leftTools = [
  { icon: Upload, label: "上传" },
  { icon: MousePointer2, label: "选择" },
  { icon: Move, label: "移动" },
  { icon: Brush, label: "涂抹" },
  { icon: Wand2, label: "魔棒" },
  { icon: PenTool, label: "钢笔" },
  { icon: Lasso, label: "套索" },
  { icon: Eraser, label: "橡皮" },
  { icon: Undo2, label: "撤回" },
  { icon: Redo2, label: "重做" },
  { icon: RotateCcw, label: "重置" },
  { icon: History, label: "历史" },
  { icon: MessageSquare, label: "反馈" },
  { icon: Command, label: "快捷" },
]

const filmstrip = [
  { label: "换家具·2张" },
  { label: "", active: true },
  { label: "" },
  { label: "局部重绘·4张" },
  { label: "" },
  { label: "" },
  { label: "" },
]

export default function EditorPage() {
  const router = useRouter()
  const [activeTool, setActiveTool] = useState("换家具")
  const [prompt, setPrompt] = useState("换成小柜子")

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-[#141414] text-neutral-200">
      {/* 顶栏 */}
      <header className="flex h-14 shrink-0 items-center gap-4 border-b border-[var(--color-panel-line)] bg-[var(--color-panel)] px-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push("/")}
            className="flex items-center gap-1 text-sm text-neutral-400 hover:text-neutral-200"
          >
            <ArrowLeft className="size-4" />
          </button>
          <img src="/icon.svg" width={30} height={30} alt="灵犀" className="size-[30px] shrink-0" />
          <span className="text-base font-semibold text-white">AI改图</span>
          <span className="h-4 w-px bg-white/15" />
          <button className="flex items-center gap-1 rounded-md bg-[var(--color-panel-soft)] px-3 py-1.5 text-sm text-neutral-300">
            室内设计
            <ChevronDown className="size-4" />
          </button>
        </div>

        {/* 功能一排 */}
        <div className="flex flex-1 items-center gap-1 overflow-x-auto px-2">
          {fullEditorTools.map((t) => {
            const Icon = toolIcons[t] ?? Sparkles
            const active = t === activeTool
            return (
              <button
                key={t}
                onClick={() => setActiveTool(t)}
                className={`flex shrink-0 flex-col items-center gap-1 rounded-md px-2.5 py-1 text-[11px] transition-colors ${
                  active
                    ? "bg-[var(--color-panel-soft)] text-[var(--color-zhimo-teal)]"
                    : "text-neutral-400 hover:text-neutral-200"
                }`}
              >
                <Icon className="size-[18px]" />
                {t}
              </button>
            )
          })}
        </div>

        <div className="flex items-center gap-3">
          <button className="flex items-center gap-1 rounded-md bg-[var(--color-panel-soft)] px-3 py-1.5 text-sm">
            80%
            <ChevronDown className="size-4" />
          </button>
          <button className="flex items-center gap-1 rounded-md bg-[var(--color-zhimo-teal)] px-4 py-1.5 text-sm font-medium text-neutral-900">
            下载导出
            <ChevronDown className="size-4" />
          </button>
          <button className="flex items-center gap-1 text-sm text-amber-400">
            <Crown className="size-4" />
            VIP
          </button>
          <div className="size-8 overflow-hidden rounded-full bg-amber-100">
            <div className="flex size-full items-center justify-center text-base">🐷</div>
          </div>
        </div>
      </header>

      <div className="flex min-h-0 flex-1">
        {/* 左侧工具竖排 */}
        <aside className="flex w-16 shrink-0 flex-col items-center gap-1 overflow-y-auto border-r border-[var(--color-panel-line)] bg-[var(--color-panel)] py-3">
          {leftTools.map((t) => (
            <button
              key={t.label}
              className="flex w-full flex-col items-center gap-1 py-2 text-[11px] text-neutral-400 transition-colors hover:text-[var(--color-zhimo-teal)]"
            >
              <t.icon className="size-5" />
              {t.label}
            </button>
          ))}
        </aside>

        {/* 画布 */}
        <main className="relative flex flex-1 flex-col items-center justify-center overflow-hidden p-6">
          <div className="relative">
            <button className="absolute right-3 top-3 z-10 flex items-center gap-1 rounded-md bg-black/60 px-3 py-1.5 text-xs text-neutral-200">
              <Columns2 className="size-4" />
              对比
            </button>
            <Image
              src="/images/kitchen.png"
              alt="厨房编辑画布"
              width={460}
              height={620}
              className="h-[min(70vh,620px)] w-auto rounded-md object-cover shadow-2xl"
              priority
            />
          </div>

          {/* 底部缩略图 */}
          <div className="absolute bottom-0 left-0 right-0 flex items-end gap-2 overflow-x-auto border-t border-[var(--color-panel-line)] bg-[var(--color-panel)] px-4 py-3">
            {filmstrip.map((f, i) => (
              <div key={i} className="flex shrink-0 flex-col gap-1">
                {f.label && <span className="text-[11px] text-neutral-400">{f.label}</span>}
                <div
                  className={`h-16 w-24 overflow-hidden rounded-md border-2 ${
                    f.active ? "border-[var(--color-zhimo-teal)]" : "border-transparent"
                  }`}
                >
                  <Image
                    src="/images/kitchen.png"
                    alt="历史缩略图"
                    width={96}
                    height={64}
                    className="h-full w-full object-cover"
                  />
                </div>
              </div>
            ))}
          </div>
        </main>

        {/* 右侧参数 */}
        <aside className="flex w-80 shrink-0 flex-col gap-5 border-l border-[var(--color-panel-line)] bg-[var(--color-panel)] p-5">
          <div>
            <p className="mb-2 text-sm font-medium text-neutral-200">软装家具 ⓘ</p>
            <button className="flex h-28 w-full flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-[var(--color-panel-line)] text-neutral-400 hover:border-[var(--color-zhimo-teal)]">
              <Plus className="size-6" />
              <span className="text-xs">
                上传【软装家具】或从 <span className="text-[var(--color-zhimo-teal)]">官方图库</span> 选择
              </span>
            </button>
          </div>

          <div className="flex-1">
            <p className="mb-2 text-sm font-medium text-neutral-200">
              <span className="text-[var(--color-zhimo-red)]">*</span> 指令描述 ⓘ
            </p>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              rows={6}
              className="w-full resize-none rounded-lg border border-[var(--color-panel-line)] bg-[var(--color-panel-soft)] p-3 text-sm text-neutral-200 outline-none focus:border-[var(--color-zhimo-teal)]"
            />
          </div>

          <div className="flex items-center justify-between">
            <button className="flex items-center gap-1 text-xs text-neutral-400">
              <Sparkles className="size-4 text-[var(--color-zhimo-teal)]" />
              标准模式
              <ChevronDown className="size-3" />
            </button>
          </div>

          <button className="flex items-center justify-center gap-2 rounded-lg bg-[var(--color-zhimo-teal)] py-3 text-sm font-semibold text-neutral-900 transition-opacity hover:opacity-90">
            <Sparkles className="size-4" />
            免费体验
          </button>
        </aside>
      </div>
    </div>
  )
}
