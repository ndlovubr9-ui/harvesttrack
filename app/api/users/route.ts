import { prisma } from "@/lib/prisma";
import { verifyRequest } from "@/lib/verifyAuth";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  try {
    const uid = await verifyRequest(req);

    if (!uid) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const requester = await prisma.user.findUnique({
      where: { firebaseId: uid },
    });

    if (!requester) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (requester.role !== "admin") {
      return NextResponse.json({ error: "Admins only" }, { status: 403 });
    }

    if (!requester.churchId) {
      return NextResponse.json([]);
    }

    const users = await prisma.user.findMany({
      where: { churchId: requester.churchId },
      select: {
        id: true,
        firstname: true,
        lastname: true,
        email: true,
        role: true,
        points: true,
      },
      orderBy: { firstname: "asc" },
    });

    return NextResponse.json(users);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to fetch users" },
      { status: 500 }
    );
  }
}