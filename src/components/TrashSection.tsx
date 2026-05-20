import { useState } from 'react'
import { Trash2, RotateCcw, X, ChevronDown } from 'lucide-react'
import { Button } from '@/components/ui/button'

type TrashItem = {
  id: string
  label: string
  sublabel?: string
}

type Props = {
  items: TrashItem[]
  onRestore: (id: string) => Promise<void>
  onPurge: (id: string) => Promise<void>
}

export default function TrashSection({ items, onRestore, onPurge }: Props) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState<string | null>(null)

  if (items.length === 0) return null

  async function handleRestore(id: string) {
    setLoading(`restore-${id}`)
    await onRestore(id)
    setLoading(null)
  }

  async function handlePurge(id: string) {
    setLoading(`purge-${id}`)
    await onPurge(id)
    setLoading(null)
  }

  return (
    <div className="border border-zinc-800 rounded-xl overflow-hidden">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-zinc-800/40 transition-colors"
      >
        <div className="flex items-center gap-2">
          <Trash2 size={14} className="text-zinc-600" />
          <span className="text-zinc-500 text-sm font-medium">Recently Deleted</span>
          <span className="text-zinc-600 text-xs">({items.length})</span>
        </div>
        <ChevronDown size={14} className={`text-zinc-600 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="border-t border-zinc-800">
          <p className="text-zinc-600 text-xs px-4 py-2">Items are permanently deleted after 30 days.</p>
          {items.map((item, i) => (
            <div
              key={item.id}
              className={`flex items-center justify-between px-4 py-3 ${i < items.length - 1 ? 'border-b border-zinc-800/50' : ''}`}
            >
              <div>
                <p className="text-zinc-400 text-sm line-clamp-1">{item.label}</p>
                {item.sublabel && <p className="text-zinc-600 text-xs">{item.sublabel}</p>}
              </div>
              <div className="flex items-center gap-2 shrink-0 ml-3">
                <Button
                  size="sm"
                  variant="ghost"
                  disabled={loading !== null}
                  onClick={() => handleRestore(item.id)}
                  className="h-7 px-2 text-xs text-emerald-500 hover:text-emerald-400 hover:bg-emerald-950/30"
                >
                  <RotateCcw size={12} className="mr-1" />
                  {loading === `restore-${item.id}` ? '…' : 'Restore'}
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  disabled={loading !== null}
                  onClick={() => handlePurge(item.id)}
                  className="h-7 px-2 text-xs text-zinc-600 hover:text-red-400 hover:bg-red-950/20"
                >
                  <X size={12} className="mr-1" />
                  {loading === `purge-${item.id}` ? '…' : 'Delete'}
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
