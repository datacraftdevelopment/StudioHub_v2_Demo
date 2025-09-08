# DELIVERABLE 3: Environment Variables Checklist 🔐

## Configuration Status: READY FOR DEPLOYMENT

**Generated:** July 21, 2025  
**Confidence Level:** 95%+  
**Based On:** Verified FileMaker connection details and authentication requirements

---

## Environment Variables Setup Guide

### Development Environment (.env.local)

Create this file in your project root and add these variables:

```bash
# ===========================================
# FILEMAKER CONNECTIONS
# ===========================================

# StudioHub Database (Primary Data Source)
STUDIOHUB_HOST=your-filemaker-server.com
STUDIOHUB_DATABASE=StudioHub
STUDIOHUB_USERNAME=your-api-username
STUDIOHUB_PASSWORD=your-secure-password
STUDIOHUB_SSL_VERIFY=false

# TC-AI Database (AI Features - Optional)
TCAI_HOST=saurfmpro03.imp.corp.transcontinental.ca
TCAI_DATABASE=TC-AI
TCAI_USERNAME=api
TCAI_PASSWORD=API!23
TCAI_SSL_VERIFY=false

# ===========================================
# SUPABASE AUTHENTICATION
# ===========================================

# Public Configuration (safe for client-side)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Private Configuration (server-side only)
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
SUPABASE_JWT_SECRET=your-jwt-secret

# ===========================================
# APPLICATION CONFIGURATION
# ===========================================

# Authentication
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-local-secret-key

# Environment
NODE_ENV=development
NEXT_PUBLIC_APP_NAME=StudioHub Dashboard
NEXT_PUBLIC_APP_VERSION=1.0.0

# ===========================================
# API CONFIGURATION
# ===========================================

# Rate Limiting
API_RATE_LIMIT_REQUESTS=100
API_RATE_LIMIT_WINDOW=900000

# Caching
CACHE_TTL_MINUTES=5
REDIS_URL=redis://localhost:6379

# ===========================================
# DEVELOPMENT TOOLS
# ===========================================

# Debugging
DEBUG_FILEMAKER_CALLS=true
LOG_LEVEL=debug
VERBOSE_LOGGING=true
```

---

## Production Environment (Vercel)

### Required Environment Variables

#### 🔗 FileMaker Database Connections

| Variable | Description | Example | Required |
|----------|-------------|---------|----------|
| `STUDIOHUB_HOST` | StudioHub FileMaker server URL | `fm.yourcompany.com` | ✅ YES |
| `STUDIOHUB_DATABASE` | Database name | `StudioHub` | ✅ YES |
| `STUDIOHUB_USERNAME` | API user account | `web_api_user` | ✅ YES |
| `STUDIOHUB_PASSWORD` | API user password | `SecurePass123!` | ✅ YES |
| `TCAI_HOST` | TC-AI server (if using AI features) | `saurfmpro03.imp.corp...` | ⚠️ OPTIONAL |
| `TCAI_DATABASE` | AI database name | `TC-AI` | ⚠️ OPTIONAL |
| `TCAI_USERNAME` | AI API username | `api` | ⚠️ OPTIONAL |
| `TCAI_PASSWORD` | AI API password | `API!23` | ⚠️ OPTIONAL |

#### 🔐 Authentication & Security

| Variable | Description | Example | Required |
|----------|-------------|---------|----------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL | `https://xyz.supabase.co` | ✅ YES |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Public API key | `eyJhbGciOiJIUzI1NiI...` | ✅ YES |
| `SUPABASE_SERVICE_ROLE_KEY` | Server-side key | `eyJhbGciOiJIUzI1NiI...` | ✅ YES |
| `NEXTAUTH_URL` | Production app URL | `https://studiohub.vercel.app` | ✅ YES |
| `NEXTAUTH_SECRET` | JWT signing secret | `crypto.randomBytes(32)` | ✅ YES |

#### ⚙️ Application Settings

| Variable | Description | Example | Required |
|----------|-------------|---------|----------|
| `NODE_ENV` | Environment mode | `production` | ✅ YES |
| `NEXT_PUBLIC_APP_NAME` | Application name | `StudioHub Dashboard` | ⚠️ OPTIONAL |
| `API_RATE_LIMIT_REQUESTS` | Rate limit threshold | `100` | ⚠️ OPTIONAL |
| `CACHE_TTL_MINUTES` | Cache expiration | `5` | ⚠️ OPTIONAL |

---

## Setup Instructions

### 1. Development Setup

```bash
# Clone the project
git clone your-repository
cd studiohub-dashboard

# Copy environment template
cp .env.example .env.local

# Edit with your values
nano .env.local

# Install dependencies
npm install

# Test FileMaker connections
npm run test:connections

# Start development server
npm run dev
```

### 2. Supabase Configuration

#### A. Create Supabase Project
1. Go to [supabase.com](https://supabase.com)
2. Create new project: "StudioHub Dashboard"
3. Note the Project URL and API keys

#### B. Setup Authentication
```sql
-- Enable email authentication
-- Configure in Supabase Dashboard > Authentication > Settings

-- Optional: Custom user metadata table
CREATE TABLE user_profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  filemaker_account TEXT,
  display_name TEXT,
  department TEXT,
  role TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### C. Row Level Security (RLS)
```sql
-- Enable RLS on user_profiles
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only see their own profile
CREATE POLICY "Users can view own profile" 
ON user_profiles FOR SELECT 
USING (auth.uid() = id);
```

### 3. FileMaker API User Setup

#### StudioHub Database Requirements:
```
Account Name: web_api_user (or your chosen name)
Password: Strong password with symbols
Privilege Set: [Data Entry Only] with access to:
  - REQUEST_DELIVERABLES (Find, View records)
  - PROJECTS (Find, View records)
  - EMPLOYEE (Find, View records)
  - STUDIO_REQUESTS (Find, View records)

Extended Privileges:
  ✅ fmrest (FileMaker Data API)
  ✅ Access via FileMaker Network
```

#### TC-AI Database (Optional):
```
Account Name: api
Password: API!23
Privilege Set: [Full Access] or custom with:
  - GLOBAL (Find, View, Edit)
  - SESSION (Create, Edit, Delete, View)

Extended Privileges:
  ✅ fmrest (FileMaker Data API)
```

### 4. Vercel Deployment Setup

#### A. Connect Repository
1. Import project to Vercel
2. Configure build settings:
   - Framework: Next.js
   - Build Command: `npm run build`
   - Output Directory: `.next`

#### B. Environment Variables
```bash
# Add each variable individually in Vercel Dashboard
# Settings > Environment Variables

# Example:
STUDIOHUB_HOST=fm.yourcompany.com
STUDIOHUB_DATABASE=StudioHub
# ... (add all required variables)
```

#### C. Domain Configuration
```bash
# Custom domain (optional)
studiohub.yourcompany.com

# SSL Certificate: Automatic via Vercel
# DNS: Point CNAME to alias.vercel.app
```

---

## Security Checklist

### 🔒 FileMaker Security

- [ ] **API User Account:** Dedicated account with minimal privileges
- [ ] **Strong Password:** Complex password with rotation policy
- [ ] **Network Access:** FileMaker server accessible to Vercel IPs
- [ ] **SSL Certificate:** Valid certificate or configured bypass for internal servers
- [ ] **Privilege Set:** Restricted to only necessary tables and operations

### 🔐 Web Application Security

- [ ] **NEXTAUTH_SECRET:** Cryptographically secure random string
- [ ] **HTTPS Only:** Force HTTPS in production (handled by Vercel)
- [ ] **API Rate Limiting:** Prevent abuse with request limits
- [ ] **Input Validation:** Sanitize all user inputs
- [ ] **Error Handling:** Don't expose sensitive information in errors

### 🛡️ Supabase Security

- [ ] **RLS Policies:** Row Level Security enabled on all tables
- [ ] **API Keys:** Service role key kept secure, anon key properly scoped
- [ ] **Authentication:** Email verification enabled
- [ ] **Password Policy:** Strong password requirements
- [ ] **Session Management:** Appropriate session timeout

---

## Testing & Validation

### Connection Tests

```bash
# Test FileMaker connections
curl -X POST https://your-fm-server/fmi/data/vLatest/databases/StudioHub/sessions \
  -H "Content-Type: application/json" \
  -d '{"fmDataSource":[{"database":"StudioHub","username":"api_user","password":"password"}]}'

# Test Supabase connection
curl -X GET https://your-project.supabase.co/rest/v1/user_profiles \
  -H "apikey: your-anon-key"

# Test application endpoints
curl https://your-app.vercel.app/api/health
```

### Deployment Validation

- [ ] **Application loads** without environment variable errors
- [ ] **FileMaker data** displays correctly in dashboard
- [ ] **Authentication flow** works end-to-end
- [ ] **AI features** load conditionally (if implemented)
- [ ] **Mobile responsiveness** works on various devices
- [ ] **Error handling** displays user-friendly messages

---

## Troubleshooting Common Issues

### FileMaker Connection Problems

```
Error: "SSL certificate verify failed"
Solution: Set STUDIOHUB_SSL_VERIFY=false for internal servers

Error: "Invalid credentials"
Solution: Verify API user account and privilege set in FileMaker

Error: "Network timeout"
Solution: Check firewall settings and server accessibility
```

### Supabase Authentication Issues

```
Error: "Invalid API key"
Solution: Verify NEXT_PUBLIC_SUPABASE_ANON_KEY is correct

Error: "RLS policy violation"
Solution: Check Row Level Security policies and user permissions

Error: "Session expired"
Solution: Implement proper session refresh logic
```

### Deployment Issues

```
Error: "Build failed"
Solution: Ensure all required environment variables are set

Error: "Function timeout"
Solution: Optimize API calls and implement caching

Error: "Memory limit exceeded"
Solution: Implement pagination for large datasets
```

---

## Environment Variable Priority

1. **Critical for Launch:**
   - FileMaker connection credentials
   - Supabase authentication keys
   - NEXTAUTH_SECRET and URL

2. **Important for Production:**
   - Rate limiting configuration
   - Caching settings
   - SSL verification settings

3. **Optional Enhancements:**
   - Debug logging flags
   - AI feature toggles
   - Analytics tracking

---

**🚀 With all environment variables properly configured, your StudioHub Dashboard will be ready for production deployment with secure connections to both FileMaker databases and robust user authentication.**