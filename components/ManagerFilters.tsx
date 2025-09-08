'use client'

import { useState, useEffect } from 'react'
import { ChevronDown, Users, Building } from 'lucide-react'

interface ManagerFiltersProps {
  onFilterChange: (filters: {
    department: string
    person: string
  }) => void
  currentFilters?: {
    department: string
    person: string
  }
}

export default function ManagerFilters({ onFilterChange, currentFilters }: ManagerFiltersProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [departments, setDepartments] = useState<string[]>([])
  const [employees, setEmployees] = useState<{ id: string; name: string; department: string }[]>([])
  const [selectedDepartment, setSelectedDepartment] = useState(currentFilters?.department || 'all')
  const [selectedPerson, setSelectedPerson] = useState(currentFilters?.person || 'all')
  const [loading, setLoading] = useState(true)

  // Fetch departments and employees
  useEffect(() => {
    fetchFilterData()
  }, [])

  // Update parent when filters change
  useEffect(() => {
    onFilterChange({
      department: selectedDepartment,
      person: selectedPerson
    })
  }, [selectedDepartment, selectedPerson, onFilterChange])

  const fetchFilterData = async () => {
    try {
      const response = await fetch('/api/filters/manager-data')
      if (response.ok) {
        const data = await response.json()
        setDepartments(data.departments || [])
        setEmployees(data.employees || [])
      }
    } catch (error) {
      console.error('Error fetching filter data:', error)
    } finally {
      setLoading(false)
    }
  }

  // Filter employees based on selected department
  const filteredEmployees = selectedDepartment === 'all' 
    ? employees 
    : employees.filter(emp => emp.department === selectedDepartment)

  const handleDepartmentChange = (dept: string) => {
    setSelectedDepartment(dept)
    // Reset person filter when department changes
    if (dept !== 'all' && selectedPerson !== 'all') {
      const personInDept = employees.find(emp => emp.id === selectedPerson && emp.department === dept)
      if (!personInDept) {
        setSelectedPerson('all')
      }
    }
  }

  return (
    <div className="bg-white rounded-lg shadow mb-6">
      <div className="p-4">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center justify-between w-full text-left"
        >
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-semibold text-gray-900">Manager Filters</h3>
            {(selectedDepartment !== 'all' || selectedPerson !== 'all') && (
              <span className="text-sm text-blue-600 bg-blue-50 px-2 py-1 rounded">
                Active
              </span>
            )}
          </div>
          <ChevronDown className={`h-5 w-5 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </button>

        {isOpen && (
          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Department Filter */}
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                <Building className="h-4 w-4" />
                Department
              </label>
              <select
                value={selectedDepartment}
                onChange={(e) => handleDepartmentChange(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={loading}
              >
                <option value="all">All Departments</option>
                {departments.map(dept => (
                  <option key={dept} value={dept}>{dept}</option>
                ))}
              </select>
            </div>

            {/* Person Filter */}
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                <Users className="h-4 w-4" />
                Person
              </label>
              <select
                value={selectedPerson}
                onChange={(e) => setSelectedPerson(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={loading}
              >
                <option value="all">All People</option>
                {filteredEmployees.map(emp => (
                  <option key={emp.id} value={emp.id}>
                    {emp.name}
                    {selectedDepartment === 'all' && ` (${emp.department})`}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}

      </div>
    </div>
  )
}