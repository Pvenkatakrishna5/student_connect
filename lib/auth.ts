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

        const email = credentials.email as string;
        const pass = credentials.password as string;

        // Demo sandbox accounts — bypass DB for quick demo
        if (email === "arjun@iitm.ac.in" && pass === "demo1234") {
          return { id: "demo_student_001", email, name: "Arjun Reddy", role: "student" };
        }
        if (email === "suresh@creativeedge.in" && pass === "demo1234") {
          return { id: "demo_employer_001", email, name: "CreativeEdge Studios", role: "employer" };
        }
        if (email === "admin@studentconnect.in" && pass === "admin1234") {
          return { id: "demo_admin_001", email, name: "System Admin", role: "admin" };
        }

        // Real DB lookup via Prisma
        const user = await prisma.user.findUnique({
          where: { email: email.toLowerCase() },
        });

        if (!user || !user.isActive) return null;

        const isValid = await bcrypt.compare(pass, user.passwordHash);
        if (!isValid) return null;

        let profileName = "";
        if (user.role === "student") {
          const student = await prisma.student.findUnique({ where: { userId: user.id } });
          profileName = student?.name || "";
        } else if (user.role === "employer") {
          const employer = await prisma.employer.findUnique({ where: { userId: user.id } });
          profileName = employer?.companyName || "";
        } else {
          profileName = "Admin";
        }

        return {
          id: user.id,
          email: user.email,
          name: profileName,
          role: user.role,
        };
      },
    }),
  ],
});
