import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const otherUserId = searchParams.get("userId");
    const userId = session.user.id;

    if (otherUserId) {
      // Fetch direct chat history
      const messages = await prisma.message.findMany({
        where: {
          OR: [
            { senderId: userId, receiverId: otherUserId },
            { senderId: otherUserId, receiverId: userId },
          ],
        },
        orderBy: { createdAt: "asc" },
      });
      return NextResponse.json(messages);
    }

    // Fetch recent conversations — get latest message per unique conversation partner
    const conversations = await prisma.$queryRaw<
      Array<{
        otherId: string;
        lastMessage: string;
        createdAt: Date;
        isRead: boolean;
        senderId: string;
      }>
    >`
      WITH LatestMessages AS (
        SELECT 
          CASE WHEN "senderId" = ${userId} THEN "receiverId" ELSE "senderId" END AS "otherId",
          content,
          "createdAt",
          "isRead",
          "senderId",
          ROW_NUMBER() OVER (
            PARTITION BY CASE WHEN "senderId" = ${userId} THEN "receiverId" ELSE "senderId" END 
            ORDER BY "createdAt" DESC
          ) as rn
        FROM "Message"
        WHERE "senderId" = ${userId} OR "receiverId" = ${userId}
      )
      SELECT 
        "otherId",
        content AS "lastMessage",
        "createdAt",
        "isRead",
        "senderId"
      FROM LatestMessages
      WHERE rn = 1
    `;

    // Attach user details for each conversation
    const populated = await Promise.all(
      conversations.map(async (conv) => {
        const user = await prisma.user.findUnique({
          where: { id: conv.otherId },
          select: { id: true, role: true, student: { select: { name: true } }, employer: { select: { companyName: true } } },
        });
        const name = user?.student?.name || user?.employer?.companyName || "Unknown";
        return { ...conv, user: { ...user, name } };
      })
    );

    populated.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return NextResponse.json(populated);
  } catch (error: any) {
    console.error("Messages GET Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { receiverId, content } = await req.json();
    if (!receiverId || !content) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const newMessage = await prisma.message.create({
      data: {
        senderId: session.user.id,
        receiverId,
        content,
      },
    });

    return NextResponse.json(newMessage);
  } catch (error: any) {
    console.error("Message POST Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { otherUserId } = await req.json();
    if (!otherUserId) return NextResponse.json({ error: "Missing userId" }, { status: 400 });

    await prisma.message.updateMany({
      where: {
        senderId: otherUserId,
        receiverId: session.user.id,
        isRead: false,
      },
      data: { isRead: true },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Message PATCH Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

