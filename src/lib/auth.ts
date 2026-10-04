/**
 * NextAuth.js (Auth.js v5) — Authentication Configuration
 *
 * Uses Credentials provider for email/password auth.
 * Passwords are hashed with bcryptjs — NEVER stored in plaintext.
 *
 * NOTE: Database queries use Prisma 8 ORM syntax:
 *   db.orm.public.User (namespace-aware accessor)
 *
 * @see https://authjs.dev/getting-started
 */
import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { loginSchema } from "@/lib/validations";

export const { handlers, signIn, signOut, auth } = NextAuth({
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },

  pages: {
    signIn: "/login",
    error: "/login",
  },

  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        // Server-side validation with Zod — never trust client input
        const parsed = loginSchema.safeParse(credentials);
        if (!parsed.success) return null;

        const { email, password } = parsed.data;

        // Prisma 8 ORM query — namespace-aware accessor
        const user = await db.orm.public.User.where({
          email: email.toLowerCase(),
        }).first();

        if (!user || !user.hashedPassword) return null;

        const isPasswordValid = await bcrypt.compare(password, user.hashedPassword);
        if (!isPasswordValid) return null;

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        };
      },
    }),
  ],

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as { role: string }).role;
      }
      return token;
    },

    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        (session.user as { role: string }).role = token.role as string;
      }
      return session;
    },
  },
});
