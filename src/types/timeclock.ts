export type GpsLocation = {
  lat: number
  lng: number
}

export type TimeEntry = {
  id: string
  employeeId: string
  employeeName: string
  clockIn: string
  clockOut: string | null
  lunchStart: string | null
  lunchEnd: string | null
  clockInLocation: GpsLocation | null
  clockOutLocation: GpsLocation | null
  status: 'active' | 'on_lunch' | 'completed' | 'pending_edit' | 'approved'
  editRequest: string | null
  editedClockIn: string | null
  editedClockOut: string | null
  date: string
}

export function calcHours(entry: TimeEntry): number {
  const start = new Date(entry.clockIn).getTime()
  const end = entry.clockOut ? new Date(entry.clockOut).getTime() : Date.now()
  let ms = end - start
  if (entry.lunchStart && entry.lunchEnd) {
    ms -= new Date(entry.lunchEnd).getTime() - new Date(entry.lunchStart).getTime()
  }
  return Math.max(0, ms / 1000 / 3600)
}

export function fmtTime(iso: string | null): string {
  if (!iso) return '—'
  return new Date(iso).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })
}

export function fmtHours(h: number): string {
  const hrs = Math.floor(h)
  const mins = Math.round((h - hrs) * 60)
  return `${hrs}h ${mins}m`
}
