# GitHub Student Developer Pack Domain Setup

If you have the GitHub Student Developer Pack, you can get a free domain (e.g., from Namecheap, .me, or Name.com) to deploy HireLoop-AI to production.

## 1. Claim your Free Domain
1. Go to your [GitHub Student Developer Pack](https://education.github.com/pack).
2. Claim the offer from Namecheap or Name.com for a free 1-year domain name (e.g., `yourname.me` or `hireloop.tech`).

## 2. Point Domain to your Server (DNS Settings)
Once you have deployed your `docker-compose.prod.yml` to a VPS (like DigitalOcean, AWS EC2, or Linode), you will get a public IP address (e.g., `192.168.1.50`).

In your domain registrar's DNS settings, add an **A Record**:
- **Type**: A
- **Host**: @ (or www)
- **Value**: Your Server's IP Address
- **TTL**: Automatic / 30 min

## 3. Configure Nginx Reverse Proxy
To securely serve your frontend and backend on the same domain, configure Nginx on your server:

```nginx
server {
    listen 80;
    server_name hireloop.yourdomain.com;

    location / {
        proxy_pass http://localhost:80; # Frontend docker container
    }

    location /api/ {
        proxy_pass http://localhost:3000; # Backend docker container
    }
}
```

## 4. Secure with Let's Encrypt (SSL)
Run `certbot` on your VPS to automatically generate and apply a free SSL certificate to your Nginx configuration, ensuring your platform is served over HTTPS!
