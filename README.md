# 🌾 Agrimitra — Farmer-Buyer Connect Platform

Agrimitra connects farmers directly with buyers through an AI-powered platform that analyzes product photos, recommends pricing, grades quality, and handles the full delivery workflow.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React + Vite + TypeScript + Tailwind CSS v4 |
| Backend | Node.js + Express + TypeScript |
| Database | PostgreSQL + Prisma ORM |
| Auth | JWT (phone + password) |
| i18n | i18next (EN, HI, MR, KN, TA) |
| AI | Stubbed service layer (swap-ready interfaces) |

## Quick Start

### Prerequisites
- Node.js 18+
- PostgreSQL running locally
- A database named `agrimitra` (or update `DATABASE_URL` in `.env`)

### 1. Clone & Install

```bash
git clone <repo-url>
cd Agrimitra

# Install all dependencies
npm install                  # Root (concurrently)
cd backend && npm install    # Backend
cd ../frontend && npm install # Frontend
```

### 2. Set Up Database

```bash
# Copy env file
cp backend/.env.example backend/.env
# Edit DATABASE_URL if your Postgres credentials differ

# Run migrations
cd backend
npx prisma migrate dev --name init

# Seed demo data
npx prisma db seed
```

### 3. Run Development Servers

```bash
# From root — starts both frontend and backend
npm run dev
```

- **Frontend:** http://localhost:5173
- **Backend:** http://localhost:4000
- **API Health:** http://localhost:4000/api/health

### Demo Accounts

All use password: `password123`

| Role | Phone | Name |
|------|-------|------|
| Farmer | 9876543210 | Ramesh Patil (Nashik) |
| Farmer | 9876543211 | Suresh Kumar (Mysuru) |
| Farmer | 9876543212 | Murugan Selvam (Coimbatore) |
| Buyer | 9876543220 | FreshMart Wholesale (Mumbai) |
| Buyer | 9876543221 | Green Grocer (Pune) |
| Delivery | 9876543230 | Ajay Jadhav (Pune) |
| Admin | 9876543200 | admin@agrimitra.com |

### Useful Commands

```bash
npm run dev              # Start both servers
npm run dev:backend      # Backend only
npm run dev:frontend     # Frontend only
npm run db:migrate       # Run Prisma migrations
npm run db:seed          # Seed database
npm run db:studio        # Open Prisma Studio (DB browser)
```

## Project Structure

```
Agrimitra/
├── backend/              # Express + TypeScript API
│   ├── prisma/           # Schema + migrations + seed
│   └── src/
│       ├── config/       # env.ts, constants.ts
│       ├── middleware/    # auth, roleGuard, upload, errorHandler
│       ├── services/ai/  # Stubbed AI functions (6 services)
│       └── utils/        # jwt, hash, storage
├── frontend/             # React + Vite + Tailwind
│   └── src/
│       ├── api/          # Axios client
│       ├── locales/      # 5 language JSON files
│       └── ...           # Components, pages, hooks (built in phases)
└── uploads/              # Dev file storage (gitignored)
```

## Languages Supported

🇬🇧 English · 🇮🇳 हिन्दी · मराठी · ಕನ್ನಡ · தமிழ்
