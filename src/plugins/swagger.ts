import swagger from "@fastify/swagger";
import swaggerUI from "@fastify/swagger-ui";
import { FastifyPluginAsync } from "fastify";
import fp from "fastify-plugin";

const swaggerPlugin: FastifyPluginAsync = async (app) => {
  await app.register(swagger, {
    openapi: {
      info: {
        title: "Helixque Match API",
        version: "1.0.0",
        description: `
## API Categories

### WebSocket API (Real-time)
- **Purpose**: Client-server real-time commands, WebRTC signaling, and push events
- **Connection**: Connect to \`/ws\` endpoint for WebSocket communication
- **Message Format**: All messages are JSON with \`type\`, \`requestId\` (optional), and \`payload\` fields

### Internal API (HTTP/REST)
- **Purpose**: Machine-to-machine communication between signaling servers and matching service
- **Endpoints**: \`/api/v1/match/*\`
- **Authentication**: Internal service authentication required

### Admin API (HTTP/REST)  
- **Purpose**: Administrative operations, user management, debugging
- **Endpoints**: \`/api/v1/admin/*\` and \`/api/v1/debug/*\`
- **Authentication**: Operator-level access required

### System API (HTTP/REST)
- **Purpose**: Health checks, metrics, monitoring
- **Endpoints**: \`/healthz\`, \`/metrics\`
- **Public Access**: Health endpoint public, metrics may require auth

## Key Features

- **Strict Matching**: Exact preference matching with normalized preference keys
- **Loose Matching**: Language-based queue matching with sampling
- **Real-time Signaling**: WebRTC signaling server integration
- **Feedback System**: Post-match rating and tagging
- **Queue Management**: Redis-based queuing with position tracking
- **Admin Controls**: User banning, deprioritization, queue debugging
- **Metrics & Health**: Prometheus metrics and health monitoring

## Scaling Design

- Horizontal scaling for WebSocket servers (stateless)
- Redis coordination for matching service scaling  
- Rate limiting and abuse prevention
- Idempotency support for reliable operations

## Security

- JWT authentication for WebSocket connections
- Rate limiting (max 6 joins per minute per user)
- Automatic restrictions for suspected abusers
- Internal API secured with service authentication
        `,
        contact: {
          name: "Helixque Team",
          email: "support@helixque.com",
        },
      },
      servers: [
        {
          url: "http://localhost:4000",
          description: "Local development server",
        },
        {
          url: "https://api-staging.helixque.com",
          description: "Staging environment",
        },
        {
          url: "https://api.helixque.com",
          description: "Production environment",
        },
      ],
      tags: [
        {
          name: "WebSocket API",
          description:
            "Real-time WebSocket communication for matching and signaling",
        },
        {
          name: "Internal Match API",
          description:
            "Internal HTTP endpoints for matching service operations",
        },
        {
          name: "Admin API",
          description:
            "Administrative endpoints for user management and moderation",
        },
        {
          name: "Debug API",
          description:
            "Debugging endpoints for queue inspection and troubleshooting",
        },
        {
          name: "System",
          description: "System health, metrics, and monitoring endpoints",
        },
        {
          name: "Legacy",
          description: "Existing preference management endpoints",
        },
      ],
    },
  });

  await app.register(swaggerUI, {
    routePrefix: "/docs",
    staticCSP: true,
    uiConfig: {
      docExpansion: "list",
      deepLinking: false,
    },
    uiHooks: {
      onRequest: function (request, reply, next) {
        next();
      },
      preHandler: function (request, reply, next) {
        next();
      },
    },
    transformSpecificationClone: true,
  });
};

export default fp(swaggerPlugin, {
  name: "swagger-plugin",
});
