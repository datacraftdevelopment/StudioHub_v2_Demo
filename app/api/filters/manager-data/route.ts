import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { FileMakerClient } from '@/lib/filemaker-client'
import { MockFileMakerClient } from '@/lib/mock/mock-filemaker-client'
import { mockDepartments, mockUsers } from '@/lib/mock/mock-data'

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

    const user = JSON.parse(userCookie.value)
    
    // Only managers can access this endpoint
    if (!user.isManager) {
      return NextResponse.json(
        { error: 'Forbidden - Manager access required' },
        { status: 403 }
      )
    }

    // Check if we're in demo mode
    const isDemoMode = process.env.NEXT_PUBLIC_DEMO_MODE === 'true'
    
    if (isDemoMode) {
      // Return mock data for demo mode
      const employeeList = mockUsers
        .filter(user => user.username !== 'admin') // Exclude admin
        .map(user => ({
          id: user.username,
          name: user.displayName,
          department: user.department || 'Unknown'
        }))
        .sort((a, b) => a.name.localeCompare(b.name))

      return NextResponse.json({
        departments: mockDepartments.sort(),
        employees: employeeList
      })
    }
    
    // Initialize FileMaker client for production mode
    const client = new FileMakerClient()
    
    // Get all employees to extract departments and names
    const employees = await client.getRecords('EMPLOYEE', 500)
    
    // Extract unique departments and format employee data
    const departmentSet = new Set<string>()
    const employeeList = []
    
    for (const record of employees) {
      const fieldData = record.fieldData
      
      // Add department to set if it exists
      if (fieldData.department) {
        departmentSet.add(fieldData.department)
      }
      
      // Only include active employees with studio manager or designer credentials
      const isActive = fieldData.active === '1' || fieldData.active === 1
      const isStudioManager = fieldData.bool_studioManager === '1' || fieldData.bool_studioManager === 1
      const isStudioDesigner = fieldData.bool_studioDesigner === '1' || fieldData.bool_studioDesigner === 1
      
      if (fieldData.nameLogon && isActive && (isStudioManager || isStudioDesigner)) {
        employeeList.push({
          id: fieldData.nameLogon,
          name: fieldData.zctFirstNameLastName || fieldData.nameLogon,
          department: fieldData.department || 'Unknown'
        })
      }
    }

    // Convert set to sorted array
    const departments = Array.from(departmentSet).sort()
    
    // Sort employees by name
    employeeList.sort((a, b) => a.name.localeCompare(b.name))

    return NextResponse.json({
      departments,
      employees: employeeList
    })
  } catch (error) {
    console.error('Error fetching manager data:', error)
    return NextResponse.json(
      { error: 'Failed to fetch filter data' },
      { status: 500 }
    )
  }
}