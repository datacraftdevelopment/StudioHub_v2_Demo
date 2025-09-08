# StudioHub Dashboard Setup Guide

## Prerequisites

- **Node.js** (v18 or higher)
- **npm** or **yarn** package manager
- **FileMaker Server** access with Data API enabled
- **Claude Desktop** (for MCP server integration)
- **Docker** (optional, for containerized deployment)

## Installation

### 1. Clone the Repository

```bash
git clone https://github.com/[username]/studiohub-dashboard.git
cd studiohub-dashboard
```

### 2. Install Dependencies

```bash
npm install
# or
yarn install
```

### 3. Environment Configuration

Copy the example environment file:

```bash
cp .env.local.example .env.local
```

Edit `.env.local` with your FileMaker server details:

```env
# FileMaker TC-AI Database
TCAI_SERVER=saurfmpro03.imp.corp.transcontinental.ca
TCAI_DATABASE=TC-AI
TCAI_USERNAME=api
TCAI_PASSWORD=API!23

# FileMaker StudioHub Database (TBD)
STUDIOHUB_SERVER=
STUDIOHUB_DATABASE=
STUDIOHUB_USERNAME=
STUDIOHUB_PASSWORD=

# Next.js Configuration
NEXTAUTH_SECRET=your-secret-here
NEXTAUTH_URL=http://localhost:3000
```

### 4. MCP Server Setup

The project includes MCP (Model Context Protocol) server configuration for FileMaker integration:

1. **Install MCP Server**:
   Follow the setup guide in `mcp-config/MCP_Setup_Guide.md`

2. **Configure Claude Desktop**:
   Add the configuration from `mcp-config/claude_desktop_config_addition.json` to your Claude Desktop settings

3. **Verify Connection**:
   Use the instructions in `mcp-config/ADDING_NEW_DATABASES.md` to test database connectivity

## Development

### Start the Development Server

```bash
npm run dev
# or
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) to view the dashboard.

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## Docker Deployment (Optional)

### Using Docker Compose

```bash
docker-compose up -d
```

### Using Dockerfile

```bash
docker build -t studiohub-dashboard .
docker run -p 3000:3000 --env-file .env.local studiohub-dashboard
```

## Project Structure

```
StudioHub-Dashboard/
├── app/                    # Next.js 14 App Router
│   ├── api/               # API routes
│   ├── dashboard/         # Dashboard pages
│   ├── calendar/          # Calendar views
│   └── login/             # Authentication
├── components/            # Reusable React components
├── lib/                   # Utility functions and configurations
├── mcp-config/           # MCP server configuration files
├── public/               # Static assets
└── types/                # TypeScript type definitions
```

## Features

### Current Implementation
- ✅ Next.js 14 with App Router
- ✅ TypeScript configuration
- ✅ Tailwind CSS styling
- ✅ MCP server setup for FileMaker integration
- ✅ Environment configuration

### Planned Features
- 🔄 Dashboard with project overview
- 🔄 Monthly calendar planner
- 🔄 AI chat integration (TC-AI database)
- 🔄 Dynamic charts and graphs
- 🔄 User authentication
- 🔄 Responsive design

## Database Integration

### TC-AI Database (AI Features)
- **Purpose**: AI chat area, dynamic visualizations
- **Layouts**: GLOBAL, SESSION
- **Status**: ✅ Connection configured

### StudioHub Database (Main Data)
- **Purpose**: Projects, studio requests, deliverables
- **Structure**: Projects → Studio Requests → Deliverables
- **Status**: ⏳ Connection details pending

## Troubleshooting

### Common Issues

1. **MCP Server Connection Failed**
   - Verify FileMaker server is accessible
   - Check credentials in environment file
   - Ensure Data API is enabled on FileMaker server

2. **Build Errors**
   - Clear Next.js cache: `rm -rf .next`
   - Delete node_modules and reinstall: `rm -rf node_modules && npm install`

3. **Environment Variables Not Loading**
   - Ensure `.env.local` exists and is properly formatted
   - Restart development server after changes

### Getting Help

1. Check the MCP setup guide in `mcp-config/`
2. Review the main README.md for project overview
3. Contact the development team for database access issues

---

## Development Status: Discovery Phase

This project is currently in the discovery phase. Key next steps:

- [ ] Complete StudioHub database connection setup
- [ ] Finalize UI requirements with stakeholders  
- [ ] Implement core dashboard functionality
- [ ] Deploy to production environment

*Last updated: January 2025*
