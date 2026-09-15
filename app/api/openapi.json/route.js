import { NextResponse } from "next/server";

const spec = {
  openapi: "3.0.3",
  info: {
    title: "OSL Carcoolie API",
    version: "1.0.0",
    description: "API documentation for the OSL Carcoolie application.",
  },
  servers: [{ url: "/" }],
  paths: {
    "/api/subscribe": {
      post: {
        summary: "Subscribe an email to the newsletter",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["email"],
                properties: {
                  email: { type: "string", format: "email" },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: "Subscription succeeded",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: { success: { type: "boolean" } },
                },
              },
            },
          },
          400: {
            description: "Invalid email address",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: { error: { type: "string" } },
                },
              },
            },
          },
          500: {
            description: "Server or upstream error",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: { error: { type: "string" } },
                },
              },
            },
          },
        },
      },
    },
  },
};

export async function GET() {
  return NextResponse.json(spec);
}
