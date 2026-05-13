# KAMANCHA RESTAURANT — Full Website Project

## Ինչ ես ստեղծում
Կամանչա ռեստորանի (Երևան, Թումանյան 23) 
պրոֆեսիոնալ full-stack վեբ կայք։
TripAdvisor Yerevan #3, 75K Instagram followers։
Ոչ մի ժամ կանգ մի առ — աշխատիր մինչև ամեն ինչ 
պատրաստ լինի ու tests-ը pass անեն։

## Tech Stack
- Frontend: Next.js 14 + TypeScript + Tailwind + Framer Motion
- Backend: Node.js + Express + REST API
- DB1: PostgreSQL via Supabase (reservations, users, auth)
- DB2: MongoDB Atlas (menu items, gallery, reviews)
- Cache: Redis
- Auth: JWT + bcrypt
- Email: Nodemailer
- Deploy: Docker + docker-compose
- CI/CD: GitHub Actions

## Security (ՊԱՐՏԱԴԻՐ)
- Helmet.js բոլոր routes-ի վրա
- Rate limiting (express-rate-limit)
- CSRF tokens բոլոր form-երի վրա
- Input validation + sanitization (Joi/Zod)
- XSS prevention
- SQL injection protection (parameterized queries)
- HTTPS redirect middleware
- JWT refresh token rotation
- Admin routes — separate middleware

## Գույներ (CSS variables-ում)
--color-primary: #5C1A1A (մուգ բորդո)
--color-accent: #C8860A (ոսկի/amber)
--color-bg: #F5ECD7 (ivory)
--color-text: #2C1810 (մուգ շագանակ)
--color-secondary: #4A5E3A (Armenian green)

## Լեզուներ (next-i18n)
hy, en, ru, fr, de, it, es, zh, hi, ar
Default: hy (հայերեն)
RTL support: ar

## Pages
1. / — Home: hero section, live music countdown, top dishes, CTA
2. /menu — Interactive menu, category filter, search, photos
3. /booking — Reservation form, hall selector, date/time picker, 
               real-time availability check
4. /about — Restaurant story, Areg (founder @restormania), team
5. /gallery — Masonry grid, filter by food/interior/events
6. /delivery — Online order, cart, checkout
7. /events — Music schedule, special evenings
8. /reviews — TripAdvisor + Google reviews integrated
9. /admin — Protected dashboard: bookings management, 
            menu CRUD, gallery upload

## Database Schema (PostgreSQL)
Tables: users, reservations, halls, timeslots, admin_users
Reservations: id, name, phone, email, date, time, 
              guests, hall_id, status, confirmation_code, created_at

## Database Schema (MongoDB)
Collections: menu_items, categories, gallery, reviews, events
MenuItem: name (10 langs), description (10 langs), 
          price, category, image_url, is_available, is_popular

## API Endpoints
POST /api/reservations — create booking + send confirmation email
GET  /api/reservations/check — check availability
GET  /api/menu — all menu items (with lang param)
GET  /api/menu/:category
POST /api/admin/login
GET  /api/admin/reservations — all bookings (protected)
PATCH /api/admin/reservations/:id — update status (protected)
POST /api/admin/menu — add menu item (protected)
GET  /api/reviews — aggregated reviews

## Email System
Confirmation email after booking:
- Հայերեն/English/Russian/etc կախված user-ի լեզվից
- Booking details + confirmation code
- Restaurant info + map link

## Ֆայլային կառուցվածք
kamancha-website/
  ├── frontend/ (Next.js)
  │   ├── app/[locale]/
  │   ├── components/
  │   │   ├── ui/ (Button, Input, Modal...)
  │   │   ├── layout/ (Navbar, Footer)
  │   │   └── sections/ (Hero, Menu, Booking...)
  │   ├── lib/ (api calls, utils)
  │   ├── public/images/
  │   └── i18n/locales/ (hy.json, en.json, ru.json...)
  ├── backend/
  │   ├── routes/
  │   ├── controllers/
  │   ├── models/ (Mongoose + Prisma)
  │   ├── middleware/ (auth, rateLimit, security)
  │   ├── utils/ (email, validation)
  │   └── config/
  ├── docker-compose.yml
  └── .github/workflows/deploy.yml

## Կանոններ
1. Ամեն feature-ի համար test գրիր (Jest + Supertest)
2. Ամեն մեծ քայլից հետո git commit + push արա
3. Error-ի դեպքում ուղղիր, մի կանգ առ
4. Console.log-ները մաքրիր production build-ից
5. Env variables — .env ֆայլում, secrets — .gitignore-ում
6. README.md-ը վերջում գրիր հայերեն + անգլերեն

## Հաջորդականություն
1. Project structure + Docker setup
2. Backend — Express + security middleware + DB connections
3. Database schemas + seed data (sample menu items 10 langs)
4. API routes + tests
5. Frontend — layout, navbar, footer, i18n setup
6. Home page
7. Menu page
8. Booking system (frontend + backend)
9. Gallery, About, Events
10. Admin panel
11. Delivery/order system
12. Email system
13. Final tests + build check
14. README.md
15. git push
