# User Permission Model - Complete Specification

## User Types & Access Control ✅ DEFINED

### Two Primary User Types:

#### 1. **Designers** (`privSet = "fm_acsDesigner"`)
**Access Level:** Restricted to personal + department data
- **Default View:** Only their own assigned deliverables
- **Department View:** Can switch to see all deliverables in their department  
- **Department Assignment:** Single department from `department` field
- **Filtering Logic:** 
  ```sql
  -- Personal View
  WHERE AssignedStaffAccountName = current_user
  
  -- Department View  
  WHERE Department = user.department
  ```

#### 2. **Managers** (`privSet = "fm_acsStudio"`)
**Access Level:** Multi-department access with filtering
- **Default View:** Deliverables from their default departments
- **Department Selection:** Can switch between any departments they manage
- **Department List:** From `departmentManager` field (multi-value)
- **Filtering Logic:**
  ```sql
  -- Default departments
  WHERE Department IN (user.departmentManager_list)
  
  -- Selected department
  WHERE Department = selected_department
  ```

---

## Access Control Matrix

| User Type | Privilege Set | Department Access | View Options |
|-----------|---------------|-------------------|--------------|
| **Designer** | `fm_acsDesigner` | Single (assigned) | Personal, Department |
| **Manager** | `fm_acsStudio` | Multiple (managed) | Department(s), All |

---

## System Access Requirements

### Entry Criteria:
```javascript
// User must meet ALL criteria to access dashboard
const canAccess = (
  user.active === 1 &&
  (user.privSet === "fm_acsDesigner" || user.privSet === "fm_acsStudio")
);
```

### Permission Loading:
```javascript
// Load user permissions and department access
async function loadUserPermissions(userId) {
  const user = await getEmployee(userId);
  
  if (user.privSet === "fm_acsDesigner") {
    return {
      userType: "designer",
      department: user.department,
      canAccessDepartments: [user.department],
      defaultView: "personal"
    };
  }
  
  if (user.privSet === "fm_acsStudio") {
    return {
      userType: "manager", 
      departments: parseDepartmentList(user.departmentManager),
      canAccessDepartments: parseDepartmentList(user.departmentManager),
      defaultView: "department"
    };
  }
}
```

---

## UI Components & Filtering

### 1. **Navigation Header - View Switcher**

#### For Designers:
```jsx
<ViewSwitcher>
  <ViewOption active={view === "personal"}>
    👤 My Deliverables
  </ViewOption>
  <ViewOption active={view === "department"}>
    🏢 {user.department} Department
  </ViewOption>
</ViewSwitcher>
```

#### For Managers:
```jsx
<DepartmentSelector>
  <Dropdown value={selectedDepartment}>
    {user.managedDepartments.map(dept => (
      <Option key={dept} value={dept}>
        🏢 {dept} Department
      </Option>
    ))}
    <Option value="all">📊 All Departments</Option>
  </Dropdown>
</DepartmentSelector>
```

### 2. **Dashboard Cards - Filtered Data**

#### Designer Dashboard:
```jsx
// Personal View
<DashboardCard title="My Overdue Items">
  {deliverables.filter(d => 
    d.assignedTo === user.id && 
    d.dueDate < today && 
    d.status !== "Complete"
  )}
</DashboardCard>

// Department View  
<DashboardCard title="Department At Risk">
  {deliverables.filter(d => 
    d.department === user.department &&
    isAtRisk(d)
  )}
</DashboardCard>
```

#### Manager Dashboard:
```jsx
// Department-filtered view
<DashboardCard title="Department Overview">
  {deliverables.filter(d => 
    selectedDepartments.includes(d.department)
  )}
</DashboardCard>
```

---

## Data Access Patterns

### API Endpoint Security:
```javascript
// All API calls must include user context and filtering
app.get('/api/deliverables', async (req, res) => {
  const user = await getAuthenticatedUser(req);
  const { view, department } = req.query;
  
  let filter = {};
  
  if (user.userType === "designer") {
    if (view === "personal") {
      filter.assignedTo = user.id;
    } else {
      filter.department = user.department;
    }
  } else if (user.userType === "manager") {
    if (department === "all") {
      filter.department = { $in: user.managedDepartments };
    } else {
      filter.department = department;
    }
  }
  
  const deliverables = await getDeliverables(filter);
  res.json(deliverables);
});
```

### FileMaker Query Patterns:
```sql
-- Designer Personal View
SELECT * FROM REQUEST_DELIVERABLES 
WHERE request_deliverables__ASSIGNEES...StaffAccountName = ?

-- Designer Department View  
SELECT * FROM REQUEST_DELIVERABLES 
WHERE Department = ?

-- Manager Department View
SELECT * FROM REQUEST_DELIVERABLES 
WHERE Department IN (?, ?, ?)
```

---

## Department Management

### Department List Configuration:
```javascript
// Parse department manager field (multi-value)
function parseDepartmentList(departmentManager) {
  // Handle different formats:
  // "Environmental\nGraphics\nIndustrial\nStructural"
  // or comma-separated values
  return departmentManager
    .split(/[\n,]/)
    .map(dept => dept.trim())
    .filter(dept => dept.length > 0);
}

// Available departments (from sample data)
const DEPARTMENTS = [
  "Environmental",
  "Graphics", 
  "Industrial",
  "Structural"
];
```

### Department Switching Logic:
```javascript
// User changes department view
async function switchDepartment(newDepartment) {
  // Validate user has access
  if (!user.canAccessDepartments.includes(newDepartment)) {
    throw new Error("Access denied to department");
  }
  
  // Update current filter
  setSelectedDepartment(newDepartment);
  
  // Refresh dashboard data
  await refreshDashboardData({
    department: newDepartment,
    userType: user.userType
  });
}
```

---

## AI Integration with Permissions

### AI Chat Context:
```javascript
// AI responses filtered by user access level
async function createAISession(userId, chatType) {
  const user = await getUserPermissions(userId);
  
  const contextFilter = user.userType === "designer" 
    ? { assignedTo: userId, department: user.department }
    : { departments: user.managedDepartments };
    
  return {
    userID: userId,
    chatType: chatType,
    accessContext: contextFilter, // Used to filter AI data responses
    aiProvider: "OpenAI",
    sessionStatus: "active"
  };
}
```

---

## Updated Authentication Flow

### Complete Login Process:
```javascript
async function authenticateUser(credentials) {
  // 1. Verify FM credentials
  const fmAuth = await verifyFileMakerCredentials(credentials);
  
  // 2. Get employee record
  const employee = await getEmployeeByLogon(credentials.username);
  
  // 3. Check access requirements
  if (!employee.active || 
      !["fm_acsDesigner", "fm_acsStudio"].includes(employee.privSet)) {
    throw new Error("Access denied");
  }
  
  // 4. Build user context
  const userContext = {
    id: employee.nameLogon,
    name: employee.zctFirstNameLastName,
    email: employee.email,
    userType: employee.privSet === "fm_acsDesigner" ? "designer" : "manager",
    department: employee.department,
    managedDepartments: employee.privSet === "fm_acsStudio" 
      ? parseDepartmentList(employee.departmentManager) 
      : [employee.department],
    hasAIAccess: employee.AI_Access === 1,
    defaultView: employee.privSet === "fm_acsDesigner" ? "personal" : "department"
  };
  
  return userContext;
}
```

---

## UI State Management

### User Context Provider:
```javascript
const UserContext = {
  // User info
  id: "joe.dasilva",
  name: "Joe DaSilva",
  userType: "manager", // "designer" | "manager"
  
  // Department access
  department: "Environmental",
  managedDepartments: ["Environmental", "Graphics", "Industrial"],
  selectedDepartment: "Environmental",
  
  // View state
  currentView: "department", // "personal" | "department" 
  
  // Permissions
  hasAIAccess: true,
  canSwitchDepartments: true
};
```

---

## Testing Scenarios

### Designer User Test:
```javascript
// Test user: Designer in Environmental dept
{
  nameLogon: "kim.designer",
  privSet: "fm_acsDesigner", 
  department: "Environmental",
  active: 1,
  AI_Access: 0
}

// Expected access:
// - Personal view: Only Kim's deliverables
// - Department view: All Environmental deliverables  
// - No AI features
```

### Manager User Test:
```javascript
// Test user: Manager of multiple departments
{
  nameLogon: "joe.manager",
  privSet: "fm_acsStudio",
  department: "Environmental", 
  departmentManager: "Environmental\nGraphics\nIndustrial",
  active: 1,
  AI_Access: 1
}

// Expected access:
// - Department selector with 3 options + "All"
// - Full AI features
// - Can switch between managed departments
```

**✅ COMPLETE PERMISSION MODEL DOCUMENTED**

**This provides the exact access control logic needed for secure, role-based dashboard functionality matching FileMaker's user management patterns.**
