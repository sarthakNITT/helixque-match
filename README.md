# Helixque Match

**Helixque Match** is a backend service designed to handle user matching logic based on preferences. It provides APIs for managing user preferences and executing matching algorithms to find compatible users.

## 🚀 Key Features

*   **Preference Management**: Create and list user preferences including domain, tech stacks, languages, and experience levels.
*   **Matching Algorithms**:
    *   **Strict Matching**: Finds users with exact matches on critical criteria.
    *   **Loose Matching**: Finds users with partial matches or broader criteria.
*   **Health Checks**: Built-in health check endpoint for monitoring service status.
*   **Swagger Documentation**: Integrated Swagger UI for interactive API documentation.

## 🛠️ Tech Stack

*   **Framework**: [Fastify](https://www.fastify.io/) - Fast and low overhead web framework for Node.js.
*   **Language**: [TypeScript](https://www.typescriptlang.org/) - Typed superset of JavaScript.
*   **Validation**: [Zod](https://zod.dev/) - TypeScript-first schema declaration and validation.
*   **Logging**: [Pino](https://github.com/pinojs/pino) - Very low overhead Node.js logger.
*   **Documentation**: [Swagger / OpenAPI](https://swagger.io/) - API description and documentation.

## 📂 Project Structure

```text
src/
├── clients/       # Clients for external services (User Data, User Status)
├── config/        # Environment and app configuration
├── controllers/   # Route handlers and business logic orchestration
├── plugins/       # Fastify plugins (Cors, Swagger)
├── routes/        # API route definitions
├── schemas/       # Zod schemas for validation and types
├── services/      # Business logic (Matching algorithms)
├── utils/         # Utility functions
├── server.ts      # Server entry point
└── app.ts         # App factory
```

## 🏁 Getting Started

### Prerequisites

*   **Node.js** (v18 or higher recommended)
*   **pnpm** (or npm/yarn)

### Installation

1.  Clone the repository:
    ```bash
    git clone <repository-url>
    cd helixque-match
    ```

2.  Install dependencies:
    ```bash
    pnpm install
    ```

3.  Configure environment variables:
    Copy the example environment file and update it with your local settings.
    ```bash
    cp .env.example .env
    ```
    *Ensure `PORT` and other variables are set correctly in `.env`.*

### Running the Application

*   **Development Mode**:
    Starts the server with hot-reloading.
    ```bash
    npm run dev
    ```

*   **Production Build**:
    Builds the TypeScript code to JavaScript.
    ```bash
    npm run build
    ```

*   **Start Production Server**:
    Runs the built application.
    ```bash
    npm start
    ```

## 📜 Scripts

*   `npm run dev`: Start development server with `ts-node-dev`.
*   `npm run build`: Compile TypeScript to `dist/`.
*   `npm start`: Run the compiled app from `dist/server.js`.
*   `npm run lint`: Run ESLint.
*   `npm run lint:fix`: Run ESLint and fix issues.
*   `npm run format`: Format code with Prettier.
*   `npm run typecheck`: Run TypeScript type checking.

## 📚 API Documentation

Once the server is running (default: `http://localhost:3000`), you can access the interactive API documentation at:

👉 **[http://localhost:3000/docs](http://localhost:3000/docs)**
