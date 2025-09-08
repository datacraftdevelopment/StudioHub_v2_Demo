# DELIVERABLE 2: Claude Code Implementation Prompt 🔧

## Implementation Status: READY FOR CLAUDE CODE

**Generated:** July 21, 2025  
**Confidence Level:** 95%+  
**Based On:** Complete discovery analysis with verified FileMaker field names and data structure

---

## Claude Code Implementation Prompt

Create a FileMaker client portal web application for StudioHub Dashboard. Start by creating a **project_plan.md** file that outlines the complete implementation strategy, then implement each phase systematically.

### Project Overview

Build a modern web dashboard that connects to two FileMaker databases:

1. **StudioHub Database** (Primary Data)
   - Main project management data
   - REQUEST_DELIVERABLES layout (30,106+ records)
   - User authentication via EMPLOYEE layout
   - Dashboard and calendar views

2. **TC-AI Database** (AI Features)  
   - Optional AI chat functionality
   - Dynamic chart generation
   - Contextual project assistance

### Core Functionality Requirements

#### 1. Dashboard Views
- **At Risk Items:** Overdue and due-today deliverables with visual alerts
- **Due Today/Week:** Time-sensitive deliverable tracking
- **My Deliverables:** User-specific task management
- **Calendar View:** Monthly planner with deliverable plotting
- **AI Integration:** Conditional chat features for permitted users

#### 2. User Management
- **Authentication:** Supabase web auth → FileMaker account verification
- **Role-Based Access:** Designer vs Manager permissions
- **Department Filtering:** Personal vs team deliverables
- **Session Management:** Persistent login state

#### 3. Data Integration
- **Real-Time Sync:** FileMaker Data API → Web dashboard
- **Performance:** Caching with 5-minute TTL for frequent queries
- **Error Handling:** Graceful degradation when FileMaker unavailable

### Technical Stack Requirements

```typescript
// Required Dependencies
{
  "framework": "Next.js 14+ with App Router",
  "styling": "Tailwind CSS with shadcn/ui components", 
  "auth": "Supabase Authentication",
  "state": "Zustand for client state management",
  "data": "TanStack Query for API caching",
  "ui": "React Hook Form + Zod validation",
  "deployment": "Vercel with environment variables"
}
```

### FileMaker API Integration

#### StudioHub Database Connection
```typescript
// Primary data source
const STUDIOHUB_CONFIG = {
  host: process.env.STUDIOHUB_HOST,
  database: "StudioHub", 
  layout: "REQUEST_DELIVERABLES",
  auth: {
    username: process.env.STUDIOHUB_USERNAME,
    password: process.env.STUDIOHUB_PASSWORD
  }
}
```

#### Critical Field Mappings
```typescript
interface Deliverable {
  id: string;              // __kptID
  title: string;           // DeliverableName
  dueDate: string;         // DueDate
  status: string;          // Status
  project: string;         // ProjectName  
  requestNumber: string;   // StudioRequestNumber
  assignedTo: string;      // request_deliverables__ASSIGNEES__...StaffFullName
  category: string;        // CategoryName
  notes: string;           // Notes
  completedDate: string;   // completeDate
  estimatedHours: string;  // EstimatedHours_Graphics
  actualHours: string;     // zci_Sum_ActualHours_Total
}
```

#### User Authentication Schema
```typescript
interface StudioUser {
  id: string;              // nameLogon (FileMaker account)
  displayName: string;     // zctFirstNameLastName
  email: string;           // email
  active: boolean;         // active flag
  roles: {
    designer: boolean;     // bool_studioDesigner
    manager: boolean;      // bool_studioManager
    coordinator: boolean;  // bool_coordinator
  };
  permissions: string;     // privSet
}
```

### Implementation Phases

#### Phase 1: Project Foundation
1. **Setup Next.js project** with TypeScript and required dependencies
2. **Configure Supabase** authentication with database schema
3. **Create FileMaker API client** with SSL handling for internal servers
4. **Setup environment variables** and deployment configuration
5. **Initialize project_plan.md** with progress tracking

#### Phase 2: Authentication System  
1. **Supabase Auth Setup** - Email/password login with session management
2. **FileMaker Verification** - Match web users to EMPLOYEE records
3. **Role Detection** - Parse bool_studioDesigner/Manager flags
4. **Protected Routes** - Middleware for authenticated access
5. **User Context** - Global state for current user permissions

#### Phase 3: Core Data Layer
1. **FileMaker API Client** - Robust connection handling with retry logic
2. **Data Models** - TypeScript interfaces for all FileMaker layouts
3. **API Routes** - Next.js API endpoints for data operations
4. **Error Handling** - Graceful failures with user feedback
5. **Caching Strategy** - TanStack Query with appropriate invalidation

#### Phase 4: Dashboard Components
1. **Layout System** - Responsive sidebar navigation matching FileMaker design
2. **Dashboard Cards** - At Risk, Due Today, This Week with real data
3. **Data Tables** - Sortable, filterable deliverables with status indicators
4. **Calendar View** - Monthly planner with deliverable plotting
5. **Status System** - Color-coded badges for deliverable states

#### Phase 5: AI Integration (Conditional)
1. **TC-AI Connection** - Secondary database for AI features
2. **Chat Interface** - AI assistant with project context
3. **Chart Generation** - Dynamic visualizations from deliverable data
4. **Permissions Check** - Show AI features only to authorized users
5. **Context Passing** - Include relevant project data in AI conversations

#### Phase 6: Performance & Polish
1. **Caching Optimization** - Efficient data fetching strategies
2. **Loading States** - Skeleton screens and progress indicators
3. **Error Boundaries** - Graceful error handling throughout app
4. **Mobile Responsiveness** - Touch-friendly interface for tablets/phones
5. **Accessibility** - WCAG AA compliance with proper ARIA labels

### API Endpoint Structure

```typescript
// Dashboard data endpoints
GET /api/deliverables/at-risk?userId={id}
GET /api/deliverables/due-today?userId={id}
GET /api/deliverables/due-week?userId={id}
GET /api/deliverables/month?start={date}&end={date}&userId={id}

// User management
POST /api/auth/verify-fm-user
GET /api/users/profile
PUT /api/users/preferences

// AI integration (conditional)
POST /api/ai/chat
GET /api/ai/charts?type={deliverables|projects}
```

### Data Processing Logic

#### At Risk Calculation
```typescript
const calculateRiskLevel = (deliverable: Deliverable) => {
  const dueDate = new Date(deliverable.dueDate);
  const today = new Date();
  const daysDiff = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  
  if (deliverable.status === "Complete") return "complete";
  if (daysDiff < 0) return "overdue";
  if (daysDiff === 0) return "due-today";  
  if (daysDiff <= 2) return "at-risk";
  return "on-track";
};
```

#### User Deliverable Filtering
```typescript
const filterUserDeliverables = (deliverables: Deliverable[], user: StudioUser, viewMode: "personal" | "department") => {
  if (viewMode === "personal") {
    return deliverables.filter(d => d.assignedTo === user.displayName);
  }
  // Department view for managers - implement based on department structure
  return deliverables; // Placeholder for department filtering logic
};
```

### Deployment Configuration

#### Vercel Environment Variables
```bash
# StudioHub FileMaker Connection
STUDIOHUB_HOST=your-filemaker-server.com
STUDIOHUB_DATABASE=StudioHub
STUDIOHUB_USERNAME=api-user
STUDIOHUB_PASSWORD=secure-password

# TC-AI FileMaker Connection (Optional)
TCAI_HOST=saurfmpro03.imp.corp.transcontinental.ca
TCAI_DATABASE=TC-AI
TCAI_USERNAME=api
TCAI_PASSWORD=API!23

# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-key

# Application Settings
NEXTAUTH_URL=https://your-app.vercel.app
NEXTAUTH_SECRET=your-secret-key
```

### Development Workflow

1. **Initial Setup**
   - Clone/create Next.js project
   - Install dependencies and configure tooling
   - Setup environment variables for development
   - Test FileMaker API connections

2. **Iterative Development**
   - Implement Phase 1 → Test → Document in project_plan.md
   - Continue with each phase systematically
   - Update project_plan.md with progress and discoveries
   - Handle edge cases and error scenarios

3. **Testing Strategy**
   - Unit tests for data processing functions
   - Integration tests for FileMaker API calls
   - Manual testing with real FileMaker data
   - Cross-browser compatibility testing

4. **Deployment**
   - Deploy to Vercel with production environment variables
   - Test all FileMaker connections in production
   - Verify Supabase authentication flow
   - Monitor performance and error rates

### Success Criteria

✅ **Functional Requirements:**
- Dashboard loads user-specific deliverables from FileMaker
- Calendar view displays deliverables by due date
- Authentication integrates Supabase → FileMaker verification
- AI features (if implemented) provide contextual assistance
- Mobile-responsive design works across devices

✅ **Performance Requirements:**
- Page load time < 3 seconds
- Data refresh time < 1 second with caching
- Handles 30,000+ deliverable records efficiently
- Graceful degradation when FileMaker unavailable

✅ **User Experience:**
- Intuitive navigation matching FileMaker patterns
- Clear visual indicators for at-risk deliverables
- Seamless switching between personal/department views
- Professional appearance suitable for business use

### Key Implementation Notes

1. **Start with project_plan.md** - Keep this file updated throughout development as your progress log
2. **FileMaker SSL Handling** - Use `rejectUnauthorized: false` for internal servers with self-signed certificates
3. **Error Resilience** - Always handle FileMaker connection failures gracefully
4. **Performance First** - Implement caching early to handle large deliverable datasets
5. **User-Centric Design** - Focus on the daily workflow of designers and managers

**Create the project_plan.md file first, then systematically implement each phase while keeping the plan updated with your progress and any discoveries.**