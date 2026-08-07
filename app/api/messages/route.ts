import { auth } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseClient";

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const peerId = searchParams.get("peerId");
    
    if (peerId) {
      // 1. Fetch messages between current user and peerId
      const { data: messages, error } = await supabaseAdmin
        .from("Message")
        .select("*")
        .or(`and(senderId.eq.${session.user.id},receiverId.eq.${peerId}),and(senderId.eq.${peerId},receiverId.eq.${session.user.id})`)
        .order("createdAt", { ascending: true });
        
      if (error) throw error;
      
      // Also mark as read
      if (messages && messages.length > 0) {
        const unreadIds = messages
          .filter(m => m.receiverId === session.user.id && !m.read)
          .map(m => m.id);
          
        if (unreadIds.length > 0) {
          await supabaseAdmin
            .from("Message")
            .update({ read: true })
            .in("id", unreadIds);
        }
      }
      
      return NextResponse.json(messages || []);
    } else {
      // 2. Fetch all conversations for current user
      // Since we can't easily do Prisma's $queryRaw for DISTINCT ON in pure Supabase JS
      // without creating a custom Postgres function, we'll fetch recent messages
      // and process them in-memory (acceptable for now)
      
      const { data: recentMsgs, error } = await supabaseAdmin
        .from("Message")
        .select("*")
        .or(`senderId.eq.${session.user.id},receiverId.eq.${session.user.id}`)
        .order("createdAt", { ascending: false })
        .limit(100);
        
      if (error) throw error;
      
      // Group by peerId to find latest message per conversation
      const convosMap = new Map();
      (recentMsgs || []).forEach(msg => {
        const peerId = msg.senderId === session.user.id ? msg.receiverId : msg.senderId;
        if (!convosMap.has(peerId)) {
          convosMap.set(peerId, {
            ...msg,
            peerId
          });
        }
      });
      
      const conversations = Array.from(convosMap.values());
      const peerIds = conversations.map(c => c.peerId);
      
      // Fetch peer names
      const { data: students } = await supabaseAdmin
        .from("Student")
        .select("userId, name")
        .in("userId", peerIds);
        
      const { data: employers } = await supabaseAdmin
        .from("Employer")
        .select("userId, companyName")
        .in("userId", peerIds);
        
      // Map names to conversations
      const enrichedConversations = conversations.map(c => {
        const student = students?.find(s => s.userId === c.peerId);
        const employer = employers?.find(e => e.userId === c.peerId);
        
        return {
          ...c,
          peerName: student ? student.name : employer ? employer.companyName : "Unknown User"
        };
      });
      
      return NextResponse.json(enrichedConversations);
    }
  } catch (error: any) {
    console.error("Messages GET Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { receiverId, content } = await req.json();

    if (!receiverId || !content) {
      return NextResponse.json({ error: "Receiver ID and content are required" }, { status: 400 });
    }

    const { data: message, error } = await supabaseAdmin
      .from("Message")
      .insert({
        id: crypto.randomUUID(),
        senderId: session.user.id,
        receiverId,
        content,
        read: false,
        createdAt: new Date().toISOString()
      })
      .select()
      .single();
      
    if (error) throw error;

    return NextResponse.json(message, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
