import { redirect } from "next/navigation";

export const dynamic = "force-static";

export async function generateStaticParams() {
  return [];
}

export default async function DocsDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  redirect(`https://docs.vytal.fit/${slug}`);
}
