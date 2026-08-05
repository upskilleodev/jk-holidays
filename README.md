# JK Holidays

Luxury travel package marketplace built with **Next.js**, **Tailwind CSS**, **Framer Motion**, and **MongoDB**.

Guests browse packages freely. Users sign up, request one package purchase, and admins approve after collecting payment manually. Referrals earn admin-configurable cashback.

## Features

- Premium public landing page + package marketplace
- User signup/login (name, email, password + optional referral code)
- User dashboard (purchase status + referral code + cashback)
- Admin dashboard:
  - Package CRUD
  - Purchase approval workflow
  - Registered users
  - Referral cashback settings & rewards
- Contact form persistence
- SEO-ready metadata

## Stack

- Next.js (App Router)
- React + TypeScript
- Tailwind CSS
- Framer Motion
- MongoDB + Mongoose
- JWT cookie auth (`jose` + `bcryptjs`)

## Getting started

### 1. Install

```bash
npm install
```

### 2. Environment

Copy `.env.example` to `.env` and fill values:

```bash
MONGODB_URI=your-mongodb-uri
JWT_SECRET=long-random-secret
ADMIN_EMAIL=admin@jkholidays.com
ADMIN_PASSWORD=change-me
OPEN_AI_KEY=
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 3. Seed admin + sample packages

```bash
npm run seed
```

Default admin (unless overridden in `.env`):

- Email: `admin@jkholidays.com`
- Password: `Admin@12345`

### 4. Run locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### 5. Production build

```bash
npm run build
npm start
```

## Key routes

| Route | Purpose |
|---|---|
| `/` | Luxury landing page |
| `/packages` | Marketplace listing |
| `/packages/[slug]` | Package detail + purchase request |
| `/signup` `/login` | Auth |
| `/dashboard` | User area |
| `/admin` | Admin overview |
| `/admin/packages` | Manage packages |
| `/admin/purchases` | Approve / reject requests |
| `/admin/users` | Registered users |
| `/admin/referrals` | Cashback settings + rewards |

## Product rules (v1)

- Guests can browse package details without login
- Purchase request requires login
- **1 user = 1 purchase**
- Purchase is inquiry-based (manual payment + admin approval)
- Referral reward = cashback configured in admin dashboard

## Editing content

- Landing copy/destinations/testimonials: `src/lib/site.ts`
- Brand colors/fonts: `src/app/globals.css` + `src/app/layout.tsx`
- Packages shown on the website: create/edit in `/admin/packages`

## Project structure

```text
src/
  app/                 # pages + API routes
  components/          # UI (home, packages, auth, admin)
  lib/                 # db, auth, utils, site content
  models/              # mongoose models
scripts/seed.ts        # admin + sample packages
PRD.md                 # full product requirements
```

## Notes

- Images currently use Unsplash URLs (replace anytime).
- OpenAI key can be used later for generating custom imagery/graphics.
- Do not commit `.env` (already gitignored).
