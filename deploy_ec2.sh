#!/bin/bash
# ==========================================
# MVP EC2 Deployment Script for HireLoop-AI
# Run this script INSIDE your cloned repo on the EC2 Ubuntu instance
# ==========================================

echo "🚀 Starting HireLoop-AI EC2 Deployment..."

# 1. Update system and install dependencies
echo "📦 Installing system dependencies..."
sudo apt-get update -y
sudo apt-get install -y curl git python3 python3-pip python3-venv redis-server

# 2. Install Node.js 20.x
echo "🟢 Installing Node.js..."
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# 3. Install PM2 (Process Manager) globally
echo "🔄 Installing PM2..."
sudo npm install -g pm2

# 4. Setup Node.js Backend
echo "⚙️ Setting up Node.js Backend..."
cd backend
npm install
# Generate Prisma Client
npx prisma generate
# Build the TypeScript code
npm run build
cd ..

# 5. Setup Python AI Backend
echo "🧠 Setting up Python AI Backend..."
cd ai
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
cd ..

# ==========================================
# STARTING SERVICES
# ==========================================
echo "🚀 Starting services with PM2..."

# 6. Start Node.js Backend (Port 4000)
cd backend
pm2 start dist/server.js --name "hireloop-backend"
# Start the queue workers
pm2 start dist/workers/index.js --name "hireloop-workers"
cd ..

# 7. Start Python AI Backend (Port 8000)
cd ai
# We use a bash wrapper so PM2 can run the virtual environment's uvicorn
cat << 'EOF' > start_ai.sh
#!/bin/bash
source venv/bin/activate
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000
EOF
chmod +x start_ai.sh
pm2 start ./start_ai.sh --name "hireloop-ai"
cd ..

# 8. Save PM2 state so it restarts on server reboot
pm2 save
sudo pm2 startup

echo "=========================================="
echo "✅ DEPLOYMENT COMPLETE!"
echo "=========================================="
echo "Your backend is running on port 4000"
echo "Your AI service is running on port 8000"
echo "Redis queue is running locally on port 6379"
echo ""
echo "⚠️ IMPORTANT NEXT STEPS:"
echo "1. Create backend/.env and add your AWS SES & Database URLs"
echo "2. Create ai/.env and add your GROQ_API_KEY"
echo "3. Restart PM2 to apply env variables: pm2 restart all"
echo "4. Open ports 4000 and 8000 in your AWS EC2 Security Group"
echo "=========================================="
