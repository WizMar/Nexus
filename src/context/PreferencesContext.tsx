import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/context/AuthContext'

export type UserPreferences = {
  language: string
  timeFormat: '12h' | '24h'
  dateFormat: string
  startOfWeek: 0 | 1
  theme: 'dark' | 'light'
}

export const DEFAULT_PREFERENCES: UserPreferences = {
  language: 'en',
  timeFormat: '12h',
  dateFormat: 'MM/DD/YYYY',
  startOfWeek: 0,
  theme: 'dark',
}

export const LANGUAGES = [
  { value: 'en', label: 'English' },
  { value: 'es', label: 'Español (Spanish)' },
]

export const DATE_FORMATS = [
  { value: 'MM/DD/YYYY', label: 'MM/DD/YYYY (US)' },
  { value: 'DD/MM/YYYY', label: 'DD/MM/YYYY (International)' },
  { value: 'YYYY-MM-DD', label: 'YYYY-MM-DD (ISO)' },
]

function loadFromStorage(userId: string): UserPreferences | null {
  try {
    const stored = localStorage.getItem(`rl_prefs_${userId}`)
    if (!stored) return null
    return { ...DEFAULT_PREFERENCES, ...JSON.parse(stored) }
  } catch { return null }
}

type PreferencesContextType = {
  prefs: UserPreferences
  setPrefs: React.Dispatch<React.SetStateAction<UserPreferences>>
  savePrefs: () => Promise<void>
  loading: boolean
}

const PreferencesContext = createContext<PreferencesContextType | null>(null)

export function PreferencesProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth()
  const [prefs, setPrefs] = useState<UserPreferences>(DEFAULT_PREFERENCES)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user?.id) { setLoading(false); return }

    // Fast load from cache first
    const cached = loadFromStorage(user.id)
    if (cached) setPrefs(cached)

    // Then hydrate from Supabase
    supabase
      .from('profiles')
      .select('language, time_format, date_format, start_of_week, theme')
      .eq('id', user.id)
      .single()
      .then(({ data }) => {
        if (data) {
          const merged: UserPreferences = {
            language: data.language ?? DEFAULT_PREFERENCES.language,
            timeFormat: (data.time_format as UserPreferences['timeFormat']) ?? DEFAULT_PREFERENCES.timeFormat,
            dateFormat: data.date_format ?? DEFAULT_PREFERENCES.dateFormat,
            startOfWeek: (data.start_of_week as UserPreferences['startOfWeek']) ?? DEFAULT_PREFERENCES.startOfWeek,
            theme: (data.theme as UserPreferences['theme']) ?? DEFAULT_PREFERENCES.theme,
          }
          setPrefs(merged)
          localStorage.setItem(`rl_prefs_${user.id}`, JSON.stringify(merged))
        }
        setLoading(false)
      })
  }, [user?.id])

  const savePrefs = useCallback(async () => {
    if (!user?.id) return
    const { error } = await supabase
      .from('profiles')
      .update({
        language: prefs.language,
        time_format: prefs.timeFormat,
        date_format: prefs.dateFormat,
        start_of_week: prefs.startOfWeek,
        theme: prefs.theme,
      })
      .eq('id', user.id)
    if (!error) {
      localStorage.setItem(`rl_prefs_${user.id}`, JSON.stringify(prefs))
    }
  }, [user?.id, prefs])

  return (
    <PreferencesContext.Provider value={{ prefs, setPrefs, savePrefs, loading }}>
      {children}
    </PreferencesContext.Provider>
  )
}

export function usePreferences() {
  const ctx = useContext(PreferencesContext)
  if (!ctx) throw new Error('usePreferences must be used inside PreferencesProvider')
  return ctx
}

/** Format a date string using the user's preferred date format */
export function formatDate(dateStr: string, fmt: string): string {
  if (!dateStr) return ''
  const [y, m, d] = dateStr.split('-')
  if (!y || !m || !d) return dateStr
  return fmt
    .replace('YYYY', y)
    .replace('MM', m)
    .replace('DD', d)
}

/** Format a time string (HH:MM) using the user's preferred time format */
export function formatTime(timeStr: string, fmt: '12h' | '24h'): string {
  if (!timeStr) return ''
  const [hStr, min] = timeStr.split(':')
  const h = parseInt(hStr, 10)
  if (fmt === '24h') return `${String(h).padStart(2, '0')}:${min}`
  const period = h >= 12 ? 'PM' : 'AM'
  const h12 = h % 12 || 12
  return `${h12}:${min} ${period}`
}
