# MCP Server Configuration for FileMaker Data API

## Overview
This configuration will allow Claude to connect to FileMaker databases via the FileMaker Data API through an MCP server.

## Required MCP Server Setup

### 1. Install FileMaker Data API MCP Server
You'll need an MCP server that can connect to FileMaker's Data API. This can be:
- A custom Node.js MCP server
- An existing FileMaker MCP connector
- A Python-based MCP server

### 2. Claude Desktop Configuration
Add this to your Claude Desktop config (`claude_desktop_config.json`):

```json
{
  "mcpServers": {
    "filemaker-api": {
      "command": "node",
      "args": ["/path/to/filemaker-mcp-server/index.js"],
      "env": {
        "FM_SERVER": "saurfmpro03.imp.corp.transcontinental.ca",
        "FM_ACCOUNT": "api",
        "FM_PASSWORD": "API!23"
      }
    }
  }
}
```

### 3. Environment Variables for MCP Server
```env
# TC-AI Database
FM_SERVER_TCAI=saurfmpro03.imp.corp.transcontinental.ca
FM_DATABASE_TCAI=TC-AI
FM_ACCOUNT_TCAI=api
FM_PASSWORD_TCAI=API!23

# StudioHub Database (TBD)
FM_SERVER_STUDIOHUB=saurfmpro03.imp.corp.transcontinental.ca
FM_DATABASE_STUDIOHUB=StudioHub
FM_ACCOUNT_STUDIOHUB=TBD
FM_PASSWORD_STUDIOHUB=TBD
```

## Required MCP Server Capabilities

The MCP server should provide these functions:
- `list_layouts` - Get available layouts from a database
- `get_layout_fields` - Get field information from a layout
- `find_records` - Execute find requests
- `get_records` - Get records from a layout
- `execute_script` - Run FileMaker scripts (if needed)

## Next Steps
1. Choose/create appropriate MCP server for FileMaker Data API
2. Configure Claude Desktop with MCP server settings
3. Test connection to TC-AI database
4. Analyze GLOBAL and SESSION layouts
5. Get StudioHub database details and repeat setup

## Testing Connection
Once configured, we can test with:
- List layouts in TC-AI database
- Examine GLOBAL layout fields
- Examine SESSION layout fields
- Verify data access permissions
