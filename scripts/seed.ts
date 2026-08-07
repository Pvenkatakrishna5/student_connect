/**
 * scripts/seed.ts
 * Run: npx tsx scripts/seed.ts
 *
 * Creates test users for all 4 roles + sample active jobs using Supabase JS client.
 */

import { createClient } from "@supabase/supabase-js";
import bcrypt from "bcryptjs";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

if (!supabaseUrl || !serviceRoleKey) {
  console.error("Missing Supabase credentials in .env.local");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false }
});

async function main() {
  console.log("🌱 Seeding StudentConnect database via Supabase REST API...\n");

  // Helper to upsert a user (since Supabase JS doesn't have an exact upsert that matches by email nicely for this table)
  async function upsertUser(email: string, role: string) {
    const { data: existing, error } = await supabase.from("User").select("*").eq("email", email).maybeSingle();
    if (existing) {
      const hash = await bcrypt.hash(`${role.charAt(0).toUpperCase() + role.slice(1)}@1234`, 12);
      await supabase.from("User").update({ passwordHash: hash, role, isVerified: true, isActive: true }).eq("id", existing.id);
      return existing;
    } else {
      const hash = await bcrypt.hash(`${role.charAt(0).toUpperCase() + role.slice(1)}@1234`, 12);
      const { data } = await supabase.from("User").insert({ email, passwordHash: hash, role, isVerified: true, isActive: true, updatedAt: new Date().toISOString() }).select().single();
      return data;
    }
  }

  // ─── 1. Admin ─────────────────────────────────────────────────────────────
  const admin = await upsertUser("admin@studentconnect.app", "admin");
  console.log(`✅ Admin:    admin@studentconnect.app  (id: ${admin?.id})`);

  // ─── 2. Agent ─────────────────────────────────────────────────────────────
  const agent = await upsertUser("agent@test.com", "agent");
  console.log(`✅ Agent:    agent@test.com            (id: ${agent?.id})`);

  // ─── 3. Employer ──────────────────────────────────────────────────────────
  const employerUser = await upsertUser("employer@test.com", "employer");
  
  const { data: existingEmployer } = await supabase.from("Employer").select("*").eq("userId", employerUser?.id).maybeSingle();
  let employer;
  if (!existingEmployer) {
    const { data } = await supabase.from("Employer").insert({
      userId: employerUser?.id,
      companyName: "TechNova Pvt Ltd",
      contactName: "Raj Kumar",
      phone: "9876543210",
      city: "Chennai",
      description: "A fast-growing product startup building EdTech solutions.",
      isVerifiedBusiness: true,
      approvalStatus: "approved",
      profileCompleted: true,
      updatedAt: new Date().toISOString()
    }).select().single();
    employer = data;
  } else {
    employer = existingEmployer;
  }
  console.log(`✅ Employer: employer@test.com         (id: ${employerUser.id})`);

  // ─── 4. Student ───────────────────────────────────────────────────────────
  const studentUser = await upsertUser("student@test.com", "student");
  
  const { data: existingStudent } = await supabase.from("Student").select("*").eq("userId", studentUser?.id).maybeSingle();
  if (!existingStudent) {
    await supabase.from("Student").insert({
      userId: studentUser?.id,
      name: "Arjun Sharma",
      college: "IIT Madras",
      branch: "Computer Science",
      year: "3rd Year",
      city: "Chennai",
      phone: "9123456789",
      skills: ["React", "Node.js", "TypeScript", "Python", "Figma"],
      bio: "Passionate CS student at IIT Madras looking for exciting part-time opportunities.",
      aadhaarNumber: "123456789012",
      isAadhaarVerified: true,
      profileCompleted: true,
      updatedAt: new Date().toISOString()
    });
  }
  console.log(`✅ Student:  student@test.com          (id: ${studentUser.id})`);

  // ─── 6. Seed Activity Logs ────────────────────────────────────────────────
  await supabase.from("Activity").insert([
    { userId: admin.id, type: "platform_setup", message: "Platform seeded with test data", createdAt: new Date().toISOString() },
    { userId: employerUser.id, type: "user_registered", message: `New employer joined: TechNova Pvt Ltd`, createdAt: new Date().toISOString() },
    { userId: studentUser.id, type: "user_registered", message: `New student joined: Arjun Sharma`, createdAt: new Date().toISOString() }
  ]);

  console.log("\n🎉 Seed complete! You can now test with:\n");
  console.log("   Admin:    admin@studentconnect.app  / Admin@1234");
  console.log("   Student:  student@test.com          / Student@1234");
  console.log("   Employer: employer@test.com         / Employer@1234");
  console.log("   Agent:    agent@test.com            / Agent@1234\n");
}

main().catch(console.error);
