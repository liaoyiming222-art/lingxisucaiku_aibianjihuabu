import { Search, ChevronDown, Coins, Crown, Upload } from "lucide-react"

export function TopNav() {
  return (
    <header className="flex h-16 shrink-0 items-center gap-4 border-b border-black/5 bg-white px-4">
      <img src="/icon.svg" width={40} height={40} alt="灵犀" className="size-10 shrink-0" />

      <div className="flex flex-1 items-center gap-3">
        <button className="flex items-center gap-1 rounded-full bg-neutral-100 px-4 py-2 text-sm font-medium text-neutral-700">
          图库
          <ChevronDown className="size-4" />
        </button>
        <div className="relative hidden max-w-md flex-1 sm:block">
          <input
            type="text"
            defaultValue="现代董事长办公室"
            className="w-full rounded-full bg-neutral-100 py-2 pl-4 pr-10 text-sm text-neutral-700 outline-none placeholder:text-neutral-400"
            placeholder="搜索灵感图片"
          />
        </div>
        <button className="flex items-center gap-1 rounded-full bg-[var(--color-zhimo-red)] px-5 py-2 text-sm font-medium text-white">
          <Search className="size-4" />
          搜索
        </button>
      </div>

      <nav className="flex items-center gap-5 text-sm text-neutral-600">
        <button className="hidden items-center gap-1 md:flex">
          <Coins className="size-4 text-amber-500" />
          充值
        </button>
        <button className="hidden items-center gap-1 md:flex">
          <Crown className="size-4 text-amber-500" />
          VIP
        </button>
        <button className="hidden items-center gap-1 md:flex">
          <Upload className="size-4" />
          上传
        </button>
        <div className="size-9 overflow-hidden rounded-full bg-amber-100 ring-2 ring-amber-200">
          <div className="flex size-full items-center justify-center text-lg">🐶</div>
        </div>
      </nav>
    </header>
  )
}
