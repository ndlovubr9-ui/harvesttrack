import { prisma } from "@/lib/prisma";
import { verifyRequest } from "@/lib/verifyAuth";
import { NextResponse } from "next/server";

const ALLOWED_ROLES = ["member", "admin"];

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const uid = await verifyRequest(req);

    if (!uid) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { role } = body;

    if (!role || !ALLOWED_ROLES.includes(role)) {
      return NextResponse.json({ error: "Invalid role" }, { status: 400 });
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

    const target = await prisma.user.findUnique({ where: { id } });

    if (!target || target.churchId !== requester.churchId) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (target.id === requester.id && role !== "admin") {
      return NextResponse.json(
        { error: "You can't remove your own admin access" },
        { status: 400 }
      );
    }

    const updated = await prisma.user.update({
      where: { id },
      data: { role },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to update role" },
      { status: 500 }
    );
  }
}