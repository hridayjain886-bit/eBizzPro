# eBizz Pro — Backend (Spring Boot)

GST Billing and Inventory Management System backend, rebuilt in Spring Boot + PostgreSQL (migrated from the original Node.js/Express + MongoDB implementation).

## Stack

- Java 17, Spring Boot 3.3
- Spring Web, Spring Data JPA, Spring Security (JWT)
- PostgreSQL + Flyway migrations
- MapStruct for entity↔DTO mapping
- springdoc-openapi (Swagger UI at `/swagger-ui.html`)

## Structure

```
controller/   REST endpoints
service/      business logic (interfaces + impl/)
repository/   Spring Data JPA repositories
entity/       JPA entities
dto/          request/ and response/ payloads
mapper/       MapStruct entity <-> DTO mappers
security/     JWT filter, JwtService, CurrentUser principal
config/       Security, CORS, OpenAPI configuration
exception/    Custom exceptions + global handler
```

## Running locally

1. Copy `.env.example` to `.env` and fill in a Postgres connection string (e.g. from Neon), a JWT secret, and SMTP credentials.
2. Export those as environment variables (or use a tool like `direnv`/your IDE's run config) — Spring Boot does not read `.env` files natively.
3. `mvn spring-boot:run`

The API starts on `http://localhost:8080`. Flyway applies the schema in `src/main/resources/db/migration` automatically on startup.

## API surface

Same routes as the original Express API, under `/api`:

- `POST /api/auth/register`, `/verify-email`, `/resend-otp`, `/login`, `/google`
- `GET /api/auth/me`, `PATCH /api/auth/profile`
- `GET/POST /api/parties`, `GET/PATCH/DELETE /api/parties/{id}`
- `GET/POST /api/transporters`, `GET/PATCH/DELETE /api/transporters/{id}`
- `GET/POST /api/stock`, `GET/PATCH/DELETE /api/stock/{id}`
- `GET/POST /api/invoices`, `GET/PATCH/DELETE /api/invoices/{id}`, `PATCH /api/invoices/{id}/status`

All routes except registration/login/Google auth require `Authorization: Bearer <token>`.
