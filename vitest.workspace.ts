import type { TestProjectConfiguration } from "vitest/node";

const projects: TestProjectConfiguration[] = [
  {
    test: {
      name: "@vytal-fit/api",
      include: ["packages/api/tests/*.test.ts"],
      environment: "node",
      // PGlite (WASM Postgres) boots per test file; allow for parallel startup.
      testTimeout: 30_000,
      hookTimeout: 60_000,
    },
  },
  {
    test: {
      name: "@vytal-fit/db",
      include: ["packages/db/tests/*.test.ts"],
      environment: "node",
      testTimeout: 30_000,
      hookTimeout: 60_000,
    },
  },
  {
    test: {
      name: "@vytal-fit/auth",
      include: ["packages/auth/tests/*.test.ts"],
      environment: "node",
      testTimeout: 30_000,
      hookTimeout: 60_000,
    },
  },
  {
    test: {
      name: "@vytal-fit/email",
      include: ["packages/email/tests/*.test.ts"],
      environment: "node",
    },
  },
  {
    test: {
      name: "@vytal-fit/shared",
      include: ["packages/shared/tests/*.test.ts"],
      environment: "node",
    },
  },
  {
    test: {
      name: "@vytal-fit/comms",
      include: ["packages/comms/tests/*.test.ts"],
      environment: "node",
    },
  },
  {
    test: {
      name: "@vytal-fit/content",
      include: ["packages/content/tests/*.test.ts"],
      environment: "node",
    },
  },
  {
    test: {
      name: "@vytal-fit/pro",
      include: ["apps/pro/src/**/*.test.ts"],
      environment: "node",
    },
  },
];

export default projects;
