import { afterEach, describe, expect, it } from "vitest";
import { getSignInUrl } from "./urls";

describe("getSignInUrl", () => {
  const originalApp = process.env.NEXT_PUBLIC_APP_URL;
  const original = process.env.NEXT_PUBLIC_ADMIN_URL;

  afterEach(() => {
    if (originalApp === undefined) {
      delete process.env.NEXT_PUBLIC_APP_URL;
    } else {
      process.env.NEXT_PUBLIC_APP_URL = originalApp;
    }
    if (original === undefined) {
      delete process.env.NEXT_PUBLIC_ADMIN_URL;
    } else {
      process.env.NEXT_PUBLIC_ADMIN_URL = original;
    }
  });

  it("stays same-origin in dev/preview when NEXT_PUBLIC_APP_URL is unset", () => {
    // Regression guard: on localhost the Sign In link must NOT point at the
    // production admin host, or the local session/cookies are lost and both
    // email and Google sign-in appear broken.
    delete process.env.NEXT_PUBLIC_APP_URL;
    delete process.env.NEXT_PUBLIC_ADMIN_URL;
    expect(getSignInUrl()).toBe("/login");
  });

  it("points at the configured app host in production", () => {
    process.env.NEXT_PUBLIC_APP_URL = "https://pro.vytal.fit";
    expect(getSignInUrl()).toBe("https://pro.vytal.fit/login");
  });

  it("falls back to the legacy admin env when app env is unset", () => {
    delete process.env.NEXT_PUBLIC_APP_URL;
    process.env.NEXT_PUBLIC_ADMIN_URL = "https://pro.vytal.fit";
    expect(getSignInUrl()).toBe("https://pro.vytal.fit/login");
  });

  it("treats a blank/whitespace value as unset", () => {
    process.env.NEXT_PUBLIC_APP_URL = "   ";
    expect(getSignInUrl()).toBe("/login");
  });

  it("does not double the slash when the app URL has a trailing slash", () => {
    process.env.NEXT_PUBLIC_APP_URL = "https://pro.vytal.fit/";
    expect(getSignInUrl()).toBe("https://pro.vytal.fit/login");
  });
});
