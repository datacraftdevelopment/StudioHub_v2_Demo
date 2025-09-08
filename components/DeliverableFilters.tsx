'use client'

import { useState, useEffect } from 'react'
import { ChevronDown, Users, Building, User, Eye } from 'lucide-react'

interface DeliverableFiltersProps {
  user: {
    username: string
    displayName: string
    isManager: boolean
    isDesigner: boolean
    department?: string
    departmentManager?: string
  }
  onFilterChange: (filters: {
    view: 'mine' | 'department' | 'all'
    departments?: string[]
    people?: string[]
    statuses?: string[]
  }) => void
  currentFilters?: {
    view: 'mine' | 'department' | 'all'
    departments?: string[]
    people?: string[]
    statuses?: string[]
  }
}

// Fixed list of departments
const DEPARTMENTS = [
  'Graphics',
  'Structural',
  'Industrial',
  'Engineering',
  'Environmental'
]

// Status options - matching FileMaker Status field values
const STATUSES = [
  { value: 'complete', label: 'Complete', color: 'text-green-600' },
  { value: 'cancelled', label: 'Cancelled', color: 'text-gray-600' },
  { value: 'overdue', label: 'Overdue', color: 'text-red-600' }
]

export default function DeliverableFilters({ user, onFilterChange, currentFilters }: DeliverableFiltersProps) {
  const [isOpen, setIsOpen] = useState(true)
  
  // Parse departmentManager field to get default departments
  const getDefaultDepartments = () => {
    if (!user.departmentManager) return []
    // departmentManager might be comma-separated or semicolon-separated
    return user.departmentManager
      .split(/[,;]/)
      .map(dept => dept.trim())
      .filter(dept => dept && DEPARTMENTS.includes(dept))
  }
  
  // Set default view mode to 'all' for managers with departmentManager field
  const getDefaultViewMode = () => {
    if (currentFilters?.view) return currentFilters.view
    if (user.isManager && user.departmentManager) return 'all'
    return 'mine'
  }
  
  const [viewMode, setViewMode] = useState<'mine' | 'department' | 'all'>(getDefaultViewMode())
  const [selectedDepartments, setSelectedDepartments] = useState<string[]>(
    currentFilters?.departments || (user.isManager ? getDefaultDepartments() : [])
  )

  // Update parent when filters change
  useEffect(() => {
    // For managers in 'all' view with no departments selected, use default departments
    const effectiveDepartments = viewMode === 'all' && user.isManager && selectedDepartments.length === 0
      ? getDefaultDepartments()
      : selectedDepartments

    onFilterChange({
      view: viewMode,
      departments: effectiveDepartments,
      people: [],
      statuses: []
    })
  }, [viewMode, selectedDepartments, onFilterChange])

  const handleViewModeChange = (mode: 'mine' | 'department' | 'all') => {
    setViewMode(mode)
    // Reset manager filters when switching to non-manager views
    if (mode !== 'all') {
      setSelectedDepartments([])
    }
  }

  const handleDepartmentToggle = (dept: string) => {
    setSelectedDepartments(prev => {
      const newDepts = prev.includes(dept) 
        ? prev.filter(d => d !== dept)
        : [...prev, dept]
      return newDepts
    })
  }

  const hasActiveFilters = (viewMode !== 'mine') || 
    (user.isManager && selectedDepartments.length > 0)

  return (
    <div className="bg-white rounded-lg shadow mb-6">
      <div className="p-4">
        <div className="flex items-center justify-between">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="flex items-center gap-2 text-left flex-1"
          >
            <ChevronDown className={`h-5 w-5 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            <h3 className="text-lg font-semibold text-gray-900">Filters</h3>
            {hasActiveFilters && (
              <span className="text-sm text-blue-600 bg-blue-50 px-2 py-1 rounded">
                Active
              </span>
            )}
          </button>
          {isOpen && hasActiveFilters && (
            <button
              onClick={() => setIsOpen(false)}
              className="text-sm text-gray-500 hover:text-gray-700 px-3 py-1 rounded hover:bg-gray-100"
            >
              Collapse
            </button>
          )}
        </div>

        {isOpen && (
          <div className="mt-4 space-y-4">
            {/* View Mode Selection */}
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-3">
                <Eye className="h-4 w-4" />
                View
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => handleViewModeChange('mine')}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    viewMode === 'mine'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <User className="h-4 w-4 inline mr-1" />
                  My Items
                </button>
                <button
                  onClick={() => handleViewModeChange('department')}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    viewMode === 'department'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <Building className="h-4 w-4 inline mr-1" />
                  My Department
                </button>
                {user.isManager && (
                  <button
                    onClick={() => handleViewModeChange('all')}
                    className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      viewMode === 'all'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    <Users className="h-4 w-4 inline mr-1" />
                    All Teams
                  </button>
                )}
              </div>
            </div>


            {/* Manager-only filters */}
            {user.isManager && viewMode === 'all' && (
              <div className="pt-4 border-t border-gray-200">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-sm font-medium text-gray-700 flex items-center gap-2">
                    <Building className="h-4 w-4" />
                    Select Departments
                  </h4>
                  <button
                    onClick={() => {
                      if (selectedDepartments.length === DEPARTMENTS.length) {
                        setSelectedDepartments([])
                      } else {
                        setSelectedDepartments(DEPARTMENTS)
                      }
                    }}
                    className="text-xs text-blue-600 hover:text-blue-800"
                  >
                    {selectedDepartments.length === DEPARTMENTS.length ? 'Deselect all' : 'Select all'}
                  </button>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
                  {DEPARTMENTS.map(dept => (
                    <label
                      key={dept}
                      className={`
                        flex items-center gap-2 px-3 py-2 rounded-md cursor-pointer transition-all
                        ${selectedDepartments.includes(dept)
                          ? 'bg-blue-100 text-blue-800 border-2 border-blue-300'
                          : 'bg-gray-50 hover:bg-gray-100 border-2 border-gray-200'
                        }
                      `}
                    >
                      <input
                        type="checkbox"
                        checked={selectedDepartments.includes(dept)}
                        onChange={() => handleDepartmentToggle(dept)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm font-medium">{dept}</span>
                    </label>
                  ))}
                </div>
                {selectedDepartments.length === 0 && getDefaultDepartments().length > 0 && (
                  <div className="mt-3">
                    <p className="text-sm text-gray-500">
                      No departments selected - showing your default departments:
                    </p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {getDefaultDepartments().map(dept => (
                        <span key={dept} className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm bg-gray-100 text-gray-700">
                          <Building className="h-3 w-3" />
                          {dept}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                {selectedDepartments.length === 0 && getDefaultDepartments().length === 0 && (
                  <p className="text-sm text-gray-500 mt-3">
                    No departments selected - showing all departments
                  </p>
                )}
                {user.departmentManager && selectedDepartments.length > 0 && (
                  <p className="text-xs text-gray-500 mt-2">
                    Custom selection (defaults: {getDefaultDepartments().join(', ')})
                  </p>
                )}
              </div>
            )}

          </div>
        )}
      </div>
    </div>
  )
}