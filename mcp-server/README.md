# n8n MCP Server

A Model Context Protocol (MCP) server for integrating n8n workflow automation with Claude Desktop. This server provides full CRUD operations for workflows, credentials, executions, and node management.

## Features

- **Workflow Management**: Create, read, update, delete, activate/deactivate workflows
- **Execution Control**: Execute workflows, monitor executions, get execution history
- **Credential Management**: Manage n8n credentials securely
- **Node Information**: Access available node types and their configurations
- **Health Monitoring**: Check n8n API connectivity and health

## Installation

1. Install dependencies:
```bash
npm install
```

2. Build the project:
```bash
npm run build
```

3. Configure your environment variables in `.env`:
```env
N8N_API_URL=http://n8n.saursysdev01.tcaurora.com/api/v1
N8N_API_KEY=your-api-key-here
API_TIMEOUT=30000
DEBUG=false
```

## Development

Run in development mode with auto-reload:
```bash
npm run dev
```

Run type checking:
```bash
npm run type-check
```

## Testing

Run tests:
```bash
npm test
```

## Claude Desktop Configuration

Add this to your Claude Desktop `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "n8n": {
      "command": "node",
      "args": ["/Users/dasilvaja/VideCode/Docker/StudioHub-Dashboard/mcp-server/dist/index.js"],
      "env": {
        "N8N_API_URL": "http://n8n.saursysdev01.tcaurora.com/api/v1",
        "N8N_API_KEY": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJiZjI4NDJiYi1mMTZmLTRmNjEtYTYzNC04YWQyMTE1ZjgzMGIiLCJpc3MiOiJuOG4iLCJhdWQiOiJwdWJsaWMtYXBpIiwiaWF0IjoxNzU1MjcxMzUxfQ.DLqiEkitdOkXb80FB8R3P7jTOdAkEGuNWJJeSu5Zzgo"
      }
    }
  }
}
```

Or using npx for easier updates:
```json
{
  "mcpServers": {
    "n8n": {
      "command": "npx",
      "args": ["-y", "tsx", "/Users/dasilvaja/VideCode/Docker/StudioHub-Dashboard/mcp-server/src/index.ts"],
      "env": {
        "N8N_API_URL": "http://n8n.saursysdev01.tcaurora.com/api/v1",
        "N8N_API_KEY": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJiZjI4NDJiYi1mMTZmLTRmNjEtYTYzNC04YWQyMTE1ZjgzMGIiLCJpc3MiOiJuOG4iLCJhdWQiOiJwdWJsaWMtYXBpIiwiaWF0IjoxNzU1MjcxMzUxfQ.DLqiEkitdOkXb80FB8R3P7jTOdAkEGuNWJJeSu5Zzgo"
      }
    }
  }
}
```

## Available Tools

### Workflow Operations
- `list_workflows` - List all workflows
- `get_workflow` - Get workflow by ID
- `create_workflow` - Create new workflow
- `update_workflow` - Update existing workflow
- `delete_workflow` - Delete workflow
- `activate_workflow` - Activate workflow
- `deactivate_workflow` - Deactivate workflow
- `test_workflow` - Test workflow without saving

### Execution Operations
- `execute_workflow` - Execute a workflow
- `get_executions` - List workflow executions
- `get_execution` - Get execution details

### Credential Operations
- `list_credentials` - List all credentials
- `get_credential` - Get credential by ID
- `create_credential` - Create new credential
- `update_credential` - Update existing credential
- `delete_credential` - Delete credential

### Node Information
- `get_node_types` - List available node types
- `get_node_type` - Get specific node type information

### System Operations
- `health_check` - Check n8n API health

## Usage Examples

After configuring Claude Desktop, you can interact with your n8n instance:

"List all my workflows"
"Create a new workflow that sends a Slack message when a webhook is triggered"
"Show me the execution history for workflow ID abc123"
"Activate the workflow named 'Daily Report'"

## Security

- API keys are handled securely through environment variables
- All requests are authenticated with n8n API keys
- Credentials are managed through n8n's built-in security

## Troubleshooting

1. **Connection Issues**: Verify N8N_API_URL and N8N_API_KEY are correct
2. **Permission Errors**: Ensure the API key has sufficient permissions
3. **Build Errors**: Run `npm run type-check` to identify TypeScript issues
4. **Runtime Errors**: Check n8n server logs and enable DEBUG=true

## License

MIT
