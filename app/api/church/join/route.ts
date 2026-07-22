import { prisma } from "@/lib/prisma";
import { verifyRequest } from "@/lib/verifyAuth";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
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

    if (requester.churchId) {
      return NextResponse.json(
        { error: "You already belong to a church" },
        { status: 400 }
      );
    }

    const body = await req.json();
    const { churchId } = body;

    if (!churchId) {
      return NextResponse.json(
        { error: "Missing churchId" },
        { status: 400 }
      );
    }

    const church = await prisma.church.findUnique({
      where: { id: churchId },
    });

    if (!church) {
      return NextResponse.json({ error: "Church not found" }, { status: 404 });
    }

    const user = await prisma.user.update({
      where: { firebaseId: uid },
      data: { churchId: church.id, role: "member" },
    });

    return NextResponse.json(user);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to join church" },
      { status: 500 }
    );
  }
}