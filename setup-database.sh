#!/bin/bash

# ===================================
# MySQL Database Setup Script
# Okahandja Municipality Portal
# ===================================

echo "🗄️  MySQL Database Setup for Okahandja Municipality Portal"
echo ""

# Color codes for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if MySQL is installed
if ! command -v mysql &> /dev/null; then
    echo -e "${RED}❌ MySQL is not installed${NC}"
    echo ""
    echo "Please install MySQL first:"
    echo "  macOS: brew install mysql"
    echo "  Ubuntu: sudo apt install mysql-server"
    echo ""
    exit 1
fi

echo -e "${GREEN}✅ MySQL is installed${NC}"
echo ""

# Check if MySQL is running
if ! pgrep -x "mysqld" > /dev/null; then
    echo -e "${YELLOW}⚠️  MySQL is not running. Starting MySQL...${NC}"

    # Try to start MySQL (macOS with Homebrew)
    if command -v brew &> /dev/null; then
        brew services start mysql
        sleep 3
    else
        echo -e "${RED}Please start MySQL manually:${NC}"
        echo "  macOS: brew services start mysql"
        echo "  Ubuntu: sudo systemctl start mysql"
        exit 1
    fi
fi

echo -e "${GREEN}✅ MySQL is running${NC}"
echo ""

# Prompt for MySQL root password
echo "Please enter your MySQL root password:"
read -s MYSQL_ROOT_PASSWORD
echo ""

# Test MySQL connection
if ! mysql -u root -p"$MYSQL_ROOT_PASSWORD" -e "SELECT 1;" &> /dev/null; then
    echo -e "${RED}❌ Failed to connect to MySQL. Please check your password.${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Connected to MySQL${NC}"
echo ""

# Create database
echo "📊 Creating database 'okahandja_municipal'..."
mysql -u root -p"$MYSQL_ROOT_PASSWORD" << EOF
CREATE DATABASE IF NOT EXISTS okahandja_municipal CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
EOF

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Database created successfully${NC}"
else
    echo -e "${RED}❌ Failed to create database${NC}"
    exit 1
fi
echo ""

# Import schema
echo "📋 Importing database schema..."
if [ -f "backend/database/schema.sql" ]; then
    mysql -u root -p"$MYSQL_ROOT_PASSWORD" okahandja_municipal < backend/database/schema.sql

    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ Schema imported successfully${NC}"
    else
        echo -e "${RED}❌ Failed to import schema${NC}"
        exit 1
    fi
else
    echo -e "${RED}❌ Schema file not found: backend/database/schema.sql${NC}"
    exit 1
fi
echo ""

# Verify tables
echo "🔍 Verifying database tables..."
TABLE_COUNT=$(mysql -u root -p"$MYSQL_ROOT_PASSWORD" okahandja_municipal -se "SHOW TABLES;" | wc -l)
echo -e "${GREEN}✅ Found $TABLE_COUNT tables${NC}"
echo ""

# Create or update .env file
echo "⚙️  Configuring environment variables..."
if [ ! -f "backend/.env" ]; then
    cp backend/.env.example backend/.env
    echo -e "${GREEN}✅ Created backend/.env from template${NC}"
else
    echo -e "${YELLOW}⚠️  backend/.env already exists${NC}"
fi

# Update database credentials in .env
if [ -f "backend/.env" ]; then
    # Update DB_PASSWORD (uncomment and set)
    if grep -q "^#DB_PASSWORD=" backend/.env || grep -q "^DB_PASSWORD=$" backend/.env; then
        echo ""
        echo "Would you like to update DB_PASSWORD in .env? (y/n)"
        read -r UPDATE_ENV
        if [ "$UPDATE_ENV" = "y" ]; then
            echo "Enter database password to use (or press Enter to use root password):"
            read -s DB_PASS
            if [ -z "$DB_PASS" ]; then
                DB_PASS="$MYSQL_ROOT_PASSWORD"
            fi

            # Update .env file
            sed -i.bak "s/^DB_PASSWORD=.*/DB_PASSWORD=$DB_PASS/" backend/.env
            echo -e "${GREEN}✅ Updated DB_PASSWORD in .env${NC}"
        fi
    fi
fi
echo ""

# Display summary
echo "=========================================="
echo -e "${GREEN}✅ Database setup complete!${NC}"
echo "=========================================="
echo ""
echo "Database Details:"
echo "  Name: okahandja_municipal"
echo "  Host: localhost"
echo "  Port: 3306"
echo "  User: root"
echo ""
echo "Default Admin Account:"
echo "  Account Number: ADMIN001"
echo "  Email: admin@okahandja-municipality.na"
echo "  Password: Check schema.sql for bcrypt hash"
echo ""
echo "Next Steps:"
echo "  1. cd backend"
echo "  2. npm install (if not done)"
echo "  3. npm run dev"
echo "  4. Open http://localhost:8080 in browser"
echo "  5. Register new account or login with demo credentials"
echo ""
echo "📚 For more details, see DATABASE_SETUP.md"
echo ""
