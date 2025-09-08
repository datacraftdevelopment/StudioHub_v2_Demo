# TC-AI Database Discovery Analysis

## Connection Status: ✅ SUCCESSFUL

**Database:** TC-AI  
**Server:** saurfmpro03.imp.corp.transcontinental.ca  
**Analyzed:** July 21, 2025

---

## Available Layouts

| Layout Name | Purpose | Status |
|-------------|---------|--------|
| GLOBAL | AI configuration and API keys | ✅ Analyzed |
| SESSION | AI session management | ✅ Analyzed |
| TC Mizu Base Layout | Theme/UI base | Available |
| 水 Mizu Theme | Japanese theme variant | Available |
| BASE | Base layout | Available |
| - | Default/empty layout | Available |

---

## GLOBAL Layout Analysis

**Purpose:** Central configuration for AI features

### Key Fields for StudioHub Integration:
- `APIKey_OpenAI` (text) - OpenAI API key storage
- `APIKey_Anthropic` (text) - Anthropic API key storage  
- `devSchema` (text) - Development schema/configuration
- `devNotes` (text) - Development notes and documentation

### Standard Fields:
- `ID` (number) - Primary key
- `recordID` (calculation/text) - Calculated record identifier
- `_creationTimestamp` (timestamp) - Record creation time
- `_creationAccount` (text) - Creating user account
- `_lastModifyTimestamp` (timestamp) - Last modification time
- `_lastModifyAccount` (text) - Last modifying user

### Current Data:
- 1 record exists (Global configuration record)
- API keys currently empty (security - likely stored elsewhere)
- Development fields empty (ready for configuration)

---

## SESSION Layout Analysis

**Purpose:** AI session tracking and management

### Fields Available:
- `ID` (number) - Session identifier
- `recordID` (calculation/text) - Calculated session ID
- Standard audit trail fields (creation/modification timestamps and accounts)

### Integration Potential:
- Track AI chat sessions per user
- Store conversation history
- Manage session state for AI interactions
- Link sessions to StudioHub users

---

## AI Features Integration Plan for StudioHub Dashboard

### 1. AI Chat Component
**Data Source:** SESSION layout
- Create new session record for each user chat
- Store conversation history in SESSION records
- Link sessions to StudioHub user accounts

### 2. Dynamic Chart Generation
**Data Source:** GLOBAL layout for configuration
- Use API keys from GLOBAL record
- Store chart preferences in devSchema field
- Generate charts based on StudioHub project data

### 3. Configuration Management
**Data Source:** GLOBAL layout
- Central configuration for AI features
- API key management (secure storage)
- Feature toggles and settings

---

## Technical Requirements for Web Integration

### API Access:
- ✅ Data API enabled and working
- ✅ Account 'api' has proper access
- ✅ Layouts accessible via REST API

### Security Considerations:
- API keys stored in GLOBAL may need encryption
- SESSION data requires user-specific access controls
- Consider read-only access for web dashboard

### Data Flow for StudioHub Dashboard:
1. **User Authentication** → Verify against StudioHub accounts
2. **AI Chat Initialization** → Create SESSION record
3. **Chart Generation** → Read GLOBAL config + StudioHub data
4. **Session Management** → Update SESSION with chat history

---

## Next Steps

### Immediate:
- [ ] Get StudioHub database connection details
- [ ] Analyze StudioHub structure (Projects → Studio Requests → Deliverables)
- [ ] Map relationships between TC-AI and StudioHub data

### Technical Planning:
- [ ] Design AI chat component architecture
- [ ] Plan dynamic chart data structure
- [ ] Create security model for API key access
- [ ] Define session management workflow

### Integration Design:
- [ ] Create unified authentication between StudioHub and TC-AI
- [ ] Design data flow for AI features in dashboard
- [ ] Plan real-time updates and caching strategy

---

## Field Mapping for Web Dashboard

### TC-AI GLOBAL → Web Configuration:
- `APIKey_OpenAI` → AI chat service configuration
- `APIKey_Anthropic` → Alternative AI service  
- `devSchema` → Chart configuration and feature settings
- `devNotes` → Admin notes and documentation

### TC-AI SESSION → Web AI Chat:
- `ID` → Session identifier for chat persistence
- `_creationAccount` → User who started chat session
- `_creationTimestamp` → Chat session start time
- Additional fields needed: conversation history, chat state

**Analysis Complete:** TC-AI database structure documented and ready for StudioHub integration planning.
