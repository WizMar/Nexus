export type Employee = {
  id: string
  name: string
  phone: string
  email: string
  role: 'Laborer' | 'Employee' | 'Lead' | 'Sales' | 'Sub-Admin' | 'Admin'
  hireDate: string
  birthdate: string
  status: 'Active' | 'Inactive' | 'Archived'
  address: string
  emergencyContact: string
  emergencyPhone: string
  notes: string
  profilePicture: string
}

export const emptyEmployee: Omit<Employee, 'id'> = {
  name: '',
  phone: '',
  email: '',
  role: 'Employee',
  hireDate: '',
  birthdate: '',
  status: 'Active',
  address: '',
  emergencyContact: '',
  emergencyPhone: '',
  notes: '',
  profilePicture: '',
}

export const roleColors: Record<string, string> = {
  Admin: 'bg-emerald-900 text-emerald-300',
  'Sub-Admin': 'bg-teal-900 text-teal-300',
  Sales: 'bg-blue-900 text-blue-300',
  Lead: 'bg-orange-900 text-orange-300',
  Employee: 'bg-stone-700 text-stone-300',
  Laborer: 'bg-stone-700 text-stone-400',
}

export const statusColors: Record<string, string> = {
  Active: 'bg-emerald-900 text-emerald-300',
  Inactive: 'bg-yellow-900 text-yellow-300',
  Archived: 'bg-red-900 text-red-300',
}

export function timeWithCompany(hireDate: string): string {
  if (!hireDate) return '—'
  const start = new Date(hireDate)
  const now = new Date()
  const years = now.getFullYear() - start.getFullYear()
  const months = now.getMonth() - start.getMonth() + years * 12
  if (months < 1) return 'Less than a month'
  if (months < 12) return `${months} month${months > 1 ? 's' : ''}`
  const y = Math.floor(months / 12)
  const m = months % 12
  return `${y} yr${y > 1 ? 's' : ''}${m > 0 ? ` ${m} mo` : ''}`
}
