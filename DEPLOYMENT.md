# 🚀 ApplyQuest Deployment Guide

This guide will help you deploy the ApplyQuest frontend to your server using GitHub Actions.

## 📋 Prerequisites

1. **Server Requirements:**
   - Ubuntu/Debian server with sudo access
   - Nginx installed and configured
   - Domain: `applyquest.vps.anishsheela.com`
   - SSH access with key-based authentication

2. **GitHub Secrets Required:**
   - `SERVER_HOST`: `applyquest.vps.anishsheela.com`
   - `SERVER_USER`: Your SSH username (e.g., `applyquest`)
   - `SSH_PRIVATE_KEY`: Your private SSH key (generate with `ssh-keygen`)
   - `SERVER_PATH`: Deployment path (e.g., `/var/www/applyquest`)

## 🛠️ Server Setup

### 1. Install Nginx

```bash
sudo apt update
sudo apt install nginx
sudo systemctl enable nginx
sudo systemctl start nginx
```

### 2. Create Deployment Directory

```bash
sudo mkdir -p /var/www/applyquest
sudo chown -R $USER:$USER /var/www/applyquest
```

### 3. Configure Nginx

Create `/etc/nginx/sites-available/applyquest`:

```nginx
server {
    listen 80;
    server_name applyquest.vps.anishsheela.com;
    root /var/www/applyquest;
    index index.html;

    # Enable gzip compression
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss;

    # Handle React Router
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
}
```

Enable the site:

```bash
sudo ln -s /etc/nginx/sites-available/applyquest /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### 4. SSL Certificate (Optional but Recommended)

```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d applyquest.vps.anishsheela.com
```

## 🔑 GitHub Setup

### 1. Generate SSH Key

```bash
ssh-keygen -t rsa -b 4096 -C "github-actions@applyquest"
```

### 2. Add Public Key to Server

```bash
# Copy public key to server
ssh-copy-id -i ~/.ssh/id_rsa.pub applyquest@applyquest.vps.anishsheela.com

# Or manually add to ~/.ssh/authorized_keys
cat ~/.ssh/id_rsa.pub
```

### 3. Add Secrets to GitHub Repository

Go to: Settings → Secrets and variables → Actions

Add these secrets:
- `SERVER_HOST`: `applyquest.vps.anishsheela.com`
- `SERVER_USER`: `applyquest` (your SSH username)
- `SSH_PRIVATE_KEY`: Contents of `~/.ssh/id_rsa` (private key)
- `SERVER_PATH`: `/var/www/applyquest`

## 🚀 Deployment Workflow

The GitHub Actions workflow (`.github/workflows/deploy.yml`) will:

1. **Checkout code** from the `main` branch
2. **Setup Node.js** and install dependencies
3. **Run tests** (optional)
4. **Build the React app** (`npm run build`)
5. **Deploy via SCP** to your server
6. **Set proper permissions** and reload nginx

### Manual Deployment

If you prefer manual deployment:

```bash
# Run the deployment script
chmod +x deploy.sh
./deploy.sh
```

## 🔍 Troubleshooting

### Check Nginx Status
```bash
sudo systemctl status nginx
sudo nginx -t
```

### Check Logs
```bash
# Nginx logs
sudo tail -f /var/log/nginx/error.log
sudo tail -f /var/log/nginx/access.log

# Application logs (if any)
tail -f /var/log/applyquest.log
```

### Test Deployment
```bash
# Test if files are deployed
curl -I https://applyquest.vps.anishsheela.com

# Check file permissions
ls -la /var/www/applyquest/
```

### Common Issues

1. **403 Forbidden**: Check file permissions
   ```bash
   sudo chown -R www-data:www-data /var/www/applyquest
   ```

2. **404 on refresh**: React Router needs proper nginx config
   ```nginx
   location / {
       try_files $uri $uri/ /index.html;
   }
   ```

3. **SSL Issues**: Ensure certificate is valid
   ```bash
   sudo certbot certificates
   ```

## 📊 Monitoring

After deployment, monitor your application:

- **Uptime**: Use services like UptimeRobot
- **Performance**: Google PageSpeed Insights
- **Errors**: Check browser console and server logs
- **Traffic**: Nginx access logs or analytics

## 🔄 Updates

The workflow automatically deploys on every push to `main`. For manual deployment:

1. Go to GitHub Actions tab
2. Click "Deploy Frontend to Server"
3. Click "Run workflow"

## 🎯 Production Checklist

- [ ] SSL certificate installed
- [ ] Domain DNS configured
- [ ] Nginx configured and tested
- [ ] SSH keys set up
- [ ] GitHub secrets configured
- [ ] Test deployment works
- [ ] Monitor logs and performance

## 📞 Support

If you encounter issues:

1. Check the GitHub Actions logs
2. Review server logs
3. Test locally first: `cd frontend && npm run build`
4. Verify SSH connection: `ssh applyquest@applyquest.vps.anishsheela.com`

---

**Happy deploying! 🚀**