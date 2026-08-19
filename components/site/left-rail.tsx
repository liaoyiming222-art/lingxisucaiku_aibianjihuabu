import { Home, Briefcase, Compass, Sparkles, Package, Cloud, Folder, FileText } from "lucide-react"

const railItems = [
  { icon: Home, active: true },
  { icon: Briefcase },
  { icon: Compass },
  { icon: Sparkles },
  { icon: Package },
  { icon: Cloud },
]

const railBottom = [{ icon: Folder }, { icon: FileText }]

export function LeftRail() {
  return (
    <aside className="hidden w-14 shrink-0 flex-col items-center justify-between border-r border-black/5 bg-white py-4 md:flex">
      <div className="flex flex-col items-center gap-1">
        {railItems.map((item, i) => (
          <button
            key={i}
            className={`flex size-10 items-center justify-center rounded-xl transition-colors ${
              item.active ? "bg-neutral-900 text-white" : "text-neutral-500 hover:bg-neutral-100"
            }`}
          >
            <item.icon className="size-5" />
          </button>
        ))}
      </div>
      <div className="flex flex-col items-center gap-1">
        {railBottom.map((item, i) => (
          <button
            key={i}
            className="flex size-10 items-center justify-center rounded-xl text-neutral-500 hover:bg-neutral-100"
          >
            <item.icon className="size-5" />
          </button>
        ))}
      </div>
    </aside>
  )
}
