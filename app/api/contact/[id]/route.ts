import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyRequest } from "@/lib/verifyAuth";
import { awardPoints, POINT_VALUES } from "@/lib/awardPoints";

const ALLOWED_STATUSES = [
  "New Contact",
  "Studying",
  "Preparing for Baptism",
  "Baptized",
];

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const uid = await verifyRequest(req);

    if (!uid) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({ where: { firebaseId: uid } });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const contact = await prisma.contact.findUnique({ where: { id } });

    if (!contact || contact.churchId !== user.churchId || contact.deletedAt) {
      return NextResponse.json({ error: "Contact not found" }, { status: 404 });
    }

    return NextResponse.json(contact);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to fetch contact" },
      { status: 500 }
    );
  }
}

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
    const { status } = body;

    if (!status || !ALLOWED_STATUSES.includes(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { firebaseId: uid } });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const contact = await prisma.contact.findUnique({ where: { id } });

    if (!contact || contact.deletedAt) {
      return NextResponse.json({ error: "Contact not found" }, { status: 404 });
    }

    if (contact.churchId !== user.churchId) {
      return NextResponse.json(
        { error: "You don't have access to this contact" },
        { status: 403 }
      );
    }

    const updated = await prisma.contact.update({
      where: { id },
      data: { status },
    });

    if (status === "Preparing for Baptism" && contact.status !== status) {
      await awardPoints(
        user.id,
        "Contact Preparing for Baptism",
        POINT_VALUES.PREPARING_FOR_BAPTISM
      );
    } else if (status === "Baptized" && contact.status !== status) {
      await awardPoints(user.id, "Contact Baptized", POINT_VALUES.BAPTIZED);
    }

    return NextResponse.json(updated);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to update contact" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const uid = await verifyRequest(req);

    if (!uid) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({ where: { firebaseId: uid } });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (user.role !== "admin") {
      return NextResponse.json({ error: "Admins only" }, { status: 403 });
    }

    const contact = await prisma.contact.findUnique({ where: { id } });

    if (!contact || contact.deletedAt) {
      return NextResponse.json({ error: "Contact not found" }, { status: 404 });
    }

    if (contact.churchId !== user.churchId) {
      return NextResponse.json(
        { error: "You don't have access to this contact" },
        { status: 403 }
      );
    }

    await prisma.contact.update({
      where: { id },
      data: { deletedAt: new Date() },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to delete contact" },
      { status: 500 }
    );
  }
}