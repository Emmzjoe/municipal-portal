# 🚀 QUICK START GUIDE

## You're in the wrong directory!

You're currently in: `/Users/emmz/Downloads/E-Hail App`
You need to be in: `/Users/emmz/Downloads/okahandja-municipal-app`

## Copy and paste these commands into your terminal:

### Step 1: Stop the current server
Press `Ctrl+C` in your terminal to stop the E-Hail server

### Step 2: Navigate to the correct directory
```bash
cd "/Users/emmz/Downloads/okahandja-municipal-app"
```

### Step 3: Check if Node.js is installed
```bash
node --version
```

**If you see a version number:** Great! Continue to Step 4.
**If you see "command not found":** You need to install Node.js first:
1. Visit https://nodejs.org/
2. Download and install the LTS version
3. Restart your terminal
4. Try `node --version` again

### Step 4: Start the Backend API
```bash
cd backend
npm install
cp .env.example .env
npm run dev
```

You should see:
```
🏛️  Okahandja Municipality API Server
🚀 Server running on http://localhost:3000
```

### Step 5: Start the Frontend (in a NEW terminal window)

**Open a new terminal window** (keep the backend running), then:

```bash
cd "/Users/emmz/Downloads/okahandja-municipal-app"
python3 -m http.server 8080
```

You should see:
```
Serving HTTP on :: port 8080 (http://[::]:8080/) ...
```

### Step 6: Open the App

Open your browser and go to: **http://localhost:8080**

Login with:
- **Account Number:** 12345678
- **Password:** password123

---

## 🎯 Simple Option (Frontend Only)

If you want to skip the backend for now and just see the UI:

```bash
cd "/Users/emmz/Downloads/okahandja-municipal-app"
open index.html
```

This will open the app directly in your browser with demo data!

---

## ❓ Need Help?

- ✅ All files are in: `/Users/emmz/Downloads/okahandja-municipal-app`
- ✅ Backend code is in: `/Users/emmz/Downloads/okahandja-municipal-app/backend`
- ✅ Frontend is: `/Users/emmz/Downloads/okahandja-municipal-app/index.html`

## 📚 More Documentation

- [README.md](README.md) - Main overview
- [SETUP.md](SETUP.md) - Detailed setup instructions
- [INTEGRATION_GUIDE.md](INTEGRATION_GUIDE.md) - API integration guide
- [backend/README.md](backend/README.md) - API documentation
