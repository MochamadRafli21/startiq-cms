import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function requireSession() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return {
      session,
      error: "No Session Found",
    };
  }
  return {
    session,
    error: null,
  };
}
