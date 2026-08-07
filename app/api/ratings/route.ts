import { auth } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseClient";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");
    if (!userId) {
      return NextResponse.json({ error: "userId required" }, { status: 400 });
    }
    
    // In Supabase we need to embed related tables if we want nested data
    const { data: ratings, error } = await supabaseAdmin
      .from("Rating")
      .select(`
        *,
        from:fromId (email, role),
        job:jobId (title)
      `)
      .eq("toId", userId)
      .order("createdAt", { ascending: false })
      .limit(20);
      
    if (error) throw error;
    
    // We also need student/employer data for the 'from' user. 
    // Since Supabase doesn't easily do nested-nested polymorphic joins without RPC, 
    // we fetch them manually.
    const fromUserIds = ratings.map(r => r.fromId);
    
    // Fetch students
    const { data: students } = await supabaseAdmin
      .from("Student")
      .select("userId, name")
      .in("userId", fromUserIds);
      
    // Fetch employers
    const { data: employers } = await supabaseAdmin
      .from("Employer")
      .select("userId, companyName")
      .in("userId", fromUserIds);
      
    // Map back
    const mappedRatings = ratings.map(r => {
      const isStudent = r.from?.role === "student";
      const studentMatch = students?.find(s => s.userId === r.fromId);
      const employerMatch = employers?.find(e => e.userId === r.fromId);
      
      return {
        ...r,
        from: {
          ...r.from,
          student: isStudent && studentMatch ? { name: studentMatch.name } : null,
          employer: !isStudent && employerMatch ? { companyName: employerMatch.companyName } : null
        }
      };
    });

    return NextResponse.json(mappedRatings);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { toId, toRole, jobId, score, review, applicationId } = await req.json();

    if (!toId || !score) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // 1. Create the rating record
    const { data: rating, error: rErr } = await supabaseAdmin
      .from("Rating")
      .insert({
        id: crypto.randomUUID(),
        fromId: session.user.id,
        toId,
        toRole,
        jobId,
        score: Number(score),
        review: review || "",
        createdAt: new Date().toISOString()
      })
      .select()
      .single();
      
    if (rErr) throw rErr;

    // 2. Update the target's aggregate rating (if student)
    if (toRole === "student") {
      const { data: student } = await supabaseAdmin
        .from("Student")
        .select("id, rating, totalRatings")
        .eq("userId", toId)
        .single();
        
      if (student) {
        const newTotalRatings = student.totalRatings + 1;
        const newRating = ((student.rating * student.totalRatings) + Number(score)) / newTotalRatings;
        
        await supabaseAdmin
          .from("Student")
          .update({
            rating: newRating,
            totalRatings: newTotalRatings
          })
          .eq("userId", toId);
          
        // Note: completedJobs increment is usually handled during payment flow, 
        // but if it was here, we'd fetch and update it similarly.
      }
    }

    // 3. Mark application as finalized if provided
    if (applicationId) {
      await supabaseAdmin
        .from("Application")
        .update({ status: "completed" })
        .eq("id", applicationId);
    }

    return NextResponse.json(rating);
  } catch (error: any) {
    console.error("Rating Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
