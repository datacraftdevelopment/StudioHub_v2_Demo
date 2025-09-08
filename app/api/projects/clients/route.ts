import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { FileMakerClient } from '@/lib/filemaker-client'
import { MockFileMakerClient } from '@/lib/mock/mock-filemaker-client'
import { mockProjects, mockClients } from '@/lib/mock/mock-data'

export async function POST(request: NextRequest) {
  try {
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

    // Get project IDs from request body
    let projectIds
    try {
      const body = await request.json()
      projectIds = body.projectIds
    } catch (e) {
      console.error('Error parsing request body:', e)
      return NextResponse.json(
        { error: 'Invalid request body' },
        { status: 400 }
      )
    }
    
    if (!projectIds || !Array.isArray(projectIds) || projectIds.length === 0) {
      return NextResponse.json(
        { error: 'Project IDs required' },
        { status: 400 }
      )
    }

    // Check if we're in demo mode
    const isDemoMode = process.env.NEXT_PUBLIC_DEMO_MODE === 'true'
    
    if (isDemoMode) {
      // Return mock client mapping for demo mode
      const projectClientMap: Record<string, string> = {}
      projectIds.forEach((projectId: string) => {
        const project = mockProjects.find(p => p.id === projectId)
        if (project) {
          projectClientMap[projectId] = project.clientName
        }
      })
      
      return NextResponse.json({ clients: projectClientMap })
    }

    // Initialize FileMaker client with session token for production mode
    const client = new FileMakerClient(sessionData.token)
    
    // Fetch projects to get client IDs
    const projectQuery = projectIds.map(id => ({ '__kptID': id }))
    
    let projects: any[] = []
    try {
      projects = await client.findRecords('PROJECTS', projectQuery, 100)
    } catch (err) {
      console.error('Error fetching projects:', err)
      // Return empty result instead of failing
      return NextResponse.json({ clients: {} })
    }
    
    // Extract unique client IDs
    const clientIds = Array.from(new Set(projects.map(p => p.fieldData._kftClientID).filter(Boolean)))
    
    if (clientIds.length === 0) {
      return NextResponse.json({ clients: {} })
    }
    
    // Fetch client records
    const clientQuery = clientIds.map(id => ({ '__kptID': id }))
    let customers: any[] = []
    try {
      customers = await client.findRecords('CUSTOMER', clientQuery, 100)
    } catch (err) {
      console.error('Error fetching customers:', err)
      // Return empty result instead of failing
      return NextResponse.json({ clients: {} })
    }
    
    // Create lookup maps
    const clientMap: Record<string, string> = {}
    customers.forEach(customer => {
      clientMap[customer.fieldData.__kptID] = customer.fieldData.custName || ''
    })
    
    // Map project IDs to client names
    const projectClientMap: Record<string, string> = {}
    projects.forEach(project => {
      const clientId = project.fieldData._kftClientID
      if (clientId && clientMap[clientId]) {
        projectClientMap[project.fieldData.__kptID] = clientMap[clientId]
      }
    })
    
    return NextResponse.json({ clients: projectClientMap })
  } catch (error) {
    console.error('Error fetching client names:', error)
    return NextResponse.json(
      { error: 'Failed to fetch client names' },
      { status: 500 }
    )
  }
}