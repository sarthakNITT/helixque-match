import { FastifyPluginAsync } from "fastify";
import {
  createPreference,
  createEnhancedPreference,
  listPreferences,
  getPreference,
  updatePreference,
  deletePreference,
} from "../controllers/preferences.controller";
// Schema imports are handled by Fastify JSON Schema validation

const preferencesRoutes: FastifyPluginAsync = async (app) => {
  // Legacy preference endpoints
  app.get(
    "/",
    {
      schema: {
        description: "List all user preferences",
        tags: ["Legacy"],
        response: {
          200: {
            type: "object",
            properties: {
              data: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    domain: { type: "string" },
                    techStacks: { type: "array", items: { type: "string" } },
                    languages: { type: "array", items: { type: "string" } },
                    experience: { type: "string" },
                  },
                },
              },
              message: { type: "string" },
              count: { type: "number" },
            },
          },
        },
      },
    },
    listPreferences
  );

  app.post(
    "/",
    {
      schema: {
        description: "Create new user preference (legacy format)",
        tags: ["Legacy"],
        body: {
          type: "object",
          properties: {
            domain: { type: "string" },
            techStacks: { type: "array", items: { type: "string" } },
            languages: { type: "array", items: { type: "string" } },
            experience: { type: "string" },
          },
          required: ["domain", "experience"],
        },
        response: {
          201: {
            type: "object",
            properties: {
              data: {
                type: "object",
                properties: {
                  id: { type: "string" },
                  domain: { type: "string" },
                  techStacks: { type: "array", items: { type: "string" } },
                  languages: { type: "array", items: { type: "string" } },
                  experience: { type: "string" },
                  createdAt: { type: "string" },
                  updatedAt: { type: "string" },
                },
              },
              message: { type: "string" },
            },
          },
          400: {
            type: "object",
            properties: {
              message: { type: "string" },
              errors: { type: "object" },
            },
          },
        },
      },
    },
    createPreference
  );

  app.get(
    "/:id",
    {
      schema: {
        description: "Get preference by ID",
        tags: ["Legacy"],
        params: {
          type: "object",
          properties: {
            id: { type: "string", description: "Preference ID" },
          },
          required: ["id"],
        },
        response: {
          200: {
            type: "object",
            properties: {
              data: {
                type: "object",
                properties: {
                  id: { type: "string" },
                  domain: { type: "string" },
                  techStacks: { type: "array", items: { type: "string" } },
                  languages: { type: "array", items: { type: "string" } },
                  experience: { type: "string" },
                  language: { type: "string" },
                  techStack: { type: "array", items: { type: "string" } },
                  region: { type: "string" },
                  availability: { type: "string" },
                  timezone: { type: "string" },
                  projectType: { type: "string" },
                  communicationStyle: { type: "string" },
                  goals: { type: "array", items: { type: "string" } },
                  strictPrefKey: { type: "string" },
                  createdAt: { type: "string" },
                  updatedAt: { type: "string" },
                },
              },
              message: { type: "string" },
            },
          },
          404: {
            type: "object",
            properties: {
              message: { type: "string" },
            },
          },
        },
      },
    },
    getPreference
  );

  app.put(
    "/:id",
    {
      schema: {
        description: "Update preference by ID",
        tags: ["Legacy"],
        params: {
          type: "object",
          properties: {
            id: { type: "string", description: "Preference ID" },
          },
          required: ["id"],
        },
        response: {
          200: {
            type: "object",
            properties: {
              data: {
                type: "object",
                properties: {
                  id: { type: "string" },
                  domain: { type: "string" },
                  techStacks: { type: "array", items: { type: "string" } },
                  languages: { type: "array", items: { type: "string" } },
                  experience: { type: "string" },
                  language: { type: "string" },
                  techStack: { type: "array", items: { type: "string" } },
                  region: { type: "string" },
                  availability: { type: "string" },
                  timezone: { type: "string" },
                  projectType: { type: "string" },
                  communicationStyle: { type: "string" },
                  goals: { type: "array", items: { type: "string" } },
                  strictPrefKey: { type: "string" },
                  createdAt: { type: "string" },
                  updatedAt: { type: "string" },
                },
              },
              message: { type: "string" },
            },
          },
          404: {
            type: "object",
            properties: {
              message: { type: "string" },
            },
          },
        },
      },
    },
    updatePreference
  );

  app.delete(
    "/:id",
    {
      schema: {
        description: "Delete preference by ID",
        tags: ["Legacy"],
        params: {
          type: "object",
          properties: {
            id: { type: "string", description: "Preference ID" },
          },
          required: ["id"],
        },
        response: {
          200: {
            type: "object",
            properties: {
              message: { type: "string" },
            },
          },
          404: {
            type: "object",
            properties: {
              message: { type: "string" },
            },
          },
        },
      },
    },
    deletePreference
  );

  // Enhanced preference endpoints for matching system
  app.post(
    "/enhanced",
    {
      schema: {
        description:
          "Create enhanced user preference with all 10 profile fields for matching system",
        tags: ["Legacy"],
        body: {
          type: "object",
          properties: {
            language: { type: "string" },
            techStack: { type: "array", items: { type: "string" } },
            domain: { type: "string" },
            region: { type: "string" },
            experience: { type: "string" },
            availability: { type: "string" },
            timezone: { type: "string" },
            projectType: { type: "string" },
            communicationStyle: { type: "string" },
            goals: { type: "array", items: { type: "string" } },
          },
          required: [
            "language",
            "techStack",
            "domain",
            "region",
            "experience",
            "availability",
            "timezone",
            "projectType",
            "communicationStyle",
            "goals",
          ],
        },
        response: {
          201: {
            type: "object",
            properties: {
              data: {
                type: "object",
                properties: {
                  id: { type: "string" },
                  language: { type: "string" },
                  techStack: { type: "array", items: { type: "string" } },
                  domain: { type: "string" },
                  region: { type: "string" },
                  experience: { type: "string" },
                  availability: { type: "string" },
                  timezone: { type: "string" },
                  projectType: { type: "string" },
                  communicationStyle: { type: "string" },
                  goals: { type: "array", items: { type: "string" } },
                  strictPrefKey: { type: "string" },
                  createdAt: { type: "string" },
                  updatedAt: { type: "string" },
                },
              },
              message: { type: "string" },
            },
          },
          400: {
            type: "object",
            properties: {
              message: { type: "string" },
              errors: { type: "object" },
            },
          },
        },
      },
    },
    createEnhancedPreference
  );
};

export default preferencesRoutes;
