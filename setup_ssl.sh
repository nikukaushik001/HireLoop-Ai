#!/bin/bash
set -e

DOMAIN="api.hireloopai.me"
EMAIL="nikukaushik001@gmail.com"

echo "🔧 Setting up Nginx config for $DOMAIN..."

cat << 'NGINX_EOF' > /home/ubuntu/api_hireloop
server {
    server_name api.hireloopai.me;

    location / {
        proxy_pass http://localhost:4000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
NGINX_EOF

sudo cp /home/ubuntu/api_hireloop /etc/nginx/sites-available/api_hireloop

# Enable the site
sudo ln -sf /etc/nginx/sites-available/api_hireloop /etc/nginx/sites-enabled/api_hireloop

# Remove default site if it exists to avoid conflicts
sudo rm -f /etc/nginx/sites-enabled/default

# Test config and reload
sudo nginx -t
sudo systemctl reload nginx

echo "🔒 Running Certbot to secure $DOMAIN..."
sudo certbot --nginx -d $DOMAIN --non-interactive --agree-tos -m $EMAIL --redirect

echo "✅ SSL Setup complete for $DOMAIN!"
