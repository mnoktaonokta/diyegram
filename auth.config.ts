import type { NextAuthConfig } from "next-auth";

import { getRoleHomePath } from "@/types/role";
import type { Role } from "@/types/role";

export { getRoleHomePath };

export const authConfig = {
  pages: {
    signIn: "/login",
  },
  providers: [],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id;
        token.role = user.role as Role;
        token.name = user.name;
      }

      if (trigger === "update" && session?.name) {
        token.name = session.name;
      }

      return token;
    },
    session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as Role;

        if (token.name) {
          session.user.name = token.name as string;
        }
      }
      return session;
    },
  },
} satisfies NextAuthConfig;
