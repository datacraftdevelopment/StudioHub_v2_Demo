# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

StudioHub Dashboard is a web application that provides a read-only interface to FileMaker databases with AI-enhanced features. It integrates with two FileMaker systems: StudioHub (main project management) and TC-AI (AI features).

## Common Development Commands

### Frontend Development Commands
```bash
npm run dev              # Start Next.js development server
npm run build            # Build for production
npm run start            # Start production server
npm run lint             # Run ESLint
```

### Demo Mode Commands
```bash
# Run application in demo mode (no database required)
NEXT_PUBLIC_DEMO_MODE=true npm run dev

# Demo login credentials:
# Username: admin
# Password: admin!23
```

### MCP Server Commands
```bash
cd mcp-server
npm install              # Install dependencies
npm start                # Run production server
npm run dev              # Run with file watching for development
npm run test:connection  # Test FileMaker connection
```

### Testing FileMaker Connection
```bash
# Test StudioHub connection (replace with actual credentials)
curl -X POST "https://your-server/fmi/data/v1/databases/StudioHub/sessions" \
  -H "Content-Type: application/json" \
  -u "username:password"
```

## High-Level Architecture

### 1. **Dual Database System**
- **StudioHub**: Primary database for project management data
  - Layout: REQUEST_DELIVERABLES (30,106+ records)
  - Key fields: __kptID, DeliverableName, DueDate, Status, ProjectName
- **TC-AI**: Secondary database for AI features
  - Server: saurfmpro03.imp.corp.transcontinental.ca
  - Layouts: GLOBAL (system vars), SESSION (user session)

### 2. **Technology Stack**
- **Frontend**: Next.js 14+ with App Router, React, Tailwind CSS, shadcn/ui
- **Backend**: Node.js MCP server for FileMaker API integration
- **Auth**: FileMaker verification (production) / Mock auth (demo)
- **State**: Zustand (client), TanStack Query (server cache)
- **Demo Mode**: Mock data system for demonstration without database

### 3. **Critical Field Mappings**
```javascript
// Deliverable object mapping
{
  id: "__kptID",
  title: "DeliverableName",
  dueDate: "DueDate",
  status: "Status",
  project: "ProjectName",
  assignedTo: "request_deliverables__ASSIGNEES__...StaffFullName"
}

// User authentication fields
{
  id: "nameLogon",
  displayName: "zctFirstNameLastName",
  isDesigner: "bool_studioDesigner",
  isManager: "bool_studioManager"
}
```

### 4. **Authentication Flow**
1. User logs in via Supabase
2. System verifies user exists in FileMaker (nameLogon field)
3. Creates session in TC-AI database
4. Returns user permissions and dashboard data

### 5. **MCP Server Architecture**
The MCP server (`/mcp-server/index.js`) provides tools for:
- `fm_get_record`: Fetch single record by ID
- `fm_find_records`: Search with criteria
- `fm_get_all_records`: Fetch all records from layout
- Automatic session management and token refresh
- SSL certificate handling for internal servers

### 6. **Environment Configuration**
Required environment variables (see `/deliverables/environment_variables_checklist.md`):
- FileMaker connections: HOST, DATABASE, USERNAME, PASSWORD, SSL_VERIFY
- Demo mode: `NEXT_PUBLIC_DEMO_MODE=true` (optional, for demo without database)

Demo mode bypasses all database calls and uses mock data. When enabled:
- Login: username `admin`, password `admin!23`
- No FileMaker or MCP server connection required
- Returns realistic mock project management data

### 7. **Key Implementation Considerations**
- **Security**: FileMaker API user needs minimal privileges (Data Entry Only)
- **Performance**: 5-minute cache TTL, pagination for large datasets
- **Error Handling**: SSL certificate bypass for internal servers (`rejectUnauthorized: false`)
- **Field Names**: Always use exact FileMaker field names (case-sensitive)

## Development Workflow

1. **Setting up MCP server**: Follow `/mcp-config/SETUP_INSTRUCTIONS.md`
2. **Environment setup**: Use `/deliverables/environment_variables_checklist.md`
3. **Implementation guide**: Refer to `/deliverables/claude_code_implementation_prompt.md`
4. **Database details**: Check `/discovery/` folder for field mappings and layouts

## Important Notes

- The project is in active development with phased implementation
- FileMaker field names are case-sensitive and must match exactly
- TC-AI database connection is optional but enables AI features
- Always test FileMaker connections before implementing features
- Use the MCP server for all FileMaker API interactions when working in Claude

## FileMaker API Query Format

The FileMaker Data API uses a specific JSON format for queries:

### Find Records by Status
```json
{
  "query": [{"DisplayStatus": "In Progress"}]
}
```

### Find Records by Multiple Criteria
```json
{
  "query": [
    {"DisplayStatus": "In Progress"},
    {"DisplayStatus": "Overdue"}
  ]
}
```

### Key Field Names
- **Status Display**: Use `DisplayStatus` (not `Status`) for filtering "In Progress", "Overdue", etc.
- **Assignee Name**: Use `request_deliverables__ASSIGNEES__RequestDeliverableID__cre_del::StaffFullName`
- **Assignee Department**: Use `request_deliverables__ASSIGNEES__RequestDeliverableID__cre_del::StaffDepartment`
- **Due Date**: Use `DueDate` for date filtering

### Query Examples
```javascript
// Find overdue items
{ "query": [{"DisplayStatus": "Overdue"}] }

// Find items by department
{ "query": [
  {"DisplayStatus": "In Progress", "request_deliverables__ASSIGNEES__RequestDeliverableID__cre_del::StaffDepartment": "Graphics"},
  {"DisplayStatus": "Overdue", "request_deliverables__ASSIGNEES__RequestDeliverableID__cre_del::StaffDepartment": "Graphics"}
] }

// Find items due today
{ "query": [{"DueDate": "07/23/2025"}] }
```

### Important Notes
- The assignee fields are related fields from the ASSIGNEES table
- You cannot directly filter by StaffFullName in the query - must fetch and filter in memory
- Department filtering works in the query using the full related field name