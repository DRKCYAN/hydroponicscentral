import { redirect } from "next/navigation";

/** The product root lands on the returning-user home: the Dashboard. */
export default function AppIndex() {
  redirect("/app/dashboard");
}
