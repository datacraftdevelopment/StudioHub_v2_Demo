#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import axios from 'axios';
import https from 'https';
import dotenv from 'dotenv';

// Create an agent that accepts self-signed certificates
const httpsAgent = new https.Agent({
  rejectUnauthorized: false
});

// Load environment variables
dotenv.config();

class FileMakerMCPServer {
  constructor() {
    this.server = new Server(
      {
        name: 'filemaker-mcp-server',
        version: '1.0.0',
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    this.setupToolHandlers();
  }

  getDatabaseConfig(database) {
    const configs = {
      'StudioHub': {
        host: process.env.STUDIOHUB_HOST,
        database: process.env.STUDIOHUB_DATABASE || 'StudioHub',
        username: process.env.STUDIOHUB_USERNAME,
        password: process.env.STUDIOHUB_PASSWORD,
        sslVerify: process.env.STUDIOHUB_SSL_VERIFY === 'true'
      }
    };

    const config = configs[database];
    if (!config || !config.username || !config.password || !config.host) {
      throw new Error(`Database configuration not found or incomplete for: ${database}`);
    }

    return config;
  }

  async authenticate(database) {
    const dbConfig = this.getDatabaseConfig(database);
    const protocol = 'https';
    const apiVersion = 'v1';
    const baseUrl = `${protocol}://${dbConfig.host}`;
    const authUrl = `${baseUrl}/fmi/data/${apiVersion}/databases/${dbConfig.database}/sessions`;
    
    try {
      const response = await axios.post(authUrl, {}, {
        auth: {
          username: dbConfig.username,
          password: dbConfig.password
        },
        headers: {
          'Content-Type': 'application/json'
        },
        httpsAgent: dbConfig.sslVerify ? undefined : httpsAgent,
        timeout: 10000
      });

      return {
        token: response.data.response.token,
        baseUrl: baseUrl,
        database: dbConfig.database,
        sslVerify: dbConfig.sslVerify
      };
    } catch (error) {
      throw new Error(`FileMaker authentication failed for ${database}: ${error.message}`);
    }
  }

  async makeAuthenticatedRequest(session, endpoint, method = 'GET', data = null) {
    const apiVersion = 'v1';
    const url = `${session.baseUrl}/fmi/data/${apiVersion}/databases/${session.database}${endpoint}`;
    
    try {
      const config = {
        method: method,
        url: url,
        headers: {
          'Authorization': `Bearer ${session.token}`,
          'Content-Type': 'application/json'
        },
        httpsAgent: session.sslVerify ? undefined : httpsAgent,
        timeout: 10000
      };

      if (data && (method === 'POST' || method === 'PATCH')) {
        config.data = data;
      }

      const response = await axios(config);
      return response.data;
    } catch (error) {
      throw new Error(`FileMaker API request failed: ${error.message}`);
    }
  }

  setupToolHandlers() {
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      return {
        tools: [
          {
            name: 'fm_list_layouts',
            description: 'List all layouts available in a FileMaker database',
            inputSchema: {
              type: 'object',
              properties: {
                database: {
                  type: 'string',
                  description: 'Database name (StudioHub)',
                  enum: ['StudioHub'],
                  default: 'StudioHub'
                }
              },
              required: ['database']
            }
          },
          {
            name: 'fm_get_layout_metadata',
            description: 'Get field information and metadata for a specific layout',
            inputSchema: {
              type: 'object',
              properties: {
                database: {
                  type: 'string',
                  description: 'Database name (StudioHub)',
                  enum: ['StudioHub'],
                  default: 'StudioHub'
                },
                layout: {
                  type: 'string',
                  description: 'Layout name to analyze'
                }
              },
              required: ['database', 'layout']
            }
          },
          {
            name: 'fm_get_records',
            description: 'Get records from a specific layout',
            inputSchema: {
              type: 'object',
              properties: {
                database: {
                  type: 'string',
                  description: 'Database name (StudioHub)',
                  enum: ['StudioHub'],
                  default: 'StudioHub'
                },
                layout: {
                  type: 'string',
                  description: 'Layout name to query'
                },
                limit: {
                  type: 'number',
                  description: 'Maximum number of records to return (default: 10)',
                  default: 10
                }
              },
              required: ['database', 'layout']
            }
          },
          {
            name: 'fm_find_records',
            description: 'Find records in a layout using search criteria',
            inputSchema: {
              type: 'object',
              properties: {
                database: {
                  type: 'string',
                  description: 'Database name (StudioHub)',
                  enum: ['StudioHub'],
                  default: 'StudioHub'
                },
                layout: {
                  type: 'string',
                  description: 'Layout name to search'
                },
                query: {
                  type: 'object',
                  description: 'Search criteria as key-value pairs'
                },
                limit: {
                  type: 'number',
                  description: 'Maximum number of records to return (default: 10)',
                  default: 10
                }
              },
              required: ['database', 'layout', 'query']
            }
          },
          {
            name: 'fm_create_record',
            description: 'Create a new record in a specific layout',
            inputSchema: {
              type: 'object',
              properties: {
                database: {
                  type: 'string',
                  description: 'Database name (StudioHub)',
                  enum: ['StudioHub'],
                  default: 'StudioHub'
                },
                layout: {
                  type: 'string',
                  description: 'Layout name to create record in'
                },
                fieldData: {
                  type: 'object',
                  description: 'Field data as key-value pairs'
                }
              },
              required: ['database', 'layout', 'fieldData']
            }
          },
          {
            name: 'fm_update_record',
            description: 'Update an existing record in a specific layout',
            inputSchema: {
              type: 'object',
              properties: {
                database: {
                  type: 'string',
                  description: 'Database name (StudioHub)',
                  enum: ['StudioHub'],
                  default: 'StudioHub'
                },
                layout: {
                  type: 'string',
                  description: 'Layout name to update record in'
                },
                recordId: {
                  type: 'string',
                  description: 'Record ID to update'
                },
                fieldData: {
                  type: 'object',
                  description: 'Field data as key-value pairs'
                }
              },
              required: ['database', 'layout', 'recordId', 'fieldData']
            }
          }
        ]
      };
    });

    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      try {
        switch (name) {
          case 'fm_list_layouts':
            return await this.listLayouts(args.database);
          
          case 'fm_get_layout_metadata':
            return await this.getLayoutMetadata(args.database, args.layout);
          
          case 'fm_get_records':
            return await this.getRecords(args.database, args.layout, args.limit || 10);
          
          case 'fm_find_records':
            return await this.findRecords(args.database, args.layout, args.query, args.limit || 10);
          
          case 'fm_create_record':
            return await this.createRecord(args.database, args.layout, args.fieldData);
          
          case 'fm_update_record':
            return await this.updateRecord(args.database, args.layout, args.recordId, args.fieldData);
          
          default:
            throw new Error(`Unknown tool: ${name}`);
        }
      } catch (error) {
        return {
          content: [
            {
              type: 'text',
              text: `Error: ${error.message}`
            }
          ]
        };
      }
    });
  }

  async listLayouts(database) {
    const session = await this.authenticate(database);
    const data = await this.makeAuthenticatedRequest(session, '/layouts');
    
    return {
      content: [
        {
          type: 'text',
          text: `Available layouts in ${database}:\n\n` + 
                data.response.layouts.map(layout => `• ${layout.name}`).join('\n')
        }
      ]
    };
  }

  async getLayoutMetadata(database, layout) {
    const session = await this.authenticate(database);
    const data = await this.makeAuthenticatedRequest(session, `/layouts/${layout}`);
    
    const fields = data.response.fieldMetaData.map(field => ({
      name: field.name,
      type: field.type,
      displayType: field.displayType,
      result: field.result,
      global: field.global,
      repetitions: field.maxRepeat
    }));

    return {
      content: [
        {
          type: 'text',
          text: `Layout "${layout}" in ${database}:\n\n` +
                `Field Information:\n` +
                fields.map(f => `• ${f.name} (${f.type}/${f.displayType})`).join('\n') +
                `\n\nDetailed Field Data:\n` +
                JSON.stringify(fields, null, 2)
        }
      ]
    };
  }

  async getRecords(database, layout, limit) {
    const session = await this.authenticate(database);
    const data = await this.makeAuthenticatedRequest(session, `/layouts/${layout}/records?_limit=${limit}`);
    
    return {
      content: [
        {
          type: 'text',
          text: `Records from "${layout}" in ${database} (showing ${Math.min(limit, data.response.data.length)} of ${data.response.dataInfo.totalRecordCount}):\n\n` +
                JSON.stringify(data.response.data, null, 2)
        }
      ]
    };
  }

  async findRecords(database, layout, query, limit) {
    const session = await this.authenticate(database);
    const findRequest = {
      query: [query],
      limit: limit
    };
    
    const data = await this.makeAuthenticatedRequest(session, `/layouts/${layout}/_find`, 'POST', findRequest);
    
    return {
      content: [
        {
          type: 'text',
          text: `Search results from "${layout}" in ${database}:\n\n` +
                `Query: ${JSON.stringify(query)}\n` +
                `Results: ${data.response.data.length} records\n\n` +
                JSON.stringify(data.response.data, null, 2)
        }
      ]
    };
  }

  async createRecord(database, layout, fieldData) {
    const session = await this.authenticate(database);
    const createRequest = {
      fieldData: fieldData
    };
    
    const data = await this.makeAuthenticatedRequest(session, `/layouts/${layout}/records`, 'POST', createRequest);
    
    return {
      content: [
        {
          type: 'text',
          text: `Successfully created record in "${layout}" (${database}):\n\n` +
                `New Record ID: ${data.response.recordId}\n` +
                `Mod ID: ${data.response.modId}\n\n` +
                `Field Data Created:\n` +
                JSON.stringify(fieldData, null, 2)
        }
      ]
    };
  }

  async updateRecord(database, layout, recordId, fieldData) {
    const session = await this.authenticate(database);
    const updateRequest = {
      fieldData: fieldData
    };
    
    const data = await this.makeAuthenticatedRequest(session, `/layouts/${layout}/records/${recordId}`, 'PATCH', updateRequest);
    
    return {
      content: [
        {
          type: 'text',
          text: `Successfully updated record ${recordId} in "${layout}" (${database}):\n\n` +
                `New Mod ID: ${data.response.modId}\n\n` +
                `Field Data Updated:\n` +
                JSON.stringify(fieldData, null, 2)
        }
      ]
    };
  }

  async run() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error('FileMaker MCP Server running...');
  }
}

const server = new FileMakerMCPServer();
server.run().catch(console.error);
