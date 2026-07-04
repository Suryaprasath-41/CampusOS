# Task 1 - Security Hardening Agent

## Task
Implement SECURITY hardening for the authentication system

## Summary
All 7 items completed successfully:

1. **Login API** (`/src/app/api/auth/login/route.ts`):
   - bcryptjs password verification with plain-text fallback and auto-migration
   - HMAC-signed tokens (SHA-256) with 24-hour expiry
   - In-memory rate limiting (5 attempts / 15 min per IP)
   - Exported `verifyToken()` for reuse

2. **Register API** (`/src/app/api/auth/register/route.ts`):
   - bcryptjs password hashing (cost 10)
   - Email format validation, min password length (6), role validation
   - @JSE.com domain enforcement preserved
   - Uses `verifyToken()` for admin auth check

3. **Seed file** (`/prisma/seed.ts`):
   - Already correct: admin@JSE.com / Samyukth@2378 plain text, all @JSE.com emails

4. **Middleware** (`/src/middleware.ts`):
   - Protects `/`, allows `/login` and `/api/auth/*`
   - Uses Web Crypto API for Edge Runtime compatibility
   - HMAC signature verified, invalid tokens redirect + cookie cleared

5. **Session-info API** (`/src/app/api/auth/session-info/route.ts`):
   - GET endpoint, verifies token, returns user info or 401

6. **Database**: `db:push` + re-seed completed successfully

7. **Lint**: Zero errors

## Key Design Decisions
- Used Web Crypto API (`crypto.subtle`) in middleware instead of Node.js `crypto` module (Edge Runtime requirement)
- Token format: `base64(userId:email:role:timestamp:HMAC-SHA256-signature)`
- Auto-migration: plain-text passwords are re-hashed with bcrypt on first successful login
- Rate limiting: simple Map-based counter, resets after 15-minute window
