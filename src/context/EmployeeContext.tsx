import { createContext, useContext, useState, useEffect } from 'react'
import { type Employee } from '@/types/employee'

type EmployeeContextType = {
  employees: Employee[]
  setEmployees: React.Dispatch<React.SetStateAction<Employee[]>>
  updateEmployee: (updated: Employee) => void
  deleteEmployee: (id: string) => void
}

const EmployeeContext = createContext<EmployeeContextType | null>(null)

function load<T>(key: string, fallback: T): T {
  try { return JSON.parse(localStorage.getItem(key) ?? '') } catch { return fallback }
}

export function EmployeeProvider({ children }: { children: React.ReactNode }) {
  const [employees, setEmployees] = useState<Employee[]>(() => load('rl_employees', []))

  useEffect(() => {
    localStorage.setItem('rl_employees', JSON.stringify(employees))
  }, [employees])

  function updateEmployee(updated: Employee) {
    setEmployees(prev => prev.map(e => e.id === updated.id ? updated : e))
  }

  function deleteEmployee(id: string) {
    setEmployees(prev => prev.filter(e => e.id !== id))
  }

  return (
    <EmployeeContext.Provider value={{ employees, setEmployees, updateEmployee, deleteEmployee }}>
      {children}
    </EmployeeContext.Provider>
  )
}

export function useEmployees() {
  const ctx = useContext(EmployeeContext)
  if (!ctx) throw new Error('useEmployees must be used inside EmployeeProvider')
  return ctx
}
