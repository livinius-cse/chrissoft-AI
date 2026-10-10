# ChrisSoft AI — B2B Procurement & Merchant Management Platform

A modern, scalable B2B Procurement, Billing, and AI Vendor Management platform powered by a TypeScript monorepo (`pnpm` + `turbo`), an Express REST backend with real JWT authentication and AI intelligence services, and a React + Vite dashboard frontend.

---

## 🚀 Quick Start (Running Backend & Frontend)

### Option 1: One-Click Launchers (Windows)
Double-click either script located in the repository root:
- `start_dev.bat` (Command Prompt launcher)
- `start_dev.ps1` (PowerShell launcher)

### Option 2: Turbo Dev (Concurrent)
From the `Chrissoft-AI-main` directory:
```bash
pnpm dev
```
This starts both the backend API server and the admin frontend concurrently.

### Option 3: Run Separately
In terminal 1 (Backend API on Port 5000):
```bash
pnpm --filter @equation-orchestra/backend dev
```

In terminal 2 (Frontend Dashboard on Port 3000):
```bash
pnpm --filter @equation-orchestra/admin dev
```

---

## 🌐 Application URLs

| Service | URL | Description |
| :--- | :--- | :--- |
| **Admin Frontend** | [http://localhost:3000](http://localhost:3000) | Interactive ChrisSoft AI Dashboard, POS Billing, Products, Inventory, Reports & AI Copilot |
| **Backend API** | [http://localhost:5000](http://localhost:5000) | REST API Server connecting core packages |
| **API Health Check** | [http://localhost:5000/api/health](http://localhost:5000/api/health) | Live system status & version |

> **Reverse Proxy Note**: The frontend development server automatically proxies all `/api/*` calls from `http://localhost:3000/api/*` directly to `http://localhost:5000/api/*`.

---

## 📡 Integrated REST API Endpoints

### 1. Authentication (`/api/auth`)
- `POST /api/auth/login` — Sign in with email and password, returns real JWT token via `@equation-orchestra/auth`.
- `POST /api/auth/signup` — Register new merchant account.
- `POST /api/auth/verify-otp` — Verify 4-digit OTP and generate session token.
- `GET /api/auth/me` — Inspect authenticated user profile (requires `Bearer <token>`).

### 2. Products & Catalogue (`/api/products`)
- `GET /api/products` — List all catalogue products (supports `?category=` and `?search=`).
- `GET /api/products/:id` — Retrieve single product details.
- `POST /api/products` — Create new inventory product.
- `PUT /api/products/:id` — Update product details.
- `POST /api/products/:id/restock` — Add stock units and log audit activity.
- `DELETE /api/products/:id` — Delete product.

### 3. Clients & Customers (`/api/customers`)
- `GET /api/customers` — List all client accounts and receivables balances.
- `GET /api/customers/:id` — Retrieve single customer details.
- `POST /api/customers` — Register new client account.
- `PUT /api/customers/:id` — Update client coordinates.

### 4. Invoices & POS Checkout (`/api/invoices`)
- `GET /api/invoices` — List recorded invoices with status and payment breakdown.
- `GET /api/invoices/:id` — Retrieve specific invoice.
- `POST /api/invoices/checkout` — Atomic POS checkout: decrements inventory stock, recalculates loyalty & spend, applies tax and discounts, and generates new invoice.

### 5. Inventory & Warehouse Logistics (`/api/inventory`)
- `GET /api/inventory/summary` — Warehouse valuations (Cost basis, Retail value, Markup net, and stock health counts).
- `POST /api/inventory/restock-alerts` — Bulk replenish all products under safety thresholds.

### 6. Activity Audit Logs (`/api/activities`)
- `GET /api/activities` — Real-time event timeline of sales, restocks, and customer additions.

### 7. Analytics & Reports (`/api/analytics`)
- `GET /api/analytics` — Business KPIs, 7-day sales trends, category distribution, and CLV metrics.
- `GET /api/analytics/reports` — GST tax breakdown (CGST 9%, SGST 9%) and payment method distributions.

### 8. AI Intelligence Engine (`/api/ai`)
- `POST /api/ai/chat` — **ChrisSoft AI Copilot**: Intelligent chatbot analyzing real-time inventory, revenue, and suppliers.
- `POST /api/ai/recommend-vendors` — Matches and scores vendors for an RFQ query using `@equation-orchestra/ai`.
- `POST /api/ai/forecast-demand` — Predicts 30-day demand and computes suggested safety reorder quantity.
- `POST /api/ai/predict-price` — Analyzes market trends and projects pricing shifts.
- `POST /api/ai/analyze-risk` — Evaluates procurement risk on purchase orders.

### 9. Store Settings (`/api/settings`)
- `GET /api/settings` — Get merchant profile and tax settings.
- `PUT /api/settings` — Update business settings.

---

## 🏗️ Architecture & Packages

```
├── apps/
│   ├── admin/             # React 19 + Vite + Tailwind CSS dashboard & POS interface
│   ├── backend/           # Express REST API connecting all packages
│   ├── ai-service/        # Standalone AI microservice (Port 5001)
│   └── vendor-portal/     # Vendor quotation portal
├── packages/
│   ├── ai/                # Gemini API integration & recommendation engine
│   ├── auth/              # JWT token generation & role-based access control
│   ├── database/          # Prisma client & PostgreSQL schema
│   ├── analytics/         # Spend summaries & vendor performance metrics
│   ├── inventory/         # Stock level management
│   ├── shared/            # Shared TypeScript data models
│   ├── search/            # Typesense integration
│   ├── storage/           # MinIO S3 object storage
│   └── procurement/       # B2B RFQ, PO & Quotation workflows
```
