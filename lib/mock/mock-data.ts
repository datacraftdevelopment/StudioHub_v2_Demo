// Mock data for demo mode
export interface MockUser {
  username: string
  displayName: string
  isManager: boolean
  isDesigner: boolean
  department?: string
  departmentManager?: string
  password: string
}

export interface MockDeliverable {
  id: string
  title: string
  dueDate: string
  status: string
  project: string
  projectId: string
  client: string
  studioRequestNumber: string
  studioRequestId: string
  opportunityId?: string
  assignedTo: string
  assignedRole: string
  assignedDepartment: string
  category: string
  notes?: string
  completeDate?: string
  displayStatus: string
  studioRequestCreated: string
  studioRequestStatus: string
  studioRequestNotes?: string
  studioRequestDescription: string
  accountName: string
  estimatedHours: string
  actualHours: string
}

export interface MockProject {
  id: string
  name: string
  clientName: string
}

export interface MockClient {
  id: string
  name: string
}

// Demo users
export const mockUsers: MockUser[] = [
  {
    username: 'admin',
    displayName: 'Administrator',
    isManager: true,
    isDesigner: false,
    department: 'Management',
    departmentManager: 'Administrator',
    password: 'admin!23'
  },
  {
    username: 'jdasilva',
    displayName: 'Joe DaSilva',
    isManager: true,
    isDesigner: false,
    department: 'Environmental',
    departmentManager: 'Joe DaSilva',
    password: 'password123'
  },
  {
    username: 'ktebby',
    displayName: 'Kim Tebby',
    isManager: false,
    isDesigner: true,
    department: 'Graphics',
    password: 'password123'
  },
  {
    username: 'erose',
    displayName: 'Emily Rose',
    isManager: false,
    isDesigner: true,
    department: 'Industrial',
    password: 'password123'
  },
  {
    username: 'msmith',
    displayName: 'Michael Smith',
    isManager: true,
    isDesigner: false,
    department: 'Structural',
    departmentManager: 'Michael Smith',
    password: 'password123'
  }
]

// Demo departments
export const mockDepartments = [
  'Graphics',
  'Environmental', 
  'Industrial',
  'Structural'
]

// Demo clients
export const mockClients: MockClient[] = [
  { id: 'C001', name: 'Circle K' },
  { id: 'C002', name: 'Walmart' },
  { id: 'C003', name: 'Becker\'s' },
  { id: 'C004', name: 'McDonald\'s' },
  { id: 'C005', name: 'Tim Hortons' },
  { id: 'C006', name: 'Shell' },
  { id: 'C007', name: 'Esso' },
  { id: 'C008', name: 'Canadian Tire' }
]

// Demo projects
export const mockProjects: MockProject[] = [
  { id: 'P001', name: '20-2630 Circle K / East Location Rebrand', clientName: 'Circle K' },
  { id: 'P002', name: '21-1543 Walmart / Retail Display Update', clientName: 'Walmart' },
  { id: 'P003', name: '20-3421 Becker\'s / Signage Refresh', clientName: 'Becker\'s' },
  { id: 'P004', name: '21-2010 McDonald\'s / Drive-Thru Modernization', clientName: 'McDonald\'s' },
  { id: 'P005', name: '20-4567 Tim Hortons / Store Renovation', clientName: 'Tim Hortons' },
  { id: 'P006', name: '21-3333 Shell / Gas Station Upgrade', clientName: 'Shell' },
  { id: 'P007', name: '20-5678 Esso / Brand Identity', clientName: 'Esso' },
  { id: 'P008', name: '21-4444 Canadian Tire / Seasonal Display', clientName: 'Canadian Tire' }
]

// Generate dates for demo (relative to current date)
const getRelativeDate = (daysOffset: number): string => {
  const date = new Date()
  date.setDate(date.getDate() + daysOffset)
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const year = date.getFullYear()
  return `${month}/${day}/${year}`
}

const getRelativeDateShort = (daysOffset: number): string => {
  const date = new Date()
  date.setDate(date.getDate() + daysOffset)
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
  const dayName = days[date.getDay()]
  return `${dayName} ${date.getDate()}`
}

// Demo deliverables with realistic project management data
export const mockDeliverables: MockDeliverable[] = [
  // Overdue items
  {
    id: 'H15320-01',
    title: 'Final Art Review',
    dueDate: getRelativeDate(-3),
    status: 'In Progress',
    displayStatus: 'Overdue',
    project: '20-2630 Circle K / East Location Rebrand',
    projectId: 'P001',
    client: 'Circle K',
    studioRequestNumber: 'SR-2024-001',
    studioRequestId: 'SR001',
    assignedTo: 'Kim Tebby',
    assignedRole: 'Senior Designer',
    assignedDepartment: 'Graphics',
    category: 'Design',
    notes: 'Client requested revisions to color scheme',
    studioRequestCreated: getRelativeDate(-10),
    studioRequestStatus: 'Active',
    studioRequestDescription: 'Complete brand refresh for Circle K location',
    accountName: 'Circle K Corporate',
    estimatedHours: '8.0',
    actualHours: '6.5'
  },
  {
    id: 'H10231-02',
    title: 'Structural Analysis Report',
    dueDate: getRelativeDate(-1),
    status: 'In Progress',
    displayStatus: 'Overdue',
    project: '21-2010 McDonald\'s / Drive-Thru Modernization',
    projectId: 'P004',
    client: 'McDonald\'s',
    studioRequestNumber: 'SR-2024-012',
    studioRequestId: 'SR012',
    assignedTo: 'Michael Smith',
    assignedRole: 'Structural Engineer',
    assignedDepartment: 'Structural',
    category: 'Engineering',
    notes: 'Waiting for soil test results',
    studioRequestCreated: getRelativeDate(-15),
    studioRequestStatus: 'Active',
    studioRequestDescription: 'Drive-thru structural modifications and analysis',
    accountName: 'McDonald\'s Canada',
    estimatedHours: '16.0',
    actualHours: '12.0'
  },
  
  // Due today
  {
    id: 'H10053-03',
    title: 'Environmental Impact Assessment',
    dueDate: getRelativeDate(0),
    status: 'In Progress',
    displayStatus: 'In Progress',
    project: '20-4567 Tim Hortons / Store Renovation',
    projectId: 'P005',
    client: 'Tim Hortons',
    studioRequestNumber: 'SR-2024-008',
    studioRequestId: 'SR008',
    assignedTo: 'Joe DaSilva',
    assignedRole: 'Environmental Consultant',
    assignedDepartment: 'Environmental',
    category: 'Assessment',
    notes: 'Final review in progress',
    studioRequestCreated: getRelativeDate(-7),
    studioRequestStatus: 'Active',
    studioRequestDescription: 'Environmental compliance for renovation project',
    accountName: 'Tim Hortons Inc',
    estimatedHours: '12.0',
    actualHours: '10.5'
  },
  
  // Upcoming items
  {
    id: 'H15067-01',
    title: 'Concept Development Meeting',
    dueDate: getRelativeDate(1),
    status: 'Pending',
    displayStatus: 'Pending',
    project: '21-1543 Walmart / Retail Display Update',
    projectId: 'P002',
    client: 'Walmart',
    studioRequestNumber: 'SR-2024-003',
    studioRequestId: 'SR003',
    assignedTo: 'Emily Rose',
    assignedRole: 'Industrial Designer',
    assignedDepartment: 'Industrial',
    category: 'Meeting',
    studioRequestCreated: getRelativeDate(-5),
    studioRequestStatus: 'Active',
    studioRequestDescription: 'Retail display concept development and approval',
    accountName: 'Walmart Canada',
    estimatedHours: '4.0',
    actualHours: '0.0'
  },
  {
    id: 'H12345-04',
    title: 'Prototype Fabrication',
    dueDate: getRelativeDate(2),
    status: 'In Progress',
    displayStatus: 'In Progress',
    project: '20-3421 Becker\'s / Signage Refresh',
    projectId: 'P003',
    client: 'Becker\'s',
    studioRequestNumber: 'SR-2024-005',
    studioRequestId: 'SR005',
    assignedTo: 'Kim Tebby',
    assignedRole: 'Senior Designer',
    assignedDepartment: 'Graphics',
    category: 'Fabrication',
    notes: 'Materials ordered, fabrication started',
    studioRequestCreated: getRelativeDate(-12),
    studioRequestStatus: 'Active',
    studioRequestDescription: 'Complete signage system refresh for all locations',
    accountName: 'Becker\'s Convenience',
    estimatedHours: '24.0',
    actualHours: '18.0'
  },
  {
    id: 'H67890-02',
    title: 'Site Survey Completion',
    dueDate: getRelativeDate(3),
    status: 'Pending',
    displayStatus: 'Pending',
    project: '21-3333 Shell / Gas Station Upgrade',
    projectId: 'P006',
    client: 'Shell',
    studioRequestNumber: 'SR-2024-010',
    studioRequestId: 'SR010',
    assignedTo: 'Joe DaSilva',
    assignedRole: 'Environmental Consultant',
    assignedDepartment: 'Environmental',
    category: 'Survey',
    studioRequestCreated: getRelativeDate(-3),
    studioRequestStatus: 'Active',
    studioRequestDescription: 'Environmental and structural assessment for gas station modernization',
    accountName: 'Shell Canada',
    estimatedHours: '16.0',
    actualHours: '0.0'
  },
  
  // Completed items
  {
    id: 'H11111-01',
    title: 'Brand Guidelines Document',
    dueDate: getRelativeDate(-5),
    status: 'Complete',
    displayStatus: 'Complete',
    project: '20-5678 Esso / Brand Identity',
    projectId: 'P007',
    client: 'Esso',
    studioRequestNumber: 'SR-2024-007',
    studioRequestId: 'SR007',
    assignedTo: 'Kim Tebby',
    assignedRole: 'Senior Designer',
    assignedDepartment: 'Graphics',
    category: 'Documentation',
    notes: 'Delivered and approved by client',
    completeDate: getRelativeDate(-2),
    studioRequestCreated: getRelativeDate(-20),
    studioRequestStatus: 'Completed',
    studioRequestDescription: 'Complete brand identity refresh and guidelines',
    accountName: 'Imperial Oil',
    estimatedHours: '32.0',
    actualHours: '28.5'
  },
  {
    id: 'H22222-03',
    title: 'Display Mock-up Production',
    dueDate: getRelativeDate(-7),
    status: 'Complete',
    displayStatus: 'Complete',
    project: '21-4444 Canadian Tire / Seasonal Display',
    projectId: 'P008',
    client: 'Canadian Tire',
    studioRequestNumber: 'SR-2024-015',
    studioRequestId: 'SR015',
    assignedTo: 'Emily Rose',
    assignedRole: 'Industrial Designer',
    assignedDepartment: 'Industrial',
    category: 'Production',
    notes: 'Mock-up approved, ready for mass production',
    completeDate: getRelativeDate(-4),
    studioRequestCreated: getRelativeDate(-14),
    studioRequestStatus: 'Completed',
    studioRequestDescription: 'Seasonal display design and production coordination',
    accountName: 'Canadian Tire Corporation',
    estimatedHours: '20.0',
    actualHours: '22.0'
  }
]

// Additional deliverables to reach 50+ items
const additionalDeliverables: MockDeliverable[] = []
const statuses = ['In Progress', 'Pending', 'Complete', 'Overdue']
const categories = ['Design', 'Engineering', 'Assessment', 'Meeting', 'Fabrication', 'Survey', 'Documentation', 'Production']

// Generate additional mock data
for (let i = 0; i < 45; i++) {
  const randomProject = mockProjects[i % mockProjects.length]
  const randomUser = mockUsers[1 + (i % (mockUsers.length - 1))] // Skip admin user
  const randomStatus = statuses[i % statuses.length]
  const randomCategory = categories[i % categories.length]
  const daysOffset = -30 + (i * 2) // Spread over 60 days
  
  additionalDeliverables.push({
    id: `H${String(30000 + i).padStart(5, '0')}-01`,
    title: `${randomCategory} Task ${i + 1}`,
    dueDate: getRelativeDate(daysOffset),
    status: randomStatus,
    displayStatus: randomStatus,
    project: randomProject.name,
    projectId: randomProject.id,
    client: randomProject.clientName,
    studioRequestNumber: `SR-2024-${String(100 + i).padStart(3, '0')}`,
    studioRequestId: `SR${100 + i}`,
    assignedTo: randomUser.displayName,
    assignedRole: randomUser.isManager ? 'Manager' : randomUser.isDesigner ? 'Designer' : 'Consultant',
    assignedDepartment: randomUser.department || 'General',
    category: randomCategory,
    notes: i % 3 === 0 ? `Additional notes for task ${i + 1}` : undefined,
    completeDate: randomStatus === 'Complete' ? getRelativeDate(daysOffset + 1) : undefined,
    studioRequestCreated: getRelativeDate(daysOffset - 5),
    studioRequestStatus: randomStatus === 'Complete' ? 'Completed' : 'Active',
    studioRequestDescription: `${randomCategory} work for ${randomProject.clientName}`,
    accountName: `${randomProject.clientName} Account`,
    estimatedHours: String(Math.floor(Math.random() * 40) + 4),
    actualHours: String(Math.floor(Math.random() * 35) + 2)
  })
}

// Combine all deliverables
export const allMockDeliverables = [...mockDeliverables, ...additionalDeliverables]

// Helper functions for filtering
export const getDeliverablesForUser = (username: string): MockDeliverable[] => {
  const user = mockUsers.find(u => u.username === username)
  if (!user) return []
  
  return allMockDeliverables.filter(d => 
    d.assignedTo === user.displayName ||
    (user.isManager && d.assignedDepartment === user.department)
  )
}

export const getDeliverablesForDepartment = (department: string): MockDeliverable[] => {
  return allMockDeliverables.filter(d => d.assignedDepartment === department)
}

export const getDeliverablesForDepartments = (departments: string[]): MockDeliverable[] => {
  if (departments.length === 0) return allMockDeliverables
  return allMockDeliverables.filter(d => departments.includes(d.assignedDepartment))
}

export const getDeliverablesWithStatuses = (statuses: string[]): MockDeliverable[] => {
  if (statuses.length === 0) return allMockDeliverables
  return allMockDeliverables.filter(d => statuses.includes(d.displayStatus))
}