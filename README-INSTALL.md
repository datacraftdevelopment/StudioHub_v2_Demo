# StudioHub Dashboard - Easy Installation Package

## What's included:
- `studiohub-dashboard.tar` - The Docker image file (790MB)
- `install.sh` - Linux/Mac installation script
- `install.bat` - Windows installation script
- `README-INSTALL.md` - This file

## Prerequisites:
1. **Install Docker Desktop** first:
   - Download from: https://www.docker.com/products/docker-desktop/
   - Install and make sure it's running

## Installation (Super Simple):

### On Linux/Mac:
1. Make the script executable: `chmod +x install.sh`
2. Run: `./install.sh`

### On Windows:
1. Double-click `install.bat`

### Manual Installation (if scripts don't work):
```bash
# Load the image
docker load < studiohub-dashboard.tar

# Run the container
docker run -d -p 3001:3000 --name studiohub --restart unless-stopped joedatacraft/studiohub-dashboard
```

## Access Your Dashboard:
- **Local:** http://localhost:3001
- **Network:** http://YOUR-SERVER-IP:3001

## Management Commands:
```bash
docker stop studiohub     # Stop the dashboard
docker start studiohub    # Start the dashboard
docker restart studiohub  # Restart the dashboard
docker logs studiohub     # View logs
```

## Troubleshooting:
- Make sure Docker Desktop is installed and running
- Check if port 3001 is already in use
- View logs with `docker logs studiohub`

## File Size:
The Docker image is approximately 790MB - this is normal for a Node.js application with all dependencies included.

---
*No configuration needed - just install Docker and run the script!*
