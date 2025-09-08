import { mockUsers, MockUser } from './mock-data'

export interface MockAuthResult {
  success: boolean
  token: string
  error?: string
  user?: {
    username: string
    displayName: string
    isManager: boolean
    isDesigner: boolean
    department?: string
    departmentManager?: string
  }
}

export class MockAuthService {
  private static generateToken(): string {
    return `mock-token-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  }

  static authenticate(username: string, password: string): MockAuthResult {
    // Find user in mock data
    const user = mockUsers.find(u => u.username === username)
    
    if (!user) {
      return {
        success: false,
        token: '',
        error: 'Invalid username or password'
      }
    }

    // Check password
    if (user.password !== password) {
      return {
        success: false,
        token: '',
        error: 'Invalid username or password'
      }
    }

    // Generate mock token and return user info
    return {
      success: true,
      token: this.generateToken(),
      user: {
        username: user.username,
        displayName: user.displayName,
        isManager: user.isManager,
        isDesigner: user.isDesigner,
        department: user.department,
        departmentManager: user.departmentManager
      }
    }
  }

  static validateToken(token: string): boolean {
    // In demo mode, all mock tokens are considered valid
    return token.startsWith('mock-token-')
  }

  static getUserFromToken(token: string): MockUser | null {
    // In demo mode, return admin user for simplicity
    // In a real implementation, you'd decode/lookup the token
    if (this.validateToken(token)) {
      return mockUsers[0] // Return admin user
    }
    return null
  }
}