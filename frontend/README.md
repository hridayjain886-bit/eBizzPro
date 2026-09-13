# eBizzPro — Frontend (React)

A GST billing & inventory management web app for the eBizzPro Spring Boot backend.

## Stack
- React 19 + Vite
- React Router
- Tailwind CSS v4
- Axios
- Recharts (reports)
- Lucide icons

## Setup

```bash
npm install
cp .env.example .env
# edit .env and point VITE_API_URL at your running backend
npm run dev
```

The app runs at http://localhost:5173 by default and expects the backend at the URL set in `VITE_API_URL` (defaults to http://localhost:8080).

## Build

```bash
npm run build
npm run preview
```

## Features
- Email/password auth with OTP email verification
- Dashboard with live revenue, pending invoices and stock alerts
- Parties (customers/suppliers) CRUD
- Stock/inventory CRUD with low-stock indicators
- Invoices: create with multi-item GST calculator, list, detail/print view, status updates
- Transporters CRUD
- Reports with revenue trend, invoice status breakdown and top customers
- Business profile settings
