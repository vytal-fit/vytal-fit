/**
 * OpenAPI 3.1 contract for the Vytal developer API (api.vytal.fit).
 *
 * Hand-authored (not generated) so it stays the single, readable source of
 * truth served at `/openapi.json`. Conventions it encodes:
 *   - Auth is a **session cookie** set by `POST /auth/sign-in/email`; send it
 *     with credentials on every request (cross-origin: `credentials: include`).
 *   - Every resource is **scoped to the caller's active organization** (set via
 *     `PATCH /me/session`). The server resolves it from the session — you never
 *     pass an org id in the body.
 *   - List responses are wrapped: `{ "items": [...] }` (some also carry a
 *     `nextCursor`). Single resources are returned bare.
 *   - Errors share one shape: `{ "error": "<CODE>", "message": "<human>" }`.
 *
 * A small test (`tests/openapi.test.ts`) verifies every `$ref` resolves and
 * every operation declares responses — so the contract can't silently rot.
 */

const ERROR_REF = { $ref: "#/components/responses/Error" } as const;

export const openApiSpec = {
  openapi: "3.1.0",
  info: {
    title: "Vytal API",
    version: "0.1.0",
    summary: "The operating system for fitness businesses — as an API.",
    description: [
      "The Vytal API powers bookings, memberships, training results and",
      "personal records for gyms, CrossFit boxes and studios. Everything is",
      "scoped to the caller's **active organization** (the gym) and isolated",
      "per tenant.",
      "",
      "## Authentication",
      "Sign in with `POST /auth/sign-in/email`. **Browser apps** receive a",
      "session cookie — send it with `credentials: \"include\"`. **Mobile /",
      "server** clients read the token from the `set-auth-token` response header",
      "and send it as `Authorization: Bearer <token>`. Switch the active gym",
      "with `PATCH /me/session`.",
      "",
      "## Conventions",
      "- **Org scope** is implicit (from the session), never a body field.",
      "- **Lists** return `{ \"items\": [ ... ] }`.",
      "- **Errors** return `{ \"error\": \"CODE\", \"message\": \"...\" }` with",
      "  the matching HTTP status.",
    ].join("\n"),
    contact: { name: "Vytal", url: "https://vytal.fit" },
  },
  servers: [
    { url: "https://api.vytal.fit", description: "Production" },
    { url: "http://localhost:3001", description: "Local development" },
  ],
  security: [{ cookieAuth: [] }, { bearerAuth: [] }],
  tags: [
    { name: "Auth", description: "Sign in / sign up and read the session." },
    { name: "Session", description: "Switch the active organization (gym)." },
    { name: "Organizations", description: "Gyms the caller can access." },
    { name: "Bookings", description: "Class booking lifecycle." },
    { name: "Records", description: "Personal records (PRs) by movement." },
    { name: "Results", description: "Workout-of-the-day (WOD) results." },
    { name: "Health", description: "Runtime and deployment health." },
  ],
  paths: {
    "/health": {
      get: {
        tags: ["Health"],
        operationId: "getHealth",
        summary: "Runtime health",
        description: "Liveness + database connectivity. Unauthenticated.",
        security: [],
        responses: {
          "200": {
            description: "Backend configured and the database responded.",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Health" },
                example: { backend: "configured", db: "ok" },
              },
            },
          },
          "503": { description: "Configured but the database ping failed." },
        },
      },
    },
    "/auth/sign-in/email": {
      post: {
        tags: ["Auth"],
        operationId: "signInEmail",
        summary: "Sign in with email and password",
        description: "On success, sets the session cookie used by every other endpoint.",
        security: [],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/SignInInput" },
              example: { email: "jose@vytal.fit", password: "••••••••" },
            },
          },
        },
        responses: {
          "200": {
            description: "Session established (cookie set).",
            content: {
              "application/json": { schema: { $ref: "#/components/schemas/Session" } },
            },
          },
          "400": ERROR_REF,
          "401": ERROR_REF,
        },
      },
    },
    "/auth/sign-up/email": {
      post: {
        tags: ["Auth"],
        operationId: "signUpEmail",
        summary: "Create an account with email and password",
        description: "Creates the user and signs them in (sets the session cookie).",
        security: [],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/SignUpInput" },
              example: { name: "Jane Athlete", email: "jane@example.com", password: "a-strong-passphrase" },
            },
          },
        },
        responses: {
          "200": {
            description: "Account created and signed in.",
            content: { "application/json": { schema: { $ref: "#/components/schemas/Session" } } },
          },
          "400": ERROR_REF,
          "409": ERROR_REF,
        },
      },
    },
    "/auth/session": {
      get: {
        tags: ["Auth"],
        operationId: "getSession",
        summary: "Fetch the current session",
        responses: {
          "200": {
            description: "The current session, or `null` when signed out.",
            content: {
              "application/json": {
                schema: { oneOf: [{ $ref: "#/components/schemas/Session" }, { type: "null" }] },
              },
            },
          },
        },
      },
    },
    "/me/session": {
      patch: {
        tags: ["Session"],
        operationId: "setActiveOrganization",
        summary: "Switch the active organization",
        description: "Sets which gym subsequent requests are scoped to.",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/SetActiveOrgInput" },
              example: { activeOrganizationId: "org-1" },
            },
          },
        },
        responses: {
          "200": {
            description: "Active organization updated.",
            content: { "application/json": { schema: { $ref: "#/components/schemas/Session" } } },
          },
          "400": ERROR_REF,
          "401": ERROR_REF,
          "403": ERROR_REF,
        },
      },
    },
    "/organizations": {
      get: {
        tags: ["Organizations"],
        operationId: "listOrganizations",
        summary: "List accessible organizations",
        responses: {
          "200": {
            description: "Gyms the caller belongs to.",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: { items: { type: "array", items: { $ref: "#/components/schemas/Organization" } } },
                },
              },
            },
          },
          "401": ERROR_REF,
        },
      },
    },
    "/organizations/{organizationId}": {
      get: {
        tags: ["Organizations"],
        operationId: "getOrganization",
        summary: "Get a single organization",
        parameters: [{ $ref: "#/components/parameters/OrganizationId" }],
        responses: {
          "200": {
            description: "Organization detail.",
            content: { "application/json": { schema: { $ref: "#/components/schemas/Organization" } } },
          },
          "401": ERROR_REF,
          "404": ERROR_REF,
        },
      },
    },
    "/bookings": {
      get: {
        tags: ["Bookings"],
        operationId: "listBookings",
        summary: "List a member's bookings",
        parameters: [{ $ref: "#/components/parameters/MemberIdRequired" }],
        responses: {
          "200": {
            description: "Bookings for the member, newest first.",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: { items: { type: "array", items: { $ref: "#/components/schemas/Booking" } } },
                },
              },
            },
          },
          "400": ERROR_REF,
          "401": ERROR_REF,
          "404": ERROR_REF,
        },
      },
      post: {
        tags: ["Bookings"],
        operationId: "createBooking",
        summary: "Book a member into a class",
        description: "Capacity-checked: a full class books as `waitlisted` instead of `confirmed`.",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/CreateBookingInput" },
              example: { classId: "cl-1", memberId: "m-1" },
            },
          },
        },
        responses: {
          "201": {
            description: "Booking created.",
            content: { "application/json": { schema: { $ref: "#/components/schemas/Booking" } } },
          },
          "400": ERROR_REF,
          "401": ERROR_REF,
          "403": ERROR_REF,
          "404": ERROR_REF,
          "409": ERROR_REF,
        },
      },
    },
    "/bookings/{bookingId}": {
      delete: {
        tags: ["Bookings"],
        operationId: "cancelBooking",
        summary: "Cancel a booking",
        parameters: [{ name: "bookingId", in: "path", required: true, schema: { type: "string" } }],
        responses: {
          "200": {
            description: "Booking cancelled.",
            content: { "application/json": { schema: { $ref: "#/components/schemas/Booking" } } },
          },
          "401": ERROR_REF,
          "403": ERROR_REF,
          "404": ERROR_REF,
          "409": ERROR_REF,
        },
      },
    },
    "/records": {
      get: {
        tags: ["Records"],
        operationId: "listRecords",
        summary: "List personal records",
        parameters: [
          { $ref: "#/components/parameters/MemberId" },
          { $ref: "#/components/parameters/ExerciseId" },
        ],
        responses: {
          "200": {
            description: "Matching personal records.",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: { items: { type: "array", items: { $ref: "#/components/schemas/PersonalRecord" } } },
                },
              },
            },
          },
          "401": ERROR_REF,
        },
      },
      post: {
        tags: ["Records"],
        operationId: "createRecord",
        summary: "Create a personal record",
        requestBody: {
          required: true,
          content: { "application/json": { schema: { $ref: "#/components/schemas/CreateRecordInput" } } },
        },
        responses: {
          "201": {
            description: "Personal record created.",
            content: { "application/json": { schema: { $ref: "#/components/schemas/PersonalRecord" } } },
          },
          "400": ERROR_REF,
          "401": ERROR_REF,
          "403": ERROR_REF,
          "404": ERROR_REF,
        },
      },
    },
    "/records/{id}": {
      patch: {
        tags: ["Records"],
        operationId: "updateRecord",
        summary: "Update a personal record",
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        requestBody: {
          required: true,
          content: { "application/json": { schema: { $ref: "#/components/schemas/UpdateRecordInput" } } },
        },
        responses: {
          "200": {
            description: "Personal record updated.",
            content: { "application/json": { schema: { $ref: "#/components/schemas/PersonalRecord" } } },
          },
          "400": ERROR_REF,
          "401": ERROR_REF,
          "403": ERROR_REF,
          "404": ERROR_REF,
        },
      },
    },
    "/results": {
      get: {
        tags: ["Results"],
        operationId: "listResults",
        summary: "List WOD results",
        parameters: [
          { $ref: "#/components/parameters/MemberId" },
          { $ref: "#/components/parameters/WodId" },
          { $ref: "#/components/parameters/Date" },
        ],
        responses: {
          "200": {
            description: "Matching WOD results.",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: { items: { type: "array", items: { $ref: "#/components/schemas/WodResult" } } },
                },
              },
            },
          },
          "401": ERROR_REF,
        },
      },
      post: {
        tags: ["Results"],
        operationId: "createResult",
        summary: "Log a WOD result",
        requestBody: {
          required: true,
          content: { "application/json": { schema: { $ref: "#/components/schemas/CreateResultInput" } } },
        },
        responses: {
          "201": {
            description: "Result logged.",
            content: { "application/json": { schema: { $ref: "#/components/schemas/WodResult" } } },
          },
          "400": ERROR_REF,
          "401": ERROR_REF,
          "403": ERROR_REF,
          "404": ERROR_REF,
        },
      },
    },
    "/results/{id}": {
      patch: {
        tags: ["Results"],
        operationId: "updateResult",
        summary: "Update a WOD result",
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        requestBody: {
          required: true,
          content: { "application/json": { schema: { $ref: "#/components/schemas/UpdateResultInput" } } },
        },
        responses: {
          "200": {
            description: "Result updated.",
            content: { "application/json": { schema: { $ref: "#/components/schemas/WodResult" } } },
          },
          "400": ERROR_REF,
          "401": ERROR_REF,
          "403": ERROR_REF,
          "404": ERROR_REF,
        },
      },
    },
  },
  components: {
    securitySchemes: {
      cookieAuth: {
        type: "apiKey",
        in: "cookie",
        name: "better-auth.session_token",
        description:
          "Session cookie set by POST /auth/sign-in/email. Browser clients send it with credentials.",
      },
      bearerAuth: {
        type: "http",
        scheme: "bearer",
        description:
          "Session token returned in the `set-auth-token` response header on sign-in; send as `Authorization: Bearer <token>`. Used by mobile and server-to-server clients.",
      },
    },
    parameters: {
      OrganizationId: { name: "organizationId", in: "path", required: true, schema: { type: "string" } },
      MemberIdRequired: {
        name: "memberId",
        in: "query",
        required: true,
        description: "Gym member id to scope the list to.",
        schema: { type: "string" },
      },
      MemberId: { name: "memberId", in: "query", required: false, schema: { type: "string" } },
      ExerciseId: { name: "exerciseId", in: "query", required: false, schema: { type: "string" } },
      WodId: { name: "wodId", in: "query", required: false, schema: { type: "string" } },
      Date: {
        name: "date",
        in: "query",
        required: false,
        description: "Filter by date (YYYY-MM-DD).",
        schema: { type: "string", format: "date" },
      },
    },
    responses: {
      Error: {
        description: "Error — `{ error: CODE, message }` with the matching HTTP status.",
        content: {
          "application/json": {
            schema: { $ref: "#/components/schemas/Error" },
            examples: {
              unauthorized: { value: { error: "UNAUTHORIZED", message: "Sign in required." } },
              forbidden: { value: { error: "FORBIDDEN", message: "Not allowed for this organization." } },
              notFound: { value: { error: "NOT_FOUND", message: "Booking not found." } },
              conflict: { value: { error: "CONFLICT", message: "Member already has an active booking for this class." } },
              badRequest: { value: { error: "BAD_REQUEST", message: "memberId is required." } },
            },
          },
        },
      },
    },
    schemas: {
      Error: {
        type: "object",
        required: ["error", "message"],
        properties: {
          error: { type: "string", description: "Stable machine-readable code (e.g. NOT_FOUND)." },
          message: { type: "string", description: "Human-readable explanation." },
        },
      },
      Health: {
        type: "object",
        properties: {
          backend: { type: "string", enum: ["configured", "unconfigured"] },
          db: { type: "string", enum: ["ok", "error"] },
        },
      },
      SignInInput: {
        type: "object",
        required: ["email", "password"],
        properties: { email: { type: "string", format: "email" }, password: { type: "string" } },
      },
      SignUpInput: {
        type: "object",
        required: ["name", "email", "password"],
        properties: {
          name: { type: "string" },
          email: { type: "string", format: "email" },
          password: { type: "string", minLength: 8 },
        },
      },
      SetActiveOrgInput: {
        type: "object",
        required: ["activeOrganizationId"],
        properties: { activeOrganizationId: { type: "string" } },
      },
      Session: {
        type: "object",
        properties: {
          user: {
            type: "object",
            properties: {
              id: { type: "string" },
              email: { type: "string", format: "email" },
              name: { type: "string" },
              emailVerified: { type: "boolean" },
            },
          },
          activeOrganizationId: { type: ["string", "null"] },
        },
      },
      Organization: {
        type: "object",
        properties: {
          id: { type: "string" },
          name: { type: "string" },
          slug: { type: "string" },
          type: { type: "string", description: "Vertical key (e.g. crossfit_box)." },
          logo: { type: ["string", "null"] },
        },
      },
      Booking: {
        type: "object",
        properties: {
          id: { type: "string" },
          organizationId: { type: "string" },
          memberId: { type: "string" },
          classId: { type: "string" },
          status: { $ref: "#/components/schemas/BookingStatus" },
          bookedAt: { type: "string", format: "date-time" },
          checkedInAt: { type: ["string", "null"], format: "date-time" },
          qrCode: { type: ["string", "null"] },
        },
      },
      BookingStatus: {
        type: "string",
        enum: ["confirmed", "waitlisted", "cancelled", "checked_in", "no_show"],
      },
      CreateBookingInput: {
        type: "object",
        required: ["classId", "memberId"],
        properties: { classId: { type: "string" }, memberId: { type: "string" } },
      },
      PersonalRecord: {
        type: "object",
        properties: {
          id: { type: "string" },
          organizationId: { type: "string" },
          memberId: { type: "string" },
          exerciseId: { type: "string" },
          value: { type: "string", description: "Numeric value as a string (weight, reps, time…)." },
          unit: { $ref: "#/components/schemas/PrUnit" },
          achievedAt: { type: "string", format: "date-time" },
          previousValue: { type: ["string", "null"] },
        },
      },
      PrUnit: { type: "string", enum: ["kg", "lbs", "time", "reps", "meters", "calories"] },
      CreateRecordInput: {
        type: "object",
        required: ["memberId", "exerciseId", "value", "unit"],
        properties: {
          memberId: { type: "string" },
          exerciseId: { type: "string" },
          value: { type: "string" },
          unit: { $ref: "#/components/schemas/PrUnit" },
          achievedAt: { type: "string", format: "date-time" },
        },
      },
      UpdateRecordInput: {
        type: "object",
        properties: {
          value: { type: "string" },
          unit: { $ref: "#/components/schemas/PrUnit" },
          achievedAt: { type: "string", format: "date-time" },
        },
      },
      WodResult: {
        type: "object",
        properties: {
          id: { type: "string" },
          organizationId: { type: "string" },
          memberId: { type: "string" },
          wodId: { type: "string" },
          classId: { type: ["string", "null"] },
          score: { type: "string" },
          scoreType: { $ref: "#/components/schemas/ScoreType" },
          scale: { $ref: "#/components/schemas/Scale" },
          isPR: { type: "boolean" },
          rpe: { type: ["integer", "null"], minimum: 1, maximum: 10 },
          notes: { type: ["string", "null"] },
          createdAt: { type: "string", format: "date-time" },
        },
      },
      ScoreType: {
        type: "string",
        enum: ["time", "rounds_reps", "weight", "reps", "distance", "calories"],
      },
      Scale: { type: "string", enum: ["rx", "scaled", "rx_plus"] },
      CreateResultInput: {
        type: "object",
        required: ["memberId", "wodId", "score", "scoreType", "scale"],
        properties: {
          memberId: { type: "string" },
          wodId: { type: "string" },
          classId: { type: "string" },
          score: { type: "string" },
          scoreType: { $ref: "#/components/schemas/ScoreType" },
          scale: { $ref: "#/components/schemas/Scale" },
          rpe: { type: "integer", minimum: 1, maximum: 10 },
          notes: { type: "string" },
        },
      },
      UpdateResultInput: {
        type: "object",
        properties: {
          score: { type: "string" },
          scoreType: { $ref: "#/components/schemas/ScoreType" },
          scale: { $ref: "#/components/schemas/Scale" },
          rpe: { type: "integer", minimum: 1, maximum: 10 },
          notes: { type: "string" },
        },
      },
    },
  },
} as const;
