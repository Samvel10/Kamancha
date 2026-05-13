# Kamancha Restaurant Website / Կամանչա Ռեստորան

Professional full-stack website for Kamancha Restaurant (Yerevan, Tumanyan 23).  
TripAdvisor Yerevan #3 · 75K Instagram followers · Live music every evening.

## Tech Stack

- **Frontend**: Next.js 14 + TypeScript + Tailwind CSS + Framer Motion
- **Backend**: Node.js + Express + REST API
- **Database 1**: PostgreSQL via Supabase (reservations, users)
- **Database 2**: MongoDB Atlas (menu, gallery, reviews, events)
- **Cache**: Redis
- **Auth**: JWT + bcrypt
- **Email**: Nodemailer
- **Deploy**: Docker + docker-compose

## Getting Started

### Prerequisites
- Docker & docker-compose
- Node.js 18+

### Development

```bash
# Clone and start all services
docker-compose up -d

# Or run individually:

# Backend
cd backend
cp .env.example .env  # fill in your DB credentials
npm install
npm run dev

# Frontend
cd frontend
cp .env.local .env.local  # fill in API URL
npm install
npm run dev
```

### Environment Variables

**Backend** (`.env`):
```
DATABASE_URL=postgresql://...
MONGODB_URI=mongodb+srv://...
REDIS_URL=redis://localhost:6379
JWT_SECRET=your-secret-key
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your@email.com
SMTP_PASS=your-password
FRONTEND_URL=http://localhost:3000
```

**Frontend** (`.env.local`):
```
NEXT_PUBLIC_API_URL=http://localhost:4000
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

### Seed Database

```bash
cd backend
npm run seed
```

Default admin credentials:
- Email: `admin@kamancha.am`
- Password: `Admin@Kamancha2024`

### Run Tests

```bash
cd backend
npm test
```

## Pages

| Route | Description |
|-------|-------------|
| `/` | Home — hero, popular dishes, music countdown |
| `/menu` | Interactive menu with filters |
| `/booking` | Table reservation with availability check |
| `/about` | Restaurant story, founder, team |
| `/gallery` | Photo gallery with masonry layout |
| `/events` | Live music and special evenings |
| `/reviews` | Guest reviews (TripAdvisor + Google) |
| `/delivery` | Online order with cart |
| `/admin` | Protected admin dashboard |

## API Endpoints

```
GET    /health
GET    /api/menu
GET    /api/menu/categories
GET    /api/menu/:category
POST   /api/reservations
GET    /api/reservations/check
GET    /api/reviews
GET    /api/gallery
GET    /api/events
POST   /api/admin/login
GET    /api/admin/reservations (protected)
PATCH  /api/admin/reservations/:id (protected)
POST   /api/admin/menu (protected)
PUT    /api/admin/menu/:id (protected)
DELETE /api/admin/menu/:id (protected)
GET    /api/admin/gallery (protected)
POST   /api/admin/gallery (protected)
DELETE /api/admin/gallery/:id (protected)
GET    /api/admin/events (protected)
POST   /api/admin/events (protected)
DELETE /api/admin/events/:id (protected)
GET    /api/admin/stats (protected)
```

## Languages

Supports 10 languages: Armenian (hy), English (en), Russian (ru), French (fr), German (de), Italian (it), Spanish (es), Chinese (zh), Hindi (hi), Arabic (ar).

RTL support for Arabic.

---

# Կամանչա Ռեստորան

Կամանչա ռեստորանի (Երևան, Թումանյան 23) պրոֆեսիոնալ full-stack վեբ կայք:

## Տեխ. Կույտ

- **Frontend**: Next.js 14 + TypeScript + Tailwind + Framer Motion
- **Backend**: Node.js + Express + REST API
- **DB**: PostgreSQL (Supabase) + MongoDB Atlas
- **Auth**: JWT + bcrypt
- **Deployment**: Docker + docker-compose

## Սկսել

```bash
docker-compose up -d
```

Admin login: `admin@kamancha.am` / `Admin@Kamancha2024`

## Տեղայնացում (10 լեզու)

hy · en · ru · fr · de · it · es · zh · hi · ar
