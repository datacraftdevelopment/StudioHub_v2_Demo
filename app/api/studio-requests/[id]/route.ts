import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { FileMakerClient } from '@/lib/filemaker-client'
import { MockFileMakerClient } from '@/lib/mock/mock-filemaker-client'
import { allMockDeliverables, mockProjects } from '@/lib/mock/mock-data'

interface StudioRequestRecord {
  fieldData: {
    __kptID: string
    StudioRequestNumber?: string
    ProjectName?: string
    _kftProjectID?: string
    CreationTStamp?: string
    Status?: string
    Notes?: string
  }
}

interface DeliverableRecord {
  fieldData: {
    __kptID: string
    DeliverableName: string
    DueDate: string
    Status: string
    CategoryName?: string
    'request_deliverables__ASSIGNEES__RequestDeliverableID__cre_del::StaffFullName'?: string
    completeDate?: string
    EstimatedHours_Graphics?: string
    'zci_Sum_ActualHours_Total'?: string
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    console.log('Studio request API called with ID:', params.id)
    
    // Check if user is authenticated
    const sessionCookie = cookies().get('fm-session')
    if (!sessionCookie) {
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

    const studioRequestId = params.id
    if (!studioRequestId) {
      return NextResponse.json(
        { error: 'Studio Request ID required' },
        { status: 400 }
      )
    }

    // Check if we're in demo mode
    const isDemoMode = process.env.NEXT_PUBLIC_DEMO_MODE === 'true'
    
    if (isDemoMode) {
      // Return mock studio request data for demo mode
      const studioRequestDeliverables = allMockDeliverables.filter(d => d.studioRequestId === studioRequestId)
      
      if (studioRequestDeliverables.length === 0) {
        return NextResponse.json(
          { error: 'Studio request not found' },
          { status: 404 }
        )
      }
      
      const firstDeliverable = studioRequestDeliverables[0]
      const project = mockProjects.find(p => p.id === firstDeliverable.projectId)
      
      const formattedDeliverables = studioRequestDeliverables.map(d => ({
        id: d.id,
        title: d.title,
        dueDate: d.dueDate,
        status: d.status,
        category: d.category,
        assignedTo: d.assignedTo,
        completeDate: d.completeDate,
        estimatedHours: d.estimatedHours,
        actualHours: d.actualHours
      }))
      
      // Sort deliverables by status and due date
      formattedDeliverables.sort((a, b) => {
        if (a.status === 'Complete' && b.status !== 'Complete') return 1
        if (a.status !== 'Complete' && b.status === 'Complete') return -1
        return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
      })
      
      const response = {
        studioRequest: {
          id: firstDeliverable.studioRequestId,
          number: firstDeliverable.studioRequestNumber,
          projectName: firstDeliverable.project,
          clientName: firstDeliverable.client,
          createdDate: firstDeliverable.studioRequestCreated,
          status: firstDeliverable.studioRequestStatus,
          notes: firstDeliverable.studioRequestNotes
        },
        deliverables: formattedDeliverables,
        summary: {
          total: formattedDeliverables.length,
          completed: formattedDeliverables.filter(d => d.status === 'Complete').length,
          overdue: formattedDeliverables.filter(d => 
            d.status !== 'Complete' && 
            d.dueDate && 
            new Date(d.dueDate) < new Date()
          ).length
        }
      }
      
      return NextResponse.json(response)
    }

    // Initialize FileMaker client with session token for production mode
    const client = new FileMakerClient(sessionData.token)
    console.log('FileMaker client initialized with session token')
    
    // Fetch the studio request
    console.log('Fetching studio request from FileMaker...')
    let studioRequests: any[] = []
    try {
      studioRequests = await client.findRecords(
        'STUDIO_REQUESTS',
        [{ '__kptID': studioRequestId }],
        1
      )
      console.log('Studio requests found:', studioRequests.length)
    } catch (err) {
      console.error('Error fetching studio request:', err)
      return NextResponse.json(
        { error: 'Failed to fetch studio request from database' },
        { status: 500 }
      )
    }
    
    if (studioRequests.length === 0) {
      return NextResponse.json(
        { error: 'Studio request not found' },
        { status: 404 }
      )
    }
    
    const studioRequest = studioRequests[0]
    console.log('Studio request data:', studioRequest.fieldData)
    
    // Fetch all deliverables for this studio request
    console.log('Fetching deliverables for studio request...')
    let deliverables: any[] = []
    try {
      deliverables = await client.findRecords(
        'REQUEST_DELIVERABLES',
        [{ '_kftStudioRequestID': studioRequestId }],
        100
      )
      console.log('Deliverables found:', deliverables.length)
    } catch (err) {
      console.error('Error fetching deliverables:', err)
      // Continue even if deliverables fail
    }
    
    // Get project details if we have a project ID
    let projectName = studioRequest.fieldData.ProjectName || ''
    let clientName = ''
    
    if (studioRequest.fieldData._kftProjectID) {
      try {
        const projects = await client.findRecords(
          'PROJECTS',
          [{ '__kptID': studioRequest.fieldData._kftProjectID }],
          1
        )
        
        if (projects.length > 0) {
          const project = projects[0]
          projectName = project.fieldData.ProjectName || projectName
          
          // Get client name if we have a client ID
          if (project.fieldData._kftClientID) {
            try {
              const customers = await client.findRecords(
                'CUSTOMER',
                [{ '__kptID': project.fieldData._kftClientID }],
                1
              )
              
              if (customers.length > 0) {
                clientName = customers[0].fieldData.custName || ''
              }
            } catch (err) {
              console.error('Error fetching customer:', err)
            }
          }
        }
      } catch (err) {
        console.error('Error fetching project:', err)
      }
    }
    
    // If no deliverables found by studio request ID, try finding by studio request number
    if (deliverables.length === 0 && studioRequest.fieldData.StudioRequestNumber) {
      console.log('No deliverables found by ID, trying by number:', studioRequest.fieldData.StudioRequestNumber)
      try {
        deliverables = await client.findRecords(
          'REQUEST_DELIVERABLES',
          [{ 'StudioRequestNumber': studioRequest.fieldData.StudioRequestNumber }],
          100
        )
        console.log('Deliverables found by number:', deliverables.length)
      } catch (err) {
        console.error('Error fetching deliverables by number:', err)
      }
    }
    
    // Format the response
    const formattedDeliverables = deliverables.map(record => ({
      id: record.fieldData.__kptID,
      title: record.fieldData.DeliverableName,
      dueDate: record.fieldData.DueDate,
      status: record.fieldData.Status,
      category: record.fieldData.CategoryName,
      assignedTo: record.fieldData['request_deliverables__ASSIGNEES__RequestDeliverableID__cre_del::StaffFullName'],
      completeDate: record.fieldData.completeDate,
      estimatedHours: record.fieldData.EstimatedHours_Graphics,
      actualHours: record.fieldData['zci_Sum_ActualHours_Total']
    }))
    
    // Sort deliverables by status (incomplete first) and due date
    formattedDeliverables.sort((a, b) => {
      // Completed items go to bottom
      if (a.status === 'Complete' && b.status !== 'Complete') return 1
      if (a.status !== 'Complete' && b.status === 'Complete') return -1
      
      // Sort by due date
      return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
    })
    
    const response = {
      studioRequest: {
        id: studioRequest.fieldData.__kptID,
        number: studioRequest.fieldData.StudioRequestNumber,
        projectName: projectName,
        clientName: clientName,
        createdDate: studioRequest.fieldData.CreationTStamp,
        status: studioRequest.fieldData.Status,
        notes: studioRequest.fieldData.Notes
      },
      deliverables: formattedDeliverables,
      summary: {
        total: formattedDeliverables.length,
        completed: formattedDeliverables.filter(d => d.status === 'Complete').length,
        overdue: formattedDeliverables.filter(d => 
          d.status !== 'Complete' && 
          d.dueDate && 
          new Date(d.dueDate) < new Date()
        ).length
      }
    }
    
    return NextResponse.json(response)
  } catch (error: any) {
    console.error('Unexpected error in studio request API:', error)
    return NextResponse.json(
      { error: 'Failed to fetch studio request details', details: error.message },
      { status: 500 }
    )
  }
}