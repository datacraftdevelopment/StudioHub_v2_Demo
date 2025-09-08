import axios, { AxiosInstance, AxiosError } from 'axios';
import { z } from 'zod';

// Zod schemas for n8n API types
export const WorkflowSchema = z.object({
  id: z.string().optional(),
  name: z.string(),
  nodes: z.array(z.any()),
  connections: z.record(z.any()),
  active: z.boolean().default(false),
  settings: z.record(z.any()).optional(),
  staticData: z.record(z.any()).optional(),
  tags: z.array(z.string()).optional(),
  meta: z.record(z.any()).optional(),
  pinData: z.record(z.any()).optional(),
  versionId: z.string().optional()
});

export const ExecutionSchema = z.object({
  workflowId: z.string(),
  data: z.record(z.any()).optional(),
  waitTill: z.date().optional()
});

export const CredentialSchema = z.object({
  id: z.string().optional(),
  name: z.string(),
  type: z.string(),
  data: z.record(z.any()),
  nodesAccess: z.array(z.object({
    nodeType: z.string()
  })).optional()
});

export type Workflow = z.infer<typeof WorkflowSchema>;
export type Execution = z.infer<typeof ExecutionSchema>;
export type Credential = z.infer<typeof CredentialSchema>;

export interface N8nApiError {
  message: string;
  code?: number;
  details?: any;
}

export class N8nApiClient {
  private client: AxiosInstance;

  constructor(baseURL: string, apiKey: string, timeout: number = 30000) {
    this.client = axios.create({
      baseURL,
      timeout,
      headers: {
        'X-N8N-API-KEY': apiKey,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });

    // Add response interceptor for error handling
    this.client.interceptors.response.use(
      (response) => response,
      (error: AxiosError) => {
        const n8nError: N8nApiError = {
          message: error.message,
          code: error.response?.status,
          details: error.response?.data
        };
        throw n8nError;
      }
    );
  }

  // Workflow CRUD Operations
  async listWorkflows(): Promise<Workflow[]> {
    const response = await this.client.get('/workflows');
    return response.data.data || response.data;
  }

  async getWorkflow(id: string): Promise<Workflow> {
    const response = await this.client.get(`/workflows/${id}`);
    return response.data.data || response.data;
  }

  async createWorkflow(workflow: Workflow): Promise<Workflow> {
    const response = await this.client.post('/workflows', workflow);
    return response.data.data || response.data;
  }

  async updateWorkflow(id: string, workflow: Partial<Workflow>): Promise<Workflow> {
    const response = await this.client.patch(`/workflows/${id}`, workflow);
    return response.data.data || response.data;
  }

  async deleteWorkflow(id: string): Promise<boolean> {
    await this.client.delete(`/workflows/${id}`);
    return true;
  }

  // Workflow Activation
  async activateWorkflow(id: string): Promise<Workflow> {
    const response = await this.client.post(`/workflows/${id}/activate`);
    return response.data.data || response.data;
  }

  async deactivateWorkflow(id: string): Promise<Workflow> {
    const response = await this.client.post(`/workflows/${id}/deactivate`);
    return response.data.data || response.data;
  }

  // Workflow Execution
  async executeWorkflow(workflowId: string, data?: Record<string, any>): Promise<any> {
    const response = await this.client.post(`/workflows/${workflowId}/execute`, {
      workflowData: data
    });
    return response.data.data || response.data;
  }

  async getExecutions(workflowId?: string, limit: number = 20): Promise<any[]> {
    const params = new URLSearchParams();
    if (workflowId) params.append('workflowId', workflowId);
    params.append('limit', limit.toString());

    const response = await this.client.get(`/executions?${params}`);
    return response.data.data || response.data;
  }

  async getExecution(id: string): Promise<any> {
    const response = await this.client.get(`/executions/${id}`);
    return response.data.data || response.data;
  }

  // Credentials Management
  async listCredentials(): Promise<Credential[]> {
    const response = await this.client.get('/credentials');
    return response.data.data || response.data;
  }

  async getCredential(id: string): Promise<Credential> {
    const response = await this.client.get(`/credentials/${id}`);
    return response.data.data || response.data;
  }

  async createCredential(credential: Credential): Promise<Credential> {
    const response = await this.client.post('/credentials', credential);
    return response.data.data || response.data;
  }

  async updateCredential(id: string, credential: Partial<Credential>): Promise<Credential> {
    const response = await this.client.patch(`/credentials/${id}`, credential);
    return response.data.data || response.data;
  }

  async deleteCredential(id: string): Promise<boolean> {
    await this.client.delete(`/credentials/${id}`);
    return true;
  }

  // Node Types and Information
  async getNodeTypes(): Promise<any[]> {
    const response = await this.client.get('/node-types');
    return response.data.data || response.data;
  }

  async getNodeType(nodeType: string): Promise<any> {
    const response = await this.client.get(`/node-types/${nodeType}`);
    return response.data.data || response.data;
  }

  // Health Check
  async healthCheck(): Promise<boolean> {
    try {
      await this.client.get('/health');
      return true;
    } catch {
      return false;
    }
  }

  // Workflow Templates and Examples
  async getWorkflowTemplate(templateId: string): Promise<Workflow> {
    const response = await this.client.get(`/workflows/templates/${templateId}`);
    return response.data.data || response.data;
  }

  // Test workflow execution without saving
  async testWorkflow(workflow: Workflow): Promise<any> {
    const response = await this.client.post('/workflows/test', workflow);
    return response.data.data || response.data;
  }
}
