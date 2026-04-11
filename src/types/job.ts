export type JobStatus = 'Draft' | 'Scheduled' | 'In Progress' | 'Completed' | 'Invoiced'
export type JobType = 'Roofing' | 'HVAC' | 'Plumbing' | 'Electrical' | 'Landscaping' | 'Painting' | 'General' | 'Other'

export type Job = {
  id: string
  title: string
  client: {
    name: string
    phone: string
    email: string
  }
  address: string
  type: JobType
  status: JobStatus
  leadId: string | null
  crewIds: string[]
  notes: string
  scope: string
  scheduledDate: string
  createdAt: string
  updatedAt: string
}

export const JOB_TYPES: JobType[] = [
  'Roofing', 'HVAC', 'Plumbing', 'Electrical', 'Landscaping', 'Painting', 'General', 'Other',
]

export const JOB_STATUSES: JobStatus[] = [
  'Draft', 'Scheduled', 'In Progress', 'Completed', 'Invoiced',
]

export const STATUS_COLORS: Record<JobStatus, string> = {
  Draft: '#6b7280',
  Scheduled: '#2980b9',
  'In Progress': '#e67e22',
  Completed: '#27ae60',
  Invoiced: '#8e44ad',
}

export const STATUS_BADGE: Record<JobStatus, string> = {
  Draft: 'bg-stone-700 text-stone-300',
  Scheduled: 'bg-blue-900/60 text-blue-300',
  'In Progress': 'bg-orange-900/60 text-orange-300',
  Completed: 'bg-emerald-900/60 text-emerald-300',
  Invoiced: 'bg-purple-900/60 text-purple-300',
}

export const STATUS_BORDER: Record<JobStatus, string> = {
  Draft: 'border-l-stone-500',
  Scheduled: 'border-l-blue-500',
  'In Progress': 'border-l-orange-500',
  Completed: 'border-l-emerald-500',
  Invoiced: 'border-l-purple-500',
}
