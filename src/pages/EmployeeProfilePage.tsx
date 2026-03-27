import { useParams, useNavigate } from 'react-router-dom'
import { useState, useRef } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { type Employee, roleColors, statusColors, timeWithCompany } from '@/types/employee'
import { useEmployees } from '@/context/EmployeeContext'
import { useTimeClock } from '@/context/TimeClockContext'
import { calcHours, fmtTime, fmtHours } from '@/types/timeclock'

export default function EmployeeProfilePage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { employees, updateEmployee } = useEmployees()
  const { entries } = useTimeClock()
  const empEntries = entries
    .filter(e => e.employeeId === id)
    .sort((a, b) => b.date.localeCompare(a.date))
  const employee = employees.find(e => e.id === id)
  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState<Employee | null>(employee ?? null)
  const fileRef = useRef<HTMLInputElement>(null)

  if (!employee || !form) {
    return (
      <div className="text-center text-stone-400 mt-20">
        <p>Employee not found.</p>
        <Button onClick={() => navigate('/employees')} className="mt-4 bg-emerald-600 hover:bg-emerald-500 text-white">Back to Employees</Button>
      </div>
    )
  }

  function handlePicChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      const pic = reader.result as string
      setForm(f => f ? { ...f, profilePicture: pic } : null)
      if (employee) updateEmployee({ ...employee, profilePicture: pic })
    }
    reader.readAsDataURL(file)
  }

  function handleSave() {
    if (!form) return
    updateEmployee(form)
    setEditing(false)
  }

  function handleCancel() {
    setForm(employee ?? null)
    setEditing(false)
  }

  function formatDate(date: string) {
    if (!date) return '—'
    return new Date(date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
  }

  const data = editing ? form : employee

  return (
    <div className="max-w-3xl mx-auto space-y-6 text-white">
      {/* Back */}
      <button onClick={() => navigate('/employees')} className="text-stone-400 hover:text-white text-sm flex items-center gap-1">
        ← Back to Employees
      </button>

      {/* Profile Header */}
      <Card className="bg-stone-900 border-stone-800 text-white">
        <CardContent className="pt-6">
          <div className="flex items-center gap-6">
            <div className="relative">
              {data.profilePicture ? (
                <img src={data.profilePicture} className="w-24 h-24 rounded-full object-cover border-2 border-stone-700" />
              ) : (
                <div className="w-24 h-24 rounded-full bg-stone-700 flex items-center justify-center text-3xl font-bold text-stone-300 border-2 border-stone-600">
                  {data.name.charAt(0).toUpperCase()}
                </div>
              )}
              <button
                onClick={() => fileRef.current?.click()}
                className="absolute bottom-0 right-0 bg-emerald-600 hover:bg-emerald-500 text-white rounded-full w-7 h-7 flex items-center justify-center text-xs"
                title="Upload photo"
              >
                +
              </button>
              <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handlePicChange} />
            </div>

            <div className="flex-1">
              <h2 className="text-2xl font-bold text-white">{employee.name}</h2>
              <div className="flex items-center gap-2 mt-1">
                <span className={`px-2 py-1 rounded text-xs font-medium ${roleColors[employee.role]}`}>{employee.role}</span>
                <span className={`px-2 py-1 rounded text-xs font-medium ${statusColors[employee.status]}`}>{employee.status}</span>
              </div>
              <p className="text-stone-400 text-sm mt-2">With the company for <span className="text-emerald-400 font-medium">{timeWithCompany(employee.hireDate)}</span></p>
            </div>

            <div>
              {editing ? (
                <div className="flex gap-2">
                  <Button onClick={handleSave} className="bg-emerald-600 hover:bg-emerald-500 text-white text-sm">Save</Button>
                  <Button onClick={handleCancel} variant="ghost" className="text-stone-400 hover:text-white text-sm">Cancel</Button>
                </div>
              ) : (
                <Button onClick={() => setEditing(true)} className="bg-stone-700 hover:bg-stone-600 text-white text-sm">Edit Profile</Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Info Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Card className="bg-stone-900 border-stone-800 text-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-stone-400 font-medium">Contact</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {editing ? (
              <>
                <Field label="Phone" value={form.phone} onChange={v => setForm({ ...form, phone: v })} />
                <Field label="Email" value={form.email} onChange={v => setForm({ ...form, email: v })} />
                <Field label="Address" value={form.address} onChange={v => setForm({ ...form, address: v })} />
              </>
            ) : (
              <>
                <InfoRow label="Phone" value={employee.phone} />
                <InfoRow label="Email" value={employee.email} />
                <InfoRow label="Address" value={employee.address} />
              </>
            )}
          </CardContent>
        </Card>

        <Card className="bg-stone-900 border-stone-800 text-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-stone-400 font-medium">Employment</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {editing ? (
              <>
                <Field label="Hire Date" value={form.hireDate} onChange={v => setForm({ ...form, hireDate: v })} type="date" />
                <div className="space-y-1">
                  <Label className="text-stone-500 text-xs">Role</Label>
                  <Select value={form.role} onValueChange={v => setForm({ ...form, role: v as Employee['role'] })}>
                    <SelectTrigger className="bg-stone-800 border-stone-700 text-white h-8 text-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-stone-800 border-stone-700 text-white">
                      <SelectItem value="Employee">Employee</SelectItem>
                      <SelectItem value="Sales">Sales</SelectItem>
                      <SelectItem value="Admin">Admin</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <Label className="text-stone-500 text-xs">Status</Label>
                  <Select value={form.status} onValueChange={v => setForm({ ...form, status: v as Employee['status'] })}>
                    <SelectTrigger className="bg-stone-800 border-stone-700 text-white h-8 text-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-stone-800 border-stone-700 text-white">
                      <SelectItem value="Active">Active</SelectItem>
                      <SelectItem value="Inactive">Inactive</SelectItem>
                      <SelectItem value="Archived">Archived</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </>
            ) : (
              <>
                <InfoRow label="Hire Date" value={formatDate(employee.hireDate)} />
                <InfoRow label="Time with Company" value={timeWithCompany(employee.hireDate)} />
                <InfoRow label="Role" value={employee.role} />
              </>
            )}
          </CardContent>
        </Card>

        <Card className="bg-stone-900 border-stone-800 text-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-stone-400 font-medium">Personal</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {editing ? (
              <Field label="Birthday" value={form.birthdate} onChange={v => setForm({ ...form, birthdate: v })} type="date" />
            ) : (
              <InfoRow label="Birthday" value={formatDate(employee.birthdate)} />
            )}
          </CardContent>
        </Card>

        <Card className="bg-stone-900 border-stone-800 text-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-stone-400 font-medium">Emergency Contact</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {editing ? (
              <>
                <Field label="Name" value={form.emergencyContact} onChange={v => setForm({ ...form, emergencyContact: v })} />
                <Field label="Phone" value={form.emergencyPhone} onChange={v => setForm({ ...form, emergencyPhone: v })} />
              </>
            ) : (
              <>
                <InfoRow label="Name" value={employee.emergencyContact} />
                <InfoRow label="Phone" value={employee.emergencyPhone} />
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Notes */}
      <Card className="bg-stone-900 border-stone-800 text-white">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm text-stone-400 font-medium">Notes</CardTitle>
        </CardHeader>
        <CardContent>
          {editing ? (
            <textarea
              value={form.notes}
              onChange={e => setForm({ ...form, notes: e.target.value })}
              placeholder="Add notes about this employee..."
              className="w-full bg-stone-800 border border-stone-700 text-white text-sm rounded-md p-2 placeholder:text-stone-500 resize-none h-24 focus:outline-none focus:ring-1 focus:ring-emerald-600"
            />
          ) : (
            <p className="text-stone-300 text-sm whitespace-pre-wrap">{employee.notes || '—'}</p>
          )}
        </CardContent>
      </Card>

      {/* Time History */}
      <Card className="bg-stone-900 border-stone-800 text-white">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm text-stone-400 font-medium">Time History</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {empEntries.length === 0 ? (
            <p className="text-stone-500 text-sm px-4 py-6">No time records yet.</p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-stone-800 text-stone-400">
                  <th className="text-left px-4 py-3 font-medium">Date</th>
                  <th className="text-left px-4 py-3 font-medium">Clock In</th>
                  <th className="text-left px-4 py-3 font-medium">Lunch</th>
                  <th className="text-left px-4 py-3 font-medium">Clock Out</th>
                  <th className="text-left px-4 py-3 font-medium">Total</th>
                  <th className="text-left px-4 py-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {empEntries.map(entry => (
                  <tr key={entry.id} className="border-b border-stone-800 hover:bg-stone-800 transition-colors">
                    <td className="px-4 py-3 text-white">{new Date(entry.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</td>
                    <td className="px-4 py-3 text-stone-400">{fmtTime(entry.clockIn)}</td>
                    <td className="px-4 py-3 text-stone-400">
                      {entry.lunchStart ? `${fmtTime(entry.lunchStart)} – ${fmtTime(entry.lunchEnd)}` : '—'}
                    </td>
                    <td className="px-4 py-3 text-stone-400">{fmtTime(entry.clockOut)}</td>
                    <td className="px-4 py-3 text-emerald-400 font-mono">{fmtHours(calcHours(entry))}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        entry.status === 'approved' ? 'bg-emerald-900 text-emerald-300' :
                        entry.status === 'completed' ? 'bg-stone-700 text-stone-300' :
                        entry.status === 'pending_edit' ? 'bg-yellow-900 text-yellow-300' :
                        'bg-blue-900 text-blue-300'
                      }`}>
                        {entry.status === 'approved' ? 'Approved' :
                         entry.status === 'completed' ? 'Completed' :
                         entry.status === 'pending_edit' ? 'Edit Pending' : 'Active'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-stone-500 text-xs">{label}</p>
      <p className="text-white text-sm">{value || '—'}</p>
    </div>
  )
}

function Field({ label, value, onChange, type = 'text' }: { label: string; value: string; onChange: (v: string) => void; type?: string }) {
  return (
    <div className="space-y-1">
      <Label className="text-stone-500 text-xs">{label}</Label>
      <Input type={type} value={value} onChange={e => onChange(e.target.value)}
        className="bg-stone-800 border-stone-700 text-white h-8 text-sm" />
    </div>
  )
}
