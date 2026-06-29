import { redirect } from "next/navigation";

export default function DeveloperDocsPage() {
  redirect("/openapi.json");
}
