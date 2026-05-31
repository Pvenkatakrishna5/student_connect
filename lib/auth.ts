import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import prisma from "@/lib/prisma";

export const { handlers, auth, signIn, signOut } = NextAuth({
  secret: process.env.NEXTAUTH_SECRET,
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as { role?: string }).role;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
      }
      return session;
    },
  },
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const email = (credentials.email as string).toLowerCase().trim();
        const pass = credentials.password as string;

        try {
          const user = await prisma.user.findUnique({
            where: { email: email },
          });

          if (!user) {
            console.error(`Authorize failed: User not found (${email})`);
            return null;
          }

          if (!user.isActive) {
            console.error(`Authorize failed: User is inactive (${email})`);
            return null;
          }

          const isValid = await bcrypt.compare(pass, user.passwordHash);
          if (!isValid) {
            console.error(`Authorize failed: Wrong password (${email})`);
            return null;
          }

          let profileName = "";
          if (user.role === "student") {
            const student = await prisma.student.findUnique({ where: { userId: user.id } }).catch(() => null);
            profileName = student?.name || "Student";
          } else if (user.role === "employer") {
            const employer = await prisma.employer.findUnique({ where: { userId: user.id } }).catch(() => null);
            profileName = employer?.companyName || "Employer";
          } else if (user.role === "agent") {
            profileName = "Verified Agent";
          } else {
            profileName = "Admin";
          }

          return {
            id: user.id,
            email: user.email,
            name: profileName,
            role: user.role,
          };
        } catch (dbErr) {
          console.error("Database connection failure in NextAuth authorize callback:", dbErr);
          throw new Error("Database connection failure");
        }
      },
    }),
  ],
});
