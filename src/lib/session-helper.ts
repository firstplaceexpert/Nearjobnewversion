/**
 * Session & Active User Helper
 *
 * Resolves current user from NextAuth session or from demo session cookie,
 * enabling seamless role testing and switching between Poster and Worker.
 */
import { cookies } from "next/headers";
import { auth } from "@/lib/auth";
import { marketplaceStore } from "@/lib/marketplace-store";
import type { UserSummary } from "@/features/tasks/types";

export async function getCurrentUser(): Promise<UserSummary | null> {
  try {
    const session = await auth();
    if (session?.user?.id) {
      const user = marketplaceStore.getUser(session.user.id);
      if (user) return user;
      return {
        id: session.user.id,
        name: session.user.name || "Pengguna",
        email: session.user.email || "",
        role:
          ((session.user as { role?: string }).role as "POSTER" | "WORKER") || "WORKER",
      };
    }
  } catch {
    // NextAuth session not initialized, check cookie
  }

  try {
    const cookieStore = await cookies();
    const activeUserId = cookieStore.get("nearjob_active_user")?.value;
    if (activeUserId) {
      const user = marketplaceStore.getUser(activeUserId);
      if (user) return user;
    }
  } catch {
    // cookies() unavailable in non-request context
  }

  // Default fallback to primary demo user (Dimas Pratama) for smooth exploration if no session
  const defaultUser = marketplaceStore.getUser("usr-poster-budi");
  return defaultUser || null;
}
