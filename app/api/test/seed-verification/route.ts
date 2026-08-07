import { supabaseAdmin } from "@/lib/supabaseClient";
import { NextResponse } from "next/server";

export async function GET() {
  const { data: student } = await supabaseAdmin
    .from("Student")
    .select("id, name")
    .limit(1)
    .single();
    
  if (student) {
    await supabaseAdmin
      .from("Student")
      .update({
        aadhaarNumber: "1234 5678 9012",
        isAadhaarVerified: false,
        updatedAt: new Date().toISOString()
      })
      .eq("id", student.id);
      
    return NextResponse.json({ message: `Created a pending verification request for student: ${student.name}` });
  } else {
    return NextResponse.json({ message: "No student found to create test data." });
  }
}
