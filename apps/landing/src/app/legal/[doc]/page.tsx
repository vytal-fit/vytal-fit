import { notFound } from "next/navigation";
import { LegalBody } from "./legal-body";
import { LEGAL_SLUGS, type LegalSlug } from "@/lib/legal-content";

// Prerender all five legal documents at build time.
export function generateStaticParams() {
  return LEGAL_SLUGS.map((doc) => ({ doc }));
}

function isLegalSlug(value: string): value is LegalSlug {
  return (LEGAL_SLUGS as readonly string[]).includes(value);
}

export default async function LegalPage({
  params,
}: {
  params: Promise<{ doc: string }>;
}) {
  const { doc } = await params;
  if (!isLegalSlug(doc)) notFound();
  return <LegalBody slug={doc} />;
}
