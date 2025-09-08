#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  CallToolResult,
  TextContent,
  Tool,
  ErrorCode,
  McpError
} from '@modelcontextprotocol/sdk/types.js';
import { z } from 'zod';
import dotenv from 'dotenv';
import { N8nApiClient, WorkflowSchema, CredentialSchema, type Workflow, type Credential } from './n8n-client.js';

// Load environment variables
dotenv.config();

class N8nMcpServer {
  private server: Server;
  private n8nClient: N8nApiClient;

  constructor() {
    this.server = new Server(
      {
        name: 'n8n-mcp-server',
        version: '1.0.0',
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    // Initialize n8n client
    const apiUrl = process.env.N8N_API_URL;
    const apiKey = process.env.N8N_API_KEY;
    const timeout = parseInt(process.env.API_TIMEOUT || '30000');

    if (!apiUrl || !apiKey) {
      throw new Error('N8N_API_URL and N8N_API_KEY environment variables are required');
    }

    this.n8nClient = new N8nApiClient(apiUrl, apiKey, timeout);
    this.setupToolHandlers();
  }

  private setupToolHandlers() {
    // List tools handler
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      return {
        tools: this.getAvailableTools(),
      };
    });

    // Call tool handler
    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      try {
        switch (name) {
          case 'list_workflows':
            return await this.listWorkflows();
          case 'get_workflow':
            return await this.getWorkflow(args);
          case 'create_workflow':
            return await this.createWorkflow(args);
          case 'update_workflow':
            return await this.updateWorkflow(args);
          case 'delete_workflow':
            return await this.deleteWorkflow(args);
          case 'activate_workflow':
            return await this.activateWorkflow(args);
          case 'deactivate_workflow':
            return await this.deactivateWorkflow(args);
          case 'execute_workflow':
            return await this.executeWorkflow(args);
          case 'get_executions':
            return await this.getExecutions(args);
          case 'get_execution':
            return await this.getExecution(args);
          case 'list_credentials':
            return await this.listCredentials();
          case 'get_credential':
            return await this.getCredential(args);
          case 'create_credential':
            return await this.createCredential(args);
          case 'update_credential':
            return await this.updateCredential(args);
          case 'delete_credential':
            return await this.deleteCredential(args);
          case 'get_node_types':
            return await this.getNodeTypes();
          case 'get_node_type':
            return await this.getNodeType(args);
          case 'test_workflow':
            return await this.testWorkflow(args);
          case 'health_check':
            return await this.healthCheck();
          default:
            throw new McpError(
              ErrorCode.MethodNotFound,
              `Unknown tool: ${name}`
            );
        }
      } catch (error) {
        if (error instanceof McpError) {
          throw error;
        }
        
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
        throw new McpError(
          ErrorCode.InternalError,
          `Tool execution failed: ${errorMessage}`
        );
      }
    });
  }

  private getAvailableTools(): Tool[] {
    return [
      {
        name: 'list_workflows',
        description: 'List all workflows in n8n',
        inputSchema: {
          type: 'object',
          properties: {},
        },
      },
      {
        name: 'get_workflow',
        description: 'Get a specific workflow by ID',
        inputSchema: {
          type: 'object',
          properties: {
            id: { type: 'string', description: 'Workflow ID' },
          },
          required: ['id'],
        },
      },
      {
        name: 'create_workflow',
        description: 'Create a new workflow',
        inputSchema: {
          type: 'object',
          properties: {
            name: { type: 'string', description: 'Workflow name' },
            nodes: { type: 'array', description: 'Array of workflow nodes' },
            connections: { type: 'object', description: 'Node connections' },
            active: { type: 'boolean', description: 'Whether workflow is active', default: false },
            settings: { type: 'object', description: 'Workflow settings' },
            tags: { type: 'array', items: { type: 'string' }, description: 'Workflow tags' },
          },
          required: ['name', 'nodes', 'connections'],
        },
      },
      {
        name: 'update_workflow',
        description: 'Update an existing workflow',
        inputSchema: {
          type: 'object',
          properties: {
            id: { type: 'string', description: 'Workflow ID' },
            name: { type: 'string', description: 'Workflow name' },
            nodes: { type: 'array', description: 'Array of workflow nodes' },
            connections: { type: 'object', description: 'Node connections' },
            active: { type: 'boolean', description: 'Whether workflow is active' },
            settings: { type: 'object', description: 'Workflow settings' },
            tags: { type: 'array', items: { type: 'string' }, description: 'Workflow tags' },
          },
          required: ['id'],
        },
      },
      {
        name: 'delete_workflow',
        description: 'Delete a workflow',
        inputSchema: {
          type: 'object',
          properties: {
            id: { type: 'string', description: 'Workflow ID' },
          },
          required: ['id'],
        },
      },
      {
        name: 'activate_workflow',
        description: 'Activate a workflow',
        inputSchema: {
          type: 'object',
          properties: {
            id: { type: 'string', description: 'Workflow ID' },
          },
          required: ['id'],
        },
      },
      {
        name: 'deactivate_workflow',
        description: 'Deactivate a workflow',
        inputSchema: {
          type: 'object',
          properties: {
            id: { type: 'string', description: 'Workflow ID' },
          },
          required: ['id'],
        },
      },
      {
        name: 'execute_workflow',
        description: 'Execute a workflow',
        inputSchema: {
          type: 'object',
          properties: {
            workflowId: { type: 'string', description: 'Workflow ID' },
            data: { type: 'object', description: 'Input data for workflow execution' },
          },
          required: ['workflowId'],
        },
      },
      {
        name: 'get_executions',
        description: 'Get workflow executions',
        inputSchema: {
          type: 'object',
          properties: {
            workflowId: { type: 'string', description: 'Filter by workflow ID' },
            limit: { type: 'number', description: 'Number of executions to return', default: 20 },
          },
        },
      },
      {
        name: 'get_execution',
        description: 'Get a specific execution by ID',
        inputSchema: {
          type: 'object',
          properties: {
            id: { type: 'string', description: 'Execution ID' },
          },
          required: ['id'],
        },
      },
      {
        name: 'list_credentials',
        description: 'List all credentials',
        inputSchema: {
          type: 'object',
          properties: {},
        },
      },
      {
        name: 'get_credential',
        description: 'Get a specific credential by ID',
        inputSchema: {
          type: 'object',
          properties: {
            id: { type: 'string', description: 'Credential ID' },
          },
          required: ['id'],
        },
      },
      {
        name: 'create_credential',
        description: 'Create a new credential',
        inputSchema: {
          type: 'object',
          properties: {
            name: { type: 'string', description: 'Credential name' },
            type: { type: 'string', description: 'Credential type' },
            data: { type: 'object', description: 'Credential data' },
            nodesAccess: { type: 'array', description: 'Nodes that can access this credential' },
          },
          required: ['name', 'type', 'data'],
        },
      },
      {
        name: 'update_credential',
        description: 'Update an existing credential',
        inputSchema: {
          type: 'object',
          properties: {
            id: { type: 'string', description: 'Credential ID' },
            name: { type: 'string', description: 'Credential name' },
            type: { type: 'string', description: 'Credential type' },
            data: { type: 'object', description: 'Credential data' },
            nodesAccess: { type: 'array', description: 'Nodes that can access this credential' },
          },
          required: ['id'],
        },
      },
      {
        name: 'delete_credential',
        description: 'Delete a credential',
        inputSchema: {
          type: 'object',
          properties: {
            id: { type: 'string', description: 'Credential ID' },
          },
          required: ['id'],
        },
      },
      {
        name: 'get_node_types',
        description: 'Get all available node types',
        inputSchema: {
          type: 'object',
          properties: {},
        },
      },
      {
        name: 'get_node_type',
        description: 'Get information about a specific node type',
        inputSchema: {
          type: 'object',
          properties: {
            nodeType: { type: 'string', description: 'Node type name' },
          },
          required: ['nodeType'],
        },
      },
      {
        name: 'test_workflow',
        description: 'Test a workflow without saving it',
        inputSchema: {
          type: 'object',
          properties: {
            name: { type: 'string', description: 'Workflow name' },
            nodes: { type: 'array', description: 'Array of workflow nodes' },
            connections: { type: 'object', description: 'Node connections' },
          },
          required: ['name', 'nodes', 'connections'],
        },
      },
      {
        name: 'health_check',
        description: 'Check if n8n API is healthy',
        inputSchema: {
          type: 'object',
          properties: {},
        },
      },
    ];
  }

  // Tool implementation methods
  private async listWorkflows(): Promise<CallToolResult> {
    const workflows = await this.n8nClient.listWorkflows();
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(workflows, null, 2),
        } as TextContent,
      ],
    };
  }

  private async getWorkflow(args: any): Promise<CallToolResult> {
    const { id } = z.object({ id: z.string() }).parse(args);
    const workflow = await this.n8nClient.getWorkflow(id);
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(workflow, null, 2),
        } as TextContent,
      ],
    };
  }

  private async createWorkflow(args: any): Promise<CallToolResult> {
    const workflow = WorkflowSchema.parse(args);
    const created = await this.n8nClient.createWorkflow(workflow);
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(created, null, 2),
        } as TextContent,
      ],
    };
  }

  private async updateWorkflow(args: any): Promise<CallToolResult> {
    const { id, ...updates } = z.object({
      id: z.string(),
      name: z.string().optional(),
      nodes: z.array(z.any()).optional(),
      connections: z.record(z.any()).optional(),
      active: z.boolean().optional(),
      settings: z.record(z.any()).optional(),
      tags: z.array(z.string()).optional(),
    }).parse(args);

    const updated = await this.n8nClient.updateWorkflow(id, updates);
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(updated, null, 2),
        } as TextContent,
      ],
    };
  }

  private async deleteWorkflow(args: any): Promise<CallToolResult> {
    const { id } = z.object({ id: z.string() }).parse(args);
    await this.n8nClient.deleteWorkflow(id);
    return {
      content: [
        {
          type: 'text',
          text: `Workflow ${id} deleted successfully`,
        } as TextContent,
      ],
    };
  }

  private async activateWorkflow(args: any): Promise<CallToolResult> {
    const { id } = z.object({ id: z.string() }).parse(args);
    const activated = await this.n8nClient.activateWorkflow(id);
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(activated, null, 2),
        } as TextContent,
      ],
    };
  }

  private async deactivateWorkflow(args: any): Promise<CallToolResult> {
    const { id } = z.object({ id: z.string() }).parse(args);
    const deactivated = await this.n8nClient.deactivateWorkflow(id);
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(deactivated, null, 2),
        } as TextContent,
      ],
    };
  }

  private async executeWorkflow(args: any): Promise<CallToolResult> {
    const { workflowId, data } = z.object({
      workflowId: z.string(),
      data: z.record(z.any()).optional(),
    }).parse(args);

    const execution = await this.n8nClient.executeWorkflow(workflowId, data);
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(execution, null, 2),
        } as TextContent,
      ],
    };
  }

  private async getExecutions(args: any): Promise<CallToolResult> {
    const { workflowId, limit } = z.object({
      workflowId: z.string().optional(),
      limit: z.number().default(20),
    }).parse(args);

    const executions = await this.n8nClient.getExecutions(workflowId, limit);
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(executions, null, 2),
        } as TextContent,
      ],
    };
  }

  private async getExecution(args: any): Promise<CallToolResult> {
    const { id } = z.object({ id: z.string() }).parse(args);
    const execution = await this.n8nClient.getExecution(id);
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(execution, null, 2),
        } as TextContent,
      ],
    };
  }

  private async listCredentials(): Promise<CallToolResult> {
    const credentials = await this.n8nClient.listCredentials();
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(credentials, null, 2),
        } as TextContent,
      ],
    };
  }

  private async getCredential(args: any): Promise<CallToolResult> {
    const { id } = z.object({ id: z.string() }).parse(args);
    const credential = await this.n8nClient.getCredential(id);
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(credential, null, 2),
        } as TextContent,
      ],
    };
  }

  private async createCredential(args: any): Promise<CallToolResult> {
    const credential = CredentialSchema.parse(args);
    const created = await this.n8nClient.createCredential(credential);
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(created, null, 2),
        } as TextContent,
      ],
    };
  }

  private async updateCredential(args: any): Promise<CallToolResult> {
    const { id, ...updates } = z.object({
      id: z.string(),
      name: z.string().optional(),
      type: z.string().optional(),
      data: z.record(z.any()).optional(),
      nodesAccess: z.array(z.object({
        nodeType: z.string()
      })).optional(),
    }).parse(args);

    const updated = await this.n8nClient.updateCredential(id, updates);
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(updated, null, 2),
        } as TextContent,
      ],
    };
  }

  private async deleteCredential(args: any): Promise<CallToolResult> {
    const { id } = z.object({ id: z.string() }).parse(args);
    await this.n8nClient.deleteCredential(id);
    return {
      content: [
        {
          type: 'text',
          text: `Credential ${id} deleted successfully`,
        } as TextContent,
      ],
    };
  }

  private async getNodeTypes(): Promise<CallToolResult> {
    const nodeTypes = await this.n8nClient.getNodeTypes();
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(nodeTypes, null, 2),
        } as TextContent,
      ],
    };
  }

  private async getNodeType(args: any): Promise<CallToolResult> {
    const { nodeType } = z.object({ nodeType: z.string() }).parse(args);
    const nodeTypeInfo = await this.n8nClient.getNodeType(nodeType);
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(nodeTypeInfo, null, 2),
        } as TextContent,
      ],
    };
  }

  private async testWorkflow(args: any): Promise<CallToolResult> {
    const workflow = WorkflowSchema.parse(args);
    const result = await this.n8nClient.testWorkflow(workflow);
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(result, null, 2),
        } as TextContent,
      ],
    };
  }

  private async healthCheck(): Promise<CallToolResult> {
    const isHealthy = await this.n8nClient.healthCheck();
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({ healthy: isHealthy, timestamp: new Date().toISOString() }, null, 2),
        } as TextContent,
      ],
    };
  }

  async run() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error('n8n MCP Server running on stdio');
  }
}

const server = new N8nMcpServer();
server.run().catch(console.error);
