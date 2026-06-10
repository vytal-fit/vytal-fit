import { describe, expect, it } from "vitest";
import {
  ROLE_HIERARCHY,
  ROLE_LABELS,
  hasMinRole,
  isAdmin,
  isStaff,
  type UserRole,
} from "../src/types/user";

const ALL_ROLES: UserRole[] = ["owner", "admin", "coach", "pt", "athlete"];

describe("ROLE_HIERARCHY", () => {
  it("covers every role exactly once", () => {
    expect(Object.keys(ROLE_HIERARCHY).sort()).toEqual([...ALL_ROLES].sort());
  });

  it("orders owner > admin > coach > pt > athlete strictly", () => {
    expect(ROLE_HIERARCHY.owner).toBeGreaterThan(ROLE_HIERARCHY.admin);
    expect(ROLE_HIERARCHY.admin).toBeGreaterThan(ROLE_HIERARCHY.coach);
    expect(ROLE_HIERARCHY.coach).toBeGreaterThan(ROLE_HIERARCHY.pt);
    expect(ROLE_HIERARCHY.pt).toBeGreaterThan(ROLE_HIERARCHY.athlete);
  });

  it("has a label for every role", () => {
    for (const role of ALL_ROLES) {
      expect(ROLE_LABELS[role]).toBeTruthy();
    }
  });
});

describe("hasMinRole", () => {
  it("a role always satisfies itself", () => {
    for (const role of ALL_ROLES) {
      expect(hasMinRole(role, role)).toBe(true);
    }
  });

  it("owner satisfies every requirement", () => {
    for (const role of ALL_ROLES) {
      expect(hasMinRole("owner", role)).toBe(true);
    }
  });

  it("athlete satisfies only athlete", () => {
    expect(hasMinRole("athlete", "athlete")).toBe(true);
    expect(hasMinRole("athlete", "pt")).toBe(false);
    expect(hasMinRole("athlete", "coach")).toBe(false);
    expect(hasMinRole("athlete", "admin")).toBe(false);
    expect(hasMinRole("athlete", "owner")).toBe(false);
  });

  it("is anti-symmetric for distinct roles", () => {
    expect(hasMinRole("coach", "admin")).toBe(false);
    expect(hasMinRole("admin", "coach")).toBe(true);
  });
});

describe("isAdmin", () => {
  it("only owner and admin are admins", () => {
    expect(isAdmin("owner")).toBe(true);
    expect(isAdmin("admin")).toBe(true);
    expect(isAdmin("coach")).toBe(false);
    expect(isAdmin("pt")).toBe(false);
    expect(isAdmin("athlete")).toBe(false);
  });
});

describe("isStaff", () => {
  it("everyone except athletes is staff", () => {
    expect(isStaff("owner")).toBe(true);
    expect(isStaff("admin")).toBe(true);
    expect(isStaff("coach")).toBe(true);
    expect(isStaff("pt")).toBe(true);
    expect(isStaff("athlete")).toBe(false);
  });
});
