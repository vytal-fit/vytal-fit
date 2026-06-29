export const openApiSpec = {
  openapi: "3.1.0",
  info: {
    title: "Vytal API",
    version: "0.1.0",
    description:
      "Developer API for Vytal. Auth, organization context, core REST wrappers, and health checks.",
  },
  servers: [
    { url: "https://api.vytal.fit", description: "Production" },
    { url: "http://localhost:3001", description: "Local development" },
  ],
  security: [
    {
      bearerAuth: [],
    },
  ],
  tags: [
    { name: "Auth", description: "Better Auth endpoints used by the web and mobile clients." },
    { name: "Session", description: "Authenticated session helpers." },
    { name: "Spaces", description: "Organization lookup and switching." },
    { name: "Bookings", description: "Booking lifecycle wrappers." },
    { name: "Records", description: "Personal record CRUD wrappers." },
    { name: "Results", description: "WOD result CRUD wrappers." },
    { name: "Health", description: "Runtime and deployment health." },
  ],
  paths: {
    "/api/health": {
      get: {
        tags: ["Health"],
        summary: "Runtime health",
        responses: {
          "200": { description: "Backend configured and healthy." },
          "503": { description: "Backend configured but database ping failed." },
        },
      },
    },
    "/api/auth/sign-in/email": {
      post: {
        tags: ["Auth"],
        summary: "Sign in with email/password",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["email", "password"],
                properties: {
                  email: { type: "string", format: "email" },
                  password: { type: "string" },
                },
              },
            },
          },
        },
        responses: {
          "200": { description: "Session established." },
        },
      },
    },
    "/api/auth/sign-up/email": {
      post: {
        tags: ["Auth"],
        summary: "Create an account with email/password",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["name", "email", "password"],
                properties: {
                  name: { type: "string" },
                  email: { type: "string", format: "email" },
                  password: { type: "string" },
                },
              },
            },
          },
        },
        responses: {
          "200": { description: "Account created." },
        },
      },
    },
    "/api/auth/get-session": {
      get: {
        tags: ["Auth"],
        summary: "Fetch the current session",
        responses: {
          "200": { description: "Current session or null." },
        },
      },
    },
    "/api/session": {
      patch: {
        tags: ["Session"],
        summary: "Update the active space",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["activeSpaceId"],
                properties: {
                  activeSpaceId: { type: "string" },
                },
              },
            },
          },
        },
        responses: {
          "200": { description: "Active space updated." },
        },
      },
    },
    "/api/spaces": {
      get: {
        tags: ["Spaces"],
        summary: "List accessible spaces",
        responses: {
          "200": { description: "Spaces list." },
        },
      },
    },
    "/api/spaces/{spaceId}": {
      get: {
        tags: ["Spaces"],
        summary: "Get a single space",
        parameters: [
          {
            name: "spaceId",
            in: "path",
            required: true,
            schema: { type: "string" },
          },
        ],
        responses: {
          "200": { description: "Space detail." },
          "404": { description: "Space not found." },
        },
      },
    },
    "/api/bookings": {
      get: {
        tags: ["Bookings"],
        summary: "List bookings",
        responses: {
          "200": { description: "Booking list." },
        },
      },
      post: {
        tags: ["Bookings"],
        summary: "Create a booking",
        responses: {
          "201": { description: "Booking created." },
        },
      },
    },
    "/api/bookings/{bookingId}": {
      delete: {
        tags: ["Bookings"],
        summary: "Cancel a booking",
        parameters: [
          {
            name: "bookingId",
            in: "path",
            required: true,
            schema: { type: "string" },
          },
        ],
        responses: {
          "204": { description: "Booking cancelled." },
        },
      },
    },
    "/api/records": {
      get: {
        tags: ["Records"],
        summary: "List personal records",
        responses: {
          "200": { description: "PR list." },
        },
      },
      post: {
        tags: ["Records"],
        summary: "Create a personal record",
        responses: {
          "201": { description: "PR created." },
        },
      },
    },
    "/api/records/{id}": {
      patch: {
        tags: ["Records"],
        summary: "Update a personal record",
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string" },
          },
        ],
        responses: {
          "200": { description: "PR updated." },
        },
      },
    },
    "/api/results": {
      get: {
        tags: ["Results"],
        summary: "List WOD results",
        responses: {
          "200": { description: "Result list." },
        },
      },
      post: {
        tags: ["Results"],
        summary: "Create a WOD result",
        responses: {
          "201": { description: "Result created." },
        },
      },
    },
    "/api/results/{id}": {
      patch: {
        tags: ["Results"],
        summary: "Update a WOD result",
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string" },
          },
        ],
        responses: {
          "200": { description: "Result updated." },
        },
      },
    },
  },
} as const;

