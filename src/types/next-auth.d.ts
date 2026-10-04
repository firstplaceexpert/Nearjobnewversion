/**
 * NextAuth.js — Type Augmentation
 *
 * Extends the default NextAuth types to include custom fields
 * like `role` on the session user object.
 */
import { type DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: "POSTER" | "WORKER";
    } & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: "POSTER" | "WORKER";
  }
}
