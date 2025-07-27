import { PrismaAdapter } from "@auth/prisma-adapter";
import { type DefaultSession, type NextAuthConfig } from "next-auth";
import Google from "next-auth/providers/google";

import { db } from "@/server/db";

/**
 * Module augmentation for `next-auth` types. Allows us to add custom properties to the `session`
 * object and keep type safety.
 *
 * @see https://next-auth.js.org/getting-started/typescript#module-augmentation
 */
declare module "next-auth" {
  interface Session extends DefaultSession {
    user: {
      id: string;
      role: string;
      reputation: number;
      // ...other properties
    } & DefaultSession["user"];
  }

  interface User {
    role: string;
    reputation: number;
    // ...other properties
  }
}

/**
 * Options for NextAuth.js used to configure adapters, providers, callbacks, etc.
 *
 * @see https://next-auth.js.org/configuration/options
 */
export const authConfig = {
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID,
      clientSecret: process.env.AUTH_GOOGLE_SECRET,
    }),
  ],
  adapter: PrismaAdapter(db) as NextAuthConfig["adapter"], // Type fix for version mismatch
  // Enable trust host for localhost development
  trustHost: true,
  // Cookie configuration for proper CSRF handling
  cookies: {
    sessionToken: {
      name: "next-auth.session-token",
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: false, // Set to false for localhost
      },
    },
    csrfToken: {
      name: "next-auth.csrf-token",
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: false, // Set to false for localhost
      },
    },
  },
  callbacks: {
    session: async ({ session, token }) => {
      // Ensure we have a valid session and token before proceeding
      if (session?.user && token?.sub) {
        session.user.id = token.sub;
        
        // Fetch user role and reputation from database
        try {
          const user = await db.user.findUnique({
            where: { id: token.sub },
            select: { role: true, reputation: true },
          });
          
          if (user) {
            session.user.role = user.role;
            session.user.reputation = user.reputation;
          } else {
            // Fallback for new users
            session.user.role = 'AUTHOR';
            session.user.reputation = 0;
          }
        } catch (error) {
          console.warn('Failed to fetch user role:', error);
          session.user.role = 'AUTHOR';
          session.user.reputation = 0;
        }
      }
      return session;
    },
    jwt: ({ user, token }) => {
      // Only set uid if we have a valid user object
      if (user?.id) {
        token.uid = user.id;
      }
      return token;
    },
  },
} satisfies NextAuthConfig;
