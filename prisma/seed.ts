/**
 * prisma/seed.ts
 * Run: npx tsx prisma/seed.ts
 *
 * Creates test users for all 4 roles + sample active jobs.
 * Admin:    admin@studentconnect.app  / Admin@1234
 * Student:  student@test.com          / Student@1234
 * Employer: employer@test.com         / Employer@1234
 * Agent:    agent@test.com            / Agent@1234
 */

import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import bcrypt from "bcryptjs";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const pool = new Pool({ connectionString: process.env.DATABASE_URL! });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter } as ConstructorParameters<typeof PrismaClient>[0]);

async function main() {
  console.log("🌱 Seeding StudentConnect database...\n");

  // ─── 1. Admin ─────────────────────────────────────────────────────────────
  const adminHash = await bcrypt.hash("Admin@1234", 12);
  const admin = await prisma.user.upsert({
    where: { email: "admin@studentconnect.app" },
    update: {},
    create: {
      email: "admin@studentconnect.app",
      passwordHash: adminHash,
      role: "admin",
      isVerified: true,
      isActive: true,
    },
  });
  console.log(`✅ Admin:    admin@studentconnect.app  (id: ${admin.id})`);

  // ─── 2. Agent ─────────────────────────────────────────────────────────────
  const agentHash = await bcrypt.hash("Agent@1234", 12);
  const agent = await prisma.user.upsert({
    where: { email: "agent@test.com" },
    update: {},
    create: {
      email: "agent@test.com",
      passwordHash: agentHash,
      role: "agent",
      isVerified: true,
      isActive: true,
    },
  });
  console.log(`✅ Agent:    agent@test.com            (id: ${agent.id})`);

  // ─── 3. Employer ──────────────────────────────────────────────────────────
  const employerHash = await bcrypt.hash("Employer@1234", 12);
  const employerUser = await prisma.user.upsert({
    where: { email: "employer@test.com" },
    update: {},
    create: {
      email: "employer@test.com",
      passwordHash: employerHash,
      role: "employer",
      isVerified: true,
      isActive: true,
    },
  });

  const employer = await prisma.employer.upsert({
    where: { userId: employerUser.id },
    update: {},
    create: {
      userId: employerUser.id,
      companyName: "TechNova Pvt Ltd",
      contactName: "Raj Kumar",
      phone: "9876543210",
      city: "Chennai",
      description: "A fast-growing product startup building EdTech solutions.",
      isVerifiedBusiness: true,
    },
  });
  console.log(`✅ Employer: employer@test.com         (id: ${employerUser.id}, employer.id: ${employer.id})`);

  // ─── 4. Student ───────────────────────────────────────────────────────────
  const studentHash = await bcrypt.hash("Student@1234", 12);
  const studentUser = await prisma.user.upsert({
    where: { email: "student@test.com" },
    update: {},
    create: {
      email: "student@test.com",
      passwordHash: studentHash,
      role: "student",
      isVerified: true,
      isActive: true,
    },
  });

  await prisma.student.upsert({
    where: { userId: studentUser.id },
    update: {},
    create: {
      userId: studentUser.id,
      name: "Arjun Sharma",
      college: "IIT Madras",
      branch: "Computer Science",
      year: "3rd Year",
      city: "Chennai",
      phone: "9123456789",
      skills: ["React", "Node.js", "TypeScript", "Python", "Figma"],
      bio: "Passionate CS student at IIT Madras looking for exciting part-time opportunities to apply my skills.",
      aadhaarNumber: "123456789012",
      isAadhaarVerified: true,
    },
  });
  console.log(`✅ Student:  student@test.com          (id: ${studentUser.id})`);

  // ─── 5. Sample Jobs ───────────────────────────────────────────────────────
  const sampleJobs = [
    {
      title: "React Developer (Part-Time)",
      description: "Build modern UI components for our EdTech SaaS platform. You'll work on dashboard pages, API integrations, and component libraries. Flexible hours, 15-20 hrs/week.",
      category: "Technical",
      payType: "monthly",
      payAmount: 15000,
      location: "Remote",
      isRemote: true,
      skillsRequired: ["React", "TypeScript", "CSS"],
      status: "active" as const,
      spotsAvailable: 2,
      startDate: "Immediate",
    },
    {
      title: "Content Writer — EdTech Blog",
      description: "Write well-researched, SEO-optimised blog articles on education technology, career guidance, and student productivity. 8-10 articles per month.",
      category: "Content",
      payType: "per-word",
      payAmount: 3,
      location: "Remote",
      isRemote: true,
      skillsRequired: ["Content Writing", "SEO", "Research"],
      status: "active" as const,
      spotsAvailable: 3,
      startDate: "Immediate",
    },
    {
      title: "Python Data Analyst",
      description: "Analyze user engagement data using Python and Pandas. Create weekly reports and dashboards. Work 10 hours/week from home.",
      category: "Technical",
      payType: "hourly",
      payAmount: 400,
      location: "Remote",
      isRemote: true,
      skillsRequired: ["Python", "Pandas", "Data Analysis"],
      status: "active" as const,
      spotsAvailable: 1,
      startDate: "Within 1 week",
    },
    {
      title: "UI/UX Designer",
      description: "Design new screens and user flows for our mobile app redesign. Figma-based workflow, collaborate with the dev team twice a week on calls.",
      category: "Design",
      payType: "fixed",
      payAmount: 12000,
      location: "Remote",
      isRemote: true,
      skillsRequired: ["Figma", "UI Design", "Prototyping"],
      status: "active" as const,
      spotsAvailable: 1,
      startDate: "Immediate",
    },
    {
      title: "Mathematics Tutor",
      description: "Teach JEE-level Mathematics to groups of 3-5 students online. Weekend batches, 2 hours per session. Must have strong fundamentals.",
      category: "Education",
      payType: "hourly",
      payAmount: 600,
      location: "Chennai",
      isRemote: false,
      skillsRequired: ["Mathematics", "Teaching", "JEE"],
      status: "active" as const,
      spotsAvailable: 2,
      startDate: "Immediate",
    },
    {
      title: "Social Media Manager",
      description: "Manage Instagram, LinkedIn and Twitter for our brand. Create posts, schedule content, reply to comments. 5-6 hours/week.",
      category: "Marketing",
      payType: "monthly",
      payAmount: 8000,
      location: "Remote",
      isRemote: true,
      skillsRequired: ["Social Media", "Canva", "Content Creation"],
      status: "pending" as const,
      spotsAvailable: 1,
      startDate: "Immediate",
    },
  ];

  let jobCount = 0;
  for (const jobData of sampleJobs) {
    await prisma.job.create({
      data: { ...jobData, employerId: employer.id },
    });
    jobCount++;
  }
  console.log(`✅ Created ${jobCount} sample jobs (5 active + 1 pending)`);

  // ─── 6. Seed Activity Logs ────────────────────────────────────────────────
  await prisma.activity.createMany({
    data: [
      { userId: admin.id, type: "platform_setup", message: "Platform seeded with test data" },
      { userId: employerUser.id, type: "user_registered", message: `New employer joined: TechNova Pvt Ltd` },
      { userId: studentUser.id, type: "user_registered", message: `New student joined: Arjun Sharma` },
    ],
    skipDuplicates: true,
  });

  console.log("\n🎉 Seed complete! You can now test with:\n");
  console.log("   Admin:    admin@studentconnect.app  / Admin@1234");
  console.log("   Student:  student@test.com          / Student@1234");
  console.log("   Employer: employer@test.com         / Employer@1234");
  console.log("   Agent:    agent@test.com            / Agent@1234\n");
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
