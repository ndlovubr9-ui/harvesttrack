import { prisma } from "@/lib/prisma";
import { verifyRequest } from "@/lib/verifyAuth";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  try {
    const uid = await verifyRequest(req);

    if (!uid) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { firebaseId: uid },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (!user.churchId) {
      return NextResponse.json({ error: "No church" }, { status: 404 });
    }

    const church = await prisma.church.findUnique({
      where: { id: user.churchId },
    });

    return NextResponse.json(church);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to fetch church" },
      { status: 500 }
    );
  }
}