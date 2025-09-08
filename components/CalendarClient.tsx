'use client'

import { useState, useEffect, useCallback } from 'react'
import { ChevronLeft, ChevronRight, X } from 'lucide-react'
import DeliverableFilters from '@/components/DeliverableFilters'
import DeliverableCard from '@/components/DeliverableCard'
import StudioRequestPanel from '@/components/StudioRequestPanel'
import { useFilterStore } from '@/lib/stores/filterStore'

interface CalendarClientProps {
  user: {
    username: string
    displayName: string
    isManager: boolean
    isDesigner: boolean
    department?: string
  }
}

interface Deliverable {
  id: string
  title: string
  dueDate: string
  status: string
  displayStatus?: string
  project: string
  projectId?: string
  studioRequestNumber?: string
  studioRequestId?: string
  opportunityId?: string
  assignedTo?: string
  assignedRole?: string
  category?: string
  notes?: string
  client?: string
  completeDate?: string
}

export default function CalendarClient({ user }: CalendarClientProps) {
  // Use Zustand store for filters
  const { view, departments, people, statuses, setFilters } = useFilterStore()
  
  const [currentDate, setCurrentDate] = useState(new Date())
  const [deliverables, setDeliverables] = useState<Deliverable[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [selectedStudioRequestId, setSelectedStudioRequestId] = useState<string | null>(null)

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
    if (view === 'mine') base = 'Showing your deliverables'
    else if (view === 'department') base = `Showing ${user.department || 'department'} deliverables`
    else if (view === 'all' && user.isManager) {
      if (departments && departments.length > 0) {
        base = `Showing deliverables for ${departments.join(', ')} department${departments.length > 1 ? 's' : ''}`
      } else {
        base = 'Showing deliverables for your managed departments'
      }
    } else {
      base = 'Showing deliverables'
    }
    return base
  }

  // Fetch deliverables
  useEffect(() => {
    fetchDeliverables()
  }, [view, departments, people, statuses])

  const fetchDeliverables = async () => {
    try {
      setLoading(true)
      setError(null)

      const params = new URLSearchParams()
      params.set('view', view)
      
      if (departments && departments.length > 0) {
        params.set('departments', departments.join(','))
      }
      
      if (people && people.length > 0) {
        params.set('people', people.join(','))
      }
      
      if (statuses && statuses.length > 0) {
        params.set('statuses', statuses.join(','))
      }

      const response = await fetch(`/api/deliverables?${params}`)
      
      if (!response.ok) {
        throw new Error('Failed to fetch deliverables')
      }

      const data = await response.json()
      setDeliverables(data.deliverables || [])
    } catch (err) {
      console.error('Error fetching deliverables:', err)
      setError('Failed to load deliverables')
    } finally {
      setLoading(false)
    }
  }

  // Calendar navigation
  const goToPreviousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1))
  }

  const goToNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1))
  }

  const goToToday = () => {
    setCurrentDate(new Date())
  }

  // Get calendar days
  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startingDayOfWeek = firstDay.getDay()

    const days = []
    
    // Add empty cells for days before month starts
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null)
    }
    
    // Add days of the month
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(year, month, i))
    }
    
    return days
  }

  // Get deliverables for a specific date
  const getDeliverablesForDate = (date: Date | null) => {
    if (!date) return []
    
    const dateStr = date.toLocaleDateString('en-CA') // YYYY-MM-DD format
    return deliverables.filter(d => {
      if (!d.dueDate) return false
      const dueDate = new Date(d.dueDate)
      return dueDate.toLocaleDateString('en-CA') === dateStr
    })
  }

  // Get status color
  const getStatusColor = (status: string) => {
    const s = status?.toLowerCase()
    if (s === 'complete' || s === 'completed') return 'bg-green-100 text-green-800'
    if (s === 'overdue') return 'bg-red-100 text-red-800'
    if (s === 'at risk') return 'bg-yellow-100 text-yellow-800'
    if (s === 'in progress') return 'bg-blue-100 text-blue-800'
    return 'bg-gray-100 text-gray-800'
  }

  const days = getDaysInMonth(currentDate)
  const monthName = currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })

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

      <div className="mt-8 bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">{monthName}</h2>
            <div className="flex items-center gap-4">
              <button
                onClick={goToToday}
                className="px-3 py-1 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
              >
                Today
              </button>
              <div className="flex items-center gap-2">
                <button
                  onClick={goToPreviousMonth}
                  className="p-1 text-gray-600 hover:text-gray-900"
                  aria-label="Previous month"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <button
                  onClick={goToNextMonth}
                  className="p-1 text-gray-600 hover:text-gray-900"
                  aria-label="Next month"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="p-12 text-center">
            <p className="text-gray-500">Loading deliverables...</p>
          </div>
        ) : error ? (
          <div className="p-12 text-center">
            <p className="text-red-600">{error}</p>
          </div>
        ) : (
          <div className="p-6">
            <div className="grid grid-cols-7 gap-px bg-gray-200">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                <div key={day} className="bg-gray-50 p-2 text-center text-sm font-semibold text-gray-900">
                  {day}
                </div>
              ))}
              
              {days.map((day, index) => {
                const dayDeliverables = getDeliverablesForDate(day)
                const isToday = day && day.toDateString() === new Date().toDateString()
                
                return (
                  <div
                    key={index}
                    onClick={() => day && setSelectedDate(day)}
                    className={`min-h-[120px] bg-white p-2 cursor-pointer hover:bg-gray-50 transition-colors ${
                      isToday ? 'ring-2 ring-blue-500' : ''
                    } ${
                      selectedDate && day && day.toDateString() === selectedDate.toDateString() 
                        ? 'bg-blue-50' 
                        : ''
                    }`}
                  >
                    {day && (
                      <>
                        <div className={`text-sm ${isToday ? 'font-bold text-blue-600' : 'text-gray-900'}`}>
                          {day.getDate()}
                        </div>
                        <div className="mt-1 space-y-1">
                          {dayDeliverables.slice(0, 3).map(deliverable => (
                            <div
                              key={deliverable.id}
                              className={`text-xs p-1 rounded truncate ${getStatusColor(deliverable.displayStatus || deliverable.status)}`}
                              title={`${deliverable.title} - ${deliverable.project}`}
                            >
                              {deliverable.title}
                            </div>
                          ))}
                          {dayDeliverables.length > 3 && (
                            <div className="text-xs text-gray-500">
                              +{dayDeliverables.length - 3} more
                            </div>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>

      {/* Expanded Day View */}
      {selectedDate && (
        <div className="fixed inset-y-0 right-0 w-full max-w-lg bg-white shadow-xl z-50 overflow-hidden flex flex-col">
          <div className="px-6 py-4 border-b bg-gray-50">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  {selectedDate.toLocaleDateString('en-US', { 
                    weekday: 'long', 
                    month: 'long', 
                    day: 'numeric',
                    year: 'numeric'
                  })}
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  {getDeliverablesForDate(selectedDate).length} deliverable{getDeliverablesForDate(selectedDate).length !== 1 ? 's' : ''}
                </p>
              </div>
              <button
                onClick={() => setSelectedDate(null)}
                className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-6">
            {getDeliverablesForDate(selectedDate).length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500">No deliverables due on this date.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {getDeliverablesForDate(selectedDate).map(deliverable => (
                  <DeliverableCard 
                    key={deliverable.id} 
                    deliverable={deliverable} 
                    onClick={() => {
                      if (deliverable.studioRequestId) {
                        setSelectedStudioRequestId(deliverable.studioRequestId)
                      }
                    }}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Studio Request Panel */}
      <StudioRequestPanel
        studioRequestId={selectedStudioRequestId}
        onClose={() => setSelectedStudioRequestId(null)}
      />
    </>
  )
}