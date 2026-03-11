# WooshCard - Product Design Document

## Overview

A virtual credit card issuance platform targeting AI subscription scenarios (Amazon, ChatGPT, Claude). Users sign in with Google, apply for virtual cards with different card networks and scenarios, pay via WooshPay, and manage card balances.

**Brand Name:** WooshCard
**Brand Concept:** "Key to the AI Era" - The key to open the door to the AI era.

## Tech Stack

- **Framework:** Next.js 14 (App Router, full-stack monolith)
- **Frontend:** React + Tailwind CSS + shadcn/ui + Framer Motion
- **ORM:** Prisma
- **Database:** PostgreSQL (Neon)
- **Auth:** NextAuth.js (Google Provider)
- **Payment:** WooshPay (hosted checkout)
- **i18n:** next-intl (en / zh)
- **Deployment:** Vercel + Neon PostgreSQL

## Data Model

### User
| Field | Type | Description |
|-------|------|-------------|
| id | UUID | Primary key |
| email | String | Google email |
| name | String | Display name |
| image | String | Google avatar URL |
| role | Enum (USER, ADMIN) | User role |
| locale | Enum (en, zh) | Preferred language |
| balance | Decimal | Wallet balance (USD) |
| createdAt | DateTime | |
| updatedAt | DateTime | |

### Card
| Field | Type | Description |
|-------|------|-------------|
| id | UUID | Primary key |
| userId | UUID (FK) | Owner |
| network | Enum (VISA, MASTERCARD) | Card network |
| scenario | Enum (AMAZON, CHATGPT, CLAUDE) | Use case |
| bin | String | BIN / card segment (6 digits) |
| cardNumber | String | Full 16-digit simulated card number |
| lastFour | String | Last 4 digits |
| customLastFour | Boolean | Whether user chose custom last 4 |
| cvv | String | Simulated CVV |
| expMonth | Int | Expiry month |
| expYear | Int | Expiry year |
| balance | Decimal | Card balance (USD) |
| status | Enum (ACTIVE, FROZEN, CANCELLED) | Card status |
| createdAt | DateTime | |

### Transaction
| Field | Type | Description |
|-------|------|-------------|
| id | UUID | Primary key |
| userId | UUID (FK) | User |
| cardId | UUID (FK, nullable) | Related card |
| type | Enum (CARD_OPEN, CUSTOM_LAST_FOUR, RECHARGE, CONSUMPTION) | Transaction type |
| amount | Decimal | Amount (USD) |
| description | String | Description |
| status | Enum (PENDING, SUCCESS, FAILED) | Status |
| wooshpayOrderId | String (nullable) | External payment order ID |
| createdAt | DateTime | |

### CardBinConfig
| Field | Type | Description |
|-------|------|-------------|
| id | UUID | Primary key |
| network | Enum (VISA, MASTERCARD) | Card network |
| scenario | Enum (AMAZON, CHATGPT, CLAUDE) | Use case |
| bin | String | BIN / card segment |
| openFee | Decimal | Card opening fee (default $5) |
| customLastFourFee | Decimal | Custom last-four fee (default $10) |
| description | String | Description text |
| isActive | Boolean | Whether this config is available |

### Key Design Decisions
- User wallet balance (`User.balance`) and card balance (`Card.balance`) are separate
- Recharge goes into card balance; consumption only deducts from card balance
- `Card.balance >= amount` check enforced on every spend; no overdraft allowed
- `CardBinConfig` managed by admin; different network + scenario combos map to different BINs and fee structures

## User-Facing Pages

```
/ (Landing Page)
  - Brand: "Key to the AI Era"
  - Feature overview, pricing
  - Google sign-in CTA

/dashboard (User Dashboard)
  - Wallet balance overview
  - My cards list (masked card numbers)
  - Quick actions: new card / recharge

/cards/new (Apply for New Card - stepped form)
  - Step 1: Select network (Visa / Mastercard)
  - Step 2: Select scenario (Amazon / ChatGPT / Claude)
  - Step 3: Show matching BIN + open fee ($5)
  - Step 4: Optional custom last-four (+$10)
  - Step 5: WooshPay checkout
  - Step 6: Success → guide to first recharge

/cards/:id (Card Detail)
  - Full card number (click to reveal/copy), CVV, expiry
  - Card balance, recharge button
  - Transaction history for this card

/transactions (Transaction History)
  - All transactions, filterable by type

/settings (User Settings)
  - Language toggle (en/zh)
  - Profile info
```

## Admin Pages

```
/admin/dashboard - Stats overview (users, cards, transactions, revenue)
/admin/users - User list (search, paginate, freeze/unfreeze)
/admin/cards - All cards (filter by status, scenario, network)
/admin/transactions - All transactions (filter by type, status, date)
/admin/bin-config - BIN config CRUD (network, scenario, bin, fees, toggle)
/admin/settings - System settings
```

### Admin Access Control
- `role` field in NextAuth session
- Middleware intercepts all `/admin` routes; redirects non-ADMIN users
- API routes also validate role

## API Design

```
# Auth
POST /api/auth/[...nextauth]     NextAuth Google login

# Cards (user)
GET    /api/cards                 My cards
POST   /api/cards                 Apply for new card (create order)
GET    /api/cards/:id             Card detail
POST   /api/cards/:id/recharge    Recharge card (create payment)
PATCH  /api/cards/:id             Freeze/unfreeze card

# Transactions (user)
GET    /api/transactions          My transactions (filterable)

# Payments
POST   /api/payments/create       Create WooshPay payment order
POST   /api/payments/webhook      WooshPay callback

# Simulate (MVP only)
POST   /api/cards/:id/simulate-spend   Simulate a card spend

# Admin
GET    /api/admin/dashboard       Stats
GET    /api/admin/users           User list
PATCH  /api/admin/users/:id       Freeze/unfreeze user
GET    /api/admin/cards           All cards
PATCH  /api/admin/cards/:id       Manage card status
GET    /api/admin/transactions    All transactions
CRUD   /api/admin/bin-config      BIN config management
```

## WooshPay Integration Flow

1. User initiates payment (card opening / recharge)
2. Backend calls WooshPay API to create payment order
3. Returns checkout URL to frontend
4. Frontend redirects / opens WooshPay hosted checkout
5. User completes payment
6. WooshPay sends webhook to `/api/payments/webhook`
7. Backend verifies signature, updates order status
8. Card opening: generate simulated card number, create Card record
9. Recharge: increment `Card.balance`
10. Frontend polls or returns via redirect to refresh status

## Frontend Design

### Style
- Dark theme, fintech aesthetic, professional and serious
- Color: dark blue/grey background + gold/tech-blue accents
- Typography: Inter/Geist (en), Noto Sans SC (zh)
- Icons: Lucide Icons

### Card Visuals (3D card effect)
- Amazon → orange-black
- ChatGPT → green-black
- Claude → orange-brown

### Landing Page Hero
- Key + digital door visual metaphor
- Particle/grid animated background

### Component Library
- Tailwind CSS + shadcn/ui
- Framer Motion for transitions
- Mobile-first responsive: mobile (<768px) / tablet / desktop

### Page Atmosphere
| Page | Style |
|------|-------|
| Landing | Grand, tech-feel, dark, impactful |
| Dashboard | Clean, moderate info density, card layout |
| New Card | Step-by-step guide, focused per step, progress bar |
| Card Detail | Physical card simulation, clear info |
| Admin | Function-first, table-heavy, efficient |
