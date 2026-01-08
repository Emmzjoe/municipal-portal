# Quick Deployment Guide

## ✅ Changes Made

1. **Logo Added to Login Screen** - The Okahandja Municipality logo now appears on the login page above the "OKAHANDJA" heading

## 🚀 Three Ways to Deploy

### Option 1: VPS/Cloud Server (Most Control)
**Best for**: Production, full control over everything
**Time**: 30-60 minutes
**Cost**: $5-20/month

**Providers to Consider:**
- **DigitalOcean** - $6/month, easy to use
- **Linode** - $5/month, reliable
- **Vultr** - $5/month, global locations
- **AWS Lightsail** - $5/month, Amazon infrastructure
- **Hetzner** - $4/month, Europe-based, very cheap

**Quick Start:**
```bash
# 1. Get a Ubuntu server from any provider above
# 2. SSH into your server
ssh root@your-server-ip

# 3. Upload this application to the server
# 4. Run the deployment script
cd /path/to/municipal-portal
chmod +x deploy-vps.sh
./deploy-vps.sh
```

The script will:
- Install Node.js, MySQL, Nginx, PM2
- Set up the database
- Configure the application
- Start everything automatically
- Set up SSL (with Let's Encrypt)

### Option 2: Railway (Easiest!)
**Best for**: Quick deployment, minimal setup
**Time**: 10-15 minutes
**Cost**: Free tier available, $5/month for production

**Steps:**
1. Go to [railway.app](https://railway.app)
2. Sign up with GitHub
3. Click "New Project" → "Deploy from GitHub repo"
4. Select your repository
5. Add MySQL database (click "New" → "Database" → "MySQL")
6. Add environment variables (see DEPLOYMENT_GUIDE.md)
7. Deploy!

Railway automatically:
- Builds your application
- Provides a URL (e.g., your-app.railway.app)
- Handles SSL certificates
- Monitors and restarts if needed

### Option 3: Render (Free Tier Available)
**Best for**: Testing, small-scale deployment
**Time**: 15-20 minutes
**Cost**: Free tier (limited), $7/month for production

**Steps:**
1. Go to [render.com](https://render.com)
2. Sign up with GitHub
3. Click "New" → "Web Service"
4. Connect your repository
5. Add PostgreSQL database (free tier)
6. Configure environment variables
7. Deploy!

---

## 📦 What You Need Before Deploying

### 1. A Domain Name (Optional but Recommended)
- Buy from: Namecheap, GoDaddy, Google Domains
- Cost: $10-15/year
- Example: `municipal.okahandja.gov.na`

### 2. Production Configuration
Create a production `.env` file with:
- Strong JWT secret (generate with: `node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"`)
- Database credentials
- Your domain name for CORS
- SMTP settings for email notifications

### 3. Database
- For VPS: MySQL will be installed by the script
- For Railway/Render: Use their provided database

---

## 🔒 Security Checklist Before Going Live

- [ ] Change all default passwords
- [ ] Generate strong JWT secret (64+ characters)
- [ ] Set `NODE_ENV=production` in .env
- [ ] Configure proper CORS origin (not `*`)
- [ ] Enable CSRF protection
- [ ] Set up HTTPS/SSL
- [ ] Configure firewall
- [ ] Set up database backups
- [ ] Remove test data from database
- [ ] Review and test all admin functions

---

## 📊 After Deployment

### Test Everything:
1. Visit your domain
2. Login as admin
3. Test all features:
   - View bills
   - Mark bills as paid
   - View users
   - Generate reports
   - Process payments

### Monitor:
```bash
# Check application logs (VPS)
pm2 logs municipal-backend

# Check Nginx logs
sudo tail -f /var/log/nginx/error.log

# Check database
mysql -u okahandja_user -p
```

### Backups:
The deployment script automatically sets up daily backups at 2 AM.

Backups are stored in: `/var/backups/municipal-portal/`

To manually backup:
```bash
/usr/local/bin/backup-municipal-db.sh
```

---

## 🆘 Quick Troubleshooting

### Application Not Starting:
```bash
pm2 restart municipal-backend
pm2 logs municipal-backend
```

### Can't Access Website:
```bash
# Check Nginx
sudo systemctl status nginx
sudo nginx -t

# Check firewall
sudo ufw status
```

### Database Connection Error:
```bash
# Check MySQL is running
sudo systemctl status mysql

# Test connection
mysql -u okahandja_user -p
```

### SSL Certificate Issues:
```bash
# Renew certificate
sudo certbot renew

# Test renewal
sudo certbot renew --dry-run
```

---

## 📞 Need Help?

1. Check the detailed **DEPLOYMENT_GUIDE.md** for comprehensive instructions
2. Check server logs: `pm2 logs` (VPS) or provider dashboard (Railway/Render)
3. Review Nginx logs: `sudo tail -f /var/log/nginx/error.log`
4. Check MySQL logs: `sudo tail -f /var/log/mysql/error.log`

---

## 🎯 Recommended Approach for Okahandja Municipality

**For Production Use:**
1. **Start with Railway** (easiest, quickest)
   - Get it live fast
   - Test with staff
   - Collect feedback

2. **Move to VPS later** (when you need more control)
   - Better performance
   - Lower long-term cost
   - Full control over everything

**Timeline:**
- Week 1: Deploy to Railway, test internally
- Week 2-3: Staff training, bug fixes
- Week 4: Public announcement
- Month 2: Consider moving to VPS for cost savings

---

## 💰 Cost Comparison

| Option | Setup Time | Monthly Cost | Best For |
|--------|-----------|--------------|----------|
| Railway | 15 min | $5-10 | Quick start, testing |
| Render | 20 min | $7-15 | Mid-scale deployment |
| VPS (DigitalOcean) | 60 min | $6 | Production, full control |
| VPS (Hetzner) | 60 min | $4 | Budget-friendly |

All options support:
- Custom domain
- SSL/HTTPS
- Automatic backups
- Monitoring

---

## 🚀 Let's Deploy!

**Ready to deploy? Choose your option:**

1. **Easy & Quick**: Follow Railway instructions above
2. **Full Control**: Use the `deploy-vps.sh` script on a Ubuntu server
3. **Free Testing**: Try Render's free tier

**Need the automated script?**
```bash
./deploy-vps.sh
```

Follow the prompts, and you'll be live in 30 minutes!

---

## ✅ Post-Deployment Checklist

After deployment:
- [ ] Access the site via your domain
- [ ] Login as admin (ADMIN001 / admin123)
- [ ] Change the admin password immediately
- [ ] Create additional staff accounts
- [ ] Remove test data
- [ ] Add real user accounts
- [ ] Test all functionality
- [ ] Announce to residents
- [ ] Monitor for issues

---

**Need more details?** See [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md) for comprehensive instructions.
