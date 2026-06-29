"use client";

// Public invite acceptance page at /invite/[id], handling both signed-in and
// signed-out visitors (state machine in AcceptState below).
//
// SECURITY: getInvitation requires a session that owns the invite email, so we
// only call it once signed in. The signed-out card stays generic and never leaks
// the org name or inviter — the link may be shared in untrusted channels.
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  AlertTriangle,
  CheckCircle2,
  Loader2,
  LogIn,
  LogOut,
  MailCheck,
  UserPlus,
  Users,
} from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { useI18n } from "@/lib/i18n";
import { useAuthStore } from "@/stores/auth-store";

type AcceptState =
  | { kind: "loading" }
  | { kind: "signed-out" }
  | {
      kind: "context";
      orgName: string;
      inviterEmail: string;
      email: string;
      role: string;
    }
  | { kind: "working" }
  | { kind: "success"; orgName: string }
  | { kind: "declined" }
  | { kind: "wrong-email"; currentEmail: string }
  | { kind: "expired" }
  | { kind: "verify-email" }
  | { kind: "error"; message: string };

export default function InvitePage() {
  const { t } = useI18n();
  const params = useParams<{ id: string }>();
  const invitationId = params?.id ?? "";

  const sessionUser = useAuthStore((s) => s.user);
  const sessionHydrated = useAuthStore((s) => s.hydrated);
  const hydrate = useAuthStore((s) => s.hydrate);
  const [state, setState] = useState<AcceptState>({ kind: "loading" });

  // Accept/setActive mutate the session, re-firing useSession; without this freeze
  // the effect re-fetches getInvitation on the already-accepted invite and flashes
  // the expired card before redirect.
  const mutationStarted = useRef(false);

  useEffect(() => {
    if (mutationStarted.current) return;
    if (!sessionHydrated) return;
    if (!invitationId) {
      setState({ kind: "error", message: t("invite.missingId") });
      return;
    }
    if (!sessionUser) {
      setState({ kind: "signed-out" });
      return;
    }

    let cancelled = false;
    void (async () => {
      const result = await authClient.organization.getInvitation({
        query: { id: invitationId },
      });
      if (cancelled) return;

      if (result.error || !result.data) {
        setState(mapInviteError(result.error?.message, sessionUser.user.email, t));
        return;
      }

      const inv = result.data as {
        email: string;
        role: string;
        organizationName: string;
        inviterEmail: string;
      };
      setState({
        kind: "context",
        orgName: inv.organizationName,
        inviterEmail: inv.inviterEmail,
        email: inv.email,
        role: inv.role,
      });
    })();

    return () => {
      cancelled = true;
    };
  }, [sessionUser, sessionHydrated, invitationId, t]);

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  async function handleAccept() {
    // Snapshot the org name now — re-fetching after accept returns "not found".
    const orgNameFromContext =
      state.kind === "context" ? state.orgName : t("invite.defaultOrg");

    mutationStarted.current = true;
    setState({ kind: "working" });

    const result = await authClient.organization.acceptInvitation({
      invitationId,
    });

    if (result.error || !result.data) {
      // Unfreeze — the failure path didn't mutate the session, so re-running is safe.
      mutationStarted.current = false;
        setState(
          mapInviteError(result.error?.message, sessionUser?.user.email ?? "", t),
        );
        return;
      }

    const acceptedOrgId = result.data.invitation?.organizationId;
    // Re-assert the active org: it's set server-side but the client cache can lag,
    // and the (app) guard would otherwise bounce to /onboarding next render.
    if (acceptedOrgId) {
      try {
        await authClient.organization.setActive({ organizationId: acceptedOrgId });
      } catch {
        // Non-fatal — already set server-side.
      }
    }

    setState({ kind: "success", orgName: orgNameFromContext });

    // Hard nav (not router.replace): the (app) org hooks lag setActive over a soft
    // transition and ping-pong to /onboarding; a full load boots consistent state.
    setTimeout(() => {
      window.location.assign("/welcome");
    }, 900);
  }

  async function handleDecline() {
    mutationStarted.current = true;
    setState({ kind: "working" });
    const result = await authClient.organization.rejectInvitation({
      invitationId,
    });
    if (result.error) {
      mutationStarted.current = false;
      setState(
        mapInviteError(result.error.message, sessionUser?.user.email ?? "", t),
      );
      return;
    }
    setState({ kind: "declined" });
  }

  async function handleSignOut() {
    await authClient.signOut();
    mutationStarted.current = false;
    setState({ kind: "signed-out" });
  }

  return (
    <div className="mx-auto w-full max-w-md">
      <div className="rounded-2xl border border-vytal-border bg-vytal-card backdrop-blur-xl p-8">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold tracking-tight">
            <span className="text-base font-medium text-vytal-muted/60">pro</span><span className="text-vytal-green">VYTAL</span>
          </h1>
        </div>

        <InviteCard
          state={state}
          invitationId={invitationId}
          onAccept={handleAccept}
          onDecline={handleDecline}
          onSignOut={handleSignOut}
          t={t}
        />
      </div>

      <p className="mt-8 text-center text-[10px] font-medium uppercase tracking-widest text-vytal-muted/40">
        Powered by Vytal
      </p>
    </div>
  );
}

/** Map a Better Auth invitation error message to a UI state. */
function mapInviteError(
  message: string | undefined,
  currentEmail: string,
  t: (key: string) => string
): AcceptState {
  const msg = message?.toLowerCase() ?? "";
  if (msg.includes("recipient")) {
    return { kind: "wrong-email", currentEmail };
  }
  if (msg.includes("verification")) {
    return { kind: "verify-email" };
  }
  if (msg.includes("not found") || msg.includes("expired") || msg.includes("invitation")) {
    return { kind: "expired" };
  }
  return { kind: "error", message: message ?? t("invite.loadError") };
}

const primaryBtn =
  "flex w-full items-center justify-center gap-2 rounded-lg bg-vytal-green px-4 py-3 text-sm font-semibold text-vytal-bg transition-all hover:bg-vytal-green/90 disabled:opacity-50 disabled:cursor-not-allowed";
const secondaryBtn =
  "flex w-full items-center justify-center gap-2 rounded-lg border border-vytal-border bg-vytal-bg2 px-4 py-3 text-sm font-semibold text-vytal-text transition-colors hover:border-vytal-green/40 hover:bg-vytal-bg3";

function InviteCard({
  state,
  invitationId,
  onAccept,
  onDecline,
  onSignOut,
  t,
}: {
  state: AcceptState;
  invitationId: string;
  onAccept: () => void;
  onDecline: () => void;
  onSignOut: () => void;
  t: (key: string) => string;
}) {
  switch (state.kind) {
    case "loading":
      return (
        <div className="flex flex-col items-center justify-center gap-3 py-8 text-center">
          <Loader2 className="h-6 w-6 animate-spin text-vytal-green" />
          <p className="text-sm text-vytal-muted">{t("invite.checking")}</p>
        </div>
      );

    case "signed-out":
      return (
        <div className="flex flex-col gap-5 text-center">
          <div className="flex flex-col items-center gap-2">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-vytal-green/10 text-vytal-green">
              <MailCheck className="h-7 w-7" />
            </div>
            <h2 className="text-lg font-bold text-vytal-text">{t("invite.signedOutTitle")}</h2>
            <p className="text-sm text-vytal-muted">{t("invite.signedOutDesc")}</p>
          </div>
          <div className="flex flex-col gap-2">
            <Link
              href={`/login?invite=${encodeURIComponent(invitationId)}`}
              className={primaryBtn}
            >
              <LogIn className="h-4 w-4" />
              {t("invite.signIn")}
            </Link>
            <Link
              href={`/register?invite=${encodeURIComponent(invitationId)}`}
              className={secondaryBtn}
            >
              <UserPlus className="h-4 w-4" />
              {t("invite.createAccount")}
            </Link>
          </div>
        </div>
      );

    case "context":
      return (
        <div className="flex flex-col gap-5 text-center">
          <div className="flex flex-col items-center gap-2">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-vytal-green/10 text-vytal-green">
              <Users className="h-7 w-7" />
            </div>
            <h2 className="text-lg font-bold text-vytal-text">
              {t("invite.contextTitle")}{" "}
              <span className="text-vytal-green">{state.orgName}</span>
            </h2>
            <p className="text-sm text-vytal-muted">
              {t("invite.contextInvitedBy")}{" "}
              <span className="font-medium text-vytal-text">{state.inviterEmail}</span>
              {t("invite.contextAsRole")}{" "}
              <span className="font-medium text-vytal-text">
                {t(`invite.role.${state.role}`)}
              </span>
              .
            </p>
            <p className="text-xs text-vytal-muted/70">
              {t("invite.contextEmail")}{" "}
              <span className="font-medium text-vytal-muted">{state.email}</span>
            </p>
          </div>
          <div className="flex flex-col gap-2">
            <button type="button" onClick={onAccept} className={primaryBtn}>
              <CheckCircle2 className="h-4 w-4" />
              {t("invite.accept")}
            </button>
            <button type="button" onClick={onDecline} className={secondaryBtn}>
              {t("invite.decline")}
            </button>
          </div>
        </div>
      );

    case "working":
      return (
        <div className="flex flex-col items-center justify-center gap-3 py-8 text-center">
          <Loader2 className="h-6 w-6 animate-spin text-vytal-green" />
          <p className="text-sm text-vytal-muted">{t("invite.working")}</p>
        </div>
      );

    case "success":
      return (
        <div className="flex flex-col items-center justify-center gap-3 py-4 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-vytal-green/10 text-vytal-green">
            <CheckCircle2 className="h-7 w-7" />
          </div>
          <h2 className="text-lg font-bold text-vytal-text">
            {t("invite.successTitle")}{" "}
            <span className="text-vytal-green">{state.orgName}</span>
          </h2>
          <p className="text-sm text-vytal-muted">{t("invite.successDesc")}</p>
        </div>
      );

    case "declined":
      return (
        <div className="flex flex-col items-center justify-center gap-3 py-4 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-vytal-bg3 text-vytal-muted">
            <LogOut className="h-7 w-7" />
          </div>
          <h2 className="text-lg font-bold text-vytal-text">{t("invite.declinedTitle")}</h2>
          <p className="text-sm text-vytal-muted">{t("invite.declinedDesc")}</p>
          <Link href="/login" className={`${secondaryBtn} mt-2`}>
            {t("invite.goSignIn")}
          </Link>
        </div>
      );

    case "wrong-email":
      return (
        <div className="flex flex-col gap-5 text-center">
          <div className="flex flex-col items-center gap-2">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-vytal-amber/10 text-vytal-amber">
              <AlertTriangle className="h-7 w-7" />
            </div>
            <h2 className="text-lg font-bold text-vytal-text">{t("invite.wrongEmailTitle")}</h2>
            <p className="text-sm text-vytal-muted">
              {t("invite.wrongEmailBefore")}{" "}
              <span className="font-medium text-vytal-text">{state.currentEmail}</span>
              {t("invite.wrongEmailAfter")}
            </p>
          </div>
          <button type="button" onClick={onSignOut} className={secondaryBtn}>
            <LogOut className="h-4 w-4" />
            {t("invite.signOut")}
          </button>
        </div>
      );

    case "verify-email":
      return (
        <div className="flex flex-col gap-5 text-center">
          <div className="flex flex-col items-center gap-2">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-vytal-amber/10 text-vytal-amber">
              <MailCheck className="h-7 w-7" />
            </div>
            <h2 className="text-lg font-bold text-vytal-text">{t("invite.verifyTitle")}</h2>
            <p className="text-sm text-vytal-muted">{t("invite.verifyDesc")}</p>
          </div>
        </div>
      );

    case "expired":
      return (
        <div className="flex flex-col gap-5 text-center">
          <div className="flex flex-col items-center gap-2">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-vytal-red/10 text-vytal-red">
              <AlertTriangle className="h-7 w-7" />
            </div>
            <h2 className="text-lg font-bold text-vytal-text">{t("invite.expiredTitle")}</h2>
            <p className="text-sm text-vytal-muted">{t("invite.expiredDesc")}</p>
          </div>
          <Link href="/login" className={secondaryBtn}>
            {t("invite.goSignIn")}
          </Link>
        </div>
      );

    case "error":
      return (
        <div className="flex flex-col gap-5 text-center">
          <div className="flex flex-col items-center gap-2">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-vytal-red/10 text-vytal-red">
              <AlertTriangle className="h-7 w-7" />
            </div>
            <h2 className="text-lg font-bold text-vytal-text">{t("invite.errorTitle")}</h2>
            <p className="text-sm text-vytal-muted">{state.message}</p>
          </div>
          <Link href="/login" className={secondaryBtn}>
            {t("invite.goSignIn")}
          </Link>
        </div>
      );
  }
}
