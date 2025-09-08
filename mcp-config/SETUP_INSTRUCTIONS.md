# FileMaker MCP Server Setup Instructions

## 1. Install Dependencies

Navigate to the MCP server directory and install required packages:

```bash
cd "/Users/dasilvaja/Cloud Dropbox/Joe DaSilva/_VibeCoding/StudioHub-Dashboard/mcp-server"
npm install
```

## 2. Test the MCP Server

First, test if the server runs correctly:

```bash
npm start
```

You should see: "FileMaker MCP Server running..."
Press Ctrl+C to stop the test.

## 3. Add to Claude Desktop Configuration

You need to add the MCP server to your Claude Desktop configuration.

### Option A: Edit existing config
If you have an existing Claude Desktop config, add the filemaker-api server to your mcpServers section.

### Option B: Create new config
Copy the contents of `claude_desktop_config_addition.json` to your Claude Desktop config file:

**Location**: `/Users/dasilvaja/Library/Application Support/Claude/claude_desktop_config.json`

**Content to add:**
```json
{
  "mcpServers": {
    "filemaker-api": {
      "command": "node",
      "args": ["/Users/dasilvaja/Cloud Dropbox/Joe DaSilva/_VibeCoding/StudioHub-Dashboard/mcp-server/index.js"],
      "env": {
        "FM_SERVER": "saurfmpro03.imp.corp.transcontinental.ca",
        "FM_DATABASE_TCAI": "TC-AI",
        "FM_ACCOUNT": "api",
        "FM_PASSWORD": "API!23",
        "FM_API_VERSION": "v1",
        "FM_PROTOCOL": "https"
      }
    }
  }
}
```

## 4. Restart Claude Desktop

After updating the configuration:
1. Quit Claude Desktop completely
2. Restart Claude Desktop
3. Start a new chat session

## 5. Test the Connection

In a new Claude chat, you should be able to use these tools:
- `fm_list_layouts` - List layouts in TC-AI database
- `fm_get_layout_metadata` - Get field information from layouts
- `fm_get_records` - Get sample records
- `fm_find_records` - Search for specific records

## 6. Verify TC-AI Connection

Test with: "List the layouts available in the TC-AI database"

You should see the GLOBAL and SESSION layouts listed.

## Troubleshooting

### Common Issues:
1. **MCP server not found**: Check the file path in the config
2. **FileMaker connection failed**: Verify server is accessible and credentials are correct
3. **No tools available**: Restart Claude Desktop after config changes

### Test FileMaker Connection Manually:
```bash
curl -X POST "https://saurfmpro03.imp.corp.transcontinental.ca/fmi/data/v1/databases/TC-AI/sessions" \
  -H "Content-Type: application/json" \
  -u "api:API!23"
```

Should return a session token if connection is working.

## Next Steps

Once the MCP server is running and connected:
1. Analyze TC-AI database structure (GLOBAL & SESSION layouts)
2. Get StudioHub database connection details
3. Complete discovery phase documentation
4. Generate accurate deliverables for web development
