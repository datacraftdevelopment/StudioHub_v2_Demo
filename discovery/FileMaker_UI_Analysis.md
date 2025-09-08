# FileMaker UI Analysis - Design Reference for Web Dashboard

## Color Scheme & Branding ✅ IDENTIFIED

### Primary Color Themes:
- **Blue (#1f5f8b, #2563eb)** - Projects and project-related sections
- **Purple/Magenta (#b91c5c, #991b1b)** - Studio Requests and request-related sections  
- **Dark Gray (#374151, #4b5563)** - Navigation sidebar
- **Light Gray (#f9fafb, #e5e7eb)** - Content backgrounds
- **White (#ffffff)** - Card backgrounds and primary content areas

### Status Indicators:
- **Green dots** - Active/In Progress status
- **Blue dots** - Information/Secondary status
- **Color-coded badges** - Various status states

---

## Layout Patterns Observed

### 1. Navigation Structure:
- **Left Sidebar:** Dark gray with collapsible sections
- **User Profile:** Top of sidebar (Eunice Chan, Jul 21)
- **Navigation Sections:** Home, Projects, Actual Time, Assignments
- **Contextual Menus:** Information, Reference, Scope of Work, Studio Requests, etc.

### 2. Content Layout:
- **Header Bar:** Title + user info + search functionality
- **Tab Navigation:** Status-based tabs (Pending, Submitted, In Progress, Complete)
- **Filter Controls:** Designer dropdowns, status selectors, sort options
- **Data Tables:** Clean rows with status indicators, due dates, assignee info
- **Detail Panels:** Right-side document sections with thumbnails

### 3. Table Design Patterns:
- **Request Numbers:** Format like "H10053-01", "5832-H10231-01"
- **Status Columns:** Text + colored dot indicators
- **Due Dates:** Clear date formatting (Tue, Jun 10 / Thu, Jul 17)
- **Assignee Info:** Names with role context
- **Action Columns:** EST, ACTL, VAR for time tracking

---

## Web Dashboard Design Adaptation

### Navigation Structure (Adapted):
```
├── 🏠 Dashboard (Home equivalent)
├── 📊 Projects (Blue theme)
├── 🎨 Studio Requests (Purple theme)  
├── ⏰ My Deliverables
├── 📅 Calendar View
└── 🤖 AI Assistant (if hasAIAccess)
```

### Color Mapping for Web:
```css
/* Projects Theme (Blue) */
--project-primary: #1f5f8b;
--project-secondary: #3b82f6;
--project-light: #dbeafe;

/* Studio Requests Theme (Purple) */
--request-primary: #b91c5c;
--request-secondary: #e11d48;
--request-light: #fce7f3;

/* Neutral Theme */
--sidebar-dark: #374151;
--content-bg: #f9fafb;
--card-bg: #ffffff;
--border-color: #e5e7eb;
```

### Dashboard Cards Design:
```
┌─────────────────────────────────────┐
│ 🔥 At Risk Items (Red accent)       │
│ • Overdue deliverables             │
│ • Due today items                  │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│ 📅 Due This Week (Blue theme)      │
│ • Upcoming deliverables            │
│ • Key milestones                   │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│ 🎨 Active Studio Requests (Purple) │
│ • In progress requests             │
│ • Recent updates                   │
└─────────────────────────────────────┘
```

### Monthly Calendar Design:
```
┌─────────────────────────────────────┐
│ July 2025                    < >    │
├─────────────────────────────────────┤
│ Mon  Tue  Wed  Thu  Fri  Sat  Sun  │
│  1    2    3    4    5    6    7   │
│      🔵   🟣              🔵        │
│  8    9   10   11   12   13   14   │
│ 🟣        🔵   🟣         🔵        │
└─────────────────────────────────────┘
```

---

## UI Component Specifications

### Status Badge System:
```jsx
// Status indicators matching FileMaker patterns
<StatusBadge status="Complete" color="green" />
<StatusBadge status="In Progress" color="blue" />
<StatusBadge status="Pending" color="yellow" />
<StatusBadge status="Overdue" color="red" />
```

### Table Row Design:
```jsx
// Matching FileMaker table structure
<TableRow>
  <RequestNumber>H10053-01</RequestNumber>
  <ProjectName>Becker's / Daisy Mart 2021 Signage</ProjectName>
  <DeliverableName>Concept Flat Art</DeliverableName>
  <DueDate>Tue, Jun 10</DueDate>
  <AssignedTo>Kim Tebby</AssignedTo>
  <StatusBadge>Complete</StatusBadge>
</TableRow>
```

### Sidebar Navigation:
```jsx
// Dark sidebar matching FileMaker style
<Sidebar className="bg-gray-700">
  <UserProfile>
    <Avatar>JD</Avatar>
    <Name>Joe DaSilva</Name>
    <Date>Jul 21</Date>
  </UserProfile>
  
  <NavSection>
    <NavItem icon="🏠" active>Dashboard</NavItem>
    <NavItem icon="📊" theme="blue">Projects</NavItem>
    <NavItem icon="🎨" theme="purple">Studio Requests</NavItem>
    <NavItem icon="⏰">My Deliverables</NavItem>
  </NavSection>
</Sidebar>
```

---

## Key Design Principles

### 1. **Consistent Color Psychology:**
- Blue = Projects (organizational, strategic)
- Purple = Studio Requests (creative, execution)
- Red = Alerts/Risk (attention required)
- Green = Success/Complete (positive status)

### 2. **Information Hierarchy:**
- Request numbers as primary identifiers
- Project names for context
- Due dates prominently displayed
- Status always visible with color coding

### 3. **Responsive Adaptation:**
- Sidebar collapses on mobile
- Tables become card-based layouts
- Touch-friendly buttons and spacing
- Maintain color themes across breakpoints

### 4. **Professional Aesthetic:**
- Clean, minimal design
- Plenty of white space
- Subtle shadows and borders
- Professional typography choices

---

## Implementation Notes

### Tailwind CSS Classes:
```css
/* Blue (Projects) Theme */
.theme-projects {
  @apply bg-blue-600 text-white;
}

/* Purple (Studio Requests) Theme */
.theme-requests {
  @apply bg-pink-600 text-white;
}

/* Sidebar */
.sidebar {
  @apply bg-gray-700 text-gray-100;
}

/* Status Indicators */
.status-complete { @apply text-green-600 bg-green-100; }
.status-progress { @apply text-blue-600 bg-blue-100; }
.status-pending { @apply text-yellow-600 bg-yellow-100; }
.status-overdue { @apply text-red-600 bg-red-100; }
```

**This visual analysis provides the perfect foundation for creating a web dashboard that feels familiar to FileMaker users while providing a modern, responsive web experience.**
