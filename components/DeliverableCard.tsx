import { Calendar, User, Briefcase, FileText, AlertCircle, Hash, Building2 } from 'lucide-react'

interface DeliverableCardProps {
  deliverable: {
    id: string
    title: string
    dueDate: string
    status: string
    displayStatus?: string
    project: string
    studioRequestNumber?: string
    studioRequestId?: string
    opportunityId?: string
    assignedTo?: string
    assignedRole?: string
    category?: string
    notes?: string
    client?: string
    completeDate?: string
    department?: string
  }
  onClick?: () => void
}

export default function DeliverableCard({ deliverable, onClick }: DeliverableCardProps) {
  // Format the date
  const formatDate = (dateString: string) => {
    if (!dateString) return 'No due date'
    try {
      const date = new Date(dateString)
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric', 
        year: 'numeric' 
      })
    } catch {
      return dateString
    }
  }

  // Determine status color
  const getStatusColor = (status: string) => {
    // Handle both raw status and calculated DisplayStatus
    const normalizedStatus = status?.toLowerCase() || ''
    
    switch (normalizedStatus) {
      case 'completed':
      case 'complete':
        return 'bg-green-100 text-green-800'
      case 'in progress':
      case 'in_progress':
      case 'pending':  // Treat pending as in progress
        return 'bg-blue-100 text-blue-800'
      case 'overdue':
        return 'bg-red-100 text-red-800'
      case 'at risk':
      case 'delayed':
        return 'bg-red-100 text-red-800'
      case 'not started':
        return 'bg-gray-100 text-gray-800'
      case 'cancelled':
      case 'canceled':
        return 'bg-gray-300 text-gray-600'
      default:
        return 'bg-yellow-100 text-yellow-800'
    }
  }

  // Check if overdue
  const isOverdue = () => {
    if (!deliverable.dueDate || deliverable.completeDate) return false
    // Also exclude cancelled status
    if (deliverable.status?.toLowerCase() === 'cancelled' || deliverable.status?.toLowerCase() === 'canceled') return false
    const dueDate = new Date(deliverable.dueDate)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    return dueDate < today
  }

  return (
    <div 
      className="bg-white rounded-lg shadow hover:shadow-md transition-shadow p-4 border border-gray-200 cursor-pointer"
      onClick={onClick}>
      <div className="space-y-3">
        {/* Top: Studio Request Number and Client */}
        <div className="flex items-center justify-between pb-2 border-b border-gray-100">
          <div className="flex flex-col">
            {deliverable.studioRequestNumber && (
              <span className="text-base font-bold text-gray-900">{deliverable.studioRequestNumber}</span>
            )}
            {deliverable.client && (
              <span className="text-base font-bold text-gray-900">{deliverable.client}</span>
            )}
          </div>
          <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(deliverable.displayStatus || deliverable.status)}`}>
            {deliverable.displayStatus || deliverable.status || 'Unknown'}
          </span>
        </div>

        {/* Project Info */}
        <div className="space-y-1">
          {deliverable.project && (
            <div className="flex items-start">
              <Briefcase className="h-4 w-4 mr-2 text-gray-400 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900 line-clamp-1">{deliverable.project}</p>
              </div>
            </div>
          )}
        </div>

        {/* Deliverable Title */}
        <div>
          <h3 className="text-base font-semibold text-gray-900 line-clamp-2">
            {deliverable.title || 'Untitled Deliverable'}
          </h3>
          {deliverable.category && (
            <p className="text-xs text-gray-500 mt-1">{deliverable.category}</p>
          )}
        </div>

        {/* Assignee and Due Date */}
        <div className="flex items-center justify-between pt-2 border-t border-gray-100">
          {deliverable.assignedTo && (
            <div className="flex items-center text-sm text-gray-600">
              <User className="h-4 w-4 mr-1 text-gray-400" />
              <div className="flex flex-col">
                <span className="truncate max-w-[150px]">{deliverable.assignedTo}</span>
                <div className="flex items-center gap-2">
                  {deliverable.assignedRole && (
                    <span className="text-xs text-gray-400">{deliverable.assignedRole}</span>
                  )}
                  {deliverable.department && (
                    <>
                      {deliverable.assignedRole && <span className="text-xs text-gray-400">•</span>}
                      <span className="text-xs text-gray-400">{deliverable.department}</span>
                    </>
                  )}
                </div>
              </div>
            </div>
          )}
          <div className="flex items-center text-sm">
            {deliverable.completeDate ? (
              <>
                <Calendar className="h-4 w-4 mr-1 text-green-500" />
                <span className="text-gray-600">
                  Completed {formatDate(deliverable.completeDate)}
                </span>
              </>
            ) : (
              <>
                {isOverdue() && <AlertCircle className="h-4 w-4 mr-1 text-red-500" />}
                <Calendar className={`h-4 w-4 mr-1 ${isOverdue() ? 'text-red-500' : 'text-gray-400'}`} />
                <span className={isOverdue() ? 'text-red-600 font-medium' : 'text-gray-600'}>
                  Due {formatDate(deliverable.dueDate)}
                </span>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}