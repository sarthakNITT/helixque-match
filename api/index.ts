import { VercelRequest, VercelResponse } from "@vercel/node";
import { FastifyInstance } from "fastify";
import { buildApp } from "../src/app";

// Create the app instance once (outside the handler for better performance)
let app: FastifyInstance | null = null;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    // Initialize the app only once
    if (!app) {
      app = buildApp();
      await app.ready();
    }

    // Prepare the request URL properly
    const url = req.url || "/";

    // Handle the request using Fastify's inject method
    const response = await app.inject({
      method: (req.method || "GET") as
        | "GET"
        | "POST"
        | "PUT"
        | "DELETE"
        | "PATCH"
        | "HEAD"
        | "OPTIONS",
      url: url,
      headers: req.headers,
      payload: req.body,
      query: req.query || {},
    });

    // Set response headers
    const responseHeaders = response.headers;
    Object.keys(responseHeaders).forEach((key) => {
      const value = responseHeaders[key];
      if (value !== undefined) {
        res.setHeader(key, value);
      }
    });

    // Set status code and send response
    res.status(response.statusCode);

    // Handle different response types
    try {
      const parsedPayload = JSON.parse(response.payload);
      res.json(parsedPayload);
    } catch {
      res.send(response.payload);
    }
  } catch (error) {
    console.error("Serverless function error:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error occurred";
    res.status(500).json({
      error: "Internal Server Error",
      message:
        process.env.NODE_ENV === "development"
          ? errorMessage
          : "Something went wrong",
    });
  }
}
