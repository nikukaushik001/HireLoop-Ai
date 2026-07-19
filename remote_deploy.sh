#!/bin/bash
set -e

echo "🚀 Connecting to EC2 to clone and run deployment..."
ssh -i hireloop-ec2.pem -o StrictHostKeyChecking=no ubuntu@13.201.8.194 << 'EOF'
  # Remove if exists to allow re-cloning
  rm -rf HireLoop-Ai
  git clone https://github.com/nikukaushik001/HireLoop-Ai.git
  cd HireLoop-Ai
  chmod +x deploy_ec2.sh
  ./deploy_ec2.sh
EOF

echo "📦 Uploading .env files..."
scp -i hireloop-ec2.pem -o StrictHostKeyChecking=no backend/.env ubuntu@13.201.8.194:~/HireLoop-Ai/backend/.env
scp -i hireloop-ec2.pem -o StrictHostKeyChecking=no ai/.env ubuntu@13.201.8.194:~/HireLoop-Ai/ai/.env

echo "🔄 Restarting services on EC2..."
ssh -i hireloop-ec2.pem -o StrictHostKeyChecking=no ubuntu@13.201.8.194 << 'EOF'
  cd HireLoop-Ai
  pm2 restart all
EOF

echo "✅ ALL DONE! EC2 backend is fully live!"
