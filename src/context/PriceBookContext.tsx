import { createContext, useContext, useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/context/AuthContext'
import type { PriceBookItem } from '@/types/pricebook'

type PriceBookContextType = {
  items: PriceBookItem[]
  loading: boolean
  addItem: (item: Omit<PriceBookItem, 'id' | 'createdAt'>) => Promise<void>
  updateItem: (item: PriceBookItem) => Promise<void>
  deleteItem: (id: string) => Promise<void>
}

const PriceBookContext = createContext<PriceBookContextType | null>(null)

function toItem(row: Record<string, unknown>): PriceBookItem {
  return {
    id: row.id as string,
    name: (row.name as string) ?? '',
    description: (row.description as string) ?? '',
    category: (row.category as string) ?? 'Misc',
    unit: (row.unit as string) ?? 'ea',
    unitPrice: (row.unit_price as number) ?? 0,
    createdAt: (row.created_at as string) ?? '',
  }
}

export function PriceBookProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth()
  const [items, setItems] = useState<PriceBookItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user?.org_id) { setLoading(false); return }
    supabase
      .from('price_book')
      .select('*')
      .eq('org_id', user.org_id)
      .order('category', { ascending: true })
      .order('name', { ascending: true })
      .then(({ data }) => {
        if (data) setItems(data.map(toItem))
        setLoading(false)
      })
  }, [user?.org_id])

  async function addItem(item: Omit<PriceBookItem, 'id' | 'createdAt'>) {
    if (!user?.org_id) return
    const { data, error } = await supabase
      .from('price_book')
      .insert({
        org_id: user.org_id,
        name: item.name,
        description: item.description,
        category: item.category,
        unit: item.unit,
        unit_price: item.unitPrice,
      })
      .select()
      .single()
    if (data && !error) setItems(prev => [...prev, toItem(data)].sort((a, b) => a.category.localeCompare(b.category) || a.name.localeCompare(b.name)))
  }

  async function updateItem(item: PriceBookItem) {
    const { error } = await supabase
      .from('price_book')
      .update({
        name: item.name,
        description: item.description,
        category: item.category,
        unit: item.unit,
        unit_price: item.unitPrice,
      })
      .eq('id', item.id)
    if (!error) setItems(prev => prev.map(x => x.id === item.id ? item : x))
  }

  async function deleteItem(id: string) {
    const { error } = await supabase.from('price_book').delete().eq('id', id)
    if (!error) setItems(prev => prev.filter(x => x.id !== id))
  }

  return (
    <PriceBookContext.Provider value={{ items, loading, addItem, updateItem, deleteItem }}>
      {children}
    </PriceBookContext.Provider>
  )
}

export function usePriceBook() {
  const ctx = useContext(PriceBookContext)
  if (!ctx) throw new Error('usePriceBook must be used inside PriceBookProvider')
  return ctx
}
