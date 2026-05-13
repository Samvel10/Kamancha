# KAMANCHA — WORKFLOW RULES

## Golden Rule
**Always edit locally → test → commit → push → deploy to server.**
Never edit files directly on the server. The server is a deployment target, not a workspace.

---

## Step-by-Step Workflow

### 1. Edit locally
All changes happen in `/home/samo/kamancha-website/`.

```bash
# Start local services (if not running)
sg docker -c "docker compose up -d"

# Run backend tests inside container
sg docker -c "docker compose exec backend npm test -- --forceExit"
```

### 2. Update MEMORY.md
After any meaningful change (new feature, schema change, new endpoint, config change), update `MEMORY.md` to reflect the current state. Keep it accurate — it's the single source of truth for future sessions.

What to update:
- File structure if new files added
- DB schema if models changed
- API endpoints if routes added/removed
- Ports if anything changed
- "What Works" / "Known Limitations" sections

### 3. Commit and push to GitHub
```bash
cd /home/samo/kamancha-website

# Stage specific files (never `git add -A` blindly — avoid committing .env)
git add <files>
git commit -m "short description of what changed"

# Push local master to GitHub main
git push origin master:main
```

**Never commit:**
- `.env` files (secrets)
- `node_modules/`
- `.next/` build artifacts
- `*.log` files

### 4. Deploy to server
```bash
# Sync files
rsync -avz \
  -e "ssh -i ~/.ssh/hetzner_key" \
  --exclude='.git' --exclude='node_modules' --exclude='.next' \
  --exclude='.env' --exclude='.env.local' --exclude='*.log' \
  --exclude='frontend/.next' --exclude='backend/node_modules' \
  --exclude='frontend/node_modules' \
  /home/samo/kamancha-website/ \
  root@5.223.92.226:/opt/kamancha/

# Rebuild and restart
ssh -i ~/.ssh/hetzner_key root@5.223.92.226 \
  "cd /opt/kamancha && docker compose -f docker-compose.prod.yml --env-file .env up -d --build"
```

### 5. Verify
```bash
curl -sI https://khamancha.duckdns.org/ | head -3
curl -s https://khamancha.duckdns.org/api/menu | python3 -c \
  "import sys,json; d=json.load(sys.stdin); print(len(d.get('data',d)), 'items')"
```

---

## Special Cases

### Adding a new environment variable
1. Add to `.env` locally (and `backend/.env`)
2. Add to `docker-compose.yml` (local) and `docker-compose.prod.yml` (prod)
3. SSH to server and add to `/opt/kamancha/.env`
4. Rebuild the affected container

### Changing NEXT_PUBLIC_API_URL or NEXT_PUBLIC_SITE_URL
These are baked into the frontend image at build time. Requires full frontend rebuild:
```bash
ssh -i ~/.ssh/hetzner_key root@5.223.92.226 \
  "cd /opt/kamancha && docker compose -f docker-compose.prod.yml --env-file .env build --no-cache frontend && \
   docker compose -f docker-compose.prod.yml --env-file .env up -d"
```

### Changing PostgreSQL schema (Prisma)
1. Edit `backend/prisma/schema.prisma`
2. Locally: schema is applied automatically via `entrypoint.sh` (`prisma db push`)
3. Production: same — `entrypoint.sh` runs `prisma db push --accept-data-loss` on container start
4. If the change could lose data, back up first:
   ```bash
   ssh -i ~/.ssh/hetzner_key root@5.223.92.226 \
     "docker compose -f /opt/kamancha/docker-compose.prod.yml exec postgres \
      pg_dump -U kamancha kamancha > /opt/kamancha/backup_$(date +%Y%m%d).sql"
   ```

### Re-seeding production data
Only needed after data is wiped or on first setup. Seed is safe to re-run (upserts halls and admin user, recreates menu/reviews/events):
```bash
ssh -i ~/.ssh/hetzner_key root@5.223.92.226 \
  "cd /opt/kamancha && docker compose -f docker-compose.prod.yml exec backend node src/seed.js"
```

### Checking production logs
```bash
# Backend logs
ssh -i ~/.ssh/hetzner_key root@5.223.92.226 \
  "cd /opt/kamancha && docker compose -f docker-compose.prod.yml logs --tail=100 -f backend"

# Apache error log
ssh -i ~/.ssh/hetzner_key root@5.223.92.226 "tail -50 /var/log/apache2/khamancha-error.log"
```

---

## Branch Strategy
- `master` = local working branch
- `main` = GitHub remote branch (production-ready)
- Push with: `git push origin master:main`
- GitHub Actions runs on push to `main` (tests backend + frontend build)

---

## What NOT to Do
- Do NOT edit files in `/opt/kamancha/` directly on the server — they will be overwritten on next rsync
- Do NOT install Nginx on the server — Apache2 is already running and managing all vhosts
- Do NOT expose Docker DB ports to the host (they're internal to Docker network for security)
- Do NOT bind backend/frontend to `0.0.0.0` in production — use `127.0.0.1:port` so Apache is the only entry point
- Do NOT run `docker compose down -v` on the server — the `-v` flag destroys database volumes
- Do NOT commit `.env` files
