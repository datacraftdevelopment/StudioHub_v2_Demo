import { MockAuthService, MockAuthResult } from './mock-auth'
import { 
  allMockDeliverables, 
  mockUsers, 
  mockProjects, 
  mockClients,
  getDeliverablesForUser,
  getDeliverablesForDepartment,
  getDeliverablesForDepartments,
  getDeliverablesWithStatuses,
  MockDeliverable 
} from './mock-data'

export class MockFileMakerClient {
  private token: string | null = null
  private lastActivity: number = Date.now()

  constructor(existingToken?: string) {
    if (existingToken) {
      this.token = existingToken
      this.lastActivity = Date.now()
    }
  }

  async authenticate(username: string, password: string): Promise<MockAuthResult> {
    const result = MockAuthService.authenticate(username, password)
    if (result.success) {
      this.token = result.token
      this.lastActivity = Date.now()
    }
    return result
  }

  async findRecords(layout: string, query: any, limit: number = 100): Promise<any[]> {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 100))

    if (layout === 'REQUEST_DELIVERABLES') {
      return this.mockFindDeliverables(query, limit)
    }
    
    if (layout === 'EMPLOYEE') {
      return this.mockFindEmployees(query, limit)
    }

    // Default empty response for unknown layouts
    return []
  }

  private mockFindDeliverables(query: any, limit: number): any[] {
    let filteredDeliverables = [...allMockDeliverables]

    // Parse query array
    if (Array.isArray(query)) {
      const matchingDeliverables: MockDeliverable[] = []
      
      query.forEach(queryObj => {
        const matches = allMockDeliverables.filter(deliverable => {
          // Check each field in the query object
          for (const [field, value] of Object.entries(queryObj)) {
            if (field === 'DisplayStatus') {
              if (deliverable.displayStatus !== value) return false
            } else if (field === 'DesignerName') {
              if (deliverable.assignedTo !== value) return false
            } else if (field === 'request_deliverables__ASSIGNEES__RequestDeliverableID__cre_del::StaffDepartment') {
              if (deliverable.assignedDepartment !== value) return false
            } else if (field === 'DueDate') {
              if (deliverable.dueDate !== value) return false
            }
            // Add more field mappings as needed
          }
          return true
        })
        
        matchingDeliverables.push(...matches)
      })
      
      // Remove duplicates
      const uniqueDeliverables = Array.from(new Set(matchingDeliverables.map(d => d.id)))
        .map(id => matchingDeliverables.find(d => d.id === id)!)
      
      filteredDeliverables = uniqueDeliverables
    }

    // Apply limit
    filteredDeliverables = filteredDeliverables.slice(0, limit)

    // Convert to FileMaker format
    return filteredDeliverables.map(deliverable => ({
      fieldData: {
        __kptID: deliverable.id,
        DeliverableName: deliverable.title,
        DueDate: deliverable.dueDate,
        Status: deliverable.status,
        ProjectName: deliverable.project,
        StudioRequestNumber: deliverable.studioRequestNumber,
        _kftProjectID: deliverable.projectId,
        _kftStudioRequestID: deliverable.studioRequestId,
        'request_deliverables__PROJECTS__ProjectID::ClientName': deliverable.client,
        'request_deliverables__ASSIGNEES__RequestDeliverableID__cre_del::StaffFullName': deliverable.assignedTo,
        'request_deliverables__ASSIGNEES__RequestDeliverableID__cre_del::RoleName': deliverable.assignedRole,
        'request_deliverables__ASSIGNEES__RequestDeliverableID__cre_del::StaffDepartment': deliverable.assignedDepartment,
        CategoryName: deliverable.category,
        Notes: deliverable.notes,
        completeDate: deliverable.completeDate,
        DesignerName: deliverable.assignedTo,
        DisplayStatus: deliverable.displayStatus,
        'request_deliverables__STUDIO_REQUESTS__StudioRequestID::Description': deliverable.studioRequestDescription,
        'request_deliverables__STUDIO_REQUESTS__StudioRequestID::AccountName': deliverable.accountName,
        'request_deliverables__PROJECTS__ProjectID::_kftClientID': 'C001',
        'request_deliverables__PROJECTS__ProjectID::_kftPACEOpportunityID': deliverable.opportunityId,
        'request_deliverables__STUDIO_REQUESTS__StudioRequestID::CreationTStamp': deliverable.studioRequestCreated,
        'request_deliverables__STUDIO_REQUESTS__StudioRequestID::Status': deliverable.studioRequestStatus,
        'request_deliverables__STUDIO_REQUESTS__StudioRequestID::Notes': deliverable.studioRequestNotes,
        EstimatedHours_Graphics: deliverable.estimatedHours,
        'zci_Sum_ActualHours_Total': deliverable.actualHours,
        'request_deliverables__PROJECTS__ProjectID::request_deliverables__CUSTOMER__ClientID::custName': deliverable.client
      }
    }))
  }

  private mockFindEmployees(query: any, limit: number): any[] {
    let filteredUsers = [...mockUsers]

    // Parse query array
    if (Array.isArray(query)) {
      const matchingUsers = []
      
      query.forEach(queryObj => {
        const matches = mockUsers.filter(user => {
          for (const [field, value] of Object.entries(queryObj)) {
            if (field === 'nameLogon' && user.username !== value) return false
          }
          return true
        })
        matchingUsers.push(...matches)
      })
      
      filteredUsers = Array.from(new Set(matchingUsers.map(u => u.username)))
        .map(username => matchingUsers.find(u => u.username === username)!)
    }

    // Apply limit
    filteredUsers = filteredUsers.slice(0, limit)

    // Convert to FileMaker format
    return filteredUsers.map(user => ({
      fieldData: {
        nameLogon: user.username,
        zctFirstNameLastName: user.displayName,
        bool_studioManager: user.isManager ? '1' : '0',
        bool_studioDesigner: user.isDesigner ? '1' : '0',
        department: user.department,
        departmentManager: user.departmentManager,
        fm_password: user.password // Note: In real system, this would be hashed
      }
    }))
  }

  async getRecords(layout: string, limit: number = 100, offset: number = 1): Promise<any[]> {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 100))

    if (layout === 'REQUEST_DELIVERABLES') {
      const startIndex = offset - 1
      const endIndex = Math.min(startIndex + limit, allMockDeliverables.length)
      const records = allMockDeliverables.slice(startIndex, endIndex)
      
      return records.map(deliverable => ({
        fieldData: {
          __kptID: deliverable.id,
          DeliverableName: deliverable.title,
          DueDate: deliverable.dueDate,
          Status: deliverable.status,
          ProjectName: deliverable.project,
          DisplayStatus: deliverable.displayStatus,
          // ... include other fields as needed
        }
      }))
    }

    return []
  }

  async getRecord(layout: string, recordId: string): Promise<any> {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 100))

    if (layout === 'REQUEST_DELIVERABLES') {
      const deliverable = allMockDeliverables.find(d => d.id === recordId)
      if (!deliverable) {
        throw new Error('Record not found')
      }
      
      return {
        fieldData: {
          __kptID: deliverable.id,
          DeliverableName: deliverable.title,
          DueDate: deliverable.dueDate,
          Status: deliverable.status,
          ProjectName: deliverable.project,
          DisplayStatus: deliverable.displayStatus,
          // ... include other fields as needed
        }
      }
    }

    throw new Error('Layout not found')
  }

  async getLayoutMetadata(layout: string): Promise<any> {
    // Return mock metadata
    return {
      fieldMetaData: [],
      portalMetaData: {}
    }
  }

  async logout(): Promise<void> {
    this.token = null
    this.lastActivity = 0
  }

  // Helper method to check if we're in demo mode
  static isDemoMode(): boolean {
    return process.env.NEXT_PUBLIC_DEMO_MODE === 'true'
  }
}