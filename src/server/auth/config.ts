import type { NextAuthConfig } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

// --- Type augmentation ---
declare module "next-auth" {
  interface Session {
    user: {
      id?: string;
      teamName: string;
      role: string;
      permissions: string[];
    };
  }

  interface User {
    id?: string;
    teamName: string;
    role: string;
    permissions: string[];
  }
}

export const authConfig: NextAuthConfig = {
  providers: [
    CredentialsProvider({
      id: "team-login",
      name: "Team Login",
      credentials: {
        teamName: { label: "Team Name", type: "text" },
      },
      async authorize(credentials: Partial<Record<"teamName", unknown>>, req: Request) {
        const teamName = typeof credentials?.teamName === "string" ? credentials.teamName.trim() : "";

        if (!teamName) return null;

        // Simulate user object based on team name only
        return {
          id: teamName.toLowerCase().replace(/\s+/g, "-"),
          teamName,
          role: "TEAM",
          permissions: [], // Or: ['VIEW_DASHBOARD'], etc.
        };
      },
    }),
  ],
  session: {
    strategy: "jwt",
    maxAge: 24 * 60 * 60, // 1 day
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.teamName = user.teamName;
        token.role = user.role;
        token.permissions = user.permissions;
      }
      return token;
    },
    async session({ session, token }) {
      session.user = {
        id: token.id as string,
        teamName: token.teamName as string,
        role: token.role as string,
        permissions: token.permissions as string[],
        email: (token.email as string) ?? "",
        emailVerified: token.emailVerified ? new Date(token.emailVerified as string) : null,
      };
      return session;
    },
  },
  pages: {
    signIn: "/auth/signin", // your custom team login page
  },
  cookies:{
    sessionToken: {
      name: `next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: "lax",
        secure: true,
        path: "/",
      },

    }
  },
  trustHost:true,
}
