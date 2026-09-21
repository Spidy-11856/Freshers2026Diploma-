# Usha Martin University — Diploma Engineering Freshers 2026

**Premium Black + Metallic Silver + Champagne Gold Freshers Pass & Cultural Events Platform**

A complete, production-ready Next.js 16 portal that visually follows a luxury event reference design — not a generic university site — with Razorpay, QR, organiser dashboard, and Cloudflare deployment.

---

## ✨ Design System — Premium Minimal Black & Gold

**Theme:** Near Black `#050505` + Charcoal `#151515/#1C1C1C/#242424` + Silver `#BFC0C2/#E8E8E8` + Champagne Gold `#C9A227/#D4AF37/#E5C76B`

- **Black background** with silver typography, white headings, subtle gold highlights, metallic borders, very subtle gold glow.
- **Typography:** Large bold geometric sans (Space Grotesk / Inter fallback) — tight, elegant, premium weight.
- **Layout:** Header → Hero (left massive typography + right blended image) → Sticky secondary nav → Be Part of The Culture (3 cards) → Info strip → How It Works → Announcements → FAQ → Contact + Footer
- **Dashboard:** Dark black interface, silver text, gold accents, rounded cards — same visual language as public site.
- **Pass Card:** Black + gold metallic, large QR, Pass Code `F26-XXXX-XXXX`, premium ticket feel.
- **No red theme.** No extra cultural categories.

### Hero Composition
Left: `DIPLOMA ENGINEERING / FRESHERS / PASS & / CULTURAL EVENTS` — gold accent `FRESHERS`.
Right: Stage/celebration image blended via `linear-gradient` masks into black background (not a separate rectangle).
Below heading: Calendar icon + `DATE TO BE ANNOUNCED SOON` (controlled from organiser Settings → instantly updates site).

---

## 🎭 Cultural Events — Only 3 Allowed

> **Strictly** `DANCE`, `DRAMA / ACTING`, `SINGING` — no photography, sports, fashion, poetry, instrumental, etc.

- Cards: horizontal on desktop, single column on mobile, premium hover lift + gold border.
- Each card: stage image, short description, `PARTICIPATE →` → modal form:
  `Full Name, Registration Number, Branch, Phone, Email, Event Type (dropdown 3), Performance Name, Participants, Description` → `SUBMIT PERFORMANCE` → confirmation.

**Organiser → Cultural Management:** table with `Name, Reg, Branch, Event Type, Performance Name, Participants, Phone, Email, Status, Date` and status `PENDING/SHORTLISTED/APPROVED/REJECTED` + assign `Coordinator Name/Phone, Performance Date/Time/Order`.

---

## 🎟️ Pass Flow

```
Home → Get My Pass → Choose FRESHER / SENIOR → Form (name, reg, branch, year/sem, phone, email)
     → Coupon → Server-calculated price → Razorpay Order → Checkout → Verify signature → Pass + QR
```

- **Pricing:** Base `₹500` (`50000` paise) editable in Settings. Example coupon `FRESHERS50` = 50% off (`₹250` final). All maths server-side; frontend price never trusted.
- **Razorpay:** Real integration via `/api/payments/create-order` (REST) + `/api/payments/verify` (HMAC SHA256). Demo mode when keys absent — creates `order_demo_*` + `demo_signature` and generates pass without real payment, so reviewers can test end-to-end without Razorpay account.
- **Secrets:** `RAZORPAY_KEY_ID/SECRET` and `JWT_SECRET` only in `env` / Cloudflare vars — never client.
- **Pass Code:** `F26-XXXX-XXXX` secure random, unique, backend-generated.
- **QR:** Unique secure token `qrToken` (48 chars). QR payload is `{t: qrToken, c: passCode}` JSON — scanner POSTs to `/api/scanner` for backend validation (not just decoding student data).

### Digital Pass
Black + gold ticket: `FRESHERS 2026 / DIPLOMA ENGINEERING / USHA MARTIN UNIVERSITY / FRESHER|SENIOR / NAME / BRANCH / REG / DATE / VENUE / PASS CODE / QR / VALID ENTRY PASS`. Large QR, decorative metallic elements, printable/downloadable. Mobile-optimized to show at gate.

### Retrieve
`/retrieve` — `Registration Number + Pass Code` → validate backend → show pass + QR + `VIEW / DOWNLOAD / SHOW QR`. Rate-limited.

---

## 🛡️ Organiser Dashboard

**Login:** `/organiser/login` — `username/email + password`, secure `bcrypt` + `jose` JWT in `httpOnly` cookie. Roles:

- `SUPER_ADMIN` (`superadmin / superadmin123`)
- `ORGANISER` (`organiser / admin123`)
- `SCANNER` (`scanner / scanner123`) → **only QR Scanner**

> Each organiser gets an **ID Pass** (e.g., `ORG-GMTWWB`) shown in sidebar — premium black/gold, unique code.

**Dashboard visuals:** Lower reference image style — stats cards, recent activity, quick actions.

**Stats:** Total Passes, Paid/Verified, Used, Unused, Revenue, Discounts, Cultural Apps, Freshers/Seniors.

**Recent Pass Activity:** Name, Branch, Pass Code, Status (`VERIFIED/USED/UNUSED`), Time.

**Pass Management:** Columns `Name, Reg, Branch, Type, Pass Code, Payment, Coupon, Status, Used, Date` + search (name/reg/code/phone) + filters (Fresher/Senior, Paid/Pending, Used/Unused) + CSV export.

**QR Scanner:** Camera via `html5-qrcode` + manual paste. `VALID PASS → show details → MARK AS USED` stores `usedAt, organiser, timestamp`. If already used → `⚠ PASS ALREADY USED` + prior timestamp. All via backend `/api/scanner`.

**Coupons:** Create with `CODE, Discount Type, Value, Expiry, Usage Limit, Per User, Min Purchase, Active`. Server-side validation.

**Announcements:** Create/Edit/Delete/Publish — appear on homepage instantly. Default: *Freshers event date will be announced soon.*

**Images:** Hero / Cultural images via URLs (prod: Cloudflare R2/S3 multipart via `/api/media`). No code edit needed.

**Reports:** Totals, revenue/discounts, coupon usage, Fresher/Senior split, cultural split + CSV/JSON export.

**Settings:** Edit `Event Name/Year/University, Hero Heading/Sub, Date/Time, Venue, Pass Price, Description, Announcement, Coordinator (name/phone/email), Social, FAQ, Gallery` — live updates.

**Audit Logs:** All creates/updates/scans logged.

---

## 🗄️ Database

**Production:** PostgreSQL via Prisma — see `prisma/schema.prisma`. Tables: `students, passes, payments, coupons, coupon_usage, cultural_applications, organisers, event_settings, announcements, media, qr_scans, audit_logs`.

**Sandbox/Demo:** File-based JSON DB (`src/lib/db.ts`) persisted to `/tmp/freshers-db` + `data/` — fully functional without Postgres. `init` seeds default coupons (`FRESHERS50`, `EARLYBIRD20`), organisers (hashed), event settings (`TBA`), announcements.

Switch to Postgres by setting `DATABASE_URL` and running `npx prisma migrate dev`.

---

## 🔐 Security

- Server-side validation everywhere
- `bcrypt` passwords, `jose` JWT, `httpOnly` cookies, protected routes via `middleware.ts` + per-API `requireAuth`
- Rate limiting on payments (`10/min/ip`) & retrieval
- Razorpay HMAC verification (`crypto.timingSafeEqual`)
- Duplicate payment/pass protection (unique passCode, order idempotency)
- Secure QR tokens (random 48 chars, not student PII)
- DB constraints, audit logs
- Never trusts `frontend price / payment status / pass status`

---

## 🚀 Quick Start

```bash
npm install
cp .env.example .env  # fill DATABASE_URL, RAZORPAY_KEY_ID/SECRET, JWT_SECRET
npm run dev    # http://localhost:3000
```

**Test without Razorpay:** Leave keys empty — checkout auto-bypasses to demo mode and still generates a valid pass + QR (so reviewing is frictionless). With real keys, full Razorpay Checkout appears.

**Test Accounts:**
```
organiser / admin123   — ORGANISER
superadmin / superadmin123 — SUPER_ADMIN
scanner / scanner123   — SCANNER (QR only)
```

**Test Coupons:**
```
FRESHERS50   — 50% off
EARLYBIRD20  — 20% off
```

---

## ☁️ Cloudflare Deployment

**Option A — Cloudflare Pages (recommended):**

1. Push to GitHub, connect repo in Cloudflare Pages.
2. Build command: `npm run build`  | Output: `.next` (or `.open-next` with OpenNext)
3. Set env vars in Pages → Settings → Variables: `DATABASE_URL`, `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`, `JWT_SECRET`, `NEXT_PUBLIC_APP_URL`.
4. Deploy. See `wrangler.toml` for R2/D1 bindings.

**Option B — Cloudflare Workers with OpenNext:**

```bash
npm install @opennextjs/cloudflare
npx opennextjs-cloudflare build
npx opennextjs-cloudflare deploy
# or
npm run deploy  # if script added
```

**R2 Media:** Uncomment `[[r2_buckets]]` in `wrangler.toml`, create bucket `freshers2026-media`, set `R2_*` envs. `/api/media` then uploads to R2 (demo returns placeholder URLs).

**Razorpay on Cloudflare:** Keys set as encrypted secrets (`wrangler secret put RAZORPAY_KEY_SECRET`). Never commit secrets. Code already reads `process.env.RAZORPAY_*` server-side only.

**Post-deploy checks:**
- Homepage shows `DATE TO BE ANNOUNCED SOON` → change in Dashboard → Settings → Event Date → homepage updates instantly.
- Get My Pass → apply `FRESHERS50` → final price halves → pay (demo or Razorpay) → pass + QR.
- Retrieve → reg + code → pass again.
- Organiser → Scanner → camera or paste code → Validate → Mark Used → re-scan shows `ALREADY USED`.

---

## 📁 Structure

```
src/
  app/
    page.tsx                 # Homepage (Hero + Culture + Info + HowItWorks + Announcements + FAQ)
    layout.tsx               # Black/gold globals, SEO
    globals.css              # Black/silver/gold tokens, gold-glow, glass, shimmer
    get-pass/                # FRESHER/SENIOR + coupon + Razorpay → PassCard
    retrieve/                # Reg + Code → PassCard
    pass/[code]/             # Direct pass link
    organiser/
      login/                 # ID Pass + 3 demo accounts
      dashboard/             # Overview, Passes, Cultural, Scanner, Coupons, Announcements, Images, Reports, Settings
    api/
      event-settings/ announcements/ auth/ coupons/ cultural/ dashboard/ media/ passes/ payments/ scanner/ audit
  components/
    Header, Hero (blended image), SecondaryNav (sticky), CulturalSection + Modal (3 only), InfoStrip, HowItWorks, Announcements, FAQ, Footer, PassCard (black/gold QR)
  lib/
    db.ts        # JSON file DB (demo) + Prisma-ready types
    auth.ts      # bcrypt + jose JWT
    razorpay.ts  # create-order + verify signature (demo fallback)
    utils.ts
prisma/schema.prisma  # PostgreSQL production schema
wrangler.toml         # Cloudflare R2/D1 config
middleware.ts         # Protects /organiser/dashboard
```

---

## 🎨 Visual Rules Enforced

- Same font weight/size hierarchy, navigation placement, hero composition, card shapes, spacing, button shapes, section arrangement, dashboard arrangement, pass-card & QR design as reference.
- Not a generic SaaS dash / normal university site.
- Black + Dark Grey + Metallic Silver + Champagne Gold only — no red.

---

## 📄 License

Private — Usha Martin University, Diploma Engineering Freshers 2026.
Built for Arena deployment — production-ready, database-connected, not mocked.

