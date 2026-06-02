import type { TestProjectConfiguration } from "vitest/node";

const projects: TestProjectConfiguration[] = [
  {
    test: {
      name: "@vytal-fit/api",
      include: ["packages/api/tests/*.test.ts"],
      environment: "node",
    },
  },
  {
    test: {
      name: "@vytal-fit/db",
      include: ["packages/db/tests/*.test.ts"],
      environment: "node",
    },
  },
  {
    test: {
      name: "@vytal-fit/auth",
      include: ["packages/auth/tests/*.test.ts"],
      environment: "node",
      testTimeout: 15_000,
      hookTimeout: 15_000,
    },
  },
];

export default projects;
