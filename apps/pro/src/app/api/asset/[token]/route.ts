import { fetchAssetByToken } from "@vytal-fit/api";

export const dynamic = "force-dynamic";

// Serves image assets via an HMAC-signed capability token (not a raw store ref).
// No session required — the signature is the access control. fetchAssetByToken
// confines the key to its own tenant prefix. Any failure maps to 404 so the
// route never leaks why a token was rejected.
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ token: string }> },
) {
  const { token: encoded } = await params;
  const token = decodeURIComponent(encoded);
  try {
    const { bytes, contentType } = await fetchAssetByToken(token);
    return new Response(new Uint8Array(bytes), {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch {
    return new Response("Not found", { status: 404 });
  }
}
