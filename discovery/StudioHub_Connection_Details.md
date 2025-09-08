# StudioHub Database Discovery - Connection Details

## Connection Information ✅ RECEIVED

**Server:** 172.16.1.36 (SAURFMPRO03)  
**Hostname:** saurfmpro03.imp.corp.transcontinental.ca  
**Database:** StudioHub  
**Account:** api  
**Password:** API!23  

**Status:** Same server and credentials as TC-AI ✅

---

## Available Layouts

| Layout Name | Purpose (Predicted) | Analysis Status |
|-------------|-------------------|-----------------|
| PROJECTS | Client projects and overall project management | ⏳ Pending |
| EMPLOYEE | Team member information and assignments | ⏳ Pending |
| STUDIO_REQUESTS | Individual project requests within projects | ⏳ Pending |
| REQUEST_ | Related to studio requests (partial name?) | ⏳ Pending |

---

## Expected Data Structure (Based on Requirements)

### Primary Hierarchy:
```
PROJECTS (Client projects)
├── STUDIO_REQUESTS (Individual requests within projects)
    ├── Deliverables/Action Items (to be identified)
```

### Dashboard Requirements:
- **Dashboard View:** Focus on due dates, overdue items, risk analysis
- **Monthly Planner:** Calendar view of deliverables and milestones
- **User Authentication:** FileMaker account-based access

---

## Next Steps for Analysis

### 1. Layout Structure Analysis
- [ ] Examine PROJECTS layout fields and relationships
- [ ] Analyze STUDIO_REQUESTS layout structure
- [ ] Identify deliverables/action items location
- [ ] Map relationships between layouts

### 2. Field Mapping Discovery
- [ ] Document actual field names (not display names)
- [ ] Identify date fields for due date calculations
- [ ] Find status/progress tracking fields
- [ ] Locate user assignment fields

### 3. Dashboard Data Requirements
- [ ] Fields needed for "at risk" calculation
- [ ] Date ranges for "due today", "due this week"
- [ ] User filtering and permission model
- [ ] Project completion status tracking

### 4. Integration Planning
- [ ] Map StudioHub authentication to web dashboard
- [ ] Link StudioHub users to TC-AI chat sessions
- [ ] Plan data flow for AI features integration

---

## Configuration Updates Required

### MCP Server Environment:
```env
FM_DATABASE_STUDIOHUB=StudioHub
FM_ACCOUNT_STUDIOHUB=api
FM_PASSWORD_STUDIOHUB=API!23
```

### Claude Desktop Config:
```json
"FM_DATABASE_STUDIOHUB": "StudioHub",
"FM_ACCOUNT_STUDIOHUB": "api", 
"FM_PASSWORD_STUDIOHUB": "API!23"
```

**⚠️ Restart Required:** Claude Desktop needs restart to load StudioHub configuration.

---

## Discovery Phase Status

### TC-AI Database: ✅ COMPLETE
- Structure analyzed and documented
- AI chat functionality validated
- Write operations tested successfully

### StudioHub Database: ⏳ READY FOR ANALYSIS
- Connection details configured
- Layout names identified
- Awaiting MCP server restart and structure analysis

**Ready to begin comprehensive StudioHub database analysis once MCP server is restarted with new configuration.**
