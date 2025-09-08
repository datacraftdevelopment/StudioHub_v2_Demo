# 🚀 StudioHub Dashboard - Super Easy Deployment

**For the person installing this:** This is the simplest possible Docker setup. Everything is already configured!

## 🎯 One-Click Deployment

### Windows Users:
1. Double-click `deploy.bat`
2. Wait for it to finish
3. Open http://localhost:3000 in your browser

### Mac/Linux Users:
1. Double-click `deploy.sh` or run `./deploy.sh` in terminal
2. Wait for it to finish  
3. Open http://localhost:3000 in your browser

## 🛑 To Stop the Application:
- **Windows:** Double-click `stop.bat`
- **Mac/Linux:** Double-click `stop.sh` or run `./stop.sh`

## 📋 To View Logs (if something breaks):
- **Windows:** Double-click `logs.bat`
- **Mac/Linux:** Double-click `logs.sh` or run `./logs.sh`

## ✅ What You Need:
- Docker Desktop installed and running
- That's it!

## 🌐 After Deployment:
- **StudioHub Dashboard:** http://localhost:3000
- **API Server:** http://localhost:3001 (you don't need to access this directly)

## 🔧 Configuration:
Everything is pre-configured for your network:
- **FileMaker Server:** saurfmpro03.imp.corp.transcontinental.ca
- **Database:** StudioHub  
- **All credentials are built-in**

## ❌ If Something Goes Wrong:
1. Make sure Docker Desktop is running
2. Check if ports 3000 or 3001 are already being used by another application
3. Run the logs script to see what's happening
4. Contact the developer

---

**That's literally it!** No configuration files, no environment variables, no complicated setup. Just run one script and you're done! 🎉
