import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseClient";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    
    const { data: application, error } = await supabaseAdmin
      .from("Application")
      .update({ isAdminVerified: true, updatedAt: new Date().toISOString() })
      .eq("id", id)
      .select()
      .single();
      
    if (error) throw error;
    
    return NextResponse.json({ success: true, application });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
