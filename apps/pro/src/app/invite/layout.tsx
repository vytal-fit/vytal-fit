"use client";

// Standalone layout outside the (app)/(auth) route groups so it inherits neither
// guard — the invite page handles both signed-in and signed-out visitors itself.
export default function InviteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-vytal-bg">
      <div className="pointer-events-none absolute inset-0">
        <div className="animate-auth-gradient absolute left-1/2 top-1/2 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-vytal-green/[0.04] blur-[120px]" />
        <div className="animate-auth-gradient-delayed absolute right-0 top-0 h-[400px] w-[400px] rounded-full bg-vytal-green/[0.03] blur-[100px]" />
        <div className="animate-auth-gradient absolute bottom-0 left-0 h-[300px] w-[300px] rounded-full bg-vytal-green/[0.02] blur-[80px]" />
      </div>
      <div className="relative z-10 w-full px-4">{children}</div>
    </div>
  );
}
