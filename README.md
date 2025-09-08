# StudioHub Dashboard Project

## Project Overview
Web dashboard connecting to FileMaker Studio Hub system with AI-enhanced features from TC-AI database.

**Goal**: Create read-only web interface with personalized dashboard and monthly planner views.

## Current Status: Discovery Phase
- ✅ Project structure created
- ✅ TC-AI connection details received
- ⏳ MCP server setup needed
- ⏳ TC-AI database analysis pending
- ⏳ StudioHub database connection details needed

## Project Structure
```
StudioHub-Dashboard/
├── discovery/          # Analysis and requirements documentation
├── mcp-config/         # MCP server configuration files
├── deliverables/       # Final prompts and specifications
└── README.md          # This file
```

## Two FileMaker Systems Integration
1. **TC-AI Database** (AI Features)
   - Server: saurfmpro03.imp.corp.transcontinental.ca
   - Account: api / API!23
   - Database: TC-AI
   - Layouts: GLOBAL, SESSION
   - Purpose: AI chat area, dynamic charts/graphs

2. **StudioHub Database** (Main Project Data)
   - Connection details: TBD
   - Structure: Projects → Studio Requests → Deliverables
   - Purpose: Dashboard and calendar views

## Implementation Workflow
1. **Discovery Phase** (Current)
   - MCP server setup for FileMaker access
   - Database structure analysis
   - Requirements gathering
   
2. **Planning Phase**
   - Create v0.dev UI generation prompt
   - Create Claude Code implementation prompt
   - Environment configuration checklist
   
3. **Development Phase**
   - UI generation with v0.dev
   - Implementation with Claude Code
   - Deployment to Vercel

## Next Steps
- [ ] Set up MCP server for FileMaker Data API access
- [ ] Analyze TC-AI database structure (GLOBAL & SESSION layouts)
- [ ] Get StudioHub database connection details
- [ ] Complete discovery documentation
- [ ] Generate accurate deliverables with real field names

---
*Updated: $(date)*
