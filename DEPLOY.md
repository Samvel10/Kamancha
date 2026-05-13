# KAMANCHA — DEPLOYMENT GUIDE

## Server Details
| | |
|---|---|
| IP | 5.223.92.226 |
| User | root |
| SSH key | `~/.ssh/hetzner_key` |
| Project dir | `/opt/kamancha/` |
| OS | Ubuntu 24.04.3 LTS |
| Web server | Apache2 (NOT Nginx — do not install Nginx) |
| SSL | Let's Encrypt via certbot 2.9.0 |
| Domain | khamancha.duckdns.org |

## Quick SSH
```bash
ssh -i ~/.ssh/hetzner_key root@5.223.92.226
```

## Apache Config Locations (on server)
| File | Purpose |
|---|---|
| `/etc/apache2/sites-available/khamancha.duckdns.org.conf` | HTTP vhost → redirects to HTTPS |
| `/etc/apache2/sites-available/khamancha.duckdns.org-le-ssl.conf` | HTTPS vhost with proxy rules |
| `/etc/apache2/sites-enabled/` | Symlinks to enabled vhosts |
| `/etc/letsencrypt/live/khamancha.duckdns.org/` | SSL cert + key |
| `/var/log/apache2/khamancha-error.log` | Error log |
| `/var/log/apache2/khamancha-access.log` | Access log |

## Apache Proxy Rules (SSL vhost)
```apache
# Backend API (Express on 127.0.0.1:4050)
ProxyPass /api http://127.0.0.1:4050/api
ProxyPassReverse /api http://127.0.0.1:4050/api

# Health check
ProxyPass /health http://127.0.0.1:4050/health
ProxyPassReverse /health http://127.0.0.1:4050/health

# Frontend (Next.js on 127.0.0.1:3050) — must be last
ProxyPass / http://127.0.0.1:3050/
ProxyPassReverse / http://127.0.0.1:3050/

# Required headers
RequestHeader set X-Forwarded-Proto "https"
RequestHeader set X-Forwarded-Port "443"
```

## Docker on Server
```bash
# Status
ssh -i ~/.ssh/hetzner_key root@5.223.92.226 \
  "cd /opt/kamancha && docker compose -f docker-compose.prod.yml ps"

# Logs
ssh -i ~/.ssh/hetzner_key root@5.223.92.226 \
  "cd /opt/kamancha && docker compose -f docker-compose.prod.yml logs --tail=50 backend"

# Restart all
ssh -i ~/.ssh/hetzner_key root@5.223.92.226 \
  "cd /opt/kamancha && docker compose -f docker-compose.prod.yml restart"
```

## Production .env on Server
Location: `/opt/kamancha/.env` (chmod 600, gitignored)

Variables required:
```
POSTGRES_PASSWORD=...
REDIS_PASSWORD=...
JWT_SECRET=...         (min 32 chars)
JWT_REFRESH_SECRET=... (min 32 chars)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=noreply@kamancha.am
SMTP_PASS=...
```

---

## Deploying Code Changes

### Standard deploy (code changes only, no new env vars)
```bash
# 1. Sync changed files to server
rsync -avz \
  -e "ssh -i ~/.ssh/hetzner_key" \
  --exclude='.git' --exclude='node_modules' --exclude='.next' \
  --exclude='.env' --exclude='.env.local' --exclude='*.log' \
  --exclude='frontend/.next' --exclude='backend/node_modules' \
  --exclude='frontend/node_modules' \
  /home/samo/kamancha-website/ \
  root@5.223.92.226:/opt/kamancha/

# 2. Rebuild and restart (skips unchanged layers due to Docker cache)
ssh -i ~/.ssh/hetzner_key root@5.223.92.226 \
  "cd /opt/kamancha && docker compose -f docker-compose.prod.yml --env-file .env up -d --build"
```

### Deploy with frontend URL change
If `NEXT_PUBLIC_API_URL` or `NEXT_PUBLIC_SITE_URL` changes, the frontend image MUST be rebuilt from scratch:
```bash
ssh -i ~/.ssh/hetzner_key root@5.223.92.226 \
  "cd /opt/kamancha && docker compose -f docker-compose.prod.yml --env-file .env build --no-cache frontend && \
   docker compose -f docker-compose.prod.yml --env-file .env up -d"
```

### Backend-only restart (config change)
```bash
ssh -i ~/.ssh/hetzner_key root@5.223.92.226 \
  "cd /opt/kamancha && docker compose -f docker-compose.prod.yml --env-file .env up -d --build backend"
```

---

## First-Time Server Setup (already done — for reference)

### 1. Install Docker
```bash
curl -fsSL https://get.docker.com | sh
systemctl enable docker && systemctl start docker
```

### 2. Copy project files
```bash
mkdir -p /opt/kamancha
rsync -avz -e "ssh -i ~/.ssh/hetzner_key" \
  --exclude='.git' --exclude='node_modules' --exclude='.next' \
  --exclude='.env' --exclude='.env.local' \
  /home/samo/kamancha-website/ root@5.223.92.226:/opt/kamancha/
```

### 3. Create .env on server
```bash
ssh -i ~/.ssh/hetzner_key root@5.223.92.226 "cat > /opt/kamancha/.env << 'EOF'
POSTGRES_PASSWORD=your_strong_password
REDIS_PASSWORD=your_strong_redis_password
JWT_SECRET=your_jwt_secret_minimum_32_chars
JWT_REFRESH_SECRET=your_refresh_secret_minimum_32_chars
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=noreply@kamancha.am
SMTP_PASS=your_smtp_app_password
EOF
chmod 600 /opt/kamancha/.env"
```

### 4. Build and start
```bash
ssh -i ~/.ssh/hetzner_key root@5.223.92.226 \
  "cd /opt/kamancha && docker compose -f docker-compose.prod.yml --env-file .env up -d --build"
```

### 5. Seed database
```bash
ssh -i ~/.ssh/hetzner_key root@5.223.92.226 \
  "cd /opt/kamancha && docker compose -f docker-compose.prod.yml exec backend node src/seed.js"
```

### 6. Apache vhost (HTTP)
Create `/etc/apache2/sites-available/khamancha.duckdns.org.conf`:
```apache
<VirtualHost *:80>
    ServerName khamancha.duckdns.org
    ProxyPreserveHost On
    ProxyRequests Off
    ProxyPass /api http://127.0.0.1:4050/api
    ProxyPassReverse /api http://127.0.0.1:4050/api
    ProxyPass /health http://127.0.0.1:4050/health
    ProxyPassReverse /health http://127.0.0.1:4050/health
    ProxyPass / http://127.0.0.1:3050/
    ProxyPassReverse / http://127.0.0.1:3050/
    ErrorLog ${APACHE_LOG_DIR}/khamancha-error.log
    CustomLog ${APACHE_LOG_DIR}/khamancha-access.log combined
    RewriteEngine on
    RewriteCond %{SERVER_NAME} =khamancha.duckdns.org
    RewriteRule ^ https://%{SERVER_NAME}%{REQUEST_URI} [END,NE,R=permanent]
</VirtualHost>
```
```bash
a2enmod proxy proxy_http headers rewrite ssl
a2ensite khamancha.duckdns.org.conf
apache2ctl configtest && systemctl reload apache2
```

### 7. SSL with certbot
```bash
certbot --apache -d khamancha.duckdns.org \
  --non-interactive --agree-tos \
  --email samvelkhachatryan167@gmail.com --redirect
```

Then edit the generated SSL vhost to add forwarded headers (see Apache Proxy Rules section above).

---

## Verify Deployment
```bash
# HTTPS works
curl -sI https://khamancha.duckdns.org/ | head -3

# HTTP redirects to HTTPS
curl -sI http://khamancha.duckdns.org/ | head -3

# API works
curl -s https://khamancha.duckdns.org/api/menu | python3 -c \
  "import sys,json; d=json.load(sys.stdin); print(len(d.get('data',d)), 'items')"

# Admin login
curl -s -X POST https://khamancha.duckdns.org/api/admin/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@kamancha.am","password":"Admin@Kamancha2024"}'
```

## SSL Certificate Renewal
Certbot installs a systemd timer that auto-renews. Manual check:
```bash
ssh -i ~/.ssh/hetzner_key root@5.223.92.226 "certbot renew --dry-run"
```
Current cert expires: **2026-08-11**

## Other Projects on the Server (do not touch)
| Domain | Port | Notes |
|---|---|---|
| araratatelier.duckdns.org | 4010 (Node) | Ararat Atelier |
| armcrypto.duckdns.org | 8090 (PHP) | Armenian Crypto |
| armenianlibery.duckdns.org | 8080 (Python) | Armenian Library |
