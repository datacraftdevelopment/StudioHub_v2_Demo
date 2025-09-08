'use client'

import { useState, useEffect } from 'react'
import DeliverableCard from './DeliverableCard'
import StudioRequestPanel from './StudioRequestPanel'
import { Loader2 } from 'lucide-react'

interface DeliverablesListProps {
  filters: {
    view: 'mine' | 'department' | 'all'
    departments?: string[]
    people?: string[]
    statuses?: string[]
  }
  groupBy?: 'status' | 'designer'
  onDataLoad?: (summaryData: { overdue: number; dueToday: number; upcoming: number }) => void
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
  assignedDepartment?: string
  category?: string
  notes?: string
  client?: string
  completeDate?: string
  // Studio Request related fields
  studioRequestCreated?: string
  studioRequestStatus?: string
  studioRequestNotes?: string
  studioRequestDescription?: string
  accountName?: string
  // Hours tracking
  estimatedHours?: string
  actualHours?: string
}

interface PaginationInfo {
  page: number
  pageSize: number
  total: number
  totalPages: number
  hasNextPage: boolean
  hasPrevPage: boolean
  recordsInPage: number
}

export default function DeliverablesList({ filters, groupBy = 'status', onDataLoad }: DeliverablesListProps) {
  const [deliverables, setDeliverables] = useState<Deliverable[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedStudioRequestId, setSelectedStudioRequestId] = useState<string | null>(null)
  const [pagination, setPagination] = useState<PaginationInfo | null>(null)
  const [currentPage, setCurrentPage] = useState(1)

  useEffect(() => {
    setCurrentPage(1) // Reset to first page when filters change
    fetchDeliverables(1)
  }, [filters])
  
  useEffect(() => {
    if (currentPage !== 1) { // Only fetch if not page 1 (page 1 is handled by filters change)
      fetchDeliverables(currentPage)
    }
  }, [currentPage])

  const fetchDeliverables = async (page: number = 1) => {
    try {
      setLoading(true)
      setError(null)
      
      console.log('Fetching deliverables with filters:', filters, 'Page:', page)

      // Build query parameters
      const params = new URLSearchParams()
      params.set('view', filters.view)
      params.set('page', page.toString())
      params.set('limit', '200')
      
      if (filters.departments && filters.departments.length > 0) {
        params.set('departments', filters.departments.join(','))
      }
      
      if (filters.people && filters.people.length > 0) {
        params.set('people', filters.people.join(','))
      }
      
      if (filters.statuses && filters.statuses.length > 0) {
        params.set('statuses', filters.statuses.join(','))
      }

      const response = await fetch(`/api/deliverables?${params}`)
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        console.error('Deliverables API error:', response.status, errorData)
        console.error('Failed with filters:', filters)
        throw new Error(errorData.error || 'Failed to fetch deliverables')
      }

      const data = await response.json()
      const deliverableData = data.deliverables || []
      setPagination(data.pagination || null)
      
      console.log('Pagination info:', data.pagination)
      
      // Client names are now included directly from the API
      console.log('Deliverables loaded with client names from FileMaker')
      
      // Sort deliverables by due date (earliest first)
      // Note: Cancelled and completed items are already filtered out by the API
      const sortedDeliverables = deliverableData.sort((a: Deliverable, b: Deliverable) => {
        // Sort by due date (earliest first)
        if (a.dueDate && b.dueDate) {
          return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
        }
        // If one has a due date and the other doesn't, prioritize the one with a due date
        if (a.dueDate && !b.dueDate) return -1
        if (!a.dueDate && b.dueDate) return 1
        // If neither has a due date, maintain original order
        return 0
      })
      
      setDeliverables(sortedDeliverables)
      
      // Calculate summary data for the cards
      if (onDataLoad) {
        const today = new Date()
        today.setHours(0, 0, 0, 0)
        
        const sevenDaysFromNow = new Date()
        sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7)
        sevenDaysFromNow.setHours(23, 59, 59, 999)
        
        let overdue = 0
        let dueToday = 0
        let upcoming = 0
        const overdueItems: any[] = []
        
        sortedDeliverables.forEach((deliverable: Deliverable) => {
          if (deliverable.dueDate) {
            const dueDate = new Date(deliverable.dueDate)
            dueDate.setHours(0, 0, 0, 0)
            
            // Count based on displayStatus if available, otherwise calculate based on date
            if (deliverable.displayStatus?.toLowerCase() === 'overdue') {
              overdue++
              overdueItems.push({
                title: deliverable.title,
                client: deliverable.client,
                project: deliverable.project,
                assignedTo: deliverable.assignedTo
              })
            } else if (dueDate < today && deliverable.status?.toLowerCase() !== 'complete') {
              overdue++
              overdueItems.push({
                title: deliverable.title,
                client: deliverable.client,
                project: deliverable.project,
                assignedTo: deliverable.assignedTo
              })
            }
            
            if (dueDate.getTime() === today.getTime()) {
              dueToday++
            }
            
            if (dueDate >= today && dueDate <= sevenDaysFromNow) {
              upcoming++
            }
          }
        })
        
        // Debug: Log overdue items to understand what's being counted
        if (overdueItems.length > 0) {
          console.log(`Found ${overdue} overdue items:`)
          console.log('Sample overdue items:', overdueItems.slice(0, 5))
        }
        
        onDataLoad({ overdue, dueToday, upcoming })
      }
    } catch (err) {
      console.error('Error fetching deliverables:', err)
      setError('Failed to load deliverables. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  // Group deliverables based on selected view
  const groupedDeliverables = deliverables.reduce((acc, deliverable) => {
    let groupKey: string
    
    if (groupBy === 'status') {
      groupKey = deliverable.displayStatus || deliverable.status || 'Unknown'
    } else {
      // Group by designer
      groupKey = deliverable.assignedTo || 'Unassigned'
    }
    
    if (!acc[groupKey]) {
      acc[groupKey] = []
    }
    acc[groupKey].push(deliverable)
    return acc
  }, {} as Record<string, Deliverable[]>)

  // Sort groups based on view type
  let sortedGroups: string[]
  
  if (groupBy === 'status') {
    // Define status order (based on DisplayStatus values)
    const statusOrder = ['Overdue', 'At Risk', 'In Progress', 'Pending', 'Not Started']
    sortedGroups = Object.keys(groupedDeliverables).sort((a, b) => {
      const aIndex = statusOrder.findIndex(s => s.toLowerCase() === a.toLowerCase())
      const bIndex = statusOrder.findIndex(s => s.toLowerCase() === b.toLowerCase())
      if (aIndex === -1 && bIndex === -1) return a.localeCompare(b)
      if (aIndex === -1) return 1
      if (bIndex === -1) return -1
      return aIndex - bIndex
    })
  } else {
    // Sort designers alphabetically, with "Unassigned" at the end
    sortedGroups = Object.keys(groupedDeliverables).sort((a, b) => {
      if (a === 'Unassigned') return 1
      if (b === 'Unassigned') return -1
      return a.localeCompare(b)
    })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
        <span className="ml-2 text-gray-600">Loading deliverables...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600">{error}</p>
        <button
          onClick={() => fetchDeliverables()}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Try Again
        </button>
      </div>
    )
  }

  if (deliverables.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">No deliverables found matching your filters.</p>
      </div>
    )
  }

  return (
    <>
      {/* Header with count */}
      {pagination && (
        <div className="mb-6 text-sm text-gray-600">
          <p>Total deliverables: <span className="font-semibold">{pagination.total}</span></p>
          {pagination.totalPages > 1 && (
            <p>Page {currentPage} of {pagination.totalPages}</p>
          )}
        </div>
      )}
      
      <div className="space-y-8">
        {sortedGroups.map(group => (
          <div key={group}>
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              {group}
              <span className="ml-2 text-sm font-normal text-gray-500">
                ({groupedDeliverables[group].length})
              </span>
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {groupedDeliverables[group].map(deliverable => (
                <DeliverableCard 
                  key={deliverable.id} 
                  deliverable={deliverable} 
                  onClick={() => {
                    console.log('Deliverable clicked:', deliverable)
                    console.log('Studio Request ID:', deliverable.studioRequestId)
                    if (deliverable.studioRequestId) {
                      setSelectedStudioRequestId(deliverable.studioRequestId)
                    } else {
                      console.warn('No studio request ID found for deliverable:', deliverable.id)
                    }
                  }}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
      
      {/* Pagination Controls */}
      {pagination && pagination.totalPages > 1 && (
        <div className="mt-8 flex items-center justify-between border-t border-gray-200 pt-6">
          <div className="flex flex-1 justify-between sm:hidden">
            <button
              onClick={() => setCurrentPage(currentPage - 1)}
              disabled={!pagination.hasPrevPage}
              className="relative inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <button
              onClick={() => setCurrentPage(currentPage + 1)}
              disabled={!pagination.hasNextPage}
              className="relative ml-3 inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
          <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700">
                Showing{' '}
                <span className="font-medium">{(currentPage - 1) * pagination.pageSize + 1}</span>
                {' '}to{' '}
                <span className="font-medium">
                  {Math.min(currentPage * pagination.pageSize, pagination.total)}
                </span>
                {' '}of{' '}
                <span className="font-medium">{pagination.total}</span>
                {' '}results
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setCurrentPage(currentPage - 1)}
                disabled={!pagination.hasPrevPage}
                className="relative inline-flex items-center rounded-l-md border border-gray-300 bg-white px-2 py-2 text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span className="sr-only">Previous</span>
                <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </button>
              
              {/* Page numbers */}
              <div className="flex items-center space-x-1">
                {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                  let pageNum
                  if (pagination.totalPages <= 5) {
                    pageNum = i + 1
                  } else if (currentPage <= 3) {
                    pageNum = i + 1
                  } else if (currentPage >= pagination.totalPages - 2) {
                    pageNum = pagination.totalPages - 4 + i
                  } else {
                    pageNum = currentPage - 2 + i
                  }
                  
                  return (
                    <button
                      key={pageNum}
                      onClick={() => setCurrentPage(pageNum)}
                      className={`relative inline-flex items-center px-4 py-2 text-sm font-medium ${
                        pageNum === currentPage
                          ? 'z-10 bg-indigo-600 text-white'
                          : 'bg-white text-gray-700 hover:bg-gray-50'
                      } border border-gray-300 rounded-md`}
                    >
                      {pageNum}
                    </button>
                  )
                })}
              </div>
              
              <button
                onClick={() => setCurrentPage(currentPage + 1)}
                disabled={!pagination.hasNextPage}
                className="relative inline-flex items-center rounded-r-md border border-gray-300 bg-white px-2 py-2 text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span className="sr-only">Next</span>
                <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
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