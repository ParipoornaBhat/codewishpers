import type { NextAuthConfig } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { adminAccounts } from "@/lib/admin"; // ✅ import admin metadata
import { db } from "@/server/db";
// --- Type augmentation ---
declare module "next-auth" {
  interface Session {
    user: {
      id?: string;
      teamName: string;
      role: string;
      permissions: string[];
      email?: string | null;
      emailVerified?: Date | null;
    };
  }

  interface User {
    id?: string;
    teamName: string;
    role: string;
    permissions: string[];
    email?: string | null;
  }
}

export const authConfig: NextAuthConfig = {
  providers: [
    // ✅ Team login (teamName only)
   CredentialsProvider({
  id: "team-login",
  name: "Team Login",
  credentials: {
    teamName: { label: "Team Name", type: "text" },
  },
  async authorize(credentials) {
    const teamName =
      typeof credentials?.teamName === "string"
        ? credentials.teamName.trim()
        : "";

    if (!teamName) return null;

    // ✅ Check in DB if this team exists
    const team = await db.team.findFirst({
      where: {
        name: teamName,
      },
    });

    if (!team) return null;

    return {
      id: team.id,
      teamName: team.name,
      role: "TEAM",
      permissions: [], // add if needed
    };
  },
}),

    // ✅ Admin login (userId + password + specific permissions)
CredentialsProvider({
  id: "admin-login",
  name: "Admin Login",
  credentials: {
    userId: { label: "Admin ID", type: "text" },
    password: { label: "Password", type: "password" },
  },
  async authorize(credentials) {
    const userId =
      typeof credentials?.userId === "string" ? credentials.userId.trim() : "";
    const password =
      typeof credentials?.password === "string" ? credentials.password : "";

    if (!userId || !password) return null;

    const admin = adminAccounts.find((a) => a.id === userId);

    if (!admin) return null;
    if (admin.password !== password) return null;

    return {
      id: admin.id,
      teamName: admin.teamName,
      role: "ADMIN",
      permissions: admin.permissions,
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
    signIn: "/auth/signin",
  },

  cookies: {
    sessionToken: {
      name: `next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: "lax",
        secure: true,
        path: "/",
      },
    },
  },

  trustHost: true,
};
