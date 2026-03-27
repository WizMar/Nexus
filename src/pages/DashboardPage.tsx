import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

const summaryCards = [
  { label: 'Active Jobs', value: '0', color: 'text-emerald-400' },
  { label: 'Pending Estimates', value: '0', color: 'text-yellow-400' },
  { label: 'Clocked In', value: '0', color: 'text-blue-400' },
  { label: 'Revenue This Month', value: '$0', color: 'text-emerald-400' },
]

const recentJobs: { id: number; client: string; address: string; status: string; date: string }[] = []

const statusColors: Record<string, string> = {
  Draft: 'bg-stone-700 text-stone-300',
  Scheduled: 'bg-blue-900 text-blue-300',
  'In Progress': 'bg-yellow-900 text-yellow-300',
  Completed: 'bg-emerald-900 text-emerald-300',
  Invoiced: 'bg-purple-900 text-purple-300',
}

export default function DashboardPage() {
  return (
    <div className="max-w-7xl mx-auto space-y-8 text-white">
        {/* Page Title */}
        <div>
          <h2 className="text-2xl font-bold text-white">Dashboard</h2>
          <p className="text-stone-400 text-sm mt-1">Here's what's going on with your business.</p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {summaryCards.map(card => (
            <Card key={card.label} className="bg-stone-900 border-stone-800 text-white">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-stone-400">
                  {card.label}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className={`text-3xl font-bold ${card.color}`}>{card.value}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Quick Actions */}
        <div>
          <h3 className="text-lg font-semibold text-white mb-3">Quick Actions</h3>
          <div className="flex flex-wrap gap-3">
            <Button className="bg-emerald-600 hover:bg-emerald-500 text-white">
              + New Estimate
            </Button>
            <Button className="bg-stone-700 hover:bg-stone-600 text-white">
              + New Job
            </Button>
            <Button className="bg-stone-700 hover:bg-stone-600 text-white">
              + Add Employee
            </Button>
          </div>
        </div>

        {/* Recent Jobs */}
        <div>
          <h3 className="text-lg font-semibold text-white mb-3">Recent Jobs</h3>
          <Card className="bg-stone-900 border-stone-800 text-white">
            {recentJobs.length === 0 ? (
              <CardContent className="py-12 text-center text-stone-500">
                No jobs yet. Create your first job to get started.
              </CardContent>
            ) : (
              <CardContent className="p-0">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-stone-800 text-stone-400">
                      <th className="text-left px-4 py-3 font-medium">Client</th>
                      <th className="text-left px-4 py-3 font-medium">Address</th>
                      <th className="text-left px-4 py-3 font-medium">Status</th>
                      <th className="text-left px-4 py-3 font-medium">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentJobs.map(job => (
                      <tr key={job.id} className="border-b border-stone-800 hover:bg-stone-800 cursor-pointer transition-colors">
                        <td className="px-4 py-3 text-white font-medium">{job.client}</td>
                        <td className="px-4 py-3 text-stone-400">{job.address}</td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-1 rounded text-xs font-medium ${statusColors[job.status]}`}>
                            {job.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-stone-400">{job.date}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </CardContent>
            )}
          </Card>
        </div>
    </div>
  )
}
