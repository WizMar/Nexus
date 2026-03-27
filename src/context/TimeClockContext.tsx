import { createContext, useContext, useState, useEffect } from 'react'
import { type TimeEntry } from '@/types/timeclock'

type TimeClockContextType = {
  entries: TimeEntry[]
  setEntries: React.Dispatch<React.SetStateAction<TimeEntry[]>>
  updateEntry: (updated: TimeEntry) => void
}

const TimeClockContext = createContext<TimeClockContextType | null>(null)

function load<T>(key: string, fallback: T): T {
  try { return JSON.parse(localStorage.getItem(key) ?? '') } catch { return fallback }
}

export function TimeClockProvider({ children }: { children: React.ReactNode }) {
  const [entries, setEntries] = useState<TimeEntry[]>(() => load('rl_timeclock', []))

  useEffect(() => {
    localStorage.setItem('rl_timeclock', JSON.stringify(entries))
  }, [entries])

  function updateEntry(updated: TimeEntry) {
    setEntries(prev => prev.map(e => e.id === updated.id ? updated : e))
  }

  return (
    <TimeClockContext.Provider value={{ entries, setEntries, updateEntry }}>
      {children}
    </TimeClockContext.Provider>
  )
}

export function useTimeClock() {
  const ctx = useContext(TimeClockContext)
  if (!ctx) throw new Error('useTimeClock must be used inside TimeClockProvider')
  return ctx
}
