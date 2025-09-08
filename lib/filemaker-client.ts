import axios, { AxiosInstance } from 'axios'
import https from 'https'
import { MockFileMakerClient } from './mock/mock-filemaker-client'

interface FileMakerConfig {
  host: string
  database: string
  username?: string
  password?: string
  sslVerify: boolean
}

interface AuthResult {
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

export class FileMakerClient {
  private config: FileMakerConfig
  private axiosInstance: AxiosInstance
  private token: string | null = null
  private lastActivity: number = Date.now()
  private readonly SESSION_TIMEOUT = 10 * 60 * 1000 // 10 minutes in milliseconds

  constructor(existingToken?: string) {
    // If in demo mode, return mock client instead
    const isDemoMode = process.env.NEXT_PUBLIC_DEMO_MODE === 'true'
    if (isDemoMode) {
      return new MockFileMakerClient(existingToken) as any
    }
    this.config = {
      host: process.env.STUDIOHUB_HOST!,
      database: process.env.STUDIOHUB_DATABASE || 'StudioHub',
      username: process.env.STUDIOHUB_USERNAME,
      password: process.env.STUDIOHUB_PASSWORD,
      sslVerify: process.env.STUDIOHUB_SSL_VERIFY === 'true',
    }

    // Use existing token if provided
    if (existingToken) {
      this.token = existingToken
      // Assume the token is fresh when passed in
      this.lastActivity = Date.now()
    }

    // Create axios instance with optional SSL verification
    this.axiosInstance = axios.create({
      baseURL: `https://${this.config.host}/fmi/data/v1/databases/${this.config.database}`,
      timeout: 30000, // Increased to 30 seconds
      headers: {
        'Content-Type': 'application/json',
      },
      ...(this.config.sslVerify ? {} : {
        httpsAgent: new https.Agent({
          rejectUnauthorized: false
        })
      })
    })
    
    // If we have an existing token, set the authorization header
    if (this.token) {
      this.axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${this.token}`
    }
  }

  async authenticate(username: string, password: string): Promise<AuthResult> {
    try {
      // First, authenticate with FileMaker using the API credentials
      if (!this.token) {
        const authResponse = await this.axiosInstance.post('/sessions', {}, {
          auth: {
            username: this.config.username!,
            password: this.config.password!,
          },
        })
        this.token = authResponse.data.response.token
      }

      // Set authorization header with API token
      this.axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${this.token}`

      // Now verify the user's credentials by searching for them in EMPLOYEE table
      const findRequest = {
        query: [{ nameLogon: username }],
        limit: 1,
      }

      try {
        const response = await this.axiosInstance.post('/layouts/EMPLOYEE/_find', findRequest)
        
        if (!response.data.response.data || response.data.response.data.length === 0) {
          return {
            success: false,
            token: '',
            error: 'Invalid username or password',
          }
        }

        const userData = response.data.response.data[0].fieldData

        // Check if the password matches (assuming fm_password field contains the password)
        if (userData.fm_password !== password) {
          return {
            success: false,
            token: '',
            error: 'Invalid username or password',
          }
        }

        // User authenticated successfully
        const userInfo = {
          username: userData.nameLogon,
          displayName: userData.zctFirstNameLastName || userData.nameLogon,
          isManager: userData.bool_studioManager === '1',
          isDesigner: userData.bool_studioDesigner === '1',
          department: userData.department || undefined,
          departmentManager: userData.departmentManager || undefined,
        }

        return {
          success: true,
          token: this.token!,
          user: userInfo,
        }
      } catch (error: any) {
        if (error.response?.data?.messages?.[0]?.code === '401') {
          // No user found
          return {
            success: false,
            token: '',
            error: 'Invalid username or password',
          }
        }
        throw error
      }
    } catch (error: any) {
      console.error('FileMaker authentication error:', error)
      return {
        success: false,
        token: '',
        error: 'Unable to connect to FileMaker server',
      }
    }
  }


  async findRecords(layout: string, query: any, limit: number = 100) {
    try {
      // Ensure we have a valid token
      await this.ensureValidToken()

      const findRequest = {
        query: Array.isArray(query) ? query : [query],
        limit: limit.toString(),
      }

      console.log(`FileMaker findRecords: layout=${layout}, query=`, JSON.stringify(findRequest))
      console.log('Token exists:', !!this.token)
      console.log('Authorization header:', this.axiosInstance.defaults.headers.common['Authorization'])

      const response = await this.axiosInstance.post(`/layouts/${layout}/_find`, findRequest)
      return response.data.response.data || []
    } catch (error: any) {
      console.error(`FileMaker findRecords error for layout ${layout}:`, error.response?.data || error.message)
      
      // If authentication error, retry once with new token
      if (error.response?.status === 401 || 
          error.response?.data?.messages?.[0]?.code === '952') {
        console.log('Authentication error detected, retrying with new token...')
        this.token = null
        try {
          await this.ensureValidToken()
          const retryFindRequest = {
            query: Array.isArray(query) ? query : [query],
            limit: limit.toString(),
          }
          const response = await this.axiosInstance.post(`/layouts/${layout}/_find`, retryFindRequest)
          return response.data.response.data || []
        } catch (retryError: any) {
          console.error('Retry failed:', retryError.response?.data || retryError.message)
          throw new Error('Not authenticated')
        }
      }
      
      // If no records found, return empty array instead of throwing
      if (error.response?.data?.messages?.[0]?.code === '401') {
        return []
      }
      
      throw error
    }
  }

  private async ensureValidToken() {
    const now = Date.now()
    const timeSinceLastActivity = now - this.lastActivity
    
    // If session is older than 10 minutes, close it and get a new one
    if (this.token && timeSinceLastActivity > this.SESSION_TIMEOUT) {
      console.log(`Session timeout detected (${Math.round(timeSinceLastActivity / 1000)}s), refreshing token...`)
      try {
        // Try to close the old session
        await this.axiosInstance.delete(`/sessions/${this.token}`).catch(() => {
          // Ignore errors when closing old session
        })
      } catch (error) {
        // Ignore errors
      }
      this.token = null
    }
    
    if (!this.token) {
      console.log('Creating new FileMaker session...')
      const authResponse = await this.axiosInstance.post('/sessions', {}, {
        auth: {
          username: this.config.username!,
          password: this.config.password!,
        },
      })
      this.token = authResponse.data.response.token
      this.axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${this.token}`
      console.log('New session created successfully')
    }
    
    // Update last activity time
    this.lastActivity = now
  }

  async getRecords(layout: string, limit: number = 100, offset: number = 1) {
    try {
      // Ensure we have a valid token
      await this.ensureValidToken()

      const response = await this.axiosInstance.get(`/layouts/${layout}/records`, {
        params: {
          _limit: limit,
          _offset: offset,
        },
      })

      return response.data.response.data
    } catch (error: any) {
      console.error(`FileMaker getRecords error for layout ${layout}:`, error.response?.data || error.message)
      
      // If authentication error, retry once with new token
      if (error.response?.status === 401 || 
          error.response?.data?.messages?.[0]?.code === '952') {
        console.log('Authentication error detected, retrying with new token...')
        this.token = null
        try {
          await this.ensureValidToken()
          const response = await this.axiosInstance.get(`/layouts/${layout}/records`, {
            params: {
              _limit: limit,
              _offset: offset,
            },
          })
          return response.data.response.data
        } catch (retryError: any) {
          console.error('Retry failed:', retryError.response?.data || retryError.message)
          throw new Error('Not authenticated')
        }
      }
      
      throw error
    }
  }

  async getRecord(layout: string, recordId: string) {
    try {
      // Ensure we have a valid token
      await this.ensureValidToken()

      const response = await this.axiosInstance.get(`/layouts/${layout}/records/${recordId}`)
      return response.data.response.data[0]
    } catch (error: any) {
      console.error(`FileMaker getRecord error for layout ${layout}, record ${recordId}:`, error.response?.data || error.message)
      
      // If authentication error, retry once with new token
      if (error.response?.status === 401 || 
          error.response?.data?.messages?.[0]?.code === '952') {
        console.log('Authentication error detected, retrying with new token...')
        this.token = null
        try {
          await this.ensureValidToken()
          const response = await this.axiosInstance.get(`/layouts/${layout}/records/${recordId}`)
          return response.data.response.data[0]
        } catch (retryError: any) {
          console.error('Retry failed:', retryError.response?.data || retryError.message)
          throw new Error('Not authenticated')
        }
      }
      
      throw error
    }
  }

  async getLayoutMetadata(layout: string) {
    try {
      // Ensure we have a valid token
      await this.ensureValidToken()

      const response = await this.axiosInstance.get(`/layouts/${layout}`)
      return response.data.response
    } catch (error: any) {
      console.error(`FileMaker getLayoutMetadata error for layout ${layout}:`, error.response?.data || error.message)
      
      // If authentication error, retry once with new token
      if (error.response?.status === 401 || 
          error.response?.data?.messages?.[0]?.code === '952') {
        console.log('Authentication error detected, retrying with new token...')
        this.token = null
        try {
          await this.ensureValidToken()
          const response = await this.axiosInstance.get(`/layouts/${layout}`)
          return response.data.response
        } catch (retryError: any) {
          console.error('Retry failed:', retryError.response?.data || retryError.message)
          throw new Error('Not authenticated')
        }
      }
      
      throw error
    }
  }

  async logout() {
    if (!this.token) {
      return
    }

    try {
      await this.axiosInstance.delete(`/sessions/${this.token}`)
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      this.token = null
      this.lastActivity = 0
    }
  }
}