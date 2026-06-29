import { redirect } from "next/navigation";

export default function DeveloperBridgePage() {
  redirect("https://api.vytal.fit/openapi.json");
}
