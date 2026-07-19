#!/bin/bash
# MVP EC2 Deployment Script for HireLoop-AI

echo "Starting EC2 Deployment Setup for HireLoop-AI..."

# 1. Update system and install dependencies
sudo apt update -y
sudo apt install -y curl git build-essential python3-pip python3-venv

# 2. Install Node.js 20 (LTS)
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# 3. Install PM2 globally to keep our apps running in the background
sudo npm install -g pm2

# 4. Setup Python Virtual Environment for AI Service
echo "Setting up AI Service..."
cd ai
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt

# Start AI Service with PM2
pm2 start start.py --name "hireloop-ai" --interpreter python3
cd ..

# 5. Setup Node.js Backend
echo "Setting up Node.js Backend..."
cd backend
npm install
npx prisma generate

# 6. Build the backend (assuming typescript)
npm run build

# Start Node Service with PM2
# We assume the compiled code is in dist/server.js
pm2 start dist/server.js --name "hireloop-node"
cd ..

# 7. Save PM2 processes so they start on reboot
pm2 save
pm2 startup

echo "========================================================="
echo "✅ Deployment Successful!"
echo "AI Service is running on port 10000 (Internal)"
echo "Node API is running on port 4000 (Public)"
echo ""
echo "Don't forget to create a .env file in the backend directory!"
echo "========================================================="
