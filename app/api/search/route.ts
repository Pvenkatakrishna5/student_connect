import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseClient";
import { SAMPLE_JOBS } from "@/lib/data";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get("q") || "";
    const category = searchParams.get("category") || "";
    const location = searchParams.get("location") || "";
    const minPay = parseInt(searchParams.get("minPay") || "0");
    const type = searchParams.get("type") || "";

    let dbQuery = supabaseAdmin
      .from("Job")
      .select("*, Employer(companyName, rating, city, isVerifiedBusiness)")
      .eq("status", "active");

    if (query) {
      dbQuery = dbQuery.or(`title.ilike.%${query}%,description.ilike.%${query}%`);
      // Note: searching arrays (skillsRequired) is complex in Supabase JS without RPC.
      // For now, title and description text search is handled.
    }

    if (category && category !== "All") {
      dbQuery = dbQuery.eq("category", category);
    }

    if (location) {
      dbQuery = dbQuery.ilike("location", `%${location}%`);
    }

    if (minPay > 0) {
      dbQuery = dbQuery.gte("payAmount", minPay);
    }

    if (type) {
      dbQuery = dbQuery.eq("payType", type);
    }

    try {
      const { data: jobs, error } = await dbQuery
        .order("createdAt", { ascending: false })
        .limit(50);

      if (error) throw error;
      
      const mapped = (jobs || []).map(j => {
        const { Employer, ...rest } = j;
        return { ...rest, employer: Employer };
      });

      return NextResponse.json(mapped);
    } catch (dbErr) {
      console.error("Search DB query failed, serving sample jobs:", dbErr);
      let fallback = SAMPLE_JOBS;
      const q = query.toLowerCase();
      if (q) {
        fallback = fallback.filter(
          (job) =>
            job.title.toLowerCase().includes(q) ||
            job.description.toLowerCase().includes(q) ||
            job.skillsRequired.some((s) => s.toLowerCase().includes(q))
        );
      }
      if (category && category !== "All") {
        fallback = fallback.filter((job) => job.category === category);
      }
      if (location) {
        fallback = fallback.filter((job) => job.location.toLowerCase().includes(location.toLowerCase()));
      }
      if (minPay > 0) {
        fallback = fallback.filter((job) => job.payAmount >= minPay);
      }
      if (type) {
        fallback = fallback.filter((job) => job.payType === type);
      }
      return NextResponse.json(fallback);
    }
  } catch (error: unknown) {
    console.error("Search API Error:", error);
    return NextResponse.json(SAMPLE_JOBS);
  }
}
