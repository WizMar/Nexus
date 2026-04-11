import { createContext, useContext, useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import type { Estimate, RoofCalc, TradeCalc, LineItem } from '@/types/estimate'

type EstimatesContextType = {
  estimates: Estimate[]
  loading: boolean
  addEstimate: (e: Omit<Estimate, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>
  updateEstimate: (e: Estimate) => Promise<void>
  deleteEstimate: (id: string) => Promise<void>
  nextNumber: () => Promise<string>
}

const EstimatesContext = createContext<EstimatesContextType | null>(null)

function toEstimate(row: Record<string, unknown>): Estimate {
  return {
    id: row.id as string,
    estimateNumber: (row.estimate_number as string) ?? '',
    status: (row.status as Estimate['status']) ?? 'Draft',
    client: {
      name: (row.client_name as string) ?? '',
      phone: (row.client_phone as string) ?? '',
      email: (row.client_email as string) ?? '',
    },
    address: (row.address as string) ?? '',
    jobType: (row.job_type as Estimate['jobType']) ?? 'General',
    roofCalc: (row.roof_calc as RoofCalc) ?? {},
    tradeCalc: (row.trade_calc as TradeCalc) ?? {},
    lineItems: (row.line_items as LineItem[]) ?? [],
    notes: (row.notes as string) ?? '',
    scope: (row.scope as string) ?? '',
    convertedJobId: (row.converted_job_id as string) ?? null,
    createdAt: (row.created_at as string) ?? '',
    updatedAt: (row.updated_at as string) ?? '',
  }
}

const ORG_ID = 'default-org'

export function EstimatesProvider({ children }: { children: React.ReactNode }) {
  const [estimates, setEstimates] = useState<Estimate[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase
      .from('estimates')
      .select('*')
      .eq('org_id', ORG_ID)
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        if (data) setEstimates(data.map(toEstimate))
        setLoading(false)
      })
  }, [])

  async function nextNumber(): Promise<string> {
    const { count } = await supabase
      .from('estimates')
      .select('*', { count: 'exact', head: true })
      .eq('org_id', ORG_ID)
    const next = (count ?? 0) + 1
    return `EST-${String(next).padStart(4, '0')}`
  }

  async function addEstimate(e: Omit<Estimate, 'id' | 'createdAt' | 'updatedAt'>) {
    const { data, error } = await supabase.from('estimates').insert({
      org_id: ORG_ID,
      estimate_number: e.estimateNumber,
      status: e.status,
      client_name: e.client.name,
      client_phone: e.client.phone,
      client_email: e.client.email,
      address: e.address,
      job_type: e.jobType,
      roof_calc: e.roofCalc,
      trade_calc: e.tradeCalc,
      line_items: e.lineItems,
      notes: e.notes,
      scope: e.scope,
      converted_job_id: e.convertedJobId,
    }).select().single()
    if (data && !error) setEstimates(prev => [toEstimate(data), ...prev])
  }

  async function updateEstimate(e: Estimate) {
    const { error } = await supabase.from('estimates').update({
      status: e.status,
      client_name: e.client.name,
      client_phone: e.client.phone,
      client_email: e.client.email,
      address: e.address,
      job_type: e.jobType,
      roof_calc: e.roofCalc,
      trade_calc: e.tradeCalc,
      line_items: e.lineItems,
      notes: e.notes,
      scope: e.scope,
      converted_job_id: e.convertedJobId,
      updated_at: new Date().toISOString(),
    }).eq('id', e.id)
    if (!error) setEstimates(prev => prev.map(x => x.id === e.id ? e : x))
  }

  async function deleteEstimate(id: string) {
    const { error } = await supabase.from('estimates').delete().eq('id', id)
    if (!error) setEstimates(prev => prev.filter(x => x.id !== id))
  }

  return (
    <EstimatesContext.Provider value={{ estimates, loading, addEstimate, updateEstimate, deleteEstimate, nextNumber }}>
      {children}
    </EstimatesContext.Provider>
  )
}

export function useEstimates() {
  const ctx = useContext(EstimatesContext)
  if (!ctx) throw new Error('useEstimates must be used inside EstimatesProvider')
  return ctx
}
