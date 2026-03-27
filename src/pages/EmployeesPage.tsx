import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { type Employee, emptyEmployee, roleColors, statusColors } from '@/types/employee'
import { useEmployees } from '@/context/EmployeeContext'

export default function EmployeesPage() {
  const navigate = useNavigate()
  const { employees, setEmployees } = useEmployees()
  const [open, setOpen] = useState(false)
  const [editTarget, setEditTarget] = useState<Employee | null>(null)
  const [form, setForm] = useState(emptyEmployee)
  const [search, setSearch] = useState('')

  function openAdd() {
    setEditTarget(null)
    setForm(emptyEmployee)
    setOpen(true)
  }

  function openEdit(emp: Employee) {
    setEditTarget(emp)
    setForm({ name: emp.name, phone: emp.phone, email: emp.email, role: emp.role, hireDate: emp.hireDate, birthdate: emp.birthdate, status: emp.status, address: emp.address, emergencyContact: emp.emergencyContact, emergencyPhone: emp.emergencyPhone, notes: emp.notes, profilePicture: emp.profilePicture })
    setOpen(true)
  }

  function handleSave() {
    if (!form.name) return
    if (editTarget) {
      setEmployees(prev => prev.map(e => e.id === editTarget.id ? { ...editTarget, ...form } : e))
    } else {
      setEmployees(prev => [...prev, { id: crypto.randomUUID(), ...form }])
    }
    setOpen(false)
  }

  function toggleStatus(id: string) {
    setEmployees(prev => prev.map(e => e.id === id ? { ...e, status: e.status === 'Active' ? 'Inactive' : 'Active' } : e))
  }

  function archiveEmployee(id: string) {
    setEmployees(prev => prev.map(e => e.id === id ? { ...e, status: 'Archived' } : e))
  }

  function deleteEmployee(id: string) {
    if (!confirm('Are you sure you want to delete this employee? This cannot be undone.')) return
    setEmployees(prev => prev.filter(e => e.id !== id))
  }

  const filtered = employees.filter(e =>
    e.name.toLowerCase().includes(search.toLowerCase()) ||
    e.role.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="max-w-5xl mx-auto space-y-6 text-white">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Employees</h2>
          <p className="text-stone-400 text-sm mt-1">Manage your team members and their roles.</p>
        </div>
        <Button onClick={openAdd} className="bg-emerald-600 hover:bg-emerald-500 text-white">
          + Add Employee
        </Button>
      </div>

      <Input
        placeholder="Search by name or role..."
        value={search}
        onChange={e => setSearch(e.target.value)}
        className="bg-stone-800 border-stone-700 text-white placeholder:text-stone-500 max-w-sm"
      />

      <Card className="bg-stone-900 border-stone-800 text-white">
        {filtered.length === 0 ? (
          <CardContent className="py-12 text-center text-stone-500">
            {employees.length === 0 ? 'No employees yet. Add your first team member.' : 'No results found.'}
          </CardContent>
        ) : (
          <CardContent className="p-0">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-stone-800 text-stone-400">
                  <th className="text-left px-4 py-3 font-medium">Name</th>
                  <th className="text-left px-4 py-3 font-medium">Phone</th>
                  <th className="text-left px-4 py-3 font-medium">Role</th>
                  <th className="text-left px-4 py-3 font-medium">Status</th>
                  <th className="text-left px-4 py-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(emp => (
                  <tr key={emp.id} className="border-b border-stone-800 hover:bg-stone-800 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        {emp.profilePicture ? (
                          <img src={emp.profilePicture} className="w-8 h-8 rounded-full object-cover" />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-stone-700 flex items-center justify-center text-stone-300 text-xs font-bold">
                            {emp.name.charAt(0).toUpperCase()}
                          </div>
                        )}
                        <button
                          onClick={() => navigate(`/employees/${emp.id}`)}
                          className="text-white font-medium hover:text-emerald-400 transition-colors"
                        >
                          {emp.name}
                        </button>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-stone-400">{emp.phone || '—'}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${roleColors[emp.role]}`}>{emp.role}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${statusColors[emp.status]}`}>{emp.status}</span>
                    </td>
                    <td className="px-4 py-3 flex gap-2">
                      <button onClick={() => openEdit(emp)} className="text-stone-400 hover:text-white text-xs underline">Edit</button>
                      <button onClick={() => toggleStatus(emp.id)} className="text-stone-400 hover:text-white text-xs underline">
                        {emp.status === 'Active' ? 'Deactivate' : 'Activate'}
                      </button>
                      <button onClick={() => archiveEmployee(emp.id)} className="text-yellow-500 hover:text-yellow-400 text-xs underline">Archive</button>
                      <button onClick={() => deleteEmployee(emp.id)} className="text-red-500 hover:text-red-400 text-xs underline">Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        )}
      </Card>

      {/* Add / Edit Dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="bg-stone-900 border-stone-700 text-white">
          <DialogHeader>
            <DialogTitle className="text-white">{editTarget ? 'Edit Employee' : 'Add Employee'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label className="text-stone-300">Full Name *</Label>
              <Input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
                placeholder="John Smith" className="bg-stone-800 border-stone-700 text-white placeholder:text-stone-500" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-stone-300">Phone</Label>
                <Input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })}
                  placeholder="(555) 000-0000" className="bg-stone-800 border-stone-700 text-white placeholder:text-stone-500" />
              </div>
              <div className="space-y-2">
                <Label className="text-stone-300">Email</Label>
                <Input value={form.email} onChange={e => setForm({ ...form, email: e.target.value })}
                  placeholder="john@email.com" className="bg-stone-800 border-stone-700 text-white placeholder:text-stone-500" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-stone-300">Role</Label>
                <Select value={form.role} onValueChange={val => setForm({ ...form, role: val as Employee['role'] })}>
                  <SelectTrigger className="bg-stone-800 border-stone-700 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-stone-800 border-stone-700 text-white">
                    <SelectItem value="Employee">Employee</SelectItem>
                    <SelectItem value="Sales">Sales</SelectItem>
                    <SelectItem value="Admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-stone-300">Hire Date</Label>
                <Input type="date" value={form.hireDate} onChange={e => setForm({ ...form, hireDate: e.target.value })}
                  className="bg-stone-800 border-stone-700 text-white" />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setOpen(false)} className="text-stone-400 hover:text-white">Cancel</Button>
            <Button onClick={handleSave} className="bg-emerald-600 hover:bg-emerald-500 text-white">
              {editTarget ? 'Save Changes' : 'Add Employee'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
