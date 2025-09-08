# SESSION Table - Required Additional Fields for AI Chat

## Current SESSION Fields ✅
- `ID` (number) - Session identifier
- `recordID` (calculation/text) - Calculated session ID
- `_creationTimestamp` (timestamp) - Session start time
- `_creationAccount` (text) - User who started session
- `_lastModifyTimestamp` (timestamp) - Last activity
- `_lastModifyAccount` (text) - Last user activity

---

## Required Additional Fields for AI Chat Integration

### Core Chat Functionality

**`userID`** (text) *Required*
- FileMaker account name of the chat user
- Links session to StudioHub user authentication
- Used for user-specific chat history

**`conversationHistory`** (text) *Required*
- JSON array storing complete chat conversation
- Format: [{"role": "user", "content": "message"}, {"role": "assistant", "content": "response"}]
- Essential for AI context and chat persistence

**`sessionTitle`** (text) *Recommended*
- Human-readable title for the chat session
- Auto-generated from first user message
- Helps users identify chat sessions

**`sessionStatus`** (text) *Required*
- Values: "active", "paused", "completed", "archived"
- Manages session lifecycle
- Enables cleanup of old sessions

### AI Configuration

**`aiProvider`** (text) *Required*
- Values: "OpenAI", "Anthropic", "Auto"
- Specifies which AI service to use
- Allows per-session AI provider selection

**`aiModel`** (text) *Recommended*
- Values: "gpt-4", "claude-3", etc.
- Specific AI model for this session
- Enables model switching per conversation

**`systemPrompt`** (text) *Optional*
- Custom system prompt for this session
- Overrides default AI behavior
- Useful for specialized chat contexts

### Dashboard Integration

**`relatedProject`** (text) *Recommended*
- Links chat to specific StudioHub project
- Enables project-specific AI assistance
- Format: StudioHub project ID or name

**`relatedStudioRequest`** (text) *Optional*
- Links to specific studio request
- More granular project association
- Helps AI understand context

**`chatType`** (text) *Required*
- Values: "general", "project", "chart", "help"
- Categorizes chat purpose
- Enables different AI behaviors per type

### Session Management

**`lastMessageTimestamp`** (timestamp) *Required*
- When last message was sent/received
- Different from _lastModifyTimestamp (could be system updates)
- Used for session timeout logic

**`messageCount`** (number) *Recommended*
- Total messages in conversation
- Helps manage session length
- Useful for usage analytics

**`sessionTimeoutMinutes`** (number) *Optional*
- Custom timeout for this session
- Default: 30 minutes
- Allows extended sessions for complex tasks

### Chart Generation Support

**`chartRequests`** (text) *Optional*
- JSON array of chart generation requests
- Stores chart parameters and results
- Links AI chat to dynamic chart generation

**`chartData`** (text) *Optional*
- Cached chart data from recent requests
- Reduces repeated data queries
- JSON format with chart configurations

---

## Recommended Field Types & Settings

```
userID: Text, Indexed, Required
conversationHistory: Text, Large text area (unlimited)
sessionTitle: Text, 255 characters
sessionStatus: Text, Value list (active, paused, completed, archived)
aiProvider: Text, Value list (OpenAI, Anthropic, Auto)
aiModel: Text, 100 characters
systemPrompt: Text, Large text area
relatedProject: Text, 255 characters
relatedStudioRequest: Text, 255 characters
chatType: Text, Value list (general, project, chart, help)
lastMessageTimestamp: Timestamp, Indexed
messageCount: Number, Default: 0
sessionTimeoutMinutes: Number, Default: 30
chartRequests: Text, Large text area
chartData: Text, Large text area
```

---

## Essential vs Optional Priority

### Must Have (Phase 1):
1. `userID` - User identification
2. `conversationHistory` - Chat persistence
3. `sessionStatus` - Session management
4. `aiProvider` - AI service selection
5. `chatType` - Categorization
6. `lastMessageTimestamp` - Timeout management

### Nice to Have (Phase 2):
1. `sessionTitle` - User experience
2. `messageCount` - Analytics
3. `relatedProject` - Dashboard integration
4. `aiModel` - Advanced configuration

### Future Enhancement (Phase 3):
1. `systemPrompt` - Customization
2. `chartRequests` - Chart generation
3. `chartData` - Performance optimization
4. `sessionTimeoutMinutes` - Custom timeouts

---

## Sample Record Structure

```json
{
  "ID": 1,
  "userID": "joe.dasilva",
  "conversationHistory": "[{\"role\":\"user\",\"content\":\"What projects are due this week?\"},{\"role\":\"assistant\",\"content\":\"Based on your StudioHub data, you have 3 projects due this week...\"}]",
  "sessionTitle": "Weekly Project Review",
  "sessionStatus": "active",
  "aiProvider": "OpenAI",
  "aiModel": "gpt-4",
  "chatType": "project",
  "relatedProject": "Brand Refresh 2025",
  "lastMessageTimestamp": "07/21/2025 14:30:00",
  "messageCount": 8,
  "_creationTimestamp": "07/21/2025 14:15:22",
  "_creationAccount": "joe.dasilva"
}
```

---

## Implementation Notes

### Security:
- `conversationHistory` should be encrypted if storing sensitive project data
- Consider user access controls for cross-user session visibility

### Performance:
- Index `userID` and `lastMessageTimestamp` for fast session lookups
- Consider archiving old sessions to separate table

### Integration:
- `userID` should match StudioHub user accounts exactly
- `relatedProject` should reference actual StudioHub project identifiers

**Recommendation: Start with the "Must Have" fields, then add others as features develop.**
