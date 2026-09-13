# eBizzPro

A GST billing and inventory management web app built with Spring Boot and React.

## Tech stack
- Backend: Java 17, Spring Boot 3, PostgreSQL, Flyway, JWT, SMTP email
- Frontend: React + Vite

## Features
- User login and registration with email OTP verification
- Invoice creation and management
- Stock tracking and stock adjustment on invoices
- Party, transporter, and business profile management
- Dashboard and reports
- GST-aware invoice handling and printable invoice view

## Setup

### 1) Backend
```bash
cd backend
cp .env.example .env
mvn spring-boot:run
```

Update the values in `backend/.env` with your PostgreSQL, JWT, and SMTP settings.
The backend loads `.env` automatically, so you do not need to export variables manually unless you want to override them in a specific terminal session.

### 2) Frontend
```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

Set your backend URL in `frontend/.env` using `VITE_API_URL`.

## Run URLs
- Frontend: `http://localhost:5173`
- Backend: `http://localhost:8080`
- Swagger UI: `http://localhost:8080/swagger-ui.html`

You can test all backend endpoints directly from Swagger UI after the backend starts.

## Notes
- Keep the real secrets in `backend/.env` and `frontend/.env` only.
- Do not commit those files to Git.
- Use `.env.example` as the public template for required values.
