# KAMANCHA WEBSITE — PROJECT MEMORY

## Project Overview
Kamancha Restaurant full-stack website. Yerevan, Tumanyan 23. TripAdvisor #3 in Yerevan, 75K Instagram followers.
- **Local dev**: `/home/samo/kamancha-website/`
- **Production**: `root@5.223.92.226:/opt/kamancha/`
- **Live URL**: https://khamancha.duckdns.org
- **Git**: https://github.com/Samvel10/Kamancha (branch: `main`)
- **Local branch**: `master` (push to `main` on GitHub)

---

## Tech Stack
| Layer | Technology |
|---|---|
| Frontend | Next.js 14, TypeScript, Tailwind CSS, Framer Motion |
| i18n | next-intl, 10 languages (hy/en/ru/fr/de/it/es/zh/hi/ar), RTL for Arabic |
| Backend | Node.js, Express, REST API |
| DB1 | PostgreSQL (via Prisma ORM) — reservations, users, auth |
| DB2 | MongoDB (via Mongoose) — menu, gallery, reviews, events |
| Cache | Redis (ioredis) |
| Auth | JWT (access 15m) + refresh tokens (7d), bcrypt |
| Email | Nodemailer |
| Testing | Jest + Supertest (24 tests, all passing) |
| Deploy | Docker + docker-compose, Apache2 reverse proxy, Let's Encrypt SSL |
| CI/CD | GitHub Actions (`.github/workflows/deploy.yml`) |

---

## File Structure

```
kamancha-website/
├── MEMORY.md                      ← this file
├── DEPLOY.md                      ← deployment guide
├── WORKFLOW.md                    ← work rules
├── CLAUDE.md                      ← project instructions for Claude
├── docker-compose.yml             ← local dev (ports 4000, 3000 on 0.0.0.0)
├── docker-compose.prod.yml        ← production (ports 4050, 3050 on 127.0.0.1)
├── .gitignore
├── .github/
│   └── workflows/deploy.yml       ← CI: test backend + frontend, deploy placeholder
│
├── backend/
│   ├── Dockerfile                 ← node:24-slim, installs openssl, runs entrypoint.sh
│   ├── entrypoint.sh              ← prisma db push → node src/index.js
│   ├── .dockerignore
│   ├── .env                       ← local dev secrets (gitignored)
│   ├── .env.example               ← template
│   ├── package.json               ← jest, supertest, express, prisma, mongoose, etc.
│   ├── prisma/
│   │   ├── schema.prisma          ← PostgreSQL schema (User, AdminUser, Hall, Reservation, RefreshToken)
│   │   └── migrations/001_init/migration.sql
│   └── src/
│       ├── index.js               ← entry point, starts server on PORT (default 4000)
│       ├── app.js                 ← Express app, all middleware + routes mounted
│       ├── seed.js                ← seeds halls, admin user, menu items, reviews, events
│       ├── config/
│       │   └── db.js              ← prisma, mongoose, redis connections
│       ├── middleware/
│       │   ├── auth.js            ← JWT verify, requireAuth, requireAdmin
│       │   ├── security.js        ← helmet, rate limiters, httpsRedirect, mongoSanitize
│       │   └── validate.js        ← Joi schema validators
│       ├── models/                ← Mongoose schemas
│       │   ├── MenuItem.js        ← multilingual name+description, price, category, is_popular
│       │   ├── Category.js        ← slug, multilingual name, icon, sort_order
│       │   ├── Review.js          ← author, rating, text, lang, source (tripadvisor/google/internal)
│       │   ├── Event.js           ← multilingual title, date, time, type (music/special/holiday)
│       │   └── GalleryItem.js     ← url, caption, type (food/interior/events)
│       ├── routes/
│       │   ├── menu.js            ← GET /api/menu, GET /api/menu/:category
│       │   ├── reservations.js    ← POST /api/reservations, GET /api/reservations/check
│       │   ├── admin.js           ← POST /api/admin/login, all protected CRUD routes
│       │   ├── auth.js            ← POST /api/auth/refresh, POST /api/auth/logout
│       │   ├── reviews.js         ← GET /api/reviews
│       │   ├── gallery.js         ← GET /api/gallery
│       │   └── events.js          ← GET /api/events
│       └── utils/
│           └── email.js           ← Nodemailer, sends booking confirmation
│   └── tests/
│       ├── setup.js               ← redirects MONGODB_URI to kamancha_test DB
│       ├── health.test.js
│       ├── menu.test.js
│       ├── reservations.test.js   ← uses hall id=99 only, does NOT wipe seeded halls
│       ├── admin.test.js
│       └── reviews.test.js
│
└── frontend/
    ├── Dockerfile                 ← node:24-slim, ARG NEXT_PUBLIC_API_URL (overridable)
    ├── .dockerignore
    ├── .env.local                 ← NEXT_PUBLIC_API_URL=http://localhost:4000 (local only)
    ├── next.config.js             ← standalone output, i18n via next-intl
    ├── middleware.ts              ← next-intl locale routing
    ├── i18n.ts                    ← i18n config
    ├── tailwind.config.ts
    ├── i18n/locales/              ← hy.json, en.json, ru.json, fr.json, de.json, it.json, es.json, zh.json, hi.json, ar.json
    ├── types/index.ts             ← shared TypeScript types
    ├── lib/
    │   ├── api.ts                 ← axios instance using NEXT_PUBLIC_API_URL
    │   └── utils.ts               ← cn(), formatPrice(), formatDate()
    ├── hooks/
    │   └── useCart.ts             ← cart state for delivery page
    ├── components/
    │   ├── layout/
    │   │   ├── Navbar.tsx         ← language switcher, mobile menu, active links
    │   │   └── Footer.tsx         ← address, social links, hours
    │   ├── ui/
    │   │   ├── Button.tsx, Input.tsx, Modal.tsx, LoadingSpinner.tsx, StarRating.tsx
    │   └── sections/
    │       ├── HeroSection.tsx, StatsSection.tsx, PopularDishesSection.tsx, AboutSnippetSection.tsx
    ├── public/images/             ← static assets
    └── app/
        ├── globals.css            ← CSS variables (brand colors)
        └── [locale]/
            ├── layout.tsx         ← root layout, RTL support for Arabic
            ├── page.tsx           ← Home (Hero + Stats + Popular Dishes + About snippet)
            ├── menu/page.tsx      ← Menu with category filter + search
            ├── booking/page.tsx   ← Reservation form, Zod validation, availability check
            ├── about/page.tsx     ← Story, founder Areg (@restormania), values, team
            ├── gallery/page.tsx   ← Masonry grid, filter by type
            ├── events/page.tsx    ← Upcoming events list
            ├── reviews/page.tsx   ← Reviews with source filter
            ├── delivery/page.tsx  ← Cart + checkout
            └── admin/
                ├── page.tsx           ← Dashboard with stats
                ├── login/page.tsx     ← Admin login form
                ├── reservations/page.tsx ← Manage bookings
                ├── menu/page.tsx      ← Menu CRUD
                ├── gallery/page.tsx   ← Gallery management
                └── events/page.tsx    ← Events management
```

---

## Database Schemas

### PostgreSQL (Prisma) — `kamancha` database

**Hall** — seeded with 3 records (id 1,2,3)
```
id, name, nameHy, capacity, description, isActive
1 = Main Hall (80 pax)
2 = Garden Terrace (40 pax)
3 = Private Room (20 pax)
```

**Reservation**
```
id, name, phone, email, date (Date), time (String "HH:MM"),
guests, hallId (FK→Hall), status (PENDING/CONFIRMED/CANCELLED/COMPLETED),
confirmationCode (unique), notes, lang, createdAt, userId (optional FK→User)
```

**AdminUser** — seeded with 1 record
```
id, email, name, password (bcrypt)
admin@kamancha.am / Admin@Kamancha2024
```

**User** — public registration (optional, linked to reservations)
```
id, email, name, phone, password (bcrypt), role (USER/ADMIN), createdAt
```

**RefreshToken**
```
id, token (unique), userId, expiresAt, createdAt
```

### MongoDB — `kamancha` database (prod) / `kamancha_test` (tests)

**MenuItem** — 10 seeded records
```
name{hy,en,ru,fr,de,it,es,zh,hi,ar}, description{...same},
price (AMD), category, image_url, is_available, is_popular, sort_order, tags[]
```

**Category** — 7 seeded (appetizers, soups, mains, grill, salads, desserts, drinks)

**Review** — 5 seeded records
```
author, rating (1-5), text, lang, source (tripadvisor/google/internal), date, is_visible
```

**Event** — 3 seeded records (upcoming dates)
```
title{hy,en,ru,...}, description{hy,en,ru}, date, time, type (music/special/holiday), is_active
```

**GalleryItem**
```
url, caption{...langs}, type (food/interior/events), is_active
```

---

## API Endpoints

### Public
| Method | Path | Description |
|---|---|---|
| GET | `/health` | Health check → `{status:"ok"}` |
| GET | `/api/menu` | All menu items. Query: `?lang=en&category=grill` |
| GET | `/api/menu/:category` | Items by category |
| GET | `/api/reviews` | All visible reviews → `{data:[], total:N}` |
| GET | `/api/events` | Upcoming events |
| GET | `/api/gallery` | Gallery items |
| GET | `/api/reservations/check` | Check availability. Query: `?date&time&hallId&guests` |
| POST | `/api/reservations` | Create booking. Body: `{name,phone,email,date,time,guests,hallId,lang}` |
| POST | `/api/auth/refresh` | Refresh JWT token |
| POST | `/api/auth/logout` | Logout, invalidate refresh token |

### Protected (Bearer token required)
| Method | Path | Description |
|---|---|---|
| POST | `/api/admin/login` | Login → `{accessToken, admin}` |
| GET | `/api/admin/reservations` | All bookings |
| PATCH | `/api/admin/reservations/:id` | Update status |
| POST | `/api/admin/menu` | Create menu item |
| PUT | `/api/admin/menu/:id` | Update menu item |
| DELETE | `/api/admin/menu/:id` | Delete menu item |
| GET | `/api/admin/stats` | Dashboard statistics |

---

## Design System (CSS Variables)
```css
--color-primary:   #5C1A1A  /* dark bordo */
--color-accent:    #C8860A  /* gold/amber */
--color-bg:        #F5ECD7  /* ivory */
--color-text:      #2C1810  /* dark brown */
--color-secondary: #4A5E3A  /* Armenian green */
```

---

## Ports

### Local development (docker-compose.yml)
| Service | Host Port | Container Port |
|---|---|---|
| Backend | 4000 | 4000 |
| Frontend | 3000 | 3000 |
| PostgreSQL | — | 5432 (internal only) |
| MongoDB | — | 27017 (internal only) |
| Redis | — | 6379 (internal only) |

### Production (docker-compose.prod.yml on server)
| Service | Host Binding | Container Port |
|---|---|---|
| Backend | 127.0.0.1:4050 | 4000 |
| Frontend | 127.0.0.1:3050 | 3000 |
| PostgreSQL | — | 5432 (Docker network) |
| MongoDB | — | 27017 (Docker network) |
| Redis | — | 6379 (Docker network) |

### Other services on the server (do not conflict)
| Port | Service |
|---|---|
| 80, 443 | Apache2 (reverse proxy for all sites) |
| 8080 | Python app (another project) |
| 8090 | PHP app (another project) |
| 8448 | Apache2/Matrix federation |
| 4010 | Node.js app (araratatelier backend, localhost only) |
| 5432 | Host PostgreSQL (localhost only) |
| 3306 | Host MySQL (localhost only) |
| 6379 | Host Redis (localhost only) |

---

## What Works ✅
- All 24 backend tests pass (run inside container: `docker compose -f docker-compose.prod.yml exec backend npm test -- --forceExit`)
- HTTPS at https://khamancha.duckdns.org with Let's Encrypt cert (expires 2026-08-11, auto-renews)
- HTTP → HTTPS redirect (301 permanent)
- HSTS header enabled (`max-age=31536000; includeSubDomains`)
- All 9+ frontend pages return 200 (`/hy`, `/en`, `/en/menu`, `/en/booking`, `/en/about`, `/en/gallery`, `/en/events`, `/en/reviews`, `/en/delivery`, `/en/admin`, `/en/admin/login`)
- Default locale redirect: `/` → `/hy` (Armenian, 307)
- Menu API: `GET /api/menu` returns 10 items with localized name/description per `?lang=` param
- Reservation booking: `POST /api/reservations` returns confirmation code
- Availability check: `GET /api/reservations/check` returns `{available: bool}`
- Admin login: `POST /api/admin/login` returns JWT accessToken
- Seed data: 10 menu items, 5 reviews, 3 events, 3 halls, 1 admin user
- All 3 other Apache vhosts on server untouched and healthy (araratatelier, armcrypto, armenianlibery)
- GitHub: https://github.com/Samvel10/Kamancha (5 commits on `main`)

## Known Limitations / Not Yet Done ⚠️
- Email sending uses placeholder SMTP credentials (Nodemailer configured but not sending real emails)
- Gallery has no uploaded images (image_url is empty string in seed data)
- Delivery/checkout has no payment integration
- Admin gallery upload (UI exists, no file upload endpoint)
- CI/CD `deploy` step is a placeholder — requires GitHub secrets setup
- `prisma migrate deploy` not used (uses `db push` instead due to migration folder naming)
- Frontend NEXT_PUBLIC_API_URL is baked at Docker build time — rebuilding image required to change domain

---

## Running Tests Locally (inside container)
```bash
# Tests run INSIDE the Docker container (databases are Docker-internal)
sg docker -c "docker compose exec backend npm test -- --forceExit"

# Tests use kamancha_test MongoDB database (setup.js redirects URI)
# Hall cleanup is scoped to id=99 only — seeded halls (1,2,3) are preserved
```

## Re-seeding Data
```bash
# Local
sg docker -c "docker compose exec backend node src/seed.js"

# Production
ssh -i ~/.ssh/hetzner_key root@5.223.92.226 \
  "cd /opt/kamancha && docker compose -f docker-compose.prod.yml exec backend node src/seed.js"
```
