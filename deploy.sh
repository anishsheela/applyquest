#!/bin/bash

# ApplyQuest Frontend Deployment Script
# This script helps deploy the frontend to your server

set -e

echo "🚀 Starting ApplyQuest Frontend Deployment"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
SERVER_HOST="applyquest.vps.anishsheela.com"
SERVER_USER="applyquest"
DEPLOY_PATH="/var/www/applyquest"

echo -e "${YELLOW}📋 Deployment Configuration:${NC}"
echo "Server: $SERVER_HOST"
echo "User: $SERVER_USER"
echo "Path: $DEPLOY_PATH"
echo ""

# Check if we're in the right directory
if [ ! -d "frontend" ]; then
    echo -e "${RED}❌ Error: frontend directory not found. Run this script from the project root.${NC}"
    exit 1
fi

# Build the frontend
echo -e "${YELLOW}🔨 Building frontend...${NC}"
cd frontend

if ! npm ci; then
    echo -e "${RED}❌ Failed to install dependencies${NC}"
    exit 1
fi

if ! npm run build; then
    echo -e "${RED}❌ Failed to build frontend${NC}"
    exit 1
fi

cd ..
echo -e "${GREEN}✅ Frontend built successfully${NC}"

# Create deployment archive
echo -e "${YELLOW}📦 Creating deployment archive...${NC}"
DEPLOY_ARCHIVE="applyquest-frontend-$(date +%Y%m%d-%H%M%S).tar.gz"

tar -czf "$DEPLOY_ARCHIVE" -C frontend/build .

echo -e "${GREEN}✅ Deployment archive created: $DEPLOY_ARCHIVE${NC}"

# Deploy to server (you'll need to set up SSH keys)
echo -e "${YELLOW}🚀 Deploying to server...${NC}"
echo "Run this command manually or set up SSH keys:"
echo ""
echo "scp $DEPLOY_ARCHIVE $SERVER_USER@$SERVER_HOST:~"
echo ""
echo "Then on the server:"
echo "ssh $SERVER_USER@$SERVER_HOST << 'EOF'"
echo "cd ~"
echo "tar -xzf $DEPLOY_ARCHIVE"
echo "sudo rm -rf $DEPLOY_PATH/*"
echo "sudo mv * $DEPLOY_PATH/"
echo "sudo chown -R www-data:www-data $DEPLOY_PATH"
echo "sudo systemctl reload nginx"
echo "echo '✅ Deployment completed!'"
echo "EOF"

echo ""
echo -e "${GREEN}🎉 Deployment preparation complete!${NC}"
echo -e "${GREEN}🌐 Your app will be available at: https://applyquest.vps.anishsheela.com${NC}"