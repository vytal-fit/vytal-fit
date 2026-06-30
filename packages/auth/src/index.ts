// `createAuth(options)` factory so modules stay importable without env vars —
// nothing reads the environment at import time.
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { bearer } from "better-auth/plugins/bearer";
import { organization } from "better-auth/plugins";
import { createAccessControl } from "better-auth/plugins/access";
import {
  adminAc,
  defaultStatements,
  memberAc,
  ownerAc,
} from "better-auth/plugins/organization/access";
import { schema, type Database } from "@vytal-fit/db";
import {
  sendEmail,
  verificationEmail,
  passwordResetEmail,
  passwordChangedEmail,
  invitationEmail,
  welcomeEmail,
} from "@vytal-fit/email";

// Access control — roles mirror the shared `UserRole` union:
// owner > admin > coach > pt > athlete
export const accessControl = createAccessControl(defaultStatements);

export const roles = {
  owner: accessControl.newRole({ ...ownerAc.statements }),
  admin: accessControl.newRole({ ...adminAc.statements }),
  coach: accessControl.newRole({
    member: ["create", "update"],
    invitation: ["create"],
  }),
  pt: accessControl.newRole({
    member: ["update"],
  }),
  athlete: accessControl.newRole({ ...memberAc.statements }),
} as const;

export interface CreateAuthOptions {
  /** Drizzle database (postgres-js in production, PGlite in tests). */
  db: Database;
  /** Secret for hashing/signing. Defaults to BETTER_AUTH_SECRET when set. */
  secret?: string;
  /** Base URL of the auth server. Defaults to BETTER_AUTH_URL when set. */
  baseURL?: string;
  /** Mounted Better Auth path. Defaults to /auth for the standalone API app. */
  basePath?: string;
}

function parseOrigins(raw: string | undefined): string[] {
  if (!raw) return [];
  return raw
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean)
    .flatMap((origin) => {
      try {
        return [new URL(origin).origin];
      } catch {
        return [];
      }
    });
}

/** Build the Vytal Better Auth instance bound to the given database. */
export function createAuth(options: CreateAuthOptions) {
  // `baseURL` is the API/auth server origin; `appUrl` is the user-facing web
  // app origin. They stay distinct so auth can live on api.vytal.fit while the
  // product UI lives on pro.vytal.fit.
  const baseURL =
    options.baseURL ?? process.env.BETTER_AUTH_URL ?? "http://localhost:3000";
  const basePath =
    options.basePath ?? process.env.BETTER_AUTH_BASE_PATH ?? "/auth";
  const appUrl =
    process.env.NEXT_PUBLIC_APP_URL ??
    process.env.NEXT_PUBLIC_ADMIN_URL ??
    baseURL;
  const trustedOriginEnv = parseOrigins(
    process.env.BETTER_AUTH_TRUSTED_ORIGINS,
  );
  const canonicalVytalOrigins = [
    "https://vytal.fit",
    "https://www.vytal.fit",
    "https://pro.vytal.fit",
    "https://www.pro.vytal.fit",
    "https://my.vytal.fit",
    "https://www.my.vytal.fit",
    "https://api.vytal.fit",
    "https://www.api.vytal.fit",
  ];
  const trustedOrigins = Array.from(
    new Set(
      [
        baseURL,
        appUrl,
        ...canonicalVytalOrigins,
        ...trustedOriginEnv,
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://[::1]:3000",
      ].flatMap((origin) => {
        try {
          return [new URL(origin).origin];
        } catch {
          return [];
        }
      }),
    ),
  );
  const supportUrl = `${appUrl}/support`;
  // PT-first: default transactional email to Portuguese until per-user locale is wired.
  const emailLocale = "pt" as const;

  // Only enabled when both credentials are present, so the package stays
  // importable (and tests/CI run) without OAuth configured.
  const googleClientId = process.env.GOOGLE_CLIENT_ID;
  const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const socialProviders =
    googleClientId && googleClientSecret
      ? {
          google: {
            clientId: googleClientId,
            clientSecret: googleClientSecret,
            prompt: "select_account" as const,
          },
        }
      : undefined;

  return betterAuth({
    appName: "Vytal",
    secret: options.secret ?? process.env.BETTER_AUTH_SECRET,
    baseURL: options.baseURL ?? process.env.BETTER_AUTH_URL,
    basePath,
    trustedOrigins,
    database: drizzleAdapter(options.db, {
      provider: "pg",
      schema,
    }),

    emailAndPassword: {
      enabled: true,
      // Don't block sign-in for unverified accounts; meaningful actions are gated in the UI.
      requireEmailVerification: false,
      sendResetPassword: async ({ user, url, token }) => {
        // Default `url` points at the API route (validates + bounces); we want
        // the user on the in-app form, carrying the original callbackURL through.
        const callbackURL =
          new URL(url, baseURL).searchParams.get("callbackURL") ?? "/login";
        const resetUrl = `${baseURL}/reset-password/${token}?callbackURL=${encodeURIComponent(callbackURL)}`;
        const built = passwordResetEmail({
          name: user.name,
          resetUrl,
          locale: emailLocale,
        });
        await sendEmail({
          to: user.email,
          ...built,
          tags: ["password-reset"],
        });
      },
      // Tripwire: notify the user whenever their password actually changes.
      onPasswordReset: async ({ user }) => {
        const built = passwordChangedEmail({
          name: user.name,
          changedAt: new Date().toISOString(),
          supportUrl,
          locale: emailLocale,
        });
        await sendEmail({
          to: user.email,
          ...built,
          tags: ["password-changed"],
        });
      },
    },

    // OAuth signups skip verification — the provider's id_token already proves it.
    emailVerification: {
      sendOnSignUp: true,
      autoSignInAfterVerification: true,
      sendVerificationEmail: async ({ user, url }) => {
        // Force post-verify callbackURL to /welcome (the gym-picker hub).
        const verifyUrl = new URL(url, baseURL);
        verifyUrl.searchParams.set("callbackURL", "/welcome");
        const built = verificationEmail({
          name: user.name,
          verifyUrl: verifyUrl.toString(),
          locale: emailLocale,
        });
        await sendEmail({
          to: user.email,
          ...built,
          tags: ["verification"],
        });
      },
    },

    socialProviders,

    // Link a later Google sign-in to the existing email/password account (same
    // verified email) instead of duplicating. allowDifferentEmails:false confines
    // linking to the matching verified email only.
    account: {
      accountLinking: {
        enabled: true,
        trustedProviders: ["google"],
        allowDifferentEmails: false,
        updateUserInfoOnLink: true,
      },
    },

    plugins: [
      bearer(),
      organization({
        ac: accessControl,
        roles,
        creatorRole: "owner",
        sendInvitationEmail: async ({ id, role, email, organization: org, inviter }) => {
          const inviteUrl = `${baseURL}/invite/${id}`;
          const built = invitationEmail({
            inviterName: inviter.user.name || inviter.user.email,
            organizationName: org.name,
            role,
            inviteUrl,
            locale: emailLocale,
          });
          await sendEmail({
            to: email,
            ...built,
            tags: ["invitation"],
          });
        },
        // Best-effort — a failed welcome email must never break org creation.
        organizationHooks: {
          afterCreateOrganization: async ({ organization: newOrg, user }) => {
            try {
              const built = welcomeEmail({
                name: user.name,
                appUrl,
                organizationName: newOrg.name,
                locale: emailLocale,
              });
              await sendEmail({
                to: user.email,
                ...built,
                tags: ["welcome", "founder"],
              });
            } catch (e) {
              console.warn("[auth] welcome email (founder) failed:", e);
            }
          },
        },
      }),
    ],
  });
}

export type Auth = ReturnType<typeof createAuth>;
export type Session = Auth["$Infer"]["Session"];
export type AuthUser = Auth["$Infer"]["Session"]["user"];
