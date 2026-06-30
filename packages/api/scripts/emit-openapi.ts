/**
 * Emit the generated OpenAPI spec to a JSON file so CI can publish docs that
 * match the committed router (not the lagging live deployment).
 *
 * Usage: tsx scripts/emit-openapi.ts [outfile]   (default: ./openapi.json)
 */
import { writeFileSync } from "node:fs";
import { openApiSpec } from "../src/openapi";

const out = process.argv[2] ?? "openapi.json";
writeFileSync(out, JSON.stringify(openApiSpec, null, 2));
const paths = Object.keys((openApiSpec as { paths: Record<string, unknown> }).paths).length;
console.log(`Wrote ${out} (${paths} paths)`);
