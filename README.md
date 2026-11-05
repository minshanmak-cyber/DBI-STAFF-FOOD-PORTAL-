# DBI Staff Food Management Portal — Production-Ready MVP

An institutional web application built with **Next.js (App Router)**, **TypeScript**, **Tailwind CSS**, **Prisma ORM**, and **PostgreSQL (Neon-ready)** for staff meal planning, next-day cutoff management, real-time food counts, QR collection verification, and compliance reporting.

---

## 1. System Architecture & Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript with strict type checking
- **Styling**: Tailwind CSS (Minimal institutional palette with dark blue `#102a43` accents)
- **Database & ORM**: PostgreSQL (Neon-ready) with Prisma ORM
- **Authentication**: Cryptographically signed HMAC-SHA256 session cookies (`jose`), bcrypt password hashing, and sliding-window login rate limiting
- **Input Validation**: Server-side Zod validation on all API endpoints and mutations
- **Timezone Management**: Strict Asia/Kolkata (`APP_TIMEZONE="Asia/Kolkata"`), next-day meal calculation, and 9:00 AM – 3:00 PM IST server-side submission window
- **QR Verification**: Cryptographically signed meal tokens, single-use per date/meal, enforced by database transactions and unique constraints
- **Reporting**: ExcelJS for multi-sheet `.xlsx` workbooks and jsPDF + autoTable for `.pdf` production reports
- **Testing**: Vitest automated test suite with controllable clock testing

---

## 2. User Roles & Workflows

### 🍽️ Staff Workflow
1. **Login & Security**:
   - Log in using assigned Staff ID (e.g. `1001`) and initial password (`Staff@12345`).
   - Forced to set a new password on first login (`/change-password?firstLogin=true`).
2. **Next-Day Meal Selection**:
   - View next-day Breakfast, Lunch, and Dinner options.
   - Independently opt-in or opt-out of each meal.
   - Submissions open at **9:00 AM IST** and close strictly at **3:00 PM IST** on the day prior to service.
   - Outside this window, server-side mutations are strictly rejected with an alert banner.
3. **QR Codes & Collection**:
   - Access unique QR codes for meals requested (`OPT_IN`).
   - View live collection status (Ready for Collection or Verified with timestamp).
4. **Meal History**:
   - Inspect personal history of responses and redeemed meals.

### 🛡️ Admin Workflow
1. **Production Dashboard**:
   - Real-time aggregate counts for Breakfast, Lunch, and Dinner for any selected service date.
   - Staff participation metrics (Total Staff, Responded, Unresponded).
2. **Staff Management**:
   - Create new staff with unique IDs and initial passwords.
   - Edit profiles and department assignments.
   - Deactivate or reactivate staff accounts (deactivated staff cannot log in, request meals, or collect food).
   - Reset passwords securely without viewing previous passwords (forces user change on next login).
3. **Late Response Correction**:
   - Review responses across all staff for any service date.
   - Perform late meal response overrides after the 3:00 PM cutoff.
   - **Mandatory Reason**: Requires an audit justification (minimum 5 characters) before saving.
4. **Audit Logs & Reports**:
   - View immutable system logs with actor, action, previous value, new value, and reason.
   - Download kitchen production sheets in formatted Excel (`.xlsx`) or printable PDF (`.pdf`).

### 📱 Canteen Operator Workflow
1. **Live Counter Dashboard**:
   - View today's preparation targets: Requested vs Collected vs Pending.
2. **QR Scanner & Verification**:
   - Open camera-based QR scanner (or manual code entry fallback).
   - Instant server-side atomic verification.
   - Validates:
     - Token signature and validity
     - Staff active status
     - Next-day / today opt-in eligibility
     - Duplicate collection prevention (physically locked by database unique constraint `@@unique([userId, serviceDate, mealType])`)
   - Returns clear color-coded states:
     - 🟢 **COLLECTION APPROVED** (Staff Name, ID, Department, Meal Type, Timestamp)
     - 🔴 **DUPLICATE COLLECTION DENIED** (Displays exact previous collection timestamp)
     - 🟡 **STAFF NOT ELIGIBLE** (Staff did not request this meal)
     - ❌ **EXPIRED / INVALID / INACTIVE**

---

## 3. Database Schema Overview

Applied via Prisma schema:
- **`User`**: `id`, `staffId` (unique), `passwordHash`, `role` (`ADMIN`, `STAFF`, `CANTEEN`), `isActive`, `mustChangePassword`, timestamps.
- **`StaffProfile`**: `id`, `userId` (FK, unique), `fullName`, `department`, `phone`.
- **`MealResponse`**: `id`, `userId` (FK), `serviceDate` (YYYY-MM-DD), `mealType`, `status` (`OPT_IN`, `OPT_OUT`, `NO_RESPONSE`), `editedById`, `@@unique([userId, serviceDate, mealType])`.
- **`MealCollection`**: `id`, `userId` (FK), `serviceDate`, `mealType`, `collectedAt`, `verifiedById` (FK), `@@unique([userId, serviceDate, mealType])`.
- **`QrToken`**: `id`, `token` (unique), `userId` (FK), `serviceDate`, `mealType`, `expiresAt`, `isRevoked`, `@@unique([userId, serviceDate, mealType])`.
- **`AuditLog`**: `id`, `actorId` (FK), `actorStaffId`, `action`, `targetType`, `targetId`, `previousValue`, `newValue`, `reason`, `createdAt`.

---

## 4. Setup & Local Development

### Prerequisites
- Node.js 18.17+ or 20+ (tested on Node v24.19.0)
- PostgreSQL database (e.g. [Neon](https://neon.tech), Supabase, or local PostgreSQL)

### Step 1: Clone & Install Dependencies
```bash
npm install
```

### Step 2: Configure Environment Variables
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
Update your `DATABASE_URL` with your Neon PostgreSQL connection string:
```env
DATABASE_URL="postgresql://neondb_owner:YOUR_PASSWORD@ep-xyz.us-east-2.aws.neon.tech/neondb?sslmode=require"
SESSION_SECRET="your-secure-session-secret-at-least-32-characters"
APP_TIMEZONE="Asia/Kolkata"
```

### Step 3: Run Database Migrations
Push the schema to your PostgreSQL database:
```bash
npx prisma db push
```

### Step 4: Bootstrap Initial Admin & Seed Data
Execute the safe initial bootstrap seed script:
```bash
npm run prisma:seed
```
This automatically seeds the production accounts:
| Role | Staff ID | Initial Password | Notes |
| :--- | :--- | :--- | :--- |
| **Admin** | `ADMIN001` | `Admin@12345` | Full administrative privileges |
| **Canteen** | `CANTEEN01` | `Canteen@12345` | Verification & QR scanner portal |
| **Staff** | `1001` – `1116` | `Staff@12345` | 116 institutional staff members with mandatory first-login password update |

### Step 5: Start Development Server
```bash
npm run dev
```
Navigate to `http://localhost:3000` in your browser.

---

## 5. Automated Tests

Run the full automated test suite:
```bash
npm test
```
The test suite includes 26 tests across 5 test suites:
- `tests/timezone.test.ts`: Controllable clock testing before, at, and after 3:00 PM IST deadline.
- `tests/validations.test.ts`: Password complexity, Zod schemas, login rate-limiting lockout after 5 failed attempts.
- `tests/auth.test.ts`: HMAC JWT session generation, tamper detection, and IDOR prevention.
- `tests/qr-verification.test.ts`: Inactive staff checks, ineligible checks, duplicate collection rejection, and concurrent race-condition prevention.
- `tests/reports.test.ts`: Excel (.xlsx) and PDF (.pdf) generation and header verification.

---

## 6. Deployment Instructions

### Deploying to Vercel / Cloud
1. Push codebase to a Git repository (GitHub/GitLab).
2. Connect to Vercel or your hosting provider.
3. Configure Environment Variables in the project settings:
   - `DATABASE_URL`: Your production Neon PostgreSQL connection string with `sslmode=require`.
   - `SESSION_SECRET`: A generated 64-character random string.
   - `APP_TIMEZONE`: `Asia/Kolkata`.
4. Build command: `npm run build` (runs `prisma generate && next build`).
5. Run `npx prisma db push && npm run prisma:seed` once to bootstrap the database.

