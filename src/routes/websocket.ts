import { FastifyPluginAsync } from "fastify";
// Schema imports are handled by WebSocket message validation

const websocketRoutes: FastifyPluginAsync = async (app) => {
  // WebSocket endpoint documentation for Swagger
  app.post(
    "/docs",
    {
      schema: {
        description:
          "WebSocket API Documentation - This endpoint documents the WebSocket message types but does not accept HTTP requests. WebSocket connections should be made to the /ws endpoint.",
        tags: ["WebSocket API"],
      },
    },
    async (request, reply) => {
      return reply.send({
        message:
          "This endpoint is for documentation only. Use WebSocket connection to /ws for real-time communication.",
        websocket_url: "/ws",
        client_messages: [
          "join_strict",
          "join_loose",
          "cancel",
          "signal",
          "call_end",
          "feedback",
          "heartbeat",
          "reconnect",
        ],
        server_messages: [
          "match_found",
          "waiting",
          "cancelled",
          "error",
          "feedback_received",
          "pong",
        ],
      });
    }
  );

  // WebSocket examples endpoint
  app.get(
    "/examples",
    {
      schema: {
        description: "WebSocket message flow examples",
        tags: ["WebSocket API"],
      },
    },
    async (request, reply) => {
      return reply.send({
        examples: [
          {
            name: "Strict Match Example",
            description: "Example of strict matching flow",
            flow: [
              {
                from: "client",
                to: "server",
                message: { type: "join_strict", preferences: {} },
              },
              {
                from: "server",
                to: "client",
                message: { type: "waiting" },
              },
              {
                from: "server",
                to: "client",
                message: {
                  type: "match_found",
                  matchId: "match123",
                  peerId: "user456",
                },
              },
            ],
          },
          {
            name: "Loose Match Example",
            description: "Example of loose matching flow",
            flow: [
              {
                from: "client",
                to: "server",
                message: { type: "join_loose", preferences: {} },
              },
              {
                from: "server",
                to: "client",
                message: {
                  type: "match_found",
                  matchId: "match456",
                  peerId: "user789",
                },
              },
            ],
          },
          {
            name: "Feedback Flow Example",
            description: "Example of feedback submission",
            flow: [
              {
                from: "client",
                to: "server",
                message: { type: "feedback", matchId: "match123", rating: 5 },
              },
              {
                from: "server",
                to: "client",
                message: { type: "feedback_received" },
              },
            ],
          },
        ],
      });
    }
  );

  // Example WebSocket flow documentation
  app.get(
    "/websocket/examples",
    {
      schema: {
        description: "WebSocket message flow examples",
        tags: ["WebSocket API"],
        response: {
          200: {
            type: "object",
            properties: {
              examples: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    name: { type: "string" },
                    description: { type: "string" },
                    flow: {
                      type: "array",
                      items: {
                        type: "object",
                        properties: {
                          from: { type: "string" },
                          to: { type: "string" },
                          message: { type: "object" },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
    async (request, reply) => {
      return reply.send({
        examples: [
          {
            name: "Successful Strict Match",
            description: "User joins strict mode and gets matched immediately",
            flow: [
              {
                from: "Client",
                to: "Server",
                message: {
                  type: "join_strict",
                  requestId: "r1",
                  payload: {
                    userId: "user123",
                    preferences: {
                      language: "javascript",
                      techStack: ["react", "node"],
                      domain: "frontend",
                      region: "us-west",
                      experience: "2-5",
                      availability: "evenings",
                      timezone: "PST",
                      projectType: "web-app",
                      communicationStyle: "collaborative",
                      goals: ["learning", "networking"],
                    },
                  },
                },
              },
              {
                from: "Server",
                to: "Client",
                message: {
                  type: "match_found",
                  requestId: "r1",
                  payload: {
                    matchId: "match_123",
                    peerId: "user456",
                    mode: "STRICT",
                    roomMeta: { created: "2024-12-04T10:00:00Z" },
                  },
                },
              },
            ],
          },
          {
            name: "Loose Match with Waiting",
            description: "User joins loose mode and waits in queue",
            flow: [
              {
                from: "Client",
                to: "Server",
                message: {
                  type: "join_loose",
                  requestId: "r2",
                  payload: {
                    userId: "user789",
                    preferences: {
                      language: "python",
                      techStack: ["django", "postgresql"],
                      domain: "backend",
                      region: "europe",
                      experience: "1-3",
                      availability: "weekends",
                      timezone: "CET",
                      projectType: "api",
                      communicationStyle: "direct",
                      goals: ["skill-building"],
                    },
                  },
                },
              },
              {
                from: "Server",
                to: "Client",
                message: {
                  type: "waiting",
                  requestId: "r2",
                  payload: {
                    message: "Added to queue, waiting for match",
                    position: 3,
                  },
                },
              },
            ],
          },
          {
            name: "Cancel and Feedback Flow",
            description:
              "User cancels match request and submits feedback after call",
            flow: [
              {
                from: "Client",
                to: "Server",
                message: {
                  type: "cancel",
                  payload: {
                    userId: "user123",
                    mode: "strict",
                  },
                },
              },
              {
                from: "Server",
                to: "Client",
                message: {
                  type: "cancelled",
                  payload: {
                    message: "Successfully removed from queue",
                  },
                },
              },
              {
                from: "Client",
                to: "Server",
                message: {
                  type: "feedback",
                  payload: {
                    matchId: "match_123",
                    fromUserId: "user123",
                    toUserId: "user456",
                    rating: 5,
                    tags: ["great", "helpful", "knowledgeable"],
                  },
                },
              },
              {
                from: "Server",
                to: "Client",
                message: {
                  type: "feedback_received",
                  payload: {
                    message: "Feedback recorded successfully",
                  },
                },
              },
            ],
          },
        ],
      });
    }
  );
};

export default websocketRoutes;
