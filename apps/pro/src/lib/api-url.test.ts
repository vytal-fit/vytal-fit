import { afterEach, describe, expect, it, vi } from "vitest";
import { getApiOrigin, getApiUrl, getAuthUrl } from "./api-url";

describe("api-url helpers", () => {
  const originalApiUrl = process.env.NEXT_PUBLIC_API_URL;
  const originalVercelUrl = process.env.VERCEL_URL;

  afterEach(() => {
    if (originalApiUrl === undefined) {
      delete process.env.NEXT_PUBLIC_API_URL;
    } else {
      process.env.NEXT_PUBLIC_API_URL = originalApiUrl;
    }

    if (originalVercelUrl === undefined) {
      delete process.env.VERCEL_URL;
    } else {
      process.env.VERCEL_URL = originalVercelUrl;
    }

    vi.unstubAllGlobals();
  });

  it("uses the public API origin when configured", () => {
    process.env.NEXT_PUBLIC_API_URL = "https://api.vytal.fit/";

    expect(getApiOrigin()).toBe("https://api.vytal.fit");
    expect(getApiUrl("/health")).toBe("https://api.vytal.fit/health");
    expect(getAuthUrl("/sign-in/email")).toBe(
      "https://api.vytal.fit/auth/sign-in/email",
    );
  });

  it("falls back to window.location.origin in the browser", () => {
    delete process.env.NEXT_PUBLIC_API_URL;
    vi.stubGlobal("window", { location: { origin: "https://pro.vytal.fit" } });

    expect(getApiOrigin()).toBe("https://pro.vytal.fit");
    expect(getAuthUrl("")).toBe("https://pro.vytal.fit/auth");
  });

  it("falls back to the Vercel deployment origin on the server", () => {
    delete process.env.NEXT_PUBLIC_API_URL;
    process.env.VERCEL_URL = "vytal-fit.vercel.app";

    expect(getApiOrigin()).toBe("https://vytal-fit.vercel.app");
  });
});
