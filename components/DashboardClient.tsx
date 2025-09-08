'use client'

import { useCallback, useEffect, useState, useMemo } from 'react'
import DeliverableFilters from '@/components/DeliverableFilters'
import DeliverablesList from '@/components/DeliverablesList'
import { useFilterStore } from '@/lib/stores/filterStore'

interface DashboardClientProps {
  user: {
    username: string
    displayName: string
    isManager: boolean
    isDesigner: boolean
    department?: string
  }
}

export default function DashboardClient({ user }: DashboardClientProps) {
  // Use Zustand store for filters
  const { view, departments, people, statuses, groupBy, setFilters, setGroupBy } = useFilterStore()
  
  const [summaryData, setSummaryData] = useState({
    overdue: 0,
    dueToday: 0,
    upcoming: 0
  })

  const handleFilterChange = useCallback((newFilters: {
    view: 'mine' | 'department' | 'all'
    departments?: string[]
    people?: string[]
    statuses?: string[]
  }) => {
    setFilters(newFilters)
  }, [setFilters])

  // Get filter description for display
  const getFilterDescription = () => {
    let base = ''
    if (view === 'mine') base = 'Showing your active deliverables'
    else if (view === 'department') base = `Showing ${user.department || 'department'} active deliverables`
    else if (view === 'all' && user.isManager) {
      if (departments && departments.length > 0) {
        base = `Showing active deliverables for ${departments.join(', ')} department${departments.length > 1 ? 's' : ''}`
      } else {
        // When departments is empty but we have effective departments from the filter component
        base = 'Showing active deliverables for your managed departments'
      }
    } else {
      base = 'Showing active deliverables'
    }
    return base + ' (In Progress and Overdue items only)'
  }

  return (
    <>
      <DeliverableFilters 
        user={user}
        onFilterChange={handleFilterChange}
        currentFilters={{ view, departments, people, statuses }}
      />

      <div className="mb-4">
        <p className="text-sm text-gray-600">{getFilterDescription()}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-2">Overdue</h2>
          <p className="text-3xl font-bold text-red-600">{summaryData.overdue}</p>
          <p className="text-sm text-gray-500 mt-1">Deliverables overdue</p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-2">Due Today</h2>
          <p className="text-3xl font-bold text-yellow-600">{summaryData.dueToday}</p>
          <p className="text-sm text-gray-500 mt-1">Deliverables due today</p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-2">Upcoming</h2>
          <p className="text-3xl font-bold text-blue-600">{summaryData.upcoming}</p>
          <p className="text-sm text-gray-500 mt-1">Due in next 7 days</p>
        </div>
      </div>

      <div className="mt-8 bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Recent Deliverables</h2>
          <div className="flex items-center gap-2">
            <label htmlFor="group-by" className="text-sm font-medium text-gray-700">
              Group by:
            </label>
            <select
              id="group-by"
              value={groupBy}
              onChange={(e) => setGroupBy(e.target.value as 'status' | 'designer')}
              className="rounded-md border-gray-300 py-1.5 text-sm shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="status">Status</option>
              <option value="designer">Designer</option>
            </select>
          </div>
        </div>
        <div className="p-6">
          <DeliverablesList 
            filters={useMemo(() => ({ view, departments, people, statuses }), [view, departments, people, statuses])} 
            groupBy={groupBy} 
            onDataLoad={setSummaryData} 
          />
        </div>
      </div>
    </>
  )
}