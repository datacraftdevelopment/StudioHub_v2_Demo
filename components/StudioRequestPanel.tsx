'use client'

import { useState, useEffect } from 'react'
import { X, Calendar, CheckCircle, AlertCircle, Clock, Users, FileText } from 'lucide-react'

interface StudioRequestPanelProps {
  studioRequestId: string | null
  onClose: () => void
}

interface StudioRequestDetails {
  studioRequest: {
    id: string
    number: string
    projectName: string
    clientName: string
    createdDate: string
    status: string
    notes: string
  }
  deliverables: {
    id: string
    title: string
    dueDate: string
    status: string
    category?: string
    assignedTo?: string
    completeDate?: string
    estimatedHours?: string
    actualHours?: string
  }[]
  summary: {
    total: number
    completed: number
    overdue: number
  }
}

export default function StudioRequestPanel({ studioRequestId, onClose }: StudioRequestPanelProps) {
  const [loading, setLoading] = useState(false)
  const [data, setData] = useState<StudioRequestDetails | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (studioRequestId) {
      fetchStudioRequestDetails()
    }
  }, [studioRequestId])

  const fetchStudioRequestDetails = async () => {
    if (!studioRequestId) return
    
    try {
      setLoading(true)
      setError(null)
      
      console.log('Fetching studio request:', studioRequestId)
      
      const response = await fetch(`/api/studio-requests/${studioRequestId}`)
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        console.error('API error:', response.status, errorData)
        throw new Error(errorData.error || 'Failed to fetch studio request details')
      }
      
      const data = await response.json()
      setData(data)
    } catch (err: any) {
      console.error('Error fetching studio request:', err)
      setError(err.message || 'Failed to load studio request details')
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    if (!dateString) return ''
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

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'completed':
      case 'complete':
        return 'bg-green-100 text-green-800'
      case 'in progress':
      case 'in_progress':
        return 'bg-blue-100 text-blue-800'
      case 'at risk':
      case 'delayed':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const isOverdue = (dueDate: string, status: string) => {
    if (!dueDate || status?.toLowerCase() === 'complete') return false
    return new Date(dueDate) < new Date()
  }

  // Don't render if no ID
  if (!studioRequestId) return null

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity"
        onClick={onClose}
      />
      
      {/* Panel */}
      <div className="fixed right-0 top-0 h-full w-full max-w-2xl bg-white shadow-xl z-50 overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 bg-gray-50 border-b flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">Studio Request Details</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        
        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {loading && (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          )}
          
          {error && (
            <div className="p-6">
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
                {error}
              </div>
            </div>
          )}
          
          {data && (
            <div className="p-6 space-y-6">
              {/* Studio Request Info */}
              <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-base text-gray-700 font-medium">
                      {data.studioRequest.number}
                    </p>
                    {data.studioRequest.clientName && (
                      <h3 className="text-lg font-bold text-gray-900 mt-1">
                        {data.studioRequest.clientName}
                      </h3>
                    )}
                  </div>
                  <span className={`px-3 py-1 text-sm font-medium rounded-full ${getStatusColor(data.studioRequest.status)}`}>
                    {data.studioRequest.status || 'Active'}
                  </span>
                </div>
                
                <div className="space-y-2 text-sm">
                  <div className="flex items-center text-gray-600">
                    <FileText className="h-4 w-4 mr-2" />
                    <span className="font-medium">Project:</span>
                    <span className="ml-2">{data.studioRequest.projectName}</span>
                  </div>
                  {data.studioRequest.createdDate && (
                    <div className="flex items-center text-gray-600">
                      <Calendar className="h-4 w-4 mr-2" />
                      <span className="font-medium">Created:</span>
                      <span className="ml-2">{formatDate(data.studioRequest.createdDate)}</span>
                    </div>
                  )}
                </div>
                
                {data.studioRequest.notes && (
                  <div className="pt-3 border-t">
                    <p className="text-sm text-gray-600">{data.studioRequest.notes}</p>
                  </div>
                )}
              </div>
              
              {/* Summary Stats */}
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-blue-50 rounded-lg p-4 text-center">
                  <p className="text-3xl font-bold text-blue-600">{data.summary.total}</p>
                  <p className="text-sm text-blue-700 mt-1">Total Deliverables</p>
                </div>
                <div className="bg-green-50 rounded-lg p-4 text-center">
                  <p className="text-3xl font-bold text-green-600">{data.summary.completed}</p>
                  <p className="text-sm text-green-700 mt-1">Completed</p>
                </div>
                <div className="bg-red-50 rounded-lg p-4 text-center">
                  <p className="text-3xl font-bold text-red-600">{data.summary.overdue}</p>
                  <p className="text-sm text-red-700 mt-1">Overdue</p>
                </div>
              </div>
              
              {/* Deliverables List */}
              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-4">All Deliverables</h4>
                <div className="space-y-3">
                  {data.deliverables.map(deliverable => (
                    <div 
                      key={deliverable.id}
                      className={`border rounded-lg p-4 ${
                        deliverable.status === 'Complete' 
                          ? 'bg-gray-50 border-gray-200' 
                          : 'bg-white border-gray-300'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h5 className={`font-medium ${
                            deliverable.status === 'Complete' ? 'text-gray-500' : 'text-gray-900'
                          }`}>
                            {deliverable.title}
                          </h5>
                          {deliverable.category && (
                            <p className="text-sm text-gray-500 mt-1">{deliverable.category}</p>
                          )}
                        </div>
                        <span className={`ml-4 px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(deliverable.status)}`}>
                          {deliverable.status}
                        </span>
                      </div>
                      
                      <div className="mt-3 flex items-center justify-between text-sm">
                        <div className="flex items-center space-x-4">
                          {deliverable.assignedTo && (
                            <div className="flex items-center text-gray-600">
                              <Users className="h-3 w-3 mr-1" />
                              <span>{deliverable.assignedTo}</span>
                            </div>
                          )}
                          <div className="flex items-center text-gray-600">
                            <Calendar className="h-3 w-3 mr-1" />
                            <span className={isOverdue(deliverable.dueDate, deliverable.status) ? 'text-red-600 font-medium' : ''}>
                              Due: {formatDate(deliverable.dueDate)}
                            </span>
                          </div>
                        </div>
                        
                        {deliverable.status === 'Complete' && deliverable.completeDate && (
                          <div className="flex items-center text-green-600 text-xs">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            <span>Completed: {formatDate(deliverable.completeDate)}</span>
                          </div>
                        )}
                      </div>
                      
                      {(deliverable.estimatedHours || deliverable.actualHours) && (
                        <div className="mt-2 flex items-center space-x-4 text-xs text-gray-500">
                          {deliverable.estimatedHours && (
                            <div className="flex items-center">
                              <Clock className="h-3 w-3 mr-1" />
                              <span>Est: {deliverable.estimatedHours}</span>
                            </div>
                          )}
                          {deliverable.actualHours && (
                            <div className="flex items-center">
                              <Clock className="h-3 w-3 mr-1" />
                              <span>Actual: {deliverable.actualHours}</span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  )
}