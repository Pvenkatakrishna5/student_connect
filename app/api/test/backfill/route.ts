import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseClient";

export async function GET() {
  const { data: users } = await supabaseAdmin
    .from("User")
    .select("*, Student(id)")
    .eq("role", "student");
    
  let created = 0;
  for (const user of users || []) {
    // Supabase returns an array for 1:1 if it doesn't know it's strict
    const hasStudent = Array.isArray(user.Student) ? user.Student.length > 0 : !!user.Student;
    
    if (!hasStudent) {
      await supabaseAdmin
        .from("Student")
        .insert({
          id: crypto.randomUUID(),
          userId: user.id,
          name: "Student",
          updatedAt: new Date().toISOString()
        });
      created++;
    }
  }
  return NextResponse.json({ message: `Created ${created} missing student profiles.` });
}
