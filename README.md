# Glossy Store Backend

Production-ready API backend for Glossy Store.

Owner: `OLUWAYEMI OYINLOLA MICHAEL`  
Portfolio: `https://oyinlola.site`

## Quick Start

1. Install dependencies:
```bash
npm install
```

2. Configure `.env`:
- Set DB credentials (`DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`)
- Set secrets (`JWT_SECRET`, `ATTACHMENT_URL_SECRET`)
- Set provider credentials (email, OAuth, payment)

3. Start server:
```bash
npm start
```

4. Open API docs:
- Swagger UI: `http://localhost:5000/api/docs`
- OpenAPI JSON: `http://localhost:5000/api/docs.json`

## Startup Behavior

On `npm start`, the app will:
1. Ensure database exists
2. Authenticate DB connection
3. Auto-sync base tables (`AUTO_SYNC_MODELS`)
4. Run migrations (`AUTO_RUN_MIGRATIONS`)
5. Seed super admin from `.env`

## Core Endpoints

- Health: `GET /api/health`
- Info: `GET /api/info`
- Auth: `/api/auth/*`
- Products: `/api/products/*`
- Cart: `/api/cart/*`
- Orders: `/api/orders/*`
- Support chat: `/api/support/*`
- Admin: `/api/admin/*`

## Notes

- Support attachments are private (signed download URL only).
- Optional virus scanning is controlled by:
  - `VIRUS_SCAN_ENABLED`
  - `VIRUS_SCAN_COMMAND`
  - `VIRUS_SCAN_ARGS`
