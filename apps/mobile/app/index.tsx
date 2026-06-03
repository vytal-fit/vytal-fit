import { Redirect } from "expo-router";

export default function Index() {
  // In a real app this would check auth state; for POC just go to login
  return <Redirect href="/login" />;
}
