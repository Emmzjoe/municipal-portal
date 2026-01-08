# Deployment Guide - Okahandja Municipal Portal

This guide covers multiple options for deploying your application to production.

---

## 🚀 Quick Deployment Options

### Option 1: VPS/Cloud Server (Recommended for Production)
**Best for**: Full control, production deployment
**Providers**: DigitalOcean, AWS EC2, Linode, Vultr, Hetzner
**Cost**: $5-20/month

### Option 2: Platform as a Service (PaaS)
**Best for**: Quick deployment, less maintenance
**Providers**: Railway, Render, Heroku
**Cost**: Free tier available, $5-10/month for production

### Option 3: Shared Hosting with Node.js Support
**Best for**: Small-scale, budget-friendly
**Providers**: Namecheap, Hostinger, A2 Hosting
**Cost**: $3-10/month

---

## 📋 Pre-Deployment Checklist

### 1. Environment Configuration
- [ ] Set `NODE_ENV=production` in `.env`
- [ ] Generate a strong JWT secret (64+ characters)
- [ ] Configure production database credentials
- [ ] Set up proper CORS origins (not `*`)
- [ ] Enable CSRF protection in production
- [ ] Configure email service for notifications

### 2. Security Hardening
- [ ] Change all default passwords
- [ ] Review and limit CORS origins
- [ ] Enable HTTPS/SSL certificate
- [ ] Set secure session cookies
- [ ] Configure firewall rules
- [ ] Set up regular database backups

### 3. Database
- [ ] Create production database
- [ ] Run schema migrations
- [ ] Do NOT seed test data in production
- [ ] Set up automated backups
- [ ] Configure database user with limited permissions

### 4. Application
- [ ] Remove console.log statements (or use proper logging)
- [ ] Set up PM2 or similar process manager
- [ ] Configure reverse proxy (Nginx/Apache)
- [ ] Set up SSL/TLS certificates (Let's Encrypt)
- [ ] Configure domain name and DNS

---

## 🔧 Detailed Deployment Instructions

## Option 1: VPS/Cloud Server Deployment (Ubuntu/Debian)

### Step 1: Server Setup

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js (using NodeSource)
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Install MySQL
sudo apt install -y mysql-server

# Install Nginx (web server/reverse proxy)
sudo apt install -y nginx

# Install PM2 (process manager)
sudo npm install -g pm2

# Install Git
sudo apt install -y git
```

### Step 2: Secure MySQL

```bash
sudo mysql_secure_installation

# Create production database
sudo mysql -u root -p
```

```sql
CREATE DATABASE okahandja_municipal;
CREATE USER 'okahandja_user'@'localhost' IDENTIFIED BY 'STRONG_PASSWORD_HERE';
GRANT ALL PRIVILEGES ON okahandja_municipal.* TO 'okahandja_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

### Step 3: Deploy Application

```bash
# Create application directory
sudo mkdir -p /var/www/municipal-portal
sudo chown $USER:$USER /var/www/municipal-portal

# Clone or upload your application
cd /var/www/municipal-portal
git clone YOUR_REPOSITORY_URL .
# OR upload files via SFTP

# Install dependencies
cd backend
npm install --production

# Create production .env file
nano .env
```

**Production .env file:**
```bash
NODE_ENV=production
PORT=3000

# JWT Configuration
JWT_SECRET=GENERATE_A_LONG_RANDOM_STRING_HERE_64_CHARS_MIN
JWT_EXPIRY=24h

# Database Configuration
DB_HOST=localhost
DB_PORT=3306
DB_NAME=okahandja_municipal
DB_USER=okahandja_user
DB_PASSWORD=YOUR_STRONG_PASSWORD_HERE

# CORS - Set to your actual domain
CORS_ORIGIN=https://yourdomain.com

# Security
FEATURE_CSRF_PROTECTION=true
SESSION_SECRET=ANOTHER_LONG_RANDOM_STRING_HERE
BCRYPT_ROUNDS=12

# Email Configuration (for notifications)
SMTP_HOST=smtp.your-email-provider.com
SMTP_PORT=587
SMTP_USER=noreply@yourdomain.com
SMTP_PASSWORD=your_email_password
EMAIL_FROM=Okahandja Municipality <noreply@yourdomain.com>
```

### Step 4: Run Database Migrations

```bash
# Run schema creation
mysql -u okahandja_user -p okahandja_municipal < database/schema.sql

# Run migrations
mysql -u okahandja_user -p okahandja_municipal < database/migration-add-lockout.sql

# DO NOT run seed-test-data.sql in production!
```

### Step 5: Set Up PM2

```bash
# Start application with PM2
cd /var/www/municipal-portal/backend
pm2 start server.js --name municipal-backend

# Save PM2 configuration
pm2 save

# Set PM2 to start on system boot
pm2 startup
# Follow the command it outputs

# Check status
pm2 status
pm2 logs municipal-backend
```

### Step 6: Configure Nginx

```bash
sudo nano /etc/nginx/sites-available/municipal-portal
```

**Nginx configuration:**
```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;

    # Redirect HTTP to HTTPS (after SSL is set up)
    # return 301 https://$server_name$request_uri;

    # Frontend
    root /var/www/municipal-portal;
    index index.html;

    # Frontend files
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Backend API
    location /api {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
}
```

Enable the site:
```bash
sudo ln -s /etc/nginx/sites-available/municipal-portal /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### Step 7: Set Up SSL with Let's Encrypt

```bash
# Install Certbot
sudo apt install -y certbot python3-certbot-nginx

# Get SSL certificate
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com

# Test auto-renewal
sudo certbot renew --dry-run
```

### Step 8: Set Up Firewall

```bash
# Allow SSH, HTTP, HTTPS
sudo ufw allow OpenSSH
sudo ufw allow 'Nginx Full'
sudo ufw enable
sudo ufw status
```

### Step 9: Set Up Database Backups

```bash
# Create backup script
sudo nano /usr/local/bin/backup-municipal-db.sh
```

```bash
#!/bin/bash
BACKUP_DIR="/var/backups/municipal-portal"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
mkdir -p $BACKUP_DIR

mysqldump -u okahandja_user -pYOUR_PASSWORD okahandja_municipal | gzip > $BACKUP_DIR/backup_$TIMESTAMP.sql.gz

# Keep only last 7 days of backups
find $BACKUP_DIR -name "backup_*.sql.gz" -mtime +7 -delete
```

```bash
# Make executable
sudo chmod +x /usr/local/bin/backup-municipal-db.sh

# Schedule daily backups with cron
sudo crontab -e
# Add this line:
0 2 * * * /usr/local/bin/backup-municipal-db.sh
```

---

## Option 2: Railway Deployment (Quick & Easy)

### Step 1: Prepare Your Application

1. Create `Procfile` in the root directory:
```
web: cd backend && node server.js
```

2. Update `backend/package.json`:
```json
{
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js"
  }
}
```

### Step 2: Deploy to Railway

1. Go to [railway.app](https://railway.app)
2. Sign up with GitHub
3. Click "New Project" → "Deploy from GitHub repo"
4. Select your repository
5. Railway will auto-detect Node.js

### Step 3: Add Database

1. Click "New" → "Database" → "MySQL"
2. Railway will provide connection details

### Step 4: Configure Environment Variables

In Railway dashboard, add these variables:
```
NODE_ENV=production
JWT_SECRET=your_jwt_secret_here
DB_HOST=mysql-railway-host
DB_PORT=3306
DB_NAME=railway
DB_USER=root
DB_PASSWORD=railway_provides_this
PORT=3000
CORS_ORIGIN=https://your-app.railway.app
```

### Step 5: Run Migrations

Use Railway's CLI or web shell:
```bash
railway run mysql -h $DB_HOST -u $DB_USER -p$DB_PASSWORD $DB_NAME < backend/database/schema.sql
```

---

## Option 3: Render Deployment

### Step 1: Create `render.yaml`

```yaml
services:
  - type: web
    name: municipal-backend
    env: node
    buildCommand: cd backend && npm install
    startCommand: cd backend && node server.js
    envVars:
      - key: NODE_ENV
        value: production
      - key: JWT_SECRET
        generateValue: true
      - key: DATABASE_URL
        fromDatabase:
          name: municipal-db
          property: connectionString

databases:
  - name: municipal-db
    databaseName: okahandja_municipal
    user: okahandja_user
```

### Step 2: Deploy

1. Go to [render.com](https://render.com)
2. Connect GitHub repository
3. Render will read `render.yaml` and deploy automatically

---

## 🔒 Security Best Practices

### 1. Update Production .env

```bash
# Generate strong secrets
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

Use output for JWT_SECRET and SESSION_SECRET

### 2. Database Security

```sql
-- Create read-only user for reports
CREATE USER 'reports_user'@'localhost' IDENTIFIED BY 'password';
GRANT SELECT ON okahandja_municipal.* TO 'reports_user'@'localhost';
```

### 3. Update CORS in backend/server.js

```javascript
const cors = require('cors');

app.use(cors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:8080',
    credentials: true
}));
```

### 4. Enable Production Security Features

In `.env`:
```bash
FEATURE_CSRF_PROTECTION=true
HTTPS_ONLY=true
```

---

## 📊 Monitoring & Maintenance

### Set Up Monitoring

```bash
# PM2 monitoring
pm2 install pm2-logrotate
pm2 set pm2-logrotate:max_size 10M
pm2 set pm2-logrotate:retain 7

# Check logs
pm2 logs municipal-backend
pm2 monit
```

### Regular Maintenance Tasks

- **Daily**: Check PM2 logs for errors
- **Weekly**: Review server resource usage
- **Monthly**: Update dependencies (`npm audit fix`)
- **Monthly**: Review and rotate logs
- **Quarterly**: Security audit and penetration testing

---

## 🌐 Domain Setup

### 1. Purchase Domain
- Namecheap, GoDaddy, Google Domains, etc.

### 2. Configure DNS

Add these records:

| Type | Name | Value | TTL |
|------|------|-------|-----|
| A | @ | YOUR_SERVER_IP | 3600 |
| A | www | YOUR_SERVER_IP | 3600 |
| CNAME | www | yourdomain.com | 3600 |

Wait 1-48 hours for DNS propagation.

---

## 📞 Support & Troubleshooting

### Common Issues

**Port already in use:**
```bash
sudo lsof -i :3000
sudo kill -9 <PID>
```

**PM2 app not starting:**
```bash
pm2 delete all
pm2 start server.js --name municipal-backend
pm2 logs
```

**Database connection failed:**
- Check credentials in .env
- Verify MySQL is running: `sudo systemctl status mysql`
- Check firewall: `sudo ufw status`

**Nginx not serving files:**
```bash
sudo nginx -t
sudo systemctl restart nginx
sudo tail -f /var/log/nginx/error.log
```

---

## 📝 Post-Deployment Checklist

- [ ] Application accessible via domain
- [ ] HTTPS/SSL working (green padlock)
- [ ] Login functionality works
- [ ] Database queries working
- [ ] Admin dashboard accessible
- [ ] Payment processing works
- [ ] Email notifications sending
- [ ] Automated backups running
- [ ] PM2 auto-restart working
- [ ] Monitoring set up
- [ ] Error logging configured
- [ ] Documentation updated with production URLs

---

## 🎉 Congratulations!

Your Okahandja Municipal Portal is now live!

**Production URLs:**
- Frontend: https://yourdomain.com
- API: https://yourdomain.com/api
- Admin: https://yourdomain.com (login as admin)

**Next Steps:**
1. Create real user accounts
2. Train staff on admin dashboard
3. Announce launch to residents
4. Monitor for issues
5. Collect feedback for improvements
