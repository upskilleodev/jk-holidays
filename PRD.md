# JK Holidays — Product Requirements Document (PRD)

> Status: Pre-implementation  
> Last updated: 4 August 2026  
> Reference UI inspiration: [dream-luxe-journeys.vercel.app](https://dream-luxe-journeys.vercel.app/)

---add 

## 1. Product Overview

**JK Holidays** is a **luxury travel package marketplace** with:

1. A **premium public website** that showcases travel package plans
2. A **user account area** for signup/login, purchase requests, and referrals
3. An **admin dashboard** to manage packages, users, purchase approvals, and referral cashback rules

### Product type

This is **not** a full online payment checkout product in v1.

It is a **content + inquiry commerce + admin operations** platform:

- Guests browse package details freely (marketplace-style discovery)
- Logged-in users submit a **purchase request** for a package plan
- Admin manually collects payment, then **approves** the request to make the purchase **active**
- Users can earn **cashback** via a referral program (cashback amount/rules configured by admin)

### What a “purchase” means

A purchase is buying a **package plan** — a curated travel product that includes multiple benefits such as:

- Hotel stays
- Food / meals
- Trekking
- Tourism activities
- Other inclusions defined per package

It is **not** merely booking a single trip seat. It is purchasing a full packaged holiday plan.

---

## 2. Goals

### Business goals

- Present JK Holidays as a premium luxury travel brand
- Convert website visitors into registered users and package purchase requests
- Give admin full control over packages, approvals, and referral cashback
- Support growth through a referral / cashback program

### Product goals

- Pixel-quality luxury landing experience inspired by the reference site
- Clean separation between public marketplace, user account, and admin ops
- Inquiry-based purchase flow with manual payment + admin approval
- Placeholder-friendly branding/content so copy, images, and colors can be updated later

### Design goals

- Cool, premium, luxury travel aesthetic on the landing page
- Smooth animations, refined typography, strong visual hierarchy
- Mobile, tablet, and desktop responsive
- Fast loading and SEO-friendly structure
- Imagery/graphics may be generated (e.g. via OpenAI) where needed for design quality

---

## 3. Scope

### In scope (v1)

- Public luxury website (landing + package marketplace pages/sections)
- User authentication (signup / login)
- User purchase request + purchase status view
- Referral code generation + usage during signup/purchase flow
- Admin dashboard for:
  - Package CRUD (create/update/publish packages shown on website)
  - Registered users list
  - Purchase request review / approve / reject (or equivalent status updates)
  - Referral cashback configuration
- MongoDB as the database
- SEO-ready metadata
- Documentation for running and editing the project

### Out of scope (v1)

- Automated payment gateway / online card checkout
- Multi-purchase history per user (rule: **1 user = 1 purchase**)
- Complex loyalty tiers beyond referral cashback
- Mobile native apps
- Multi-language / multi-currency (unless added later)

---

## 4. Clarified Product Rules

| Topic | Decision |
|---|---|
| Referral reward | **Cashback**, amount/rules configurable by admin in dashboard |
| Guest browsing | Allowed — website is a marketplace to show package details |
| Purchase without login | Purchase request requires signup/login |
| Purchase quantity | **1 user = 1 purchase** (one active/requested package relationship per user) |
| What is purchased | A **package plan** with bundled benefits (hotels, food, trekking, activities, etc.) |
| Payment | Manual collection by admin; approval activates purchase |
| Database | **MongoDB** |
| Branding | Placeholder brand/content/images initially; replaceable later |
| Design bar | Premium luxury landing; cool visual identity; AI-generated images/graphics allowed |

---

## 5. User Roles

### 5.1 Guest (unauthenticated)

- Browse landing page and package marketplace
- View package details, pricing, inclusions/benefits
- Navigate about, services, gallery, testimonials, contact
- Can start signup / login

### 5.2 User (authenticated)

- Register with: **full name**, **email**, **password**
- Optionally enter a **referral code** during signup (and/or purchase flow)
- Submit **one** purchase request for a package plan
- View purchase status (e.g. pending / approved-active / rejected)
- View / share personal referral code
- View referral-related cashback info (as applicable once admin configures and system records it)

### 5.3 Admin

- Secure admin login
- Create / edit / publish / unpublish travel packages
- View registered users
- View purchase requests and related user + package details
- Manually mark payment collected and **approve** purchase → status becomes **active**
- Reject / cancel requests if needed
- Configure referral cashback rules/amounts
- Manage basic site-facing content if needed (future-friendly; packages are primary CMS)

---

## 6. Experience Map

### 6.1 Public website (marketplace + brand)

Inspired by the reference luxury journeys site, with original JK Holidays placeholders.

#### Landing page (must feel premium)

First viewport / overall experience should feel high-end:

- Strong brand presence
- Expressive typography
- Atmospheric backgrounds / full-bleed hero imagery
- Smooth motion (scroll + section transitions)
- Minimal clutter; one job per section

Suggested sections:

1. **Responsive navigation**
2. **Hero** — brand, short headline, CTA(s), dominant luxury imagery, animations
3. **Featured destinations / packages** — cards or editorial layout linking to details
4. **Why us / advantages** — benefits of buying a package plan
5. **About**
6. **Services / inclusions overview**
7. **Gallery**
8. **Testimonials**
9. **Contact / inquiry form** (general contact; separate from package purchase request)
10. **Footer** with social links

#### Package marketplace behavior

- Guests can explore packages and see details/pricing without logging in
- CTA on package: **Request purchase / Buy plan** → prompts login/signup if needed
- After auth, user submits purchase request for that package

### 6.2 Auth experience

**Signup fields**

- Full name
- Email
- Password
- Referral code (optional)

**Login fields**

- Email
- Password

Post-login destinations:

- If no purchase yet → package browse / selected package purchase flow
- If purchase exists → user dashboard showing purchase status + referral info

### 6.3 User dashboard (lightweight)

- Profile summary (name, email)
- Current purchase status (only one purchase relationship)
- Package summary if requested/approved
- Referral code + share action
- Cashback status / amount (when applicable)

### 6.4 Purchase / inquiry flow

1. User views package details (price, benefits, itinerary-like inclusions)
2. User clicks purchase / request
3. If not logged in → signup/login
4. System enforces **1 user = 1 purchase**
   - If user already has a pending/active purchase → block new request with clear message
5. User confirms request (referral code applied if provided and valid)
6. Request appears in admin panel as **Pending**
7. Admin contacts user / collects payment manually
8. Admin approves → purchase becomes **Active**
9. User dashboard reflects active package plan

### 6.5 Referral + cashback flow

1. Every registered user gets a unique referral code
2. User A shares code
3. User B signs up with code and/or uses it when purchasing
4. When User B’s purchase is approved/activated, referral conversion is counted
5. Cashback for referrer is calculated from **admin-configured rules**
6. Admin can view / manage cashback outcomes (at minimum: configured value + earned records)

> Exact cashback payout mechanics (wallet vs offline settlement) can be admin-operated in v1; system must track entitlement and status.

### 6.6 Admin dashboard experience

Modules:

1. **Overview** — counts (users, pending requests, active purchases, packages)
2. **Packages** — create/edit package plans shown on website
3. **Purchase requests** — approve/reject, mark payment collected
4. **Users** — registered users list + purchase/referral summary
5. **Referrals / Cashback settings** — configure cashback amount or percentage/rules
6. **Auth** — admin-only access

---

## 7. Functional Requirements

### 7.1 Public site

- Responsive navbar + mobile menu
- Luxury animated hero
- Packages listing sourced from DB (published only)
- Package detail page/section with price + benefits/inclusions
- About, services, gallery, testimonials, contact
- Smooth scrolling / page animations
- SEO metadata (title, description, Open Graph basics)
- Contact form submission (store and/or notify; at minimum persist in DB for admin visibility if implemented)

### 7.2 Packages (Admin-managed)

Each package should support fields such as:

- Title
- Short description
- Long description
- Cover image / gallery images
- Price
- Duration (e.g. days/nights)
- Location / destination
- Benefits / inclusions (hotel, food, trekking, activities, etc.)
- Highlights
- Published status (draft / published)
- Sort order / featured flag (optional but useful)
- Created/updated timestamps

Published packages appear on the main website.

### 7.3 Auth

- User signup/login with name, email, password
- Password hashing
- Session or JWT-based auth
- Protected user routes
- Protected admin routes
- Unique email constraint

### 7.4 Purchases

Statuses (minimum):

- `pending` — request submitted, awaiting admin
- `active` — payment collected + admin approved
- `rejected` — admin declined
- `cancelled` — optional

Rules:

- One purchase document/relationship per user
- Purchase stores: user, package, price snapshot, referral code used (if any), status, timestamps, admin notes (optional)

### 7.5 Referrals & cashback

- Auto-generate unique referral code per user
- Validate referral code on signup/purchase
- Prevent self-referral
- Admin-configurable cashback (amount and/or % — final schema during implementation)
- Create cashback record when referred purchase becomes active
- Admin visibility into referral conversions and cashback statuses

### 7.6 Admin operations

- CRUD packages
- List/filter purchase requests
- Approve purchase (implies payment collected manually)
- Reject purchase with optional reason
- List users
- Configure cashback settings
- Dashboard metrics

---

## 8. Non-Functional Requirements

- **Performance**: fast landing, optimized images
- **Responsiveness**: mobile / tablet / desktop
- **SEO**: semantic structure + metadata
- **Security**: hashed passwords, protected admin, validated inputs
- **Maintainability**: clean reusable component structure
- **Deployability**: deployment-ready Next.js build
- **Cross-browser**: modern evergreen browsers
- **Content flexibility**: placeholders for brand, copy, colors, images

---

## 9. Technical Requirements

### Stack

| Layer | Choice |
|---|---|
| Framework | React + Next.js |
| Styling | Tailwind CSS |
| Animation | Framer Motion (or equivalent) |
| Database | **MongoDB** |
| Auth | Email/password (secure hashing + session/JWT) |
| Images / graphics | Optimized assets; OpenAI may be used to generate relevant luxury travel imagery/graphics for design |
| Hosting | Deployment-ready (Vercel-friendly assumed) |

### Architecture principles

- App Router (preferred unless project constraints say otherwise)
- Clear folder structure: `components`, `app` routes, `lib`, `models`/`schemas`, `actions` or API routes
- Server-side data fetching for packages where useful (SEO)
- Client components for interactive UI / animations
- Environment variables for MongoDB URI, auth secrets, OpenAI key (for image generation tooling), etc.

### Suggested high-level data models

#### User
- name
- email
- passwordHash
- role (`user` | `admin`)
- referralCode
- referredBy (user id / code reference)
- createdAt

#### Package
- title, slug
- summary, description
- price
- duration
- destination
- inclusions/benefits[]
- images[]
- isFeatured
- status (`draft` | `published`)
- timestamps

#### Purchase
- userId
- packageId
- priceSnapshot
- referralCodeUsed
- status (`pending` | `active` | `rejected` | `cancelled`)
- adminNote
- timestamps / approvedAt

#### CashbackSetting
- type (`fixed` | `percentage`)
- value
- isActive
- updatedBy / updatedAt

#### CashbackReward
- referrerUserId
- referredUserId
- purchaseId
- amount
- status (`pending` | `approved` | `paid` | `cancelled`)
- timestamps

#### ContactMessage (optional)
- name, email, message, createdAt

---

## 10. Information Architecture / Routes (Draft)

### Public

- `/` — luxury landing page
- `/packages` — marketplace listing
- `/packages/[slug]` — package detail
- `/about` — optional dedicated page or landing section
- `/contact` — optional dedicated page or landing section
- `/login`
- `/signup`

### User

- `/dashboard` — purchase status, referral code, profile summary

### Admin

- `/admin` — overview
- `/admin/packages`
- `/admin/packages/new`
- `/admin/packages/[id]/edit`
- `/admin/purchases`
- `/admin/users`
- `/admin/referrals` (cashback settings + records)

Exact route structure may be refined during implementation while preserving this IA.

---

## 11. UI / UX Design Notes

### Landing page bar

Must feel like a **cool luxury premium travel brand site**, not a generic template.

Guidelines:

- Brand-first hero composition
- Full-bleed / dominant visual plane for hero
- Expressive fonts (avoid default generic stacks)
- Atmospheric backgrounds (gradients, imagery, subtle patterns) — not flat single-color pages
- Intentional motion (at least a few meaningful animations)
- One purpose per section
- Cards only when they aid interaction/understanding (e.g. package selection)
- Highly responsive across breakpoints

### Content strategy for v1

Use placeholders for:

- Brand name/logo treatment
- Package titles/copy
- Images (AI-generated luxury travel visuals acceptable)
- Testimonials
- Contact details / social links

Structure should make later content replacement easy (centralized content/config or CMS-like admin package fields).

### Reference

Visual/UX inspiration: [https://dream-luxe-journeys.vercel.app/](https://dream-luxe-journeys.vercel.app/)

Clone the **design quality, layout language, animation feel, and responsiveness** — not the original brand assets/content.

---

## 12. Deliverables

1. Complete Next.js source code
2. MongoDB-backed data layer
3. Public luxury website (responsive)
4. User auth + dashboard
5. Admin dashboard modules
6. Inquiry purchase + approval flow
7. Referral cashback foundation (admin-configurable)
8. Deployment-ready build
9. Clean folder structure
10. Documentation for running and editing (`README.md`)

---

## 13. Success Criteria

- Landing page looks premium and distinctive on first viewport
- Packages created in admin appear correctly on the website
- Guests can browse package details without login
- Users can sign up/login and submit one purchase request
- Admin can approve and activate purchases after manual payment
- Referral codes work and cashback rules are admin-configurable
- Site is responsive and animation quality matches luxury expectations
- Project runs locally with documented setup (MongoDB + env vars)

---

## 14. Open Items / Later Decisions

These do not block PRD sign-off, but should be decided during implementation:

1. Cashback config shape: fixed amount vs percentage vs both
2. Whether cashback becomes “payable” only after referred purchase is `active`
3. Admin creation method (seed script vs first-run setup)
4. Contact form delivery (DB only vs email notification)
5. Image storage approach (local/public, cloud storage, or generated asset pipeline)
6. Whether package detail is multi-page or single-page sections only
7. Exact legal/terms copy for referral cashback

---

## 15. Implementation Phases (Recommended)

### Phase 1 — Foundation
- Next.js + Tailwind + Framer Motion setup
- MongoDB connection + base models
- Design system tokens / luxury UI foundation
- Landing page shell

### Phase 2 — Marketplace + content
- Package models + public listing/detail
- Landing sections (about, services, gallery, testimonials, contact)
- AI/generated imagery integration where needed

### Phase 3 — Auth + user purchase
- Signup/login
- User dashboard
- Purchase request flow + 1-purchase rule

### Phase 4 — Admin
- Admin auth/guard
- Package CRUD
- Purchases approval workflow
- Users list

### Phase 5 — Referrals
- Referral codes
- Admin cashback settings
- Reward recording on approved referred purchases

### Phase 6 — Polish
- Animation/responsive QA
- SEO metadata
- README / runbook
- Deployment prep

---

## 16. One-line Product Summary

**JK Holidays is a luxury travel package marketplace where guests explore premium package plans, users request a single purchase for admin approval after manual payment, and referrers earn admin-configured cashback — all powered by Next.js and MongoDB.**
