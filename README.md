# Helixque Match API

Helixque Match is a Fastify based TypeScript service that exposes APIs for managing user preferences and related matchmaking features. The project is designed with modular components for configuration, routing, validation, and documentation to keep the codebase scalable and easy to extend.

## Table of Contents

- [Tech Stack](#tech-stack)
- [Quick Start](#quick-start)
- [Available Scripts](#available-scripts)
- [Environment Variables](#environment-variables)
- [Project Structure](#project-structure)
- [Key Modules](#key-modules)
- [API Surface](#api-surface)
- [Logging](#logging)
- [Swagger Documentation](#swagger-documentation)
- [Development Notes](#development-notes)

## Tech Stack

- **Runtime:** Node.js + TypeScript
- **Framework:** Fastify 5
- **Validation:** Zod
- **Configuration:** dotenv
- **Observability:** Pino (with pretty logging in development)
- **Tooling:** pnpm, ts-node-dev, TypeScript compiler

## Quick Start

1. **Install dependencies** (pnpm is recommended):
   ```bash
   pnpm install
   ```
2. **Create a `.env` file** at the project root (see [Environment Variables](#environment-variables)).
3. **Run the development server**:
   ```bash
   pnpm dev
   ```
4. The API boots on `http://localhost:<PORT>` (defaults to `4000` via `.env`). Swagger UI is available at `/docs` once the server is running.

## Available Scripts

- `pnpm dev`: Start the Fastify server with live reload via `ts-node-dev`.
- `pnpm build`: Compile TypeScript sources to the `dist/` folder.
- `pnpm start`: Run the compiled JavaScript from `dist/`.

## Environment Variables

Configuration is loaded through `dotenv` and validated with Zod. Add a `.env` file with the following keys:

```dotenv
NODE_ENV=development
PORT=3000
LOG_LEVEL=info
```

Missing values fall back to the defaults defined in `src/config/env.ts`.

## Project Structure

```
helixque-match/
├── package.json
├── pnpm-lock.yaml
├── tsconfig.json
├── src/
│   ├── app.ts
│   ├── server.ts
│   ├── config/
│   │   └── env.ts
│   ├── controllers/
│   │   └── preferences.controller.ts
│   ├── plugins/
│   │   ├── cors.ts
│   │   └── swagger.ts
│   ├── routes/
│   │   ├── health.ts
│   │   ├── index.ts
│   │   └── preferences.ts
│   ├── schemas/
│   │   └── preferences.schema.ts
│   └── utils/
│       ├── logger.ts
│       └── response.ts (placeholder for shared response helpers)
└── dist/ (generated at build time)
```

## Key Modules

- **`src/server.ts`**: Entrypoint that builds the Fastify instance and starts listening. Safe to import in tests without auto-starting.
- **`src/app.ts`**: Factory responsible for registering global plugins and routes. Returns the configured Fastify instance.
- **`src/config/env.ts`**: Loads `.env` variables and validates them with Zod to ensure reliable defaults across environments.
- **`src/plugins/cors.ts`**: Fastify plugin that enables CORS with credentials; wrapped with `fastify-plugin` for encapsulation control.
- **`src/plugins/swagger.ts`**: Registers OpenAPI metadata and serves Swagger UI at `/docs`.
- **`src/routes/health.ts`**: Lightweight liveness route responding at `GET /health`.
- **`src/routes/index.ts`**: Central place to mount versioned API routes. Currently exposes `/api/v1/preferences`.
- **`src/routes/preferences.ts`**: Declares REST endpoints for preferences (`GET /`, `POST /`).
- **`src/controllers/preferences.controller.ts`**: Business logic handlers for preferences. Validates incoming payloads and returns typed responses.
- **`src/schemas/preferences.schema.ts`**: Defines the Zod schema that guards the preferences contract.
- **`src/utils/logger.ts`**: Configures Pino logger according to environment (pretty output in development, JSON in production).

## API Surface

Current endpoints (prefixed with `http://localhost:<PORT>`):

| Method | Path                  | Description                                                               |
| ------ | --------------------- | ------------------------------------------------------------------------- |
| GET    | `/health`             | Health check for service monitoring                                       |
| GET    | `/api/v1/preferences` | Fetch the list of stored preferences (returns an empty array placeholder) |
| POST   | `/api/v1/preferences` | Create a new preference; body validated by `PreferenceSchema`             |

Sample request body for `POST /api/v1/preferences`:

```json
{
  "domain": "backend",
  "techStacks": ["node", "postgres"],
  "languages": ["typescript"],
  "experience": "mid"
}
```

## Logging

Pino powers structured logging. The log level is controlled via `LOG_LEVEL`. In non-production environments, logs are prettified with timestamps and colors for human readability.

## Swagger Documentation

- Swagger specification served at runtime under `/docs/json`.
- Interactive documentation accessible via `http://localhost:<PORT>/docs` after the server starts.

## Development Notes

- `dist/` is generated only after running `pnpm build` and should be excluded from source control.
- Add new route modules under `src/routes/` and register them in `src/routes/index.ts` to keep API versioning consistent.
- Place shared domain logic in `src/controllers/` and keep request validation in `src/schemas/` to maintain separation of concerns.
- Extend reusable utilities (error handling, response shaping) inside `src/utils/` as the project grows.
