# Enterprise Training Workflow Management System (T-WMS)

A role-based, multi-step training request and approval platform built with React, TypeScript, Vite, Tailwind CSS v4, and an optional Supabase backend.

---

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Supabase Integration](#supabase-integration)
- [Roles & Workflow](#roles--workflow)
- [Demo Mode vs. Live Mode](#demo-mode-vs-live-mode)
- [Available Scripts](#available-scripts)
- [Environment Variables](#environment-variables)
- [Database Setup](#database-setup)

---

## Overview

T-WMS lets organizations manage the full lifecycle of employee training requests — from manager nomination through a multi-stage approval chain (AI audit → Training Unit Head → Talent Development) — with real-time updates and role-filtered dashboards for every participant.

---

## Features

- **Role-based dashboards** — distinct views for Employee, Manager, Training Unit Head, Talent Dev Manager, and HR Admin.
- **Multi-step approval workflow** — `DraftByManager → PendingEmployee → PendingAI → PendingUnitHead → PendingTalentDev → Approved / Rejected`.
- **Client-side AI auditor** — automatically validates cost caps, date ranges, and required fields before escalating to human reviewers.
- **Real-time updates** — Supabase Postgres CDC pushes changes to every connected session instantly.
- **Demo mode** — works fully offline with seeded mock data; no backend required.
- **Training Need Assessment** — dedicated assessment form for employees and managers.
- **Training nomination modal** — managers can nominate employees directly from the dashboard.
- **Multi-currency support** — SAR, USD, EUR, GBP with automatic USD conversion.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Language | TypeScript |
| UI framework | React 18 |
| Build tool | Vite 6 |
| Styling | Tailwind CSS v4 (`@tailwindcss/vite`) |
| Component primitives | Radix UI, shadcn/ui patterns |
| Icons | Lucide React |
| Charts | Recharts |
| Forms | React Hook Form |
| Backend (optional) | Supabase (Postgres + Auth + Realtime + Storage) |
| Animations | Motion (Framer Motion v12) |

---

## Project Structure

```
enterprise-training-wms/
├── src/
│   ├── app/
│   │   ├── App.tsx                      # Root component — state, routing, handlers
│   │   ├── components/
│   │   │   ├── Login.tsx                # Mock login with role cards
│   │   │   ├── Shell.tsx                # App layout: header, search, nav
│   │   │   ├── Dashboards.tsx           # Five role-specific dashboard views
│   │   │   ├── RequestDetail.tsx        # Single request view and action buttons
│   │   │   ├── NominationModal.tsx      # Manager nomination flow
│   │   │   ├── TrainingNeedAssessment.tsx          # Assessment form (active)
│   │   │   ├── TrainingNeedAssessmentSupabase.tsx  # Supabase-backed assessment (full schema)
│   │   │   ├── WorkflowTracker.tsx      # Visual workflow status stepper
│   │   │   ├── SmartTrainingForm.tsx    # Smart training request form
│   │   │   └── ui/                      # Radix-based primitive components
│   │   └── data/
│   │       └── mockData.ts              # Users, courses, institutes, seed requests
│   ├── hooks/
│   │   ├── useSupabaseAuth.ts           # Supabase auth + profile hook
│   │   └── useTrainingRequestForm.ts    # Form state for Supabase assessment
│   ├── lib/
│   │   └── supabase.ts                  # Supabase client, auth, storage, realtime helpers
│   ├── services/
│   │   └── trainingRequestService.ts    # CRUD + workflow helpers (full schema)
│   ├── types/
│   │   └── database.types.ts            # Generated types for full Supabase schema
│   └── styles/
│       ├── index.css                    # Entry stylesheet
│       ├── theme.css                    # Design tokens
│       ├── tailwind.css                 # Tailwind base
│       └── fonts.css                    # Font imports
├── supabase_simple_schema.sql           # Minimal schema — aligned with App.tsx today
├── supabase_schema.sql                  # Full enterprise schema (RLS, enums, workflows)
├── supabase_seed_data.sql               # Seed data for full schema
├── vite.config.ts
├── tsconfig.json
└── .env.example
```

---

## Getting Started

### Prerequisites

- Node.js 18 or later
- npm or pnpm

### 1 — Install dependencies

```bash
npm install
# or
pnpm install
```

### 2 — Start the development server

```bash
npm run dev
```

The app starts at **http://localhost:5173**.  
No backend is required — it runs in **demo mode** with seeded mock data out of the box.

### 3 — Log in

On the login screen enter an **Employee ID** and the password **`password`** (same for all demo accounts):

| Employee ID | Name | Role |
|---|---|---|
| `E001` | Ahmed Al-Saud | Employee |
| `E002` | Sara Al-Otaibi | Employee |
| `E003` | Khalid Al-Harbi | Employee |
| `E004` | Reem Al-Shammari | Employee |
| `M001` | Fahad Al-Qahtani | Manager |
| `M002` | Noura Al-Dossary | Manager |
| `UH01` | Yousef Al-Mutairi | Training Unit Head |
| `TD01` | Layla Al-Zahrani | Talent Dev Manager |
| `HR01` | Omar Al-Ghamdi | HR Admin |

> **Password for all accounts:** `password`

---

## Supabase Integration

The app works in two modes:

| Mode | When | Persistence |
|---|---|---|
| **Demo** | `VITE_SUPABASE_URL` is missing | In-memory only, resets on refresh |
| **Live** | Both env vars are set | Postgres via Supabase, shared across sessions |

### Quick setup

1. Create a free project at [supabase.com](https://supabase.com).
2. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```
3. Fill in your project URL and anon key (found in **Project Settings → API**).
4. Run the schema against your database — see [Database Setup](#database-setup) below.
5. Restart the dev server.

---

## Roles & Workflow

### Roles

| Role | ID prefix | Capabilities |
|---|---|---|
| **Employee** | `E___` | View own requests, accept/decline nominations, submit assessments |
| **Manager** | `M___` | Nominate employees, view team requests |
| **Training Unit Head** | `UH__` | Approve / reject requests after AI audit |
| **Talent Dev Manager** | `TD__` | Final sign-off on approved requests |
| **HR Admin** | `HR__` | Read-only view of all requests |

### Approval flow

```
Manager nominates employee
        │
        ▼
  DraftByManager
        │  Employee accepts
        ▼
  PendingEmployee ──► (employee declines) ──► Rejected
        │  Employee submits
        ▼
    PendingAI
        │
        ├── AI passes ──► PendingUnitHead
        │
        └── AI rejects ──► AIRejected
                │
                ▼
         PendingUnitHead
                │
                ├── Approved ──► PendingTalentDev
                │
                └── Rejected ──► Rejected
                        │
                        ▼
                PendingTalentDev
                        │
                        ├── Approved ──► Approved ✅
                        │
                        └── Rejected ──► Rejected ❌
```

### AI audit rules

The client-side auditor auto-runs ~1.8 seconds after a request reaches `PendingAI`:

- USD cost must not exceed **$10,000**
- Duration must be at least **1 day**
- Course title, institute, and city are required

### Demo credentials

See the [Getting Started → Log in](#3--log-in) table for all accounts. Password for every account is **`password`**.

---

## Demo Mode vs. Live Mode

| Capability | Demo | Live (Supabase) |
|---|---|---|
| Login | Mock credentials from `mockData.ts` | Mock credentials (Supabase Auth not wired to login UI by default) |
| Data source | `INITIAL_REQUESTS` in memory | `public.training_requests` table |
| Persistence | Lost on page refresh | Persistent in Postgres |
| Real-time sync | Not available | Postgres CDC via Supabase Realtime |
| AI audit | Runs client-side either way | Same; result is persisted to DB |

---

## Available Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start Vite dev server (hot reload) |
| `npm run build` | Production bundle to `dist/` |
| `npm run preview` | Serve the production build locally |
| `npm run type-check` | Run TypeScript compiler check without emitting files |

---

## Environment Variables

| Variable | Required | Description |
|---|---|---|
| `VITE_SUPABASE_URL` | Optional | Your Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | Optional | Your Supabase anon/public API key |

> All client-side env vars **must** be prefixed with `VITE_`. Never commit your `.env` file — it is already in `.gitignore`.

---

## Database Setup

The repo ships two SQL files:

### Option A — Simple schema (recommended for the current UI)

Run `supabase_simple_schema.sql` in the Supabase SQL editor. This creates a single `training_requests` table whose columns align exactly with the mappers in `App.tsx`.

### Option B — Full enterprise schema

Run `supabase_schema.sql` followed by `supabase_seed_data.sql` for the complete multi-table schema with RLS policies, workflow enums, and relational data. This requires wiring `TrainingNeedAssessmentSupabase.tsx` and `trainingRequestService.ts` into the app instead of the current simple integration in `App.tsx`.

See `SUPABASE_SETUP_GUIDE.md` and `QUICK_START.md` for step-by-step instructions.

---

Built by **Charisma Team — فريق كاريزما** · WhatsApp: [+201002455834](https://wa.me/201002455834)
