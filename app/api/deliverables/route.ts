import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { FileMakerClient } from '@/lib/filemaker-client'
import { MockFileMakerClient } from '@/lib/mock/mock-filemaker-client'
import { 
  allMockDeliverables, 
  getDeliverablesForUser, 
  getDeliverablesForDepartment, 
  getDeliverablesForDepartments, 
  getDeliverablesWithStatuses,
  mockUsers 
} from '@/lib/mock/mock-data'

interface DeliverableRecord {
  fieldData: {
    __kptID: string
    DeliverableName: string
    DueDate: string
    Status: string
    ProjectName: string
    StudioRequestNumber?: string
    _kftProjectID?: string
    _kftStudioRequestID?: string
    'request_deliverables__PROJECTS__ProjectID::ClientName'?: string
    'request_deliverables__ASSIGNEES__RequestDeliverableID__cre_del::StaffFullName'?: string
    'request_deliverables__ASSIGNEES__RequestDeliverableID__cre_del::RoleName'?: string
    'request_deliverables__ASSIGNEES__RequestDeliverableID__cre_del::StaffDepartment'?: string
    CategoryName?: string
    Notes?: string
    completeDate?: string
    DesignerName?: string
    DisplayStatus?: string
    'request_deliverables__STUDIO_REQUESTS__StudioRequestID::Description'?: string
    'request_deliverables__STUDIO_REQUESTS__StudioRequestID::AccountName'?: string
    // Additional fields to eliminate separate API calls
    'request_deliverables__PROJECTS__ProjectID::_kftClientID'?: string
    'request_deliverables__PROJECTS__ProjectID::_kftPACEOpportunityID'?: string
    'request_deliverables__STUDIO_REQUESTS__StudioRequestID::CreationTStamp'?: string
    'request_deliverables__STUDIO_REQUESTS__StudioRequestID::Status'?: string
    'request_deliverables__STUDIO_REQUESTS__StudioRequestID::Notes'?: string
    EstimatedHours_Graphics?: string
    'zci_Sum_ActualHours_Total'?: string
    // Actual client name from CUSTOMER table (if possible through relationships)
    'request_deliverables__PROJECTS__ProjectID::request_deliverables__CUSTOMER__ClientID::custName'?: string
  }
}

export async function GET(request: NextRequest) {
  try {
    // Check if user is authenticated
    const sessionCookie = cookies().get('fm-session')
    const userCookie = cookies().get('fm-user')
    
    if (!sessionCookie || !userCookie) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Parse session data
    let sessionData
    try {
      sessionData = JSON.parse(sessionCookie.value)
    } catch (e) {
      // Fallback for old session format
      sessionData = { token: sessionCookie.value, createdAt: Date.now() }
    }
    
    let user
    try {
      user = JSON.parse(userCookie.value)
    } catch (e) {
      return NextResponse.json(
        { error: 'Invalid user data' },
        { status: 400 }
      )
    }
    
    // Get query parameters
    const searchParams = request.nextUrl.searchParams
    const view = searchParams.get('view') || 'mine'
    const departments = searchParams.get('departments')?.split(',').filter(Boolean) || []
    const people = searchParams.get('people')?.split(',').filter(Boolean) || []
    const statuses = searchParams.get('statuses')?.split(',').filter(Boolean) || []
    const limit = parseInt(searchParams.get('limit') || '500')
    const offset = 1

    // Check if we're in demo mode
    const isDemoMode = process.env.NEXT_PUBLIC_DEMO_MODE === 'true'
    
    // Initialize appropriate client based on mode
    let client
    if (isDemoMode) {
      client = new MockFileMakerClient(sessionData.token)
    } else {
      client = new FileMakerClient(sessionData.token)
    }
    
    // Fetch deliverables based on status filter
    let deliverables: DeliverableRecord[] = []
    let totalCount = 0
    
    try {
      // Build query based on view and status filters
      let query: Record<string, string>[] = []
      
      // First, determine status filter
      const statusFilter = statuses.length > 0 
        ? statuses 
        : ["In Progress", "Overdue"] // Default statuses
      
      // Build query based on view
      if (view === 'mine') {
        // My Items - filter by DesignerName
        query = statusFilter.map(status => ({ 
          DesignerName: user.displayName,
          DisplayStatus: status 
        }))
      } else if (view === 'department' && user.department) {
        // My Department - filter by StaffDepartment
        query = statusFilter.map(status => ({ 
          DisplayStatus: status,
          'request_deliverables__ASSIGNEES__RequestDeliverableID__cre_del::StaffDepartment': user.department
        }))
      } else if (view === 'all') {
        // Selected Departments - filter by selected departments
        if (departments.length > 0) {
          query = []
          departments.forEach(dept => {
            statusFilter.forEach(status => {
              query.push({
                DisplayStatus: status,
                'request_deliverables__ASSIGNEES__RequestDeliverableID__cre_del::StaffDepartment': dept
              })
            })
          })
        } else {
          // No departments selected, show all
          query = statusFilter.map(status => ({ DisplayStatus: status }))
        }
      } else {
        // Fallback to status filter only
        query = statusFilter.map(status => ({ DisplayStatus: status }))
      }
      
      // Use findRecords with the query
      deliverables = await client.findRecords('REQUEST_DELIVERABLES', query, limit)
      
    } catch (queryError: any) {
      console.error('Query execution error:', queryError)
      console.error('Error response:', queryError.response?.data)
      
      // If no records found (401 error), return empty array instead of throwing
      if (queryError.response?.data?.messages?.[0]?.code === '401') {
        deliverables = []
      } else {
        throw queryError
      }
    }
    
    
    
    // Format the deliverables for the frontend
    let formattedDeliverables = deliverables.map(record => {
      // Extract client from ProjectName
      // Common formats: "Client / Project" or "20-2630 Client / Project"
      let client = ''
      const projectName = record.fieldData.ProjectName || ''
      
      if (projectName.includes('/')) {
        const parts = projectName.split('/')
        // Remove any leading numbers/codes from the first part
        const firstPart = parts[0].trim()
        // Remove pattern like "20-2630 " from the beginning
        client = firstPart.replace(/^\d+-\d+\s+/, '').trim()
      }
      
      return {
        id: record.fieldData.__kptID,
        title: record.fieldData.DeliverableName,
        dueDate: record.fieldData.DueDate,
        status: record.fieldData.Status,
        project: projectName,
        projectId: record.fieldData._kftProjectID,
        client: record.fieldData['request_deliverables__PROJECTS__ProjectID::request_deliverables__CUSTOMER__ClientID::custName'] || 
                record.fieldData['request_deliverables__PROJECTS__ProjectID::ClientName'] || 
                client,
        studioRequestNumber: record.fieldData.StudioRequestNumber,
        studioRequestId: record.fieldData._kftStudioRequestID,
        opportunityId: record.fieldData['request_deliverables__PROJECTS__ProjectID::_kftPACEOpportunityID'],
        assignedTo: record.fieldData['request_deliverables__ASSIGNEES__RequestDeliverableID__cre_del::StaffFullName'] || record.fieldData.DesignerName,
        assignedRole: record.fieldData['request_deliverables__ASSIGNEES__RequestDeliverableID__cre_del::RoleName'],
        assignedDepartment: record.fieldData['request_deliverables__ASSIGNEES__RequestDeliverableID__cre_del::StaffDepartment'],
        category: record.fieldData.CategoryName,
        notes: record.fieldData.Notes,
        completeDate: record.fieldData.completeDate,
        displayStatus: record.fieldData.DisplayStatus,
        // Studio Request related fields
        studioRequestCreated: record.fieldData['request_deliverables__STUDIO_REQUESTS__StudioRequestID::CreationTStamp'],
        studioRequestStatus: record.fieldData['request_deliverables__STUDIO_REQUESTS__StudioRequestID::Status'],
        studioRequestNotes: record.fieldData['request_deliverables__STUDIO_REQUESTS__StudioRequestID::Notes'],
        studioRequestDescription: record.fieldData['request_deliverables__STUDIO_REQUESTS__StudioRequestID::Description'],
        accountName: record.fieldData['request_deliverables__STUDIO_REQUESTS__StudioRequestID::AccountName'],
        // Hours tracking
        estimatedHours: record.fieldData.EstimatedHours_Graphics,
        actualHours: record.fieldData['zci_Sum_ActualHours_Total']
      }
    })
    
    
    return NextResponse.json({
      deliverables: formattedDeliverables,
      total: formattedDeliverables.length,
      filters: { view, departments, people, statuses }
    })
  } catch (error: any) {
    console.error('Error fetching deliverables:', error)
    console.error('Error details:', error.response?.data || error.message)
    return NextResponse.json(
      { error: 'Failed to fetch deliverables', details: error.message },
      { status: 500 }
    )
  }
}