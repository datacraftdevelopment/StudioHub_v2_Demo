# StudioHub Database - Updated Layout Information

## Connection Status: READ-ONLY ✅

**Account Permissions:** Read-only (perfect for discovery phase)  
**Security Model:** Same as TC-AI discovery approach

---

## Complete Available Layouts

| Layout Name | Purpose | Priority |
|-------------|---------|----------|
| **PROJECTS** | Client projects and overall project management | 🔥 Critical |
| **STUDIO_REQUESTS** | Individual project requests within projects | 🔥 Critical |
| **REQUEST_DELIVERABLES** | Action items/deliverables for studio requests | 🔥 Critical |
| **EMPLOYEE** | Team member information and assignments | 📋 Important |
| **CUSTOMER** | Client information | 📋 Reference |

---

## Expected Data Hierarchy ✅ CONFIRMED

Based on layout names, the structure appears to be:

```
PROJECTS (Client projects)
├── STUDIO_REQUESTS (Individual requests within projects)
    ├── REQUEST_DELIVERABLES (Action items/deliverables)
```

**🎯 Perfect!** This matches our dashboard requirements:
- **Dashboard View:** Focus on REQUEST_DELIVERABLES due dates and status
- **Monthly Planner:** Calendar view of REQUEST_DELIVERABLES deadlines
- **Project Context:** Link deliverables back to STUDIO_REQUESTS and PROJECTS

---

## Discovery Analysis Priority

### Phase 1: Core Dashboard Data (Critical)
1. **REQUEST_DELIVERABLES** - The action items that drive the dashboard
2. **STUDIO_REQUESTS** - Context and grouping for deliverables  
3. **PROJECTS** - Top-level project information

### Phase 2: User & Context Data (Important)
4. **EMPLOYEE** - User assignments and authentication mapping
5. **CUSTOMER** - Client context (may not be needed for dashboard)

---

## Key Questions for Analysis

### REQUEST_DELIVERABLES Layout:
- [ ] Due date field name and format?
- [ ] Status/progress tracking fields?
- [ ] Assignment fields (which employee)?
- [ ] Relationship to STUDIO_REQUESTS?
- [ ] Priority/urgency indicators?

### STUDIO_REQUESTS Layout:
- [ ] Request title/name fields?
- [ ] Client/project associations?
- [ ] Overall request status?
- [ ] Relationship to PROJECTS?

### PROJECTS Layout:
- [ ] Project name and client fields?
- [ ] Project status and dates?
- [ ] User access/permission model?

### EMPLOYEE Layout:
- [ ] User account mapping for authentication?
- [ ] Assignment tracking fields?
- [ ] Permission levels?

---

## Dashboard Integration Plan

### AI Chat Enhancement:
- **TC-AI Sessions** ↔ **StudioHub Users** (via EMPLOYEE)
- **AI Context:** "Tell me about my deliverables" → Query REQUEST_DELIVERABLES for user
- **Chart Generation:** Project completion rates from REQUEST_DELIVERABLES status

### Web Dashboard Features:
- **At Risk Items:** Overdue REQUEST_DELIVERABLES
- **Due Today/Week:** REQUEST_DELIVERABLES by date ranges
- **Monthly Calendar:** REQUEST_DELIVERABLES plotted by due dates
- **Project Grouping:** Group deliverables by STUDIO_REQUESTS and PROJECTS

---

## Next Steps (After Claude Desktop Restart)

1. **Connect to StudioHub database**
2. **Analyze REQUEST_DELIVERABLES layout** (highest priority)
3. **Map STUDIO_REQUESTS structure**
4. **Document PROJECTS layout**
5. **Identify user authentication model in EMPLOYEE**
6. **Create complete field mapping documentation**

**Ready for comprehensive StudioHub analysis once Claude Desktop is restarted!**

**The REQUEST_DELIVERABLES layout is likely the goldmine for dashboard data.**
