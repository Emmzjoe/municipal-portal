#!/bin/bash
# Okahandja Municipal Portal - VPS Deployment Script
# This script helps set up the application on a Ubuntu/Debian VPS

set -e  # Exit on error

echo "========================================="
echo "Okahandja Municipal Portal Deployment"
echo "========================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if running as root
if [[ $EUID -eq 0 ]]; then
   echo -e "${RED}This script should not be run as root${NC}"
   echo "Run it as a regular user with sudo privileges"
   exit 1
fi

# Function to print colored output
print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

print_info() {
    echo -e "${YELLOW}→ $1${NC}"
}

# Check if we're on Ubuntu/Debian
if ! command -v apt-get &> /dev/null; then
    print_error "This script is for Ubuntu/Debian systems only"
    exit 1
fi

print_info "Step 1: System Update"
sudo apt update && sudo apt upgrade -y
print_success "System updated"

print_info "Step 2: Installing Node.js 20.x"
if ! command -v node &> /dev/null; then
    curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
    sudo apt install -y nodejs
    print_success "Node.js installed: $(node -v)"
else
    print_success "Node.js already installed: $(node -v)"
fi

print_info "Step 3: Installing MySQL"
if ! command -v mysql &> /dev/null; then
    sudo apt install -y mysql-server
    print_success "MySQL installed"
    print_info "Running MySQL secure installation..."
    sudo mysql_secure_installation
else
    print_success "MySQL already installed"
fi

print_info "Step 4: Installing Nginx"
if ! command -v nginx &> /dev/null; then
    sudo apt install -y nginx
    sudo systemctl enable nginx
    sudo systemctl start nginx
    print_success "Nginx installed and started"
else
    print_success "Nginx already installed"
fi

print_info "Step 5: Installing PM2"
if ! command -v pm2 &> /dev/null; then
    sudo npm install -g pm2
    print_success "PM2 installed"
else
    print_success "PM2 already installed"
fi

print_info "Step 6: Creating application directory"
APP_DIR="/var/www/municipal-portal"
if [ ! -d "$APP_DIR" ]; then
    sudo mkdir -p $APP_DIR
    sudo chown $USER:$USER $APP_DIR
    print_success "Application directory created: $APP_DIR"
else
    print_success "Application directory already exists: $APP_DIR"
fi

print_info "Step 7: Database setup"
read -p "Enter MySQL root password: " -s MYSQL_ROOT_PASS
echo ""
read -p "Enter new database password for production: " -s DB_PASSWORD
echo ""

# Create database and user
sudo mysql -u root -p"$MYSQL_ROOT_PASS" <<EOF
CREATE DATABASE IF NOT EXISTS okahandja_municipal;
CREATE USER IF NOT EXISTS 'okahandja_user'@'localhost' IDENTIFIED BY '$DB_PASSWORD';
GRANT ALL PRIVILEGES ON okahandja_municipal.* TO 'okahandja_user'@'localhost';
FLUSH PRIVILEGES;
EOF

if [ $? -eq 0 ]; then
    print_success "Database and user created"
else
    print_error "Failed to create database"
    exit 1
fi

print_info "Step 8: Installing application dependencies"
if [ -d "$APP_DIR/backend" ]; then
    cd $APP_DIR/backend
    npm install --production
    print_success "Dependencies installed"
else
    print_error "Backend directory not found. Please upload your application files to $APP_DIR first"
    exit 1
fi

print_info "Step 9: Creating production .env file"
# Generate random secrets
JWT_SECRET=$(node -e "console.log(require('crypto').randomBytes(64).toString('hex'))")
SESSION_SECRET=$(node -e "console.log(require('crypto').randomBytes(64).toString('hex'))")

read -p "Enter your domain name (e.g., municipal.okahandja.gov.na): " DOMAIN_NAME

cat > $APP_DIR/backend/.env <<EOF
NODE_ENV=production
PORT=3000

# JWT Configuration
JWT_SECRET=$JWT_SECRET
JWT_EXPIRY=24h

# Database Configuration
DB_HOST=localhost
DB_PORT=3306
DB_NAME=okahandja_municipal
DB_USER=okahandja_user
DB_PASSWORD=$DB_PASSWORD

# Security
SESSION_SECRET=$SESSION_SECRET
BCRYPT_ROUNDS=12
FEATURE_CSRF_PROTECTION=true

# CORS
CORS_ORIGIN=https://$DOMAIN_NAME

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
AUTH_RATE_LIMIT_MAX=5
EOF

print_success ".env file created"

print_info "Step 10: Running database migrations"
cd $APP_DIR
mysql -u okahandja_user -p"$DB_PASSWORD" okahandja_municipal < backend/database/schema.sql
mysql -u okahandja_user -p"$DB_PASSWORD" okahandja_municipal < backend/database/migration-add-lockout.sql
print_success "Database migrations completed"

print_info "Step 11: Starting application with PM2"
cd $APP_DIR/backend
pm2 delete municipal-backend 2>/dev/null || true
pm2 start server.js --name municipal-backend
pm2 save
print_success "Application started with PM2"

print_info "Step 12: Configuring PM2 to start on boot"
sudo env PATH=$PATH:/usr/bin pm2 startup systemd -u $USER --hp /home/$USER
print_success "PM2 configured for auto-start"

print_info "Step 13: Creating Nginx configuration"
sudo tee /etc/nginx/sites-available/municipal-portal > /dev/null <<EOF
server {
    listen 80;
    server_name $DOMAIN_NAME www.$DOMAIN_NAME;

    root $APP_DIR;
    index index.html;

    # Frontend files
    location / {
        try_files \$uri \$uri/ /index.html;
    }

    # Backend API
    location /api {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
}
EOF

sudo ln -sf /etc/nginx/sites-available/municipal-portal /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx
print_success "Nginx configured"

print_info "Step 14: Setting up firewall"
sudo ufw allow OpenSSH
sudo ufw allow 'Nginx Full'
sudo ufw --force enable
print_success "Firewall configured"

print_info "Step 15: Creating database backup script"
sudo tee /usr/local/bin/backup-municipal-db.sh > /dev/null <<'EOF'
#!/bin/bash
BACKUP_DIR="/var/backups/municipal-portal"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
mkdir -p $BACKUP_DIR

mysqldump -u okahandja_user -p$DB_PASSWORD okahandja_municipal | gzip > $BACKUP_DIR/backup_$TIMESTAMP.sql.gz

# Keep only last 7 days
find $BACKUP_DIR -name "backup_*.sql.gz" -mtime +7 -delete
EOF

sudo chmod +x /usr/local/bin/backup-municipal-db.sh

# Add to crontab
(crontab -l 2>/dev/null; echo "0 2 * * * /usr/local/bin/backup-municipal-db.sh") | crontab -
print_success "Database backup configured (runs daily at 2 AM)"

echo ""
echo "========================================="
echo -e "${GREEN}Deployment Complete!${NC}"
echo "========================================="
echo ""
echo "Your application is now running at:"
echo "  http://$DOMAIN_NAME"
echo ""
echo "Next steps:"
echo "1. Point your domain DNS to this server's IP address"
echo "2. Set up SSL certificate:"
echo "   sudo apt install certbot python3-certbot-nginx"
echo "   sudo certbot --nginx -d $DOMAIN_NAME -d www.$DOMAIN_NAME"
echo ""
echo "3. Check application status:"
echo "   pm2 status"
echo "   pm2 logs municipal-backend"
echo ""
echo "4. Create your first admin user in the database"
echo ""
echo "Environment file created at: $APP_DIR/backend/.env"
echo "Database password: [HIDDEN - check .env file]"
echo ""
print_info "Important: Keep your .env file secure!"
echo "========================================="
