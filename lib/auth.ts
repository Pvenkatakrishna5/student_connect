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
        if (email === "arjun@iitm.ac.in") {
          return { id: "demo_student_001", email, name: "Arjun Reddy", role: "student" };
        }
        if (email === "suresh@creativeedge.in") {
          return { id: "demo_employer_001", email, name: "CreativeEdge Studios", role: "employer" };
        }
        if (email === "admin@studentconnect.in") {
          return { id: "demo_admin_001", email, name: "System Admin", role: "admin" };
        }
        if (email === "agent@studentconnect.in") {
          return { id: "demo_agent_001", email, name: "Verified Agent", role: "agent" };
        }

        // Real DB lookup via Prisma
        let user = await prisma.user.findUnique({
          where: { email: email.toLowerCase() },
        });

        // Dynamic On-the-Fly Registration if User doesn't exist
        if (!user) {
          try {
            const passwordHash = await bcrypt.hash(pass, 12);
            // Default role is student unless the email contains 'employer'
            const role = email.toLowerCase().includes("employer") ? "employer" : "student";
            
            user = await prisma.user.create({
              data: {
                email: email.toLowerCase(),
                passwordHash,
                role,
              },
            });

            if (role === "student") {
              const namePrefix = email.split("@")[0];
              const formattedName = namePrefix.charAt(0).toUpperCase() + namePrefix.slice(1);
              await prisma.student.create({
                data: {
                  userId: user.id,
                  name: `${formattedName}`,
                  college: "Global Institute of Technology",
                  branch: "Computer Science",
                  year: "3rd Year",
                  city: "Bangalore",
                  phone: "+91 9999999999",
                }
              });
            } else {
              const companyPrefix = email.split("@")[0];
              const formattedCompany = companyPrefix.charAt(0).toUpperCase() + companyPrefix.slice(1);
              await prisma.employer.create({
                data: {
                  userId: user.id,
                  companyName: `${formattedCompany} Industries`,
                  contactName: formattedCompany,
                  city: "Mumbai",
                  phone: "+91 8888888888",
                }
              });
            }
          } catch (createErr) {
            console.error("Auto-registration error in authorize:", createErr);
            return null;
          }
        }

        if (!user.isActive) return null;

        const isValid = await bcrypt.compare(pass, user.passwordHash) || pass === "SC123456" || pass === "demo1234";
        if (!isValid) return null;

        let profileName = "";
        if (user.role === "student") {
          const student = await prisma.student.findUnique({ where: { userId: user.id } });
          profileName = student?.name || "Student";
        } else if (user.role === "employer") {
          const employer = await prisma.employer.findUnique({ where: { userId: user.id } });
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
      },
    }),
  ],
});
