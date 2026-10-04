/**
 * NextAuth.js API Route Handler
 *
 * This catch-all route handles all auth-related API requests
 * (sign in, sign out, callback, session, etc.)
 */
import { handlers } from "@/lib/auth";

export const { GET, POST } = handlers;
