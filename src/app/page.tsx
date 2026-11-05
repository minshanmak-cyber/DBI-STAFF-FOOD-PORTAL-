import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";

export default async function HomePage() {
  const session = await getSession();

  if (!session) {
    redirect("/login");
  }

  if (session.mustChangePassword) {
    redirect("/change-password?firstLogin=true");
  }

  if (session.role === "ADMIN") {
    redirect("/admin");
  }

  if (session.role === "CANTEEN") {
    redirect("/canteen");
  }

  redirect("/staff");
}

