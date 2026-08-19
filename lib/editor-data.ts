import type { LucideIcon } from "lucide-react"
import {
  Grid2x2,
  Layers,
} from "lucide-react"

export type EditorTool = {
  id: string
  label: string
  icon: LucideIcon
}

/** 左侧竖排工具（AI 快速编辑弹窗） */
export const editorTools: EditorTool[] = [
  { id: "material", label: "材质替换", icon: Layers },
  { id: "inpaint", label: "局部重绘", icon: Grid2x2 },
]

/** 选择区域方式 */
export const regionModes = [
  { id: "smart", label: "智能选区" },
  { id: "brush", label: "涂抹选择" },
  { id: "lasso", label: "套索选择" },
]

/** 材质库分类 */
export const materialGroups: { title: string; items: string[] }[] = [
  { title: "涂料", items: ["白色涂料", "米色涂料", "浅灰涂料", "深灰涂料", "浅蓝涂料"] },
  { title: "木材", items: ["浅色原木", "深棕木纹", "红褐木纹"] },
  { title: "瓷砖", items: ["白色瓷砖", "灰色瓷砖", "马赛克瓷砖"] },
  {
    title: "石材砌块",
    items: ["砖墙", "混凝土砌块", "黄灰毛石", "深灰文化石", "白色大理石", "水磨石"],
  },
]

/** 修改颜色 - 常用色值 */
export const colorSwatches = [
  { name: "暖白", value: "#f3efe6" },
  { name: "米灰", value: "#d8d2c4" },
  { name: "浅木", value: "#c8a06a" },
  { name: "深棕", value: "#6b4a2f" },
  { name: "雾蓝", value: "#8fa5ad" },
  { name: "墨绿", value: "#3f5a45" },
  { name: "砖红", value: "#a8503c" },
  { name: "炭灰", value: "#3a3a3a" },
]

/** 完整编辑页顶部功能 */
export const fullEditorTools = [
  "智能修改",
  "换家具",
  "换硬装",
  "换材质",
  "换颜色",
  "换风格",
  "素材植入",
  "调光影",
  "调氛围",
  "擦除",
  "高清增强",
  "去水印",
  "扩图",
  "换视角",
  "拆PSD",
  "修复人物",
]
