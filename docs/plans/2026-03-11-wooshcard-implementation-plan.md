# WooshCard Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build a virtual credit card issuance platform (WooshCard) with Google login, WooshPay payment, card management, and admin dashboard.

**Architecture:** Next.js 14 App Router monolith with Prisma ORM on Neon PostgreSQL. NextAuth.js for Google SSO. WooshPay hosted checkout for payments. next-intl for i18n. shadcn/ui + Tailwind for UI.

**Tech Stack:** Next.js 14, React, TypeScript, Tailwind CSS, shadcn/ui, Framer Motion, Prisma, PostgreSQL (Neon), NextAuth.js, WooshPay API, next-intl, Vercel

---

## Task 1: Project Scaffolding & Configuration

**Files:**
- Create: `package.json`, `tsconfig.json`, `tailwind.config.ts`, `next.config.mjs`, `postcss.config.mjs`
- Create: `.env.example`, `.gitignore`
- Create: `src/app/layout.tsx`, `src/app/page.tsx`, `src/app/globals.css`

**Step 1: Initialize Next.js project**

Run:
```bash
npx create-next-app@14 . --typescript --tailwind --eslint --app --src-dir --import-alias "@/*" --use-npm
```

**Step 2: Install core dependencies**

Run:
```bash
npm install prisma @prisma/client next-auth @auth/prisma-adapter next-intl framer-motion lucide-react @wooshpay/sdk clsx tailwind-merge class-variance-authority
npm install -D @types/node
```

**Step 3: Install shadcn/ui**

Run:
```bash
npx shadcn-ui@latest init
```
Choose: Style=Default, Color=Slate, CSS variables=Yes

**Step 4: Add shadcn components we need**

Run:
```bash
npx shadcn-ui@latest add button card input label select dialog table tabs badge dropdown-menu sheet separator avatar toast progress
```

**Step 5: Create `.env.example`**

```env
# Database
DATABASE_URL="postgresql://user:pass@host:5432/wooshcard?sslmode=require"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="generate-a-secret-here"

# Google OAuth
GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""

# WooshPay
WOOSHPAY_API_KEY=""
WOOSHPAY_WEBHOOK_SECRET=""
WOOSHPAY_API_URL="https://api.wooshpay.com"
```

**Step 6: Update `.gitignore` to include `.env`**

Ensure `.env` and `.env.local` are in `.gitignore`.

**Step 7: Commit**

```bash
git add -A
git commit -m "chore: scaffold Next.js project with core dependencies"
```

---

## Task 2: Prisma Schema & Database Setup

**Files:**
- Create: `prisma/schema.prisma`
- Create: `src/lib/prisma.ts`

**Step 1: Initialize Prisma**

Run:
```bash
npx prisma init
```

**Step 2: Write Prisma schema**

File: `prisma/schema.prisma`

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

enum Role {
  USER
  ADMIN
}

enum CardNetwork {
  VISA
  MASTERCARD
}

enum CardScenario {
  AMAZON
  CHATGPT
  CLAUDE
}

enum CardStatus {
  ACTIVE
  FROZEN
  CANCELLED
}

enum TransactionType {
  CARD_OPEN
  CUSTOM_LAST_FOUR
  RECHARGE
  CONSUMPTION
}

enum TransactionStatus {
  PENDING
  SUCCESS
  FAILED
}

model Account {
  id                String  @id @default(cuid())
  userId            String
  type              String
  provider          String
  providerAccountId String
  refresh_token     String? @db.Text
  access_token      String? @db.Text
  expires_at        Int?
  token_type        String?
  scope             String?
  id_token          String? @db.Text
  session_state     String?
  user              User    @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([provider, providerAccountId])
}

model Session {
  id           String   @id @default(cuid())
  sessionToken String   @unique
  userId       String
  expires      DateTime
  user         User     @relation(fields: [userId], references: [id], onDelete: Cascade)
}

model User {
  id            String    @id @default(cuid())
  name          String?
  email         String?   @unique
  emailVerified DateTime?
  image         String?
  role          Role      @default(USER)
  locale        String    @default("en")
  balance       Decimal   @default(0) @db.Decimal(10, 2)
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
  accounts      Account[]
  sessions      Session[]
  cards         Card[]
  transactions  Transaction[]
}

model VerificationToken {
  identifier String
  token      String   @unique
  expires    DateTime

  @@unique([identifier, token])
}

model Card {
  id             String       @id @default(cuid())
  userId         String
  network        CardNetwork
  scenario       CardScenario
  bin            String
  cardNumber     String       @unique
  lastFour       String
  customLastFour Boolean      @default(false)
  cvv            String
  expMonth       Int
  expYear        Int
  balance        Decimal      @default(0) @db.Decimal(10, 2)
  status         CardStatus   @default(ACTIVE)
  createdAt      DateTime     @default(now())
  user           User         @relation(fields: [userId], references: [id], onDelete: Cascade)
  transactions   Transaction[]

  @@index([userId])
}

model Transaction {
  id              String            @id @default(cuid())
  userId          String
  cardId          String?
  type            TransactionType
  amount          Decimal           @db.Decimal(10, 2)
  description     String
  status          TransactionStatus @default(PENDING)
  wooshpayOrderId String?
  createdAt       DateTime          @default(now())
  user            User              @relation(fields: [userId], references: [id], onDelete: Cascade)
  card            Card?             @relation(fields: [cardId], references: [id])

  @@index([userId])
  @@index([cardId])
}

model CardBinConfig {
  id                String       @id @default(cuid())
  network           CardNetwork
  scenario          CardScenario
  bin               String
  openFee           Decimal      @default(5) @db.Decimal(10, 2)
  customLastFourFee Decimal      @default(10) @db.Decimal(10, 2)
  description       String       @default("")
  isActive          Boolean      @default(true)
  createdAt         DateTime     @default(now())
  updatedAt         DateTime     @updatedAt

  @@unique([network, scenario])
}
```

**Step 3: Create Prisma client singleton**

File: `src/lib/prisma.ts`

```typescript
import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient }

export const prisma = globalForPrisma.prisma || new PrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
```

**Step 4: Generate Prisma client and push schema**

Run:
```bash
npx prisma generate
npx prisma db push
```

**Step 5: Create seed script for default CardBinConfig data**

File: `prisma/seed.ts`

```typescript
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const configs = [
    { network: 'VISA' as const, scenario: 'AMAZON' as const, bin: '431940', openFee: 5, customLastFourFee: 10, description: 'Visa card for Amazon purchases' },
    { network: 'VISA' as const, scenario: 'CHATGPT' as const, bin: '433210', openFee: 5, customLastFourFee: 10, description: 'Visa card for ChatGPT subscription' },
    { network: 'VISA' as const, scenario: 'CLAUDE' as const, bin: '435760', openFee: 5, customLastFourFee: 10, description: 'Visa card for Claude subscription' },
    { network: 'MASTERCARD' as const, scenario: 'AMAZON' as const, bin: '559666', openFee: 5, customLastFourFee: 10, description: 'Mastercard for Amazon purchases' },
    { network: 'MASTERCARD' as const, scenario: 'CHATGPT' as const, bin: '552830', openFee: 5, customLastFourFee: 10, description: 'Mastercard for ChatGPT subscription' },
    { network: 'MASTERCARD' as const, scenario: 'CLAUDE' as const, bin: '556120', openFee: 5, customLastFourFee: 10, description: 'Mastercard for Claude subscription' },
  ]

  for (const config of configs) {
    await prisma.cardBinConfig.upsert({
      where: { network_scenario: { network: config.network, scenario: config.scenario } },
      update: config,
      create: config,
    })
  }

  console.log('Seed data created')
}

main()
  .catch((e) => { console.error(e); process.exit(1) })
  .finally(() => prisma.$disconnect())
```

Add to `package.json`:
```json
"prisma": { "seed": "npx ts-node --compiler-options {\"module\":\"CommonJS\"} prisma/seed.ts" }
```

Run:
```bash
npx prisma db seed
```

**Step 6: Commit**

```bash
git add prisma/ src/lib/prisma.ts package.json
git commit -m "feat: add Prisma schema with User, Card, Transaction, CardBinConfig models"
```

---

## Task 3: Authentication (NextAuth.js + Google)

**Files:**
- Create: `src/app/api/auth/[...nextauth]/route.ts`
- Create: `src/lib/auth.ts`
- Create: `src/components/auth/login-button.tsx`
- Create: `src/components/auth/user-menu.tsx`
- Create: `src/providers/session-provider.tsx`

**Step 1: Create auth config**

File: `src/lib/auth.ts`

```typescript
import { NextAuthOptions } from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'
import { PrismaAdapter } from '@auth/prisma-adapter'
import { prisma } from '@/lib/prisma'

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma) as any,
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async session({ session, user }) {
      if (session.user) {
        const dbUser = await prisma.user.findUnique({ where: { id: user.id } })
        session.user.id = user.id
        session.user.role = dbUser?.role || 'USER'
        session.user.locale = dbUser?.locale || 'en'
      }
      return session
    },
  },
  pages: {
    signIn: '/',
  },
}
```

**Step 2: Create API route**

File: `src/app/api/auth/[...nextauth]/route.ts`

```typescript
import NextAuth from 'next-auth'
import { authOptions } from '@/lib/auth'

const handler = NextAuth(authOptions)
export { handler as GET, handler as POST }
```

**Step 3: Create session provider**

File: `src/providers/session-provider.tsx`

```typescript
'use client'
import { SessionProvider } from 'next-auth/react'

export function AuthProvider({ children }: { children: React.ReactNode }) {
  return <SessionProvider>{children}</SessionProvider>
}
```

**Step 4: Create LoginButton and UserMenu components**

Basic Google sign-in button and user avatar dropdown.

**Step 5: Add NextAuth type augmentation**

File: `src/types/next-auth.d.ts`

```typescript
import { DefaultSession } from 'next-auth'

declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      role: string
      locale: string
    } & DefaultSession['user']
  }
}
```

**Step 6: Wrap root layout with AuthProvider**

**Step 7: Commit**

```bash
git add src/app/api/auth/ src/lib/auth.ts src/providers/ src/components/auth/ src/types/
git commit -m "feat: add Google OAuth login with NextAuth.js"
```

---

## Task 4: Internationalization (next-intl)

**Files:**
- Create: `src/i18n.ts`
- Create: `src/messages/en.json`
- Create: `src/messages/zh.json`
- Modify: `next.config.mjs`
- Modify: `src/app/layout.tsx`
- Create: `src/middleware.ts`

**Step 1: Configure next-intl**

File: `src/i18n.ts` — setup `getRequestConfig` with locale detection from user session or browser.

**Step 2: Create message files**

`src/messages/en.json` and `src/messages/zh.json` with keys for all UI text:
- nav, landing, dashboard, cards, transactions, admin, common

**Step 3: Add middleware for locale handling**

**Step 4: Update layout to wrap with NextIntlClientProvider**

**Step 5: Commit**

```bash
git add src/i18n.ts src/messages/ src/middleware.ts next.config.mjs
git commit -m "feat: add i18n support with next-intl (en/zh)"
```

---

## Task 5: Shared Layout & Navigation

**Files:**
- Create: `src/components/layout/header.tsx`
- Create: `src/components/layout/sidebar.tsx`
- Create: `src/components/layout/mobile-nav.tsx`
- Create: `src/components/layout/footer.tsx`
- Create: `src/app/(user)/layout.tsx`
- Create: `src/app/(admin)/layout.tsx`
- Modify: `src/app/globals.css`

**Step 1: Define dark theme CSS variables in globals.css**

Dark blue/grey base, gold/tech-blue accents per design spec.

**Step 2: Build Header component**

Logo (WooshCard), nav links, language switch, UserMenu. Responsive — hamburger on mobile.

**Step 3: Build Sidebar for admin**

Admin nav links: Dashboard, Users, Cards, Transactions, BIN Config, Settings.

**Step 4: Build MobileNav (Sheet-based slide-out menu)**

**Step 5: Create route group layouts**

`(user)/layout.tsx` — Header + main content + footer
`(admin)/layout.tsx` — Header + Sidebar + main content, with admin role check

**Step 6: Commit**

```bash
git add src/components/layout/ src/app/\(user\)/ src/app/\(admin\)/
git commit -m "feat: add shared layouts with header, sidebar, mobile nav"
```

---

## Task 6: Landing Page

**Files:**
- Create: `src/app/(user)/page.tsx`
- Create: `src/components/landing/hero.tsx`
- Create: `src/components/landing/features.tsx`
- Create: `src/components/landing/pricing.tsx`
- Create: `src/components/landing/cta.tsx`

**Step 1: Build Hero section**

"Key to the AI Era" headline, animated particle/grid background using CSS or Framer Motion, Google sign-in CTA button. Dark, grand, impactful.

**Step 2: Build Features section**

3 feature cards: Multi-network support, AI subscription scenarios, Instant virtual cards.

**Step 3: Build Pricing section**

Card opening fee ($5), custom last-four fee (+$10), scenario comparison.

**Step 4: Build CTA section**

Final call-to-action with Google sign-in.

**Step 5: Assemble landing page**

**Step 6: Test mobile responsiveness**

Run `npm run dev`, test at 375px, 768px, 1024px widths.

**Step 7: Commit**

```bash
git add src/app/\(user\)/page.tsx src/components/landing/
git commit -m "feat: add landing page with hero, features, pricing sections"
```

---

## Task 7: User Dashboard

**Files:**
- Create: `src/app/(user)/dashboard/page.tsx`
- Create: `src/components/dashboard/balance-card.tsx`
- Create: `src/components/dashboard/card-list.tsx`
- Create: `src/components/dashboard/quick-actions.tsx`
- Create: `src/components/ui/virtual-card.tsx`

**Step 1: Build VirtualCard UI component**

3D card effect with Framer Motion. Shows masked card number, network logo, scenario badge. Different color schemes per scenario (Amazon=orange-black, ChatGPT=green-black, Claude=orange-brown).

**Step 2: Build BalanceCard**

Shows user wallet balance with currency formatting.

**Step 3: Build CardList**

Grid of VirtualCard components. Empty state with "Apply for your first card" CTA.

**Step 4: Build QuickActions**

Buttons: "Apply New Card", "Recharge".

**Step 5: Build Dashboard page**

Server component, fetch user data + cards via Prisma. Pass to client components.

**Step 6: Commit**

```bash
git add src/app/\(user\)/dashboard/ src/components/dashboard/ src/components/ui/virtual-card.tsx
git commit -m "feat: add user dashboard with balance, card list, quick actions"
```

---

## Task 8: Card Application Flow (Frontend)

**Files:**
- Create: `src/app/(user)/cards/new/page.tsx`
- Create: `src/components/cards/step-network.tsx`
- Create: `src/components/cards/step-scenario.tsx`
- Create: `src/components/cards/step-preview.tsx`
- Create: `src/components/cards/step-custom-last-four.tsx`
- Create: `src/components/cards/step-payment.tsx`
- Create: `src/components/cards/step-success.tsx`
- Create: `src/components/cards/card-application-wizard.tsx`

**Step 1: Build CardApplicationWizard**

Multi-step form with progress bar. State management with React useState. Mobile: one step per screen.

**Step 2: Build StepNetwork**

Select Visa or Mastercard. Large selectable cards with network logos.

**Step 3: Build StepScenario**

Select Amazon / ChatGPT / Claude. Cards with scenario icons and descriptions.

**Step 4: Build StepPreview**

Fetch matching CardBinConfig via API. Display: BIN, network, scenario, open fee ($5). Show preview of what the card will look like.

**Step 5: Build StepCustomLastFour**

Toggle: "Customize last 4 digits (+$10)". If yes, show 4-digit input with validation (0000-9999). Display updated total: $5 or $15.

**Step 6: Build StepPayment**

Show order summary. "Pay with WooshPay" button. On click: call `/api/payments/create`, redirect to WooshPay checkout URL.

**Step 7: Build StepSuccess**

Card created confirmation. Show new card preview. CTA: "Recharge your card now" button.

**Step 8: Commit**

```bash
git add src/app/\(user\)/cards/new/ src/components/cards/
git commit -m "feat: add multi-step card application wizard"
```

---

## Task 9: Card API Routes

**Files:**
- Create: `src/app/api/cards/route.ts`
- Create: `src/app/api/cards/[id]/route.ts`
- Create: `src/app/api/cards/[id]/recharge/route.ts`
- Create: `src/app/api/cards/[id]/simulate-spend/route.ts`
- Create: `src/lib/card-generator.ts`
- Create: `src/lib/api-utils.ts`

**Step 1: Create API utility helpers**

File: `src/lib/api-utils.ts` — `getSessionUser()` helper that returns authenticated user or 401.

**Step 2: Create card number generator**

File: `src/lib/card-generator.ts`

```typescript
// Generate simulated card number from BIN
// generateCardNumber(bin: string, customLastFour?: string): { cardNumber, lastFour, cvv, expMonth, expYear }
// - Pads BIN to 16 digits with random digits (or custom last 4)
// - Generates random 3-digit CVV
// - Sets expiry to 3 years from now
```

**Step 3: Build GET /api/cards**

Return current user's cards, ordered by createdAt desc.

**Step 4: Build POST /api/cards**

Body: `{ network, scenario, customLastFour? }`. Validate inputs. Look up CardBinConfig. Calculate total fee. Create pending Transaction. Return transaction ID for payment.

**Step 5: Build GET /api/cards/[id]**

Return card detail with transactions. Verify ownership.

**Step 6: Build PATCH /api/cards/[id]**

Body: `{ status: 'FROZEN' | 'ACTIVE' }`. Verify ownership.

**Step 7: Build POST /api/cards/[id]/recharge**

Body: `{ amount }`. Validate amount > 0. Create pending RECHARGE Transaction. Return transaction ID for payment.

**Step 8: Build POST /api/cards/[id]/simulate-spend**

Body: `{ amount, description }`. Check `card.balance >= amount`. If insufficient, return 400. Deduct balance. Create CONSUMPTION Transaction.

**Step 9: Commit**

```bash
git add src/app/api/cards/ src/lib/card-generator.ts src/lib/api-utils.ts
git commit -m "feat: add card API routes (CRUD, recharge, simulate spend)"
```

---

## Task 10: WooshPay Payment Integration

**Files:**
- Create: `src/lib/wooshpay.ts`
- Create: `src/app/api/payments/create/route.ts`
- Create: `src/app/api/payments/webhook/route.ts`
- Create: `src/app/(user)/payments/success/page.tsx`
- Create: `src/app/(user)/payments/cancel/page.tsx`

**Step 1: Create WooshPay client wrapper**

File: `src/lib/wooshpay.ts`

```typescript
// createPaymentSession({ amount, currency, description, orderId, returnUrl, cancelUrl })
// => { checkoutUrl, sessionId }
//
// verifyWebhookSignature(payload, signature, secret)
// => boolean
```

Integrate with WooshPay API. Use their hosted checkout flow.

**Step 2: Build POST /api/payments/create**

Body: `{ transactionId }`. Look up pending Transaction. Call WooshPay to create payment session. Store `wooshpayOrderId` on Transaction. Return `{ checkoutUrl }`.

**Step 3: Build POST /api/payments/webhook**

Verify signature. Parse event type (payment.success / payment.failed). Find Transaction by wooshpayOrderId. On success:
- If CARD_OPEN: generate card number, create Card record, update Transaction to SUCCESS
- If RECHARGE: increment Card.balance, update Transaction to SUCCESS
On failure: update Transaction to FAILED.

Use Prisma transaction for atomicity.

**Step 4: Build payment result pages**

`/payments/success` — "Payment successful" with link back to dashboard or card detail.
`/payments/cancel` — "Payment cancelled" with retry option.

**Step 5: Commit**

```bash
git add src/lib/wooshpay.ts src/app/api/payments/ src/app/\(user\)/payments/
git commit -m "feat: integrate WooshPay payment gateway with webhook handling"
```

---

## Task 11: Card Detail & Recharge Pages

**Files:**
- Create: `src/app/(user)/cards/[id]/page.tsx`
- Create: `src/components/cards/card-detail-view.tsx`
- Create: `src/components/cards/recharge-dialog.tsx`
- Create: `src/components/cards/transaction-list.tsx`

**Step 1: Build CardDetailView**

Full card visualization (click to reveal number, copy button). CVV, expiry display. Balance prominently shown. Freeze/unfreeze toggle.

**Step 2: Build RechargeDialog**

Modal dialog. Amount input (minimum $1). Show current balance. "Pay with WooshPay" button triggers payment flow.

**Step 3: Build TransactionList**

Table of transactions for this card. Columns: date, type, amount, status, description. Filterable by type.

**Step 4: Build card detail page**

Server component, fetch card + transactions. Verify ownership.

**Step 5: Commit**

```bash
git add src/app/\(user\)/cards/\[id\]/ src/components/cards/
git commit -m "feat: add card detail page with recharge and transaction history"
```

---

## Task 12: Transaction History Page

**Files:**
- Create: `src/app/(user)/transactions/page.tsx`
- Create: `src/app/api/transactions/route.ts`

**Step 1: Build GET /api/transactions**

Query params: `type`, `page`, `limit`. Return paginated transactions for current user.

**Step 2: Build transactions page**

Table with filters (type dropdown), pagination. Responsive — cards on mobile, table on desktop.

**Step 3: Commit**

```bash
git add src/app/\(user\)/transactions/ src/app/api/transactions/
git commit -m "feat: add transaction history page with filtering"
```

---

## Task 13: User Settings Page

**Files:**
- Create: `src/app/(user)/settings/page.tsx`
- Create: `src/app/api/user/settings/route.ts`

**Step 1: Build PATCH /api/user/settings**

Body: `{ locale }`. Update user locale.

**Step 2: Build settings page**

Profile info display (from Google). Language toggle (en/zh). Save button.

**Step 3: Commit**

```bash
git add src/app/\(user\)/settings/ src/app/api/user/
git commit -m "feat: add user settings page with language toggle"
```

---

## Task 14: Admin Dashboard

**Files:**
- Create: `src/app/(admin)/admin/dashboard/page.tsx`
- Create: `src/app/api/admin/dashboard/route.ts`
- Create: `src/components/admin/stat-card.tsx`
- Create: `src/components/admin/revenue-chart.tsx`
- Create: `src/lib/admin-guard.ts`

**Step 1: Create admin guard utility**

File: `src/lib/admin-guard.ts` — helper that checks session role === ADMIN, returns 403 if not.

**Step 2: Build GET /api/admin/dashboard**

Return stats: total users, today's new users, total cards, today's cards, total transaction amount, today's amount, revenue breakdown (open fees + custom fees).

**Step 3: Build StatCard component**

Reusable stat display card with icon, label, value, trend.

**Step 4: Build admin dashboard page**

Grid of StatCards. Revenue summary.

**Step 5: Commit**

```bash
git add src/app/\(admin\)/ src/app/api/admin/dashboard/ src/components/admin/ src/lib/admin-guard.ts
git commit -m "feat: add admin dashboard with statistics overview"
```

---

## Task 15: Admin User Management

**Files:**
- Create: `src/app/(admin)/admin/users/page.tsx`
- Create: `src/app/api/admin/users/route.ts`
- Create: `src/app/api/admin/users/[id]/route.ts`
- Create: `src/components/admin/user-table.tsx`

**Step 1: Build GET /api/admin/users**

Query params: `search`, `page`, `limit`. Return paginated users with card count.

**Step 2: Build PATCH /api/admin/users/[id]**

Body: `{ role }` or freeze/unfreeze logic.

**Step 3: Build UserTable component**

Searchable, paginated table. Columns: avatar, name, email, role, cards count, balance, joined date, actions (freeze/unfreeze).

**Step 4: Build admin users page**

**Step 5: Commit**

```bash
git add src/app/\(admin\)/admin/users/ src/app/api/admin/users/ src/components/admin/user-table.tsx
git commit -m "feat: add admin user management"
```

---

## Task 16: Admin Card & Transaction Management

**Files:**
- Create: `src/app/(admin)/admin/cards/page.tsx`
- Create: `src/app/(admin)/admin/transactions/page.tsx`
- Create: `src/app/api/admin/cards/route.ts`
- Create: `src/app/api/admin/cards/[id]/route.ts`
- Create: `src/app/api/admin/transactions/route.ts`

**Step 1: Build admin cards API**

GET with filters (network, scenario, status, search). PATCH for status change.

**Step 2: Build admin transactions API**

GET with filters (type, status, dateRange, search).

**Step 3: Build admin cards page**

Table with filters. Actions: freeze, cancel.

**Step 4: Build admin transactions page**

Table with filters and date range picker.

**Step 5: Commit**

```bash
git add src/app/\(admin\)/admin/cards/ src/app/\(admin\)/admin/transactions/ src/app/api/admin/cards/ src/app/api/admin/transactions/
git commit -m "feat: add admin card and transaction management"
```

---

## Task 17: Admin BIN Config Management

**Files:**
- Create: `src/app/(admin)/admin/bin-config/page.tsx`
- Create: `src/app/api/admin/bin-config/route.ts`
- Create: `src/app/api/admin/bin-config/[id]/route.ts`
- Create: `src/components/admin/bin-config-form.tsx`

**Step 1: Build BIN config CRUD API**

GET: list all configs. POST: create new. PATCH: update. DELETE: soft-delete (isActive=false).

**Step 2: Build BinConfigForm**

Dialog form for create/edit. Fields: network (select), scenario (select), bin (input), openFee, customLastFourFee, description, isActive toggle.

**Step 3: Build BIN config page**

Table of configs with edit/toggle actions. "Add New" button opens form dialog.

**Step 4: Commit**

```bash
git add src/app/\(admin\)/admin/bin-config/ src/app/api/admin/bin-config/ src/components/admin/bin-config-form.tsx
git commit -m "feat: add admin BIN config management"
```

---

## Task 18: Middleware & Route Protection

**Files:**
- Modify: `src/middleware.ts`

**Step 1: Add route protection to middleware**

```typescript
// Protected routes:
// /dashboard, /cards/*, /transactions, /settings → require login
// /admin/* → require login + ADMIN role
// /api/admin/* → require ADMIN role
// Public routes: /, /api/auth/*
```

**Step 2: Test protection**

- Unauthenticated access to /dashboard → redirect to /
- Non-admin access to /admin → redirect to /dashboard
- API returns 401/403 appropriately

**Step 3: Commit**

```bash
git add src/middleware.ts
git commit -m "feat: add middleware route protection for user and admin routes"
```

---

## Task 19: Mobile Optimization & Polish

**Files:**
- Modify: various component files

**Step 1: Audit all pages at 375px width**

Check: landing, dashboard, card application, card detail, transactions, settings, admin pages.

**Step 2: Fix responsive issues**

- Tables → card layout on mobile
- Wizard steps → full-screen on mobile
- Touch targets ≥ 44px
- Proper spacing and font sizes

**Step 3: Add loading states**

Skeleton loaders for data-fetching pages.

**Step 4: Add error boundaries**

Global error boundary + per-page error states.

**Step 5: Commit**

```bash
git add -A
git commit -m "feat: mobile optimization and polish (loading states, error handling)"
```

---

## Task 20: Final Integration Testing & Deployment Prep

**Files:**
- Create: `vercel.json` (if needed)
- Modify: `next.config.mjs` (production settings)
- Create: `.env.production.example`

**Step 1: End-to-end flow test**

Test complete flow locally:
1. Google login
2. Apply card (Visa + Amazon)
3. Pay via WooshPay (or mock)
4. Card created
5. Recharge card
6. Simulate spend
7. Check transaction history
8. Admin: view stats, manage users/cards/configs

**Step 2: Prepare for Vercel deployment**

- Set all env vars in Vercel dashboard
- Configure Neon PostgreSQL connection
- Set WooshPay webhook URL to production domain
- Run `npx prisma db push` against production DB

**Step 3: Deploy**

```bash
npx vercel --prod
```

**Step 4: Post-deploy verification**

Test Google login, card creation, payment flow on production.

**Step 5: Commit any remaining changes**

```bash
git add -A
git commit -m "chore: deployment configuration and final adjustments"
```

---

## Summary

| Task | Description | Dependencies |
|------|-------------|--------------|
| 1 | Project Scaffolding | None |
| 2 | Prisma Schema & DB | Task 1 |
| 3 | Authentication | Task 2 |
| 4 | i18n | Task 1 |
| 5 | Shared Layout & Nav | Task 3, 4 |
| 6 | Landing Page | Task 5 |
| 7 | User Dashboard | Task 5 |
| 8 | Card Application (FE) | Task 7 |
| 9 | Card API Routes | Task 2, 3 |
| 10 | WooshPay Integration | Task 9 |
| 11 | Card Detail & Recharge | Task 9, 10 |
| 12 | Transaction History | Task 9 |
| 13 | User Settings | Task 5 |
| 14 | Admin Dashboard | Task 5, 9 |
| 15 | Admin User Mgmt | Task 14 |
| 16 | Admin Card & Txn Mgmt | Task 14 |
| 17 | Admin BIN Config | Task 14 |
| 18 | Middleware Protection | Task 3 |
| 19 | Mobile & Polish | Task 6-17 |
| 20 | Integration Test & Deploy | Task 18, 19 |
