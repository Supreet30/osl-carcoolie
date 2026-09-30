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
    "/api/catalog": {
      get: {
        summary: "Read-only bootstrap data for building a quote — cities, vehicle types, vehicle models, add-on services, and the current GST rate.",
        responses: {
          200: {
            description: "Catalog data",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    cities: {
                      type: "array",
                      items: {
                        type: "object",
                        properties: { name: { type: "string" }, state: { type: "string", nullable: true } },
                      },
                    },
                    vehicleTypes: {
                      type: "array",
                      items: {
                        type: "object",
                        properties: { name: { type: "string" }, priceMultiplier: { type: "number" } },
                      },
                    },
                    vehicleModels: {
                      type: "array",
                      items: {
                        type: "object",
                        properties: {
                          make: { type: "string" },
                          model: { type: "string" },
                          vehicleType: { type: "string", nullable: true },
                        },
                      },
                    },
                    addOns: {
                      type: "array",
                      items: {
                        type: "object",
                        properties: {
                          key: { type: "string" },
                          label: { type: "string" },
                          subtitle: { type: "string", nullable: true },
                          price: { type: "number" },
                        },
                      },
                    },
                    gstRate: { type: "number", description: "Fraction, e.g. 0.18 for 18%." },
                  },
                },
              },
            },
          },
        },
      },
    },
    "/api/quote": {
      post: {
        summary: "Computes a price estimate for a route/vehicle/add-on combination — the same calculation this site's \"Get an Estimate\" modal uses (route price, vehicle-type multiplier, luxury-make surcharge, GST, coupon discount).",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["fromCity", "toCity", "vehicleType"],
                properties: {
                  fromCity: { type: "string", description: "Must match a city name from /api/catalog." },
                  toCity: { type: "string" },
                  vehicleType: { type: "string", description: "Must match a vehicleTypes.name from /api/catalog." },
                  make: { type: "string", description: "Optional — used to check the luxury-make surcharge." },
                  selectedAddOns: {
                    type: "array",
                    items: { type: "string" },
                    description: "Add-on keys from /api/catalog's addOns[].key.",
                  },
                  couponCode: { type: "string" },
                  pickupMethod: { type: "string", enum: ["self", "driver"] },
                  dropoffMethod: { type: "string", enum: ["self", "driver"] },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: "Either a quote, or available:false if there's no route between the two cities yet.",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    available: { type: "boolean" },
                    message: { type: "string" },
                    estimate: { type: "object", description: "Tax-exclusive breakdown (subtotal, gst, total, ...)." },
                    inclusive: {
                      type: "object",
                      description: "Customer-facing lines with GST folded in (transportation, addOnsInclusive, ...).",
                    },
                  },
                },
              },
            },
          },
          400: {
            description: "Missing required fields or invalid JSON",
            content: {
              "application/json": { schema: { type: "object", properties: { error: { type: "string" } } } },
            },
          },
        },
      },
    },
    "/api/resolve-pincode": {
      get: {
        summary: "Detects the city for an Indian PIN code, matched against this site's own serviced cities list. PIN-to-post-office data is cached for 30 days server-side (it never meaningfully changes) — repeat lookups of the same PIN are fast and don't count against the upstream free postal API's quota.",
        parameters: [
          { name: "pincode", in: "query", required: true, schema: { type: "string", pattern: "^\\d{6}$" }, description: "A 6-digit Indian PIN code." },
        ],
        responses: {
          200: {
            description: "Always 200 for a well-formed PIN, even when nothing matches — check `matched` before reading `city`.",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    matched: { type: "boolean" },
                    city: { type: "string", nullable: true, description: "Only present (and non-null) when matched is true — a name from /api/catalog's cities[]." },
                    district: { type: "string", description: "The PIN's postal district, present whenever the PIN itself was found, regardless of whether it matched a serviced city." },
                    state: { type: "string" },
                    message: { type: "string", description: "Present instead of district/state when the PIN doesn't exist at all." },
                  },
                },
              },
            },
          },
          400: {
            description: "Malformed PIN (not 6 digits)",
            content: { "application/json": { schema: { type: "object", properties: { error: { type: "string" } } } } },
          },
          502: {
            description: "The upstream postal data service is unreachable",
            content: { "application/json": { schema: { type: "object", properties: { error: { type: "string" } } } } },
          },
        },
      },
    },
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
