import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseClient";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json({ error: "userId is required" }, { status: 400 });
    }

    const { data: notifications, error } = await supabaseAdmin
      .from("Notification")
      .select("*")
      .eq("recipientId", userId)
      .order("createdAt", { ascending: false });

    if (error) throw error;

    return NextResponse.json(notifications || []);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const { id } = await req.json();
    if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

    const { data: notification, error } = await supabaseAdmin
      .from("Notification")
      .update({ read: true })
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(notification);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const { userId } = await req.json();
    if (!userId) return NextResponse.json({ error: "userId required" }, { status: 400 });

    const { data, error } = await supabaseAdmin
      .from("Notification")
      .update({ read: true })
      .eq("recipientId", userId)
      .eq("read", false)
      .select(); // need to return something to avoid error in some versions

    if (error) throw error;

    return NextResponse.json({ success: true, updated: data?.length || 0 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
