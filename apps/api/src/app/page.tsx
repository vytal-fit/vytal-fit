import { redirect } from "next/navigation";

export default function ApiHomePage() {
  redirect("/openapi.json");
}
