"use client"

import { useRef, useState, type PointerEvent as ReactPointerEvent } from "react"
import { createPortal } from "react-dom"
import Image from "next/image"
import {
  X,
  RotateCcw,
  Undo2,
  Redo2,
  Eraser,
  ZoomIn,
  ZoomOut,
  Move,
  Maximize,
  ChevronDown,
  Check,
  Smile,
  Upload,
  Sparkles,
  Sun,
  CloudRain,
  Sunset,
  ImageIcon,
  LoaderCircle,
} from "lucide-react"
import {
  editorTools,
  regionModes,
  materialGroups,
  colorSwatches,
} from "@/lib/editor-data"

type Point = { x: number; y: number }
type SmartSelection = { x: number; y: number; width: number; height: number; label: string }
type EditorSnapshot = {
  zoom: number
  pan: Point
  smartSelection: SmartSelection | null
  brushStrokes: Point[][]
  lassoPoints: Point[]
  eraserStrokes: Point[][]
  previewColor: string | null
}

const generationModels = [
  { id: "g2-stable", name: "全能图片 G2-官方稳定版", description: "质量稳定，适合精细局部修改", recommended: true },
  { id: "g2-fast", name: "全能图片 G2-快速版", description: "生成更快，适合方案探索" },
  { id: "v2-stable", name: "全能图片 V2-官方稳定版", description: "风格表现均衡" },
  { id: "seedream-pro", name: "Seedream 5.0 Pro", description: "高质量空间与材质表现" },
  { id: "seedream-lite", name: "Seedream 5.0 Lite", description: "轻量快速，消耗更低" },
  { id: "v2-lite", name: "全能图片 V2-Lite", description: "适合快速预览" },
]

type MaterialPreviewState = { name: string; top: number }
type UploadedMaterial = { name: string; url: string }

function materialVariants(material: string) {
  const isWood = material.includes("木")
  const isTile = material.includes("瓷砖")
  const isStone = ["石", "砖", "混凝土"].some((word) => material.includes(word))
  const paintPalette = material.includes("白") ? ["#f3f0e9", "#e6e1d8"] : material.includes("灰") ? ["#a9aaa5", "#777974"] : material.includes("蓝") ? ["#9bb1ba", "#718a96"] : ["#d8c8ae", "#b9a287"]
  const patterns = isWood
    ? [
        "repeating-linear-gradient(84deg,#8a6242 0 7px,#ad7d52 8px 14px,#704c35 15px 18px)",
        "repeating-linear-gradient(96deg,#d1ab7b 0 9px,#b88755 10px 16px,#e1c397 17px 22px)",
        "repeating-linear-gradient(88deg,#5a3929 0 8px,#7b4d35 9px 15px,#3f2d24 16px 20px)",
      ]
    : isTile
      ? [
          "linear-gradient(#ddd 2px,transparent 2px),linear-gradient(90deg,#ddd 2px,#f5f3ed 2px)",
          "linear-gradient(#aaa 2px,transparent 2px),linear-gradient(90deg,#aaa 2px,#777 2px)",
          "linear-gradient(45deg,#e7ded1 25%,#cbb9a5 25% 50%,#f1ece5 50% 75%,#b9a38c 75%)",
        ]
      : isStone
        ? [
            "radial-gradient(circle at 25% 30%,#d8cab5 0 8%,transparent 9%),radial-gradient(circle at 70% 55%,#9c8d79 0 9%,transparent 10%),#b9aa96",
            "linear-gradient(125deg,#d9d3c7 0 35%,#8d8174 36% 39%,#eee9df 40% 72%,#afa596 73%)",
            "radial-gradient(circle at 20% 50%,#6d685f 0 12%,transparent 13%),radial-gradient(circle at 75% 28%,#8b857a 0 10%,transparent 11%),#4f4c47",
          ]
        : [
            `radial-gradient(circle at 30% 25%,rgba(255,255,255,.42),transparent 28%),linear-gradient(135deg,${paintPalette[0]},${paintPalette[1]})`,
            `repeating-linear-gradient(105deg,${paintPalette[0]} 0 3px,${paintPalette[1]} 4px 6px)`,
            `radial-gradient(circle at 70% 30%,${paintPalette[0]} 0 12%,transparent 13%),${paintPalette[1]}`,
          ]
  const finishes = ["细腻哑光", "自然肌理", "柔光质感", "轻砂纹理", "暖调饰面", "低饱和", "高质感", "设计师精选"]
  return finishes.map((finish, index) => ({
    name: `${material} · ${finish}`,
    background: patterns[index % patterns.length],
  }))
}

export function AiEditModal({ onClose }: { onClose: () => void }) {
  const editorRef = useRef<HTMLDivElement>(null)
  const imageFrameRef = useRef<HTMLDivElement>(null)
  const dragStart = useRef({ pointerX: 0, pointerY: 0, panX: 0, panY: 0 })
  const selectionDrawing = useRef(false)
  const editorHistory = useRef<EditorSnapshot[]>([{
    zoom: 100,
    pan: { x: 0, y: 0 },
    smartSelection: null,
    brushStrokes: [],
    lassoPoints: [],
    eraserStrokes: [],
    previewColor: null,
  }])
  const historyIndex = useRef(0)
  const materialCloseTimer = useRef<number | null>(null)

  const [activeTool, setActiveTool] = useState("material")
  const [regionMode, setRegionMode] = useState("smart")
  const [description, setDescription] = useState("")
  const [showMaterialLib, setShowMaterialLib] = useState(false)
  const [previewColor, setPreviewColor] = useState<string | null>(null)
  const [colorValue, setColorValue] = useState("")
  const [zoom, setZoom] = useState(100)
  const [pan, setPan] = useState<Point>({ x: 0, y: 0 })
  const [moving, setMoving] = useState(false)
  const [dragging, setDragging] = useState(false)
  const [imageFullscreen, setImageFullscreen] = useState(false)
  const [smartSelection, setSmartSelection] = useState<SmartSelection | null>(null)
  const [brushStrokes, setBrushStrokes] = useState<Point[][]>([])
  const [lassoPoints, setLassoPoints] = useState<Point[]>([])
  const [eraserStrokes, setEraserStrokes] = useState<Point[][]>([])
  const [eraserActive, setEraserActive] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedTools, setGeneratedTools] = useState<string[]>([])
  const [selectedModel, setSelectedModel] = useState(generationModels[0])
  const [showModelPicker, setShowModelPicker] = useState(false)
  const [materialPreview, setMaterialPreview] = useState<MaterialPreviewState | null>(null)
  const [uploadedMaterials, setUploadedMaterials] = useState<UploadedMaterial[]>([])
  const [toast, setToast] = useState<string | null>(null)

  function flash(msg: string) {
    setToast(msg)
    window.clearTimeout((flash as typeof flash & { _t?: number })._t)
    ;(flash as typeof flash & { _t?: number })._t = window.setTimeout(() => setToast(null), 1600)
  }

  function keepMaterialPreviewOpen() {
    if (materialCloseTimer.current) window.clearTimeout(materialCloseTimer.current)
    materialCloseTimer.current = null
  }

  function showMaterialPreview(name: string, target: HTMLElement) {
    keepMaterialPreviewOpen()
    const editorRect = editorRef.current?.getBoundingClientRect()
    const targetRect = target.getBoundingClientRect()
    if (!editorRect) return
    const desiredTop = targetRect.top - editorRect.top - 16
    const top = Math.max(12, Math.min(editorRect.height - 190, desiredTop))
    setMaterialPreview({ name, top })
  }

  function scheduleMaterialPreviewClose() {
    keepMaterialPreviewOpen()
    materialCloseTimer.current = window.setTimeout(() => setMaterialPreview(null), 250)
  }

  function uploadMaterial(file: File) {
    const url = URL.createObjectURL(file)
    setUploadedMaterials((items) => [{ name: file.name.replace(/\.[^.]+$/, ""), url }, ...items].slice(0, 6))
    flash(`已上传材质：${file.name}`)
  }

  function makeSnapshot(overrides: Partial<EditorSnapshot> = {}): EditorSnapshot {
    return {
      zoom,
      pan: { ...pan },
      smartSelection: smartSelection ? { ...smartSelection } : null,
      brushStrokes: brushStrokes.map((stroke) => stroke.map((point) => ({ ...point }))),
      lassoPoints: lassoPoints.map((point) => ({ ...point })),
      eraserStrokes: eraserStrokes.map((stroke) => stroke.map((point) => ({ ...point }))),
      previewColor,
      ...overrides,
    }
  }

  function commitEditorState(overrides: Partial<EditorSnapshot> = {}) {
    const next = editorHistory.current.slice(0, historyIndex.current + 1)
    next.push(makeSnapshot(overrides))
    editorHistory.current = next
    historyIndex.current = next.length - 1
  }

  function applySnapshot(snapshot: EditorSnapshot) {
    setZoom(snapshot.zoom)
    setPan(snapshot.pan)
    setSmartSelection(snapshot.smartSelection)
    setBrushStrokes(snapshot.brushStrokes)
    setLassoPoints(snapshot.lassoPoints)
    setEraserStrokes(snapshot.eraserStrokes)
    setPreviewColor(snapshot.previewColor)
    setEraserActive(false)
  }

  function reset() {
    setDescription("")
    setPreviewColor(null)
    setColorValue("")
    setShowMaterialLib(false)
    setZoom(100)
    setPan({ x: 0, y: 0 })
    setMoving(false)
    setEraserActive(false)
    setSmartSelection(null)
    setBrushStrokes([])
    setLassoPoints([])
    setEraserStrokes([])
    commitEditorState({
      zoom: 100,
      pan: { x: 0, y: 0 },
      smartSelection: null,
      brushStrokes: [],
      lassoPoints: [],
      eraserStrokes: [],
      previewColor: null,
    })
    flash("已重置全部图片操作")
  }

  function undo() {
    if (historyIndex.current <= 0) return flash("没有更早的画布状态")
    historyIndex.current -= 1
    const snapshot = editorHistory.current[historyIndex.current]
    applySnapshot(snapshot)
    flash("已撤销上一步操作")
  }

  function redo() {
    if (historyIndex.current >= editorHistory.current.length - 1) return flash("没有可重做的画布状态")
    historyIndex.current += 1
    const snapshot = editorHistory.current[historyIndex.current]
    applySnapshot(snapshot)
    flash("已恢复下一步操作")
  }

  function changeZoom(next: number) {
    const safeZoom = Math.max(40, Math.min(200, next))
    setZoom(safeZoom)
    commitEditorState({ zoom: safeZoom })
  }

  function pickMaterial(name: string) {
    setDescription(name)
    setPreviewColor("#e8836f")
    commitEditorState({ previewColor: "#e8836f" })
    flash(`已应用材质：${name}`)
  }

  function handlePointerDown(event: ReactPointerEvent<HTMLDivElement>) {
    if (!moving) return
    event.currentTarget.setPointerCapture(event.pointerId)
    dragStart.current = {
      pointerX: event.clientX,
      pointerY: event.clientY,
      panX: pan.x,
      panY: pan.y,
    }
    setDragging(true)
  }

  function handlePointerMove(event: ReactPointerEvent<HTMLDivElement>) {
    if (!dragging) return
    setPan({
      x: dragStart.current.panX + event.clientX - dragStart.current.pointerX,
      y: dragStart.current.panY + event.clientY - dragStart.current.pointerY,
    })
  }

  function handlePointerUp(event: ReactPointerEvent<HTMLDivElement>) {
    if (!dragging) return
    event.currentTarget.releasePointerCapture(event.pointerId)
    setDragging(false)
    const nextPan = {
      x: dragStart.current.panX + event.clientX - dragStart.current.pointerX,
      y: dragStart.current.panY + event.clientY - dragStart.current.pointerY,
    }
    setPan(nextPan)
    commitEditorState({ pan: nextPan })
  }

  function clearSelection() {
    setSmartSelection(null)
    setBrushStrokes([])
    setLassoPoints([])
    setEraserStrokes([])
    setEraserActive(false)
  }

  function changeRegionMode(value: string) {
    setRegionMode(value)
    clearSelection()
  }

  function detectSmartObject(point: Point): SmartSelection {
    const regions = [
      { label: "茶几桌面", hit: [53, 80, 63, 77], box: [54, 63, 27, 12] },
      { label: "沙发", hit: [27, 72, 48, 83], box: [26, 48, 48, 34] },
      { label: "右侧单椅", hit: [76, 100, 50, 84], box: [76, 48, 22, 37] },
      { label: "绿植", hit: [0, 27, 29, 73], box: [2, 25, 24, 48] },
      { label: "木饰面墙", hit: [65, 100, 8, 54], box: [65, 7, 34, 49] },
      { label: "落地窗", hit: [0, 65, 8, 48], box: [2, 7, 62, 43] },
      { label: "地面", hit: [0, 100, 75, 100], box: [2, 74, 96, 24] },
    ]
    const matched = regions.find(({ hit }) => point.x >= hit[0] && point.x <= hit[1] && point.y >= hit[2] && point.y <= hit[3])
    if (matched) {
      return { x: matched.box[0], y: matched.box[1], width: matched.box[2], height: matched.box[3], label: matched.label }
    }
    return {
      x: Math.max(2, Math.min(70, point.x - 15)),
      y: Math.max(2, Math.min(72, point.y - 14)),
      width: 28,
      height: 26,
      label: "局部物体",
    }
  }

  function selectionPoint(event: ReactPointerEvent<HTMLDivElement>) {
    const rect = imageFrameRef.current?.getBoundingClientRect()
    if (!rect) return { x: 0, y: 0 }
    return {
      x: Math.max(0, Math.min(100, ((event.clientX - rect.left) / rect.width) * 100)),
      y: Math.max(0, Math.min(100, ((event.clientY - rect.top) / rect.height) * 100)),
    }
  }

  function handleSelectionDown(event: ReactPointerEvent<HTMLDivElement>) {
    if (moving || !["material", "erase", "inpaint", "color"].includes(activeTool)) return
    event.stopPropagation()
    const point = selectionPoint(event)
    if (eraserActive) {
      if (!smartSelection && brushStrokes.length === 0 && lassoPoints.length === 0) {
        flash("请先创建选区")
        return
      }
      event.currentTarget.setPointerCapture(event.pointerId)
      selectionDrawing.current = true
      setEraserStrokes((strokes) => [...strokes, [point]])
      return
    }
    if (regionMode === "smart") {
      const selection = detectSmartObject(point)
      setBrushStrokes([])
      setLassoPoints([])
      setEraserStrokes([])
      setSmartSelection(selection)
      commitEditorState({ smartSelection: selection, brushStrokes: [], lassoPoints: [], eraserStrokes: [] })
      flash(`已智能选中：${selection.label}`)
      return
    }
    event.currentTarget.setPointerCapture(event.pointerId)
    selectionDrawing.current = true
    setSmartSelection(null)
    setEraserStrokes([])
    if (regionMode === "brush") {
      setLassoPoints([])
      setBrushStrokes((strokes) => [...strokes, [point]])
    } else {
      setBrushStrokes([])
      setLassoPoints([point])
    }
  }

  function handleSelectionMove(event: ReactPointerEvent<HTMLDivElement>) {
    if (!selectionDrawing.current || moving) return
    event.stopPropagation()
    const point = selectionPoint(event)
    if (eraserActive) {
      setEraserStrokes((strokes) => strokes.map((stroke, index) => index === strokes.length - 1 ? [...stroke, point] : stroke))
    } else if (regionMode === "brush") {
      setBrushStrokes((strokes) => strokes.map((stroke, index) => index === strokes.length - 1 ? [...stroke, point] : stroke))
    } else if (regionMode === "lasso") {
      setLassoPoints((points) => [...points, point])
    }
  }

  function handleSelectionUp(event: ReactPointerEvent<HTMLDivElement>) {
    if (!selectionDrawing.current) return
    event.stopPropagation()
    selectionDrawing.current = false
    if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId)
    commitEditorState()
    flash(eraserActive ? "已擦除部分选区" : regionMode === "brush" ? "涂抹选区已完成" : "套索选区已闭合")
  }

  function generate() {
    if (isGenerating) return
    const label = editorTools.find((tool) => tool.id === activeTool)?.label ?? "AI 编辑"
    setIsGenerating(true)
    window.setTimeout(() => {
      setIsGenerating(false)
      setGeneratedTools((items) => [label, ...items].slice(0, 4))
      flash(`${label}方案已生成`)
    }, 1400)
  }

  const hasSelection = Boolean(smartSelection || brushStrokes.length || lassoPoints.length)
  const selectionHint = eraserActive ? "按住并涂抹，擦除已选择的区域" : regionMode === "smart" ? "点击桌子、沙发等物体进行智能选择" : regionMode === "brush" ? "按住并涂抹要编辑的区域" : "沿对象边缘自由圈选"

  return (
    <>
    <div
      ref={editorRef}
      className="fixed inset-x-[5vw] bottom-[5vh] top-[9vh] z-50 flex overflow-hidden rounded-xl border border-white/10 bg-[var(--color-shell)]/95 shadow-2xl backdrop-blur-sm"
    >
      {/* 左侧工具栏：仅缩小尺寸，不修改工具内容 */}
      <div className="flex w-[76px] shrink-0 flex-col items-center gap-0.5 overflow-y-auto border-r border-[var(--color-panel-line)] bg-[var(--color-panel)] py-2.5">
        {editorTools.map((tool) => {
          const active = tool.id === activeTool
          return (
            <button
              key={tool.id}
              onClick={() => {
                setActiveTool(tool.id)
                setShowMaterialLib(false)
                clearSelection()
              }}
              className={`flex w-[62px] flex-col items-center gap-1 rounded-lg py-2 text-[10px] transition-colors ${
                active
                  ? "bg-[var(--color-panel-soft)] text-[var(--color-zhimo-teal)]"
                  : "text-neutral-400 hover:bg-white/5 hover:text-neutral-200"
              }`}
            >
              <tool.icon className="size-[19px]" />
              {tool.label}
            </button>
          )
        })}
      </div>

      {/* 参数面板：宽度和留白按知末紧凑化 */}
      <div className="flex w-[292px] shrink-0 flex-col border-r border-[var(--color-panel-line)] bg-[var(--color-panel)]">
        <div className="flex-1 overflow-y-auto p-4">
          {activeTool === "material" && (
            <MaterialPanel
              regionMode={regionMode}
              setRegionMode={changeRegionMode}
              description={description}
              setDescription={setDescription}
              showMaterialLib={showMaterialLib}
              setShowMaterialLib={setShowMaterialLib}
              onPickMaterial={pickMaterial}
              onPreviewMaterial={showMaterialPreview}
              onLeaveMaterial={scheduleMaterialPreviewClose}
            />
          )}

          {activeTool === "hq" && <HqPanel />}
          {activeTool === "style" && <StylePanel />}
          {activeTool === "erase" && (
            <ErasePanel regionMode={regionMode} setRegionMode={changeRegionMode} />
          )}
          {activeTool === "inpaint" && (
            <InpaintPanel
              regionMode={regionMode}
              setRegionMode={changeRegionMode}
              description={description}
              setDescription={setDescription}
              onUpload={() => flash("请选择替换参考图")}
            />
          )}
          {activeTool === "detail" && <DetailPanel />}
          {activeTool === "weather" && <WeatherPanel />}
          {activeTool === "color" && (
            <ColorPanel
              regionMode={regionMode}
              setRegionMode={changeRegionMode}
              colorValue={colorValue}
              onPickColor={(value) => {
                setColorValue(value)
                setPreviewColor(value)
                commitEditorState({ previewColor: value })
                flash(`已选择色值 ${value}`)
              }}
            />
          )}
        </div>

        <div className="relative border-t border-[var(--color-panel-line)] p-3">
          {showModelPicker && (
            <div className="absolute bottom-[calc(100%+8px)] left-3 right-3 z-30 max-h-64 overflow-y-auto rounded-xl border border-[var(--color-panel-line)] bg-[#1b1b1b] p-1.5 shadow-2xl">
              <div className="sticky top-0 z-10 flex items-center justify-between bg-[#1b1b1b] px-2 pb-2 pt-1">
                <span className="text-[11px] font-medium text-neutral-200">选择生成模型</span>
                <span className="text-[9px] text-neutral-500">上下滑动查看更多</span>
              </div>
              <div className="flex flex-col gap-1">
                {generationModels.map((model) => {
                  const selected = model.id === selectedModel.id
                  return (
                    <button
                      key={model.id}
                      onClick={() => {
                        setSelectedModel(model)
                        setShowModelPicker(false)
                        flash(`已切换模型：${model.name}`)
                      }}
                      className={`relative flex w-full items-center gap-2.5 rounded-lg border px-2.5 py-2.5 text-left transition-colors ${
                        selected
                          ? "border-neutral-500 bg-[var(--color-panel-soft)]"
                          : "border-transparent hover:bg-white/5"
                      }`}
                    >
                      <span className={`flex size-8 shrink-0 items-center justify-center rounded-md ${selected ? "bg-white/10 text-white" : "bg-[#303030] text-neutral-400"}`}>
                        <Sparkles className="size-4" />
                      </span>
                      <span className="min-w-0 pr-8">
                        <b className="block truncate text-[11px] font-medium text-neutral-100">{model.name}</b>
                        <span className="mt-0.5 block truncate text-[9px] text-neutral-500">{model.description}</span>
                      </span>
                      {model.recommended && (
                        <span className="absolute right-2 top-1.5 rounded bg-[var(--color-zhimo-teal)] px-1.5 py-0.5 text-[8px] font-semibold text-neutral-950">
                          推荐
                        </span>
                      )}
                      {selected && !model.recommended && <Check className="absolute right-2 size-3.5 text-[var(--color-zhimo-teal)]" />}
                    </button>
                  )
                })}
              </div>
            </div>
          )}
          <button
            onClick={() => setShowModelPicker((value) => !value)}
            aria-expanded={showModelPicker}
            className={`mb-2 flex w-full items-center gap-2 rounded-lg border px-2.5 py-2 text-left transition-colors ${
              showModelPicker
                ? "border-[var(--color-zhimo-teal)] bg-[var(--color-zhimo-teal)]/10"
                : "border-[var(--color-panel-line)] bg-[var(--color-panel-soft)] hover:border-neutral-500"
            }`}
          >
            <span className="flex size-7 shrink-0 items-center justify-center rounded-md bg-white/5 text-neutral-300">
              <Sparkles className="size-3.5" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-[9px] text-neutral-500">生成模型</span>
              <b className="block truncate text-[11px] font-medium text-neutral-200">{selectedModel.name}</b>
            </span>
            {selectedModel.recommended && <span className="rounded bg-[var(--color-zhimo-teal)]/15 px-1.5 py-0.5 text-[8px] text-[var(--color-zhimo-teal)]">推荐</span>}
            <ChevronDown className={`size-3.5 shrink-0 text-neutral-500 transition-transform ${showModelPicker ? "rotate-180" : ""}`} />
          </button>
          <button
            onClick={generate}
            disabled={isGenerating}
            className="w-full rounded-lg bg-neutral-200 py-2.5 text-center text-sm font-medium text-neutral-900 transition-colors hover:bg-white disabled:cursor-wait disabled:opacity-60"
          >
            <span className="flex items-center justify-center gap-2">
              {isGenerating && <LoaderCircle className="size-4 animate-spin" />}
              {isGenerating ? "正在生成" : "立即生成"}
            </span>
            <span className="mt-0.5 block text-[10px] opacity-60">（免费剩余 4 次）</span>
          </button>
        </div>
      </div>

      {activeTool === "material" && materialPreview && (
        <MaterialPreviewFlyout
          material={materialPreview.name}
          top={materialPreview.top}
          selected={description}
          uploadedMaterials={uploadedMaterials}
          onMouseEnter={keepMaterialPreviewOpen}
          onMouseLeave={scheduleMaterialPreviewClose}
          onPick={pickMaterial}
          onUpload={uploadMaterial}
        />
      )}

      {/* 画布区 */}
      <div
        className={`relative flex flex-1 items-center justify-center overflow-hidden bg-[#141414] ${
          moving ? (dragging ? "cursor-grabbing" : "cursor-grab") : ""
        }`}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        onWheel={(event) => {
          if (!moving) return
          event.preventDefault()
          changeZoom(zoom + (event.deltaY < 0 ? 10 : -10))
        }}
      >
        <button
          onClick={onClose}
          onPointerDown={(event) => event.stopPropagation()}
          className="absolute right-3 top-3 z-20 flex size-8 items-center justify-center rounded-full bg-black/50 text-neutral-300 hover:bg-black/70"
          aria-label="关闭编辑器"
        >
          <X className="size-5" />
        </button>

        {moving && (
          <div className="absolute left-1/2 top-3 z-10 -translate-x-1/2 rounded-md border border-white/10 bg-black/65 px-3 py-1.5 text-[11px] text-neutral-300">
            按住拖动画布 · 滚轮缩放
          </div>
        )}

        <div
          ref={imageFrameRef}
          onPointerDown={handleSelectionDown}
          onPointerMove={handleSelectionMove}
          onPointerUp={handleSelectionUp}
          onPointerCancel={handleSelectionUp}
          className={`relative touch-none select-none shadow-2xl transition-transform duration-150 ${
            !moving && ["material", "erase", "inpaint", "color"].includes(activeTool) ? "cursor-crosshair" : ""
          }`}
          style={{ transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom / 100})` }}
        >
          <Image
            src="/images/living-room.png"
            alt="现代客厅编辑预览"
            width={760}
            height={620}
            draggable={false}
            className="max-h-[calc(86vh-108px)] h-auto w-[min(48vw,680px)] rounded-sm object-contain"
            priority
          />
          {previewColor && (
            <div
              className="pointer-events-none absolute left-[26%] top-[64%] h-[16%] w-[46%] rounded-sm opacity-80 mix-blend-multiply ring-2 ring-[var(--color-zhimo-teal)]"
              style={{ backgroundColor: previewColor }}
            />
          )}
          <svg
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
            className="pointer-events-none absolute inset-0 size-full overflow-visible"
            aria-hidden="true"
          >
            <defs>
              <mask id="selection-mask" maskUnits="userSpaceOnUse" x="0" y="0" width="100" height="100">
                <rect x="0" y="0" width="100" height="100" fill="black" />
                {smartSelection && <rect x={smartSelection.x} y={smartSelection.y} width={smartSelection.width} height={smartSelection.height} rx="1" fill="white" />}
                {brushStrokes.map((stroke, index) => (
                  <polyline key={`mask-brush-${index}`} points={stroke.map((point) => `${point.x},${point.y}`).join(" ")} fill="none" stroke="white" strokeWidth="18" strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
                ))}
                {lassoPoints.length > 1 && <polygon points={lassoPoints.map((point) => `${point.x},${point.y}`).join(" ")} fill="white" />}
                {eraserStrokes.map((stroke, index) => (
                  <polyline key={`mask-eraser-${index}`} points={stroke.map((point) => `${point.x},${point.y}`).join(" ")} fill="none" stroke="black" strokeWidth="24" strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
                ))}
              </mask>
            </defs>
            <rect x="0" y="0" width="100" height="100" fill="rgba(18,214,165,.23)" mask="url(#selection-mask)" />
            <g mask="url(#selection-mask)">
              {smartSelection && (
                <g>
                <rect
                  x={smartSelection.x}
                  y={smartSelection.y}
                  width={smartSelection.width}
                  height={smartSelection.height}
                  rx="1"
                  fill="none"
                  stroke="var(--color-zhimo-teal)"
                  strokeWidth="1.5"
                  vectorEffect="non-scaling-stroke"
                />
                {[
                  [smartSelection.x, smartSelection.y],
                  [smartSelection.x + smartSelection.width, smartSelection.y],
                  [smartSelection.x + smartSelection.width, smartSelection.y + smartSelection.height],
                  [smartSelection.x, smartSelection.y + smartSelection.height],
                ].map(([x, y], index) => (
                  <circle key={index} cx={x} cy={y} r=".8" fill="white" stroke="var(--color-zhimo-teal)" strokeWidth="1" vectorEffect="non-scaling-stroke" />
                ))}
                </g>
              )}
              {brushStrokes.map((stroke, index) => (
                <polyline key={index} points={stroke.map((point) => `${point.x},${point.y}`).join(" ")} fill="none" stroke="rgba(18,214,165,.62)" strokeWidth="18" strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
              ))}
              {lassoPoints.length > 1 && (
                <polygon points={lassoPoints.map((point) => `${point.x},${point.y}`).join(" ")} fill="none" stroke="var(--color-zhimo-teal)" strokeWidth="1.5" strokeDasharray="6 4" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
              )}
            </g>
          </svg>
          {smartSelection && (
            <div
              className="pointer-events-none absolute -translate-y-full rounded-t-md bg-[var(--color-zhimo-teal)] px-2 py-1 text-[9px] font-medium text-neutral-950"
              style={{ left: `${smartSelection.x}%`, top: `${smartSelection.y}%` }}
            >
              智能选中 · {smartSelection.label}
            </div>
          )}
          {!moving && ["material", "erase", "inpaint", "color"].includes(activeTool) && !hasSelection && (
            <div className="pointer-events-none absolute left-1/2 top-4 -translate-x-1/2 whitespace-nowrap rounded-md bg-black/70 px-3 py-1.5 text-[10px] text-white backdrop-blur">
              {selectionHint}
            </div>
          )}
        </div>

        {isGenerating && (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 bg-black/40 backdrop-blur-[2px]">
            <LoaderCircle className="size-8 animate-spin text-[var(--color-zhimo-teal)]" />
            <span className="text-xs text-white">AI 正在生成新方案…</span>
          </div>
        )}

        <div
          onPointerDown={(event) => event.stopPropagation()}
          className="absolute bottom-4 left-1/2 z-20 flex -translate-x-1/2 items-center gap-0.5 rounded-xl border border-white/10 bg-black/65 px-2 py-1.5 text-neutral-300 backdrop-blur"
        >
          <ToolbarButton icon={RotateCcw} label="重置" onClick={reset} />
          <Divider />
          <IconBtn icon={Undo2} onClick={undo} title="撤销" />
          <IconBtn icon={Redo2} onClick={redo} title="重做" />
          <Divider />
          <ToolbarButton
            icon={Eraser}
            label="擦除"
            active={eraserActive}
            onClick={() => {
              if (!hasSelection) return flash("请先创建智能、涂抹或套索选区")
              setMoving(false)
              setEraserActive((value) => !value)
              flash(eraserActive ? "已退出橡皮擦" : "橡皮擦已启用，请在选区上涂抹")
            }}
          />
          <Divider />
          <IconBtn icon={ZoomOut} onClick={() => changeZoom(zoom - 10)} title="缩小" />
          <span className="w-11 text-center text-[11px] tabular-nums">{zoom}%</span>
          <IconBtn icon={ZoomIn} onClick={() => changeZoom(zoom + 10)} title="放大" />
          <Divider />
          <ToolbarButton
            icon={Move}
            label="移动"
            active={moving}
            onClick={() => { setEraserActive(false); setMoving((value) => !value) }}
          />
          <Divider />
          <IconBtn
            icon={Maximize}
            onClick={() => setImageFullscreen(true)}
            title="全屏查看图片"
          />
        </div>

        {toast && (
          <div className="absolute left-1/2 top-6 z-30 -translate-x-1/2 rounded-lg bg-black/80 px-4 py-2 text-sm text-white shadow-lg">
            {toast}
          </div>
        )}
      </div>

      <div className="hidden w-48 shrink-0 flex-col border-l border-[var(--color-panel-line)] bg-[var(--color-panel)] p-3 xl:flex">
        <p className="text-sm font-medium text-neutral-200">生成历史</p>
        {generatedTools.length === 0 ? (
          <div className="mt-6 flex flex-1 flex-col items-center justify-center gap-3 text-neutral-500">
            <Smile className="size-9 opacity-50" />
            <span className="text-xs">暂无数据</span>
          </div>
        ) : (
          <div className="mt-3 flex flex-col gap-2 overflow-y-auto">
            {generatedTools.map((label, index) => (
              <button
                key={`${label}-${index}`}
                className="overflow-hidden rounded-lg border border-[var(--color-panel-line)] bg-[var(--color-panel-soft)] text-left"
              >
                <Image src="/images/living-room.png" alt={label} width={180} height={100} className="h-20 w-full object-cover" />
                <span className="flex items-center justify-between px-2 py-1.5 text-[10px] text-neutral-300">
                  <b>{label}</b><em className="not-italic text-[var(--color-zhimo-teal)]">新</em>
                </span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
    {imageFullscreen && typeof document !== "undefined" && createPortal(
      <div
        className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95"
        role="dialog"
        aria-label="全屏查看当前图片"
        onClick={() => setImageFullscreen(false)}
      >
        <button
          onClick={() => setImageFullscreen(false)}
          className="absolute right-6 top-6 z-10 flex size-10 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20"
          aria-label="退出图片全屏预览"
        >
          <X className="size-6" />
        </button>
        <div className="relative" onClick={(event) => event.stopPropagation()}>
          <Image
            src="/images/living-room.png"
            alt="当前图片全屏预览"
            width={1520}
            height={1240}
            className="h-auto max-h-[92vh] w-auto max-w-[96vw] object-contain"
            priority
          />
          {previewColor && (
            <div
              className="pointer-events-none absolute left-[26%] top-[64%] h-[16%] w-[46%] rounded-sm opacity-80 mix-blend-multiply ring-2 ring-[var(--color-zhimo-teal)]"
              style={{ backgroundColor: previewColor }}
            />
          )}
        </div>
        <div className="absolute bottom-5 left-1/2 -translate-x-1/2 rounded-full bg-white/10 px-4 py-2 text-xs text-white/70">
          当前图片 · 点击空白处退出
        </div>
      </div>,
      document.body,
    )}
    </>
  )
}

/* ---------- 面板：材质替换（保持原型交互不变） ---------- */
function MaterialPanel({
  regionMode,
  setRegionMode,
  description,
  setDescription,
  showMaterialLib,
  setShowMaterialLib,
  onPickMaterial,
  onPreviewMaterial,
  onLeaveMaterial,
}: {
  regionMode: string
  setRegionMode: (value: string) => void
  description: string
  setDescription: (value: string) => void
  showMaterialLib: boolean
  setShowMaterialLib: (value: boolean) => void
  onPickMaterial: (name: string) => void
  onPreviewMaterial: (name: string, target: HTMLElement) => void
  onLeaveMaterial: () => void
}) {
  return (
    <div className="flex flex-col gap-5">
      <RegionSelect value={regionMode} onChange={setRegionMode} />
      <div>
        <p className="mb-2 text-sm font-medium text-neutral-200">替换描述</p>
        <textarea
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          onFocus={() => setShowMaterialLib(true)}
          rows={3}
          placeholder="描述你想要替换的材质和替换对象，例如：浅色木地板；可点击使用推荐材质库。"
          className="w-full resize-none rounded-lg border border-[var(--color-panel-line)] bg-[var(--color-panel-soft)] p-3 text-sm text-neutral-200 outline-none placeholder:text-neutral-500 focus:border-[var(--color-zhimo-teal)]"
        />
      </div>
      {showMaterialLib && (
        <div className="flex flex-col gap-4 rounded-lg border border-[var(--color-panel-line)] bg-[var(--color-panel-soft)]/60 p-3">
          {materialGroups.map((group) => (
            <div key={group.title}>
              <p className="mb-2 text-xs font-medium text-neutral-300">{group.title}</p>
              <div className="flex flex-wrap gap-2">
                {group.items.map((item) => (
                  <button
                    key={item}
                    data-material-name={item}
                    onClick={(event) => {
                      onPreviewMaterial(item, event.currentTarget)
                      onPickMaterial(item)
                    }}
                    onMouseEnter={(event) => onPreviewMaterial(item, event.currentTarget)}
                    onMouseLeave={(event) => {
                      if (event.currentTarget !== document.activeElement) onLeaveMaterial()
                    }}
                    onFocus={(event) => onPreviewMaterial(item, event.currentTarget)}
                    onBlur={onLeaveMaterial}
                    className={`rounded-md border px-3 py-1.5 text-xs transition-colors ${
                      description === item
                        ? "border-[var(--color-zhimo-teal)] bg-[var(--color-zhimo-teal)]/15 text-[var(--color-zhimo-teal)]"
                        : "border-[var(--color-panel-line)] text-neutral-300 hover:border-neutral-500"
                    }`}
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function MaterialPreviewFlyout({
  material,
  top,
  selected,
  uploadedMaterials,
  onMouseEnter,
  onMouseLeave,
  onPick,
  onUpload,
}: {
  material: string
  top: number
  selected: string
  uploadedMaterials: UploadedMaterial[]
  onMouseEnter: () => void
  onMouseLeave: () => void
  onPick: (name: string) => void
  onUpload: (file: File) => void
}) {
  const variants = materialVariants(material)
  return (
    <div
      data-testid="material-preview-flyout"
      style={{ top }}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      className="absolute left-[376px] z-40 w-[420px] rounded-xl border border-[#363939] bg-[rgba(25,27,27,.97)] p-3 text-white shadow-[0_18px_55px_rgba(0,0,0,.42)] backdrop-blur-xl"
    >
      <div className="mb-2 flex items-center">
        <b className="block text-[11px] font-medium text-neutral-200">{material} · 材质参考</b>
      </div>
      <div className="flex h-[118px] items-stretch gap-2.5">
        <label data-testid="material-upload-fixed" title="上传本地材质图片" className="flex w-[88px] shrink-0 cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed border-[#555959] bg-[#202222] text-neutral-400 transition-colors hover:border-[var(--color-zhimo-teal)] hover:bg-[#222827] hover:text-[var(--color-zhimo-teal)]">
          <Upload className="mb-1.5 size-5" />
          <b className="text-[10px] font-medium">上传图片</b>
          <span className="mt-1 text-[8px] text-neutral-600">JPG / PNG</span>
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            onChange={(event) => {
              const file = event.target.files?.[0]
              if (file) onUpload(file)
              event.currentTarget.value = ""
            }}
          />
        </label>

        <div data-testid="material-preview-separator" className="my-1 w-px shrink-0 bg-white/15" aria-hidden="true" />

        <div
          data-testid="material-preview-scroll"
          className="material-preview-scroll relative flex min-w-0 flex-1 snap-x snap-mandatory items-start gap-2 overflow-x-auto overflow-y-hidden scroll-smooth pb-[10px]"
          onWheel={(event) => {
            if (Math.abs(event.deltaY) > Math.abs(event.deltaX)) {
              event.currentTarget.scrollLeft += event.deltaY
              event.preventDefault()
            }
          }}
        >
          {uploadedMaterials.map((item) => (
            <button key={item.url} aria-label={`应用材质：${item.name}`} onClick={() => onPick(item.name)} className={`group w-[104px] shrink-0 snap-start overflow-hidden rounded-lg border text-left transition-colors ${selected === item.name ? "border-[var(--color-zhimo-teal)]" : "border-[#393c3c] hover:border-neutral-500"}`}>
              <img src={item.url} alt={item.name} className="h-[78px] w-full object-cover transition-transform group-hover:scale-[1.03]" />
              <span className="block truncate bg-[#242626] px-2 py-1.5 text-[9px] text-neutral-300">{item.name}</span>
            </button>
          ))}
          {variants.map((variant) => (
            <button key={variant.name} aria-label={`应用材质：${variant.name}`} onClick={() => onPick(variant.name)} className={`group w-[104px] shrink-0 snap-start overflow-hidden rounded-lg border text-left transition-colors ${selected === variant.name ? "border-[var(--color-zhimo-teal)]" : "border-[#393c3c] hover:border-neutral-500"}`}>
              <span
                className="block h-[78px] w-full transition-transform group-hover:scale-[1.03]"
                style={{ backgroundImage: variant.background, backgroundSize: material.includes("瓷砖") ? "22px 22px" : "cover" }}
              />
              <span className="block truncate bg-[#242626] px-2 py-1.5 text-[9px] text-neutral-300">{variant.name.replace(`${material} · `, "")}</span>
            </button>
          ))}
          <div className="pointer-events-none sticky right-0 h-[101px] w-5 shrink-0 bg-gradient-to-r from-transparent to-[#191b1b]" />
        </div>
      </div>
    </div>
  )
}

function HqPanel() {
  const [scale, setScale] = useState("2x")
  const [strength, setStrength] = useState(55)
  return (
    <Panel title="高清放大" hint="放大图片尺寸并增强纹理细节，保持原始构图。">
      <FieldLabel>放大倍数</FieldLabel>
      <div className="grid grid-cols-2 gap-2">
        <Choice active={scale === "2x"} onClick={() => setScale("2x")} title="2× 高清" desc="1520 × 1240" />
        <Choice active={scale === "4x"} onClick={() => setScale("4x")} title="4× 超清" desc="3040 × 2480" />
      </div>
      <RangeField label="细节强度" value={strength} onChange={setStrength} />
      <div className="rounded-lg border border-[var(--color-panel-line)] bg-[var(--color-panel-soft)] p-3 text-xs leading-5 text-neutral-400">
        <Sparkles className="mb-2 size-4 text-[var(--color-zhimo-teal)]" />
        自动修复模糊边缘，增强木纹、织物与装饰品细节。
      </div>
    </Panel>
  )
}

function StylePanel() {
  const [style, setStyle] = useState("中古风")
  return (
    <Panel title="风格转换" hint="保留当前空间结构和家具关系，转换整体设计语言。">
      <FieldLabel>目标风格</FieldLabel>
      <div className="grid grid-cols-2 gap-2">
        {["中古风", "奶油风", "现代极简", "侘寂风"].map((item) => (
          <Choice key={item} active={style === item} onClick={() => setStyle(item)} title={item} desc={item === "中古风" ? "温暖木色" : item === "奶油风" ? "柔和浅色" : item === "现代极简" ? "简洁克制" : "自然肌理"} />
        ))}
      </div>
      <FieldLabel>补充描述</FieldLabel>
      <textarea rows={3} placeholder="可补充希望保留或强化的设计细节" className="panel-input resize-none" />
    </Panel>
  )
}

function ErasePanel({ regionMode, setRegionMode }: RegionProps) {
  const [brushSize, setBrushSize] = useState(38)
  return (
    <Panel title="魔法消除" hint="选择画面中需要移除的物体，AI 将自动补全背景。">
      <RegionSelect value={regionMode} onChange={setRegionMode} />
      <RangeField label="画笔大小" value={brushSize} onChange={setBrushSize} suffix=" px" />
      <div className="rounded-lg border border-dashed border-[var(--color-panel-line)] p-4 text-center text-xs leading-5 text-neutral-500">
        在中间画布涂抹或框选要消除的内容
      </div>
    </Panel>
  )
}

function InpaintPanel({
  regionMode,
  setRegionMode,
  description,
  setDescription,
  onUpload,
}: RegionProps & { description: string; setDescription: (value: string) => void; onUpload: () => void }) {
  return (
    <Panel title="局部重绘" hint="选择局部区域，并描述希望替换成的内容。">
      <RegionSelect value={regionMode} onChange={setRegionMode} />
      <FieldLabel>替换描述</FieldLabel>
      <textarea
        value={description}
        onChange={(event) => setDescription(event.target.value)}
        rows={3}
        placeholder="例如：将单椅替换成圆润的米色休闲椅"
        className="panel-input resize-none"
      />
      <FieldLabel>替换图片</FieldLabel>
      <button onClick={onUpload} className="flex h-24 w-full flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-[var(--color-panel-line)] bg-[var(--color-panel-soft)] text-xs text-neutral-400 hover:border-neutral-500">
        <Upload className="size-5" />上传图片替换选中区域
      </button>
    </Panel>
  )
}

function DetailPanel() {
  const [strength, setStrength] = useState(48)
  const [target, setTarget] = useState("全图细节")
  return (
    <Panel title="细节增强" hint="强化家具、织物和装饰细节，不改变空间布局。">
      <FieldLabel>增强对象</FieldLabel>
      <div className="flex flex-wrap gap-2">
        {["全图细节", "家具纹理", "软装织物", "灯光氛围"].map((item) => (
          <Chip key={item} active={target === item} onClick={() => setTarget(item)}>{item}</Chip>
        ))}
      </div>
      <RangeField label="增强强度" value={strength} onChange={setStrength} />
      <div className="grid grid-cols-2 gap-2">
        <Choice active title="保持构图" desc="不移动物体" />
        <Choice active title="保持色调" desc="不改变主色" />
      </div>
    </Panel>
  )
}

function WeatherPanel() {
  const [weather, setWeather] = useState("晴朗午后")
  const [strength, setStrength] = useState(62)
  const options = [
    { name: "晴朗午后", desc: "清晰日光", icon: Sun },
    { name: "阴天柔光", desc: "均匀柔和", icon: ImageIcon },
    { name: "雨天氛围", desc: "低饱和", icon: CloudRain },
    { name: "落日晚霞", desc: "暖橙光线", icon: Sunset },
  ]
  return (
    <Panel title="切换天气" hint="改变窗外天气与室内光照，不改变空间和家具。">
      <FieldLabel>天气与时间</FieldLabel>
      <div className="grid grid-cols-2 gap-2">
        {options.map(({ name, desc, icon: Icon }) => (
          <button key={name} onClick={() => setWeather(name)} className={`rounded-lg border p-3 text-left transition-colors ${weather === name ? "border-[var(--color-zhimo-teal)] bg-[var(--color-zhimo-teal)]/10" : "border-[var(--color-panel-line)] bg-[var(--color-panel-soft)]"}`}>
            <Icon className={`mb-2 size-4 ${weather === name ? "text-[var(--color-zhimo-teal)]" : "text-neutral-400"}`} />
            <b className="block text-xs font-medium text-neutral-200">{name}</b>
            <span className="mt-1 block text-[10px] text-neutral-500">{desc}</span>
          </button>
        ))}
      </div>
      <RangeField label="光照强度" value={strength} onChange={setStrength} />
    </Panel>
  )
}

function ColorPanel({ regionMode, setRegionMode, colorValue, onPickColor }: RegionProps & { colorValue: string; onPickColor: (value: string) => void }) {
  return (
    <Panel title="修改颜色" hint="选择区域后更换颜色，同时保留原有材质纹理。">
      <RegionSelect value={regionMode} onChange={setRegionMode} />
      <FieldLabel>目标颜色</FieldLabel>
      <input value={colorValue} onChange={(event) => onPickColor(event.target.value)} placeholder="请选择或输入具体色值" className="panel-input" />
      <div className="grid grid-cols-4 gap-2">
        {colorSwatches.map((color) => (
          <button key={color.value} onClick={() => onPickColor(color.value)} title={color.name} className={`flex flex-col items-center gap-1 rounded-md p-1.5 text-[10px] text-neutral-400 hover:bg-white/5 ${colorValue === color.value ? "ring-1 ring-[var(--color-zhimo-teal)]" : ""}`}>
            <span className="h-7 w-full rounded" style={{ backgroundColor: color.value }} />{color.name}
          </button>
        ))}
      </div>
    </Panel>
  )
}

type RegionProps = { regionMode: string; setRegionMode: (value: string) => void }

function Panel({ title, hint, children }: { title: string; hint: string; children: React.ReactNode }) {
  return <div className="flex flex-col gap-4"><div><h2 className="text-sm font-semibold text-neutral-100">{title}</h2><p className="mt-1.5 text-[11px] leading-5 text-neutral-500">{hint}</p></div>{children}</div>
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return <p className="-mb-2 text-xs font-medium text-neutral-200">{children}</p>
}

function Choice({ active = false, onClick, title, desc }: { active?: boolean; onClick?: () => void; title: string; desc: string }) {
  return <button onClick={onClick} className={`rounded-lg border p-3 text-left transition-colors ${active ? "border-[var(--color-zhimo-teal)] bg-[var(--color-zhimo-teal)]/10" : "border-[var(--color-panel-line)] bg-[var(--color-panel-soft)] hover:border-neutral-500"}`}><b className="block text-xs font-medium text-neutral-200">{title}</b><span className="mt-1 block text-[10px] text-neutral-500">{desc}</span></button>
}

function Chip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return <button onClick={onClick} className={`rounded-full border px-3 py-1.5 text-[11px] ${active ? "border-[var(--color-zhimo-teal)] bg-[var(--color-zhimo-teal)]/10 text-[var(--color-zhimo-teal)]" : "border-[var(--color-panel-line)] text-neutral-400"}`}>{children}</button>
}

function RangeField({ label, value, onChange, suffix = "%" }: { label: string; value: number; onChange: (value: number) => void; suffix?: string }) {
  return <div><div className="mb-2 flex items-center justify-between text-xs text-neutral-300"><span>{label}</span><span className="text-[11px] text-neutral-500">{value}{suffix}</span></div><input type="range" min="0" max="100" value={value} onChange={(event) => onChange(Number(event.target.value))} className="w-full accent-[var(--color-zhimo-teal)]" /></div>
}

function RegionSelect({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  return (
    <div>
      <p className="mb-2 text-xs font-medium text-neutral-200">选择区域</p>
      <div className="grid grid-cols-3 gap-2">
        {regionModes.map((mode) => {
          const active = mode.id === value
          return <button key={mode.id} onClick={() => onChange(mode.id)} className={`flex flex-col items-center gap-1.5 rounded-lg border py-2.5 text-[10px] transition-colors ${active ? "border-[var(--color-zhimo-teal)] bg-[var(--color-zhimo-teal)]/10 text-[var(--color-zhimo-teal)]" : "border-[var(--color-panel-line)] bg-[var(--color-panel-soft)] text-neutral-300 hover:border-neutral-500"}`}><span className="text-sm leading-none">{mode.id === "smart" ? "✦" : mode.id === "brush" ? "⌁" : "◯"}</span>{mode.label}</button>
        })}
      </div>
    </div>
  )
}

function ToolbarButton({ icon: Icon, label, onClick, active = false }: { icon: typeof Move; label: string; onClick: () => void; active?: boolean }) {
  return <button onClick={onClick} className={`flex items-center gap-1.5 whitespace-nowrap rounded-lg px-2.5 py-1.5 text-[11px] transition-colors ${active ? "bg-white/15 text-[var(--color-zhimo-teal)]" : "hover:bg-white/10"}`}><Icon className="size-4 shrink-0" />{label}</button>
}

function IconBtn({ icon: Icon, onClick, title }: { icon: typeof Move; onClick: () => void; title: string }) {
  return <button onClick={onClick} title={title} className="flex size-8 items-center justify-center rounded-lg transition-colors hover:bg-white/10"><Icon className="size-4" /></button>
}

function Divider() {
  return <span className="mx-0.5 h-4 w-px bg-white/15" />
}
