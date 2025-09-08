# FileMaker Data API Integration Guide

This document outlines all the secrets, configurations, and lessons learned from integrating with FileMaker's Data API.

## Environment Variables

### Required Configuration
```env
# FileMaker Server Connection
STUDIOHUB_HOST=your-filemaker-server.com
STUDIOHUB_DATABASE=YourDatabase
STUDIOHUB_USERNAME=api_user
STUDIOHUB_PASSWORD=api_password
STUDIOHUB_SSL_VERIFY=false  # Set to false for internal servers with self-signed certificates
```

### Important Notes on SSL
- Internal FileMaker servers often use self-signed certificates
- Set `STUDIOHUB_SSL_VERIFY=false` to bypass certificate validation
- In production with proper certificates, set to `true`

## Session Management

### Critical Timeout Settings
- **FileMaker Session Timeout**: 15 minutes of inactivity
- **Recommended Refresh**: 10 minutes (600,000ms)
- **API Request Timeout**: 30 seconds (30,000ms) - FileMaker can be slow with large datasets
- **Implementation**: Track last activity and proactively refresh before timeout

```javascript
private readonly SESSION_TIMEOUT = 10 * 60 * 1000 // 10 minutes in milliseconds
```

### Session Refresh Logic
1. Track `lastActivity` timestamp with each API call
2. Before each request, check if session is older than 10 minutes
3. If timeout detected:
   - Close existing session (ignore errors)
   - Create new session
   - Update authorization header

## Authentication Flow

### API User Setup
1. Create dedicated API user in FileMaker
2. Minimum privilege set: "Data Entry Only"
3. Grant access to required layouts/tables

### Dual Authentication Pattern
For user-specific data access:
1. API authenticates with service credentials
2. Verify user credentials against EMPLOYEE table
3. Return user permissions and filtered data

## FileMaker Query Syntax - CRITICAL INFORMATION

### Query Format
The FileMaker Data API expects queries in a specific JSON format:

```json
{
  "query": [
    {"fieldName": "value"}
  ]
}
```

### Field Name Requirements
- **Case Sensitive**: Field names must match exactly (DisplayStatus not displaystatus)
- **Related Fields**: Use double colon syntax
  ```
  request_deliverables__ASSIGNEES__RequestDeliverableID__cre_del::StaffFullName
  ```

### Common Query Patterns

#### Get ALL Records - IMPORTANT!
```javascript
// WRONG - Returns NO records
const query = []

// RIGHT - Use getRecords method without query
await client.getRecords('LAYOUT_NAME', limit, offset)

// OR use wildcard in find
await client.findRecords('LAYOUT_NAME', [{"FieldName": "*"}], limit)
```

#### Simple Field Query
```javascript
{
  "query": [{"Status": "In Progress"}]
}
```

#### Multiple Criteria (OR Logic)
```javascript
{
  "query": [
    {"Status": "In Progress"},
    {"Status": "Overdue"}
  ]
}
```

#### Multiple Fields (AND Logic within same object)
```javascript
{
  "query": [
    {"Status": "In Progress", "Department": "Graphics"}
  ]
}
```

#### Complex Queries - Mix of AND/OR
```javascript
{
  "query": [
    {"DisplayStatus": "In Progress", "StaffDepartment": "Graphics"},
    {"DisplayStatus": "Overdue", "StaffDepartment": "Graphics"}
  ]
}
```

### Date Query Patterns
```javascript
// Exact date
{"DueDate": "07/23/2025"}

// Date range
{"DueDate": "07/01/2025...07/31/2025"}

// Before date
{"DueDate": "<07/23/2025"}

// After date
{"DueDate": ">07/23/2025"}
```

### Query Limitations
- No complex nested AND/OR combinations
- Limited operators (no LIKE, IN, NOT, etc.)
- Empty queries return NO records - not all records!
- Cannot use wildcards with operators (e.g., ">*" doesn't work)
- For complex filtering, fetch more records and filter in application

## Field Discovery and Debugging

### Finding Available Fields
When working with a new layout, discover available fields:

```javascript
const records = await client.getRecords('LAYOUT_NAME', 1)
if (records.length > 0) {
  console.log('Available fields:', Object.keys(records[0].fieldData))
  console.log('Field data:', JSON.stringify(records[0].fieldData, null, 2))
}
```

### Common Field Mapping Issues

#### Problem: DesignerName vs Assignee Fields
```javascript
// WRONG - DesignerName might not exist
{"DesignerName": "John Smith"}

// RIGHT - Use the actual assignee field
{"request_deliverables__ASSIGNEES__RequestDeliverableID__cre_del::StaffFullName": "John Smith"}
```

#### Problem: Status vs DisplayStatus
```javascript
// Check both fields - they may contain different data
Status: "Pending"         // Internal status
DisplayStatus: "Overdue"  // Calculated display status
```

## Common Pitfalls and Solutions

### 1. Empty Query Returns Nothing
**Problem**: `[]` query returns no records, not all records
**Solution**: Use `getRecords()` method or wildcard query
```javascript
// Get all records
await client.getRecords('LAYOUT', limit, offset)
```

### 2. Case Sensitivity Issues
**Problem**: "overdue" doesn't match "Overdue"
**Solution**: Always use exact case from FileMaker
```javascript
// WRONG
{"DisplayStatus": "overdue"}

// RIGHT
{"DisplayStatus": "Overdue"}
```

### 3. Field Doesn't Exist Errors (Error 102)
**Problem**: Querying non-existent field
**Solution**: Verify field names first, use fallback
```javascript
try {
  await client.findRecords('LAYOUT', query)
} catch (error) {
  if (error.response?.data?.messages?.[0]?.code === '102') {
    // Field doesn't exist, try alternative
  }
}
```

### 4. Authentication vs Authorization
**Problem**: API credentials aren't user credentials
**Solution**: Understand the two-tier auth model
```javascript
// API credentials - for FileMaker API access
STUDIOHUB_USERNAME=api
STUDIOHUB_PASSWORD=API!23

// User credentials - from EMPLOYEE table
username: "jsmith"  // nameLogon field
password: "userpass" // fm_password field
```

### 5. Related Field Queries
**Problem**: Can't always query related fields directly
**Solution**: Fetch records and filter in memory
```javascript
// May not work
{"request_deliverables__ASSIGNEES__RequestDeliverableID__cre_del::StaffFullName": "John"}

// Alternative - get all and filter
const records = await client.getRecords('REQUEST_DELIVERABLES')
const filtered = records.filter(r => 
  r.fieldData['request_deliverables__ASSIGNEES__RequestDeliverableID__cre_del::StaffFullName'] === 'John'
)
```

## Performance Optimization

### Query Strategy
1. **Minimize API Calls**: Fetch once, filter in memory
2. **Use Proper Limits**: Default 100, max varies by server
3. **Cache Aggressively**: FileMaker is slow, cache when possible

### Batch Pattern for Related Data
```javascript
// Get deliverables
const deliverables = await getDeliverables()

// Extract unique project IDs
const projectIds = [...new Set(deliverables.map(d => d.projectId).filter(Boolean))]

// Batch fetch related data
const projects = await getProjectsByIds(projectIds)

// Create lookup map
const projectMap = Object.fromEntries(projects.map(p => [p.id, p]))
```

## Field Naming Patterns

### StudioHub Specific Fields
```
REQUEST_DELIVERABLES:
- __kptID (primary key)
- DeliverableName
- DueDate (format: MM/DD/YYYY)
- Status (internal status)
- DisplayStatus (calculated display status)
- ProjectName
- completeDate
- StudioRequestNumber
- _kftProjectID (foreign key)
- _kftStudioRequestID (foreign key)
- request_deliverables__ASSIGNEES__RequestDeliverableID__cre_del::StaffFullName
- request_deliverables__ASSIGNEES__RequestDeliverableID__cre_del::StaffDepartment

EMPLOYEE:
- nameLogon (username for login)
- fm_password (password - plain text!)
- zctFirstNameLastName (display name)
- bool_studioManager (text: "1" or "0")
- bool_studioDesigner (text: "1" or "0")
- department
- email
- active
```

## Testing and Debugging

### Essential Debug Logging
```javascript
console.log('Query to execute:', JSON.stringify(query))
console.log('User details:', user)
console.log('Found records:', records.length)
if (records.length > 0) {
  console.log('First record:', JSON.stringify(records[0].fieldData, null, 2))
}
```

### Connection Test Script
```javascript
async function testConnection() {
  const client = new FileMakerClient()
  try {
    const records = await client.getRecords('REQUEST_DELIVERABLES', 5)
    console.log('Success! Found', records.length, 'records')
    if (records.length > 0) {
      console.log('Fields:', Object.keys(records[0].fieldData))
    }
  } catch (error) {
    console.error('Connection failed:', error.message)
  }
}
```

### Finding Field Names
```javascript
// Helper to find assignee-related fields
const record = deliverables[0].fieldData
Object.keys(record).forEach(key => {
  if (key.toLowerCase().includes('assign') || 
      key.toLowerCase().includes('staff') || 
      key.toLowerCase().includes('designer')) {
    console.log(`Potential assignee field: ${key} = ${record[key]}`)
  }
})
```

## Security Best Practices

### API Credentials
- Use service account with minimal privileges
- Store in environment variables only
- Never commit to version control
- Rotate regularly

### User Data Access
- Always verify user permissions server-side
- Filter data based on user role
- Log access for audit trails
- Sanitize user input before queries

### Session Security
- Use httpOnly cookies
- Implement CSRF protection
- Close sessions on logout
- Monitor for suspicious activity

## Quick Reference - Query Examples

```javascript
// Get all deliverables
await client.getRecords('REQUEST_DELIVERABLES', 100)

// Get overdue items
await client.findRecords('REQUEST_DELIVERABLES', [
  {"DisplayStatus": "Overdue"}
])

// Get items for specific user
await client.findRecords('REQUEST_DELIVERABLES', [
  {"request_deliverables__ASSIGNEES__RequestDeliverableID__cre_del::StaffFullName": "John Smith"}
])

// Get items by multiple statuses
await client.findRecords('REQUEST_DELIVERABLES', [
  {"DisplayStatus": "In Progress"},
  {"DisplayStatus": "Overdue"},
  {"DisplayStatus": "At Risk"}
])

// Get items by department
await client.findRecords('REQUEST_DELIVERABLES', [
  {"request_deliverables__ASSIGNEES__RequestDeliverableID__cre_del::StaffDepartment": "Graphics"}
])

// Get items due today
const today = new Date().toLocaleDateString('en-US', {
  month: '2-digit',
  day: '2-digit', 
  year: 'numeric'
})
await client.findRecords('REQUEST_DELIVERABLES', [
  {"DueDate": today}
])
```

## Troubleshooting Checklist

When deliverables aren't showing:
1. ✓ Check server logs for actual query being sent
2. ✓ Verify field names are exactly correct (case sensitive)
3. ✓ Ensure you're using the right query method (findRecords vs getRecords)
4. ✓ Check if you're filtering by the correct field (Status vs DisplayStatus)
5. ✓ Verify user has valid session cookie
6. ✓ Look for authentication errors (token expired)
7. ✓ Test with getRecords() to see if ANY data returns
8. ✓ Check for field type mismatches
9. ✓ Verify the layout name is correct
10. ✓ Look for related field access issues