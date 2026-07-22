import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyRequest } from "@/lib/verifyAuth";
import { awardPoints, POINT_VALUES } from "@/lib/awardPoints";

export async function POST(req: Request) {
  try {
    const uid = await verifyRequest(req);

    if (!uid) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();

    const user = await prisma.user.findUnique({
      where: { firebaseId: uid },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (!user.churchId) {
      return NextResponse.json(
        { error: "You need to set up your church before adding contacts" },
        { status: 400 }
      );
    }

    const contact = await prisma.contact.create({
      data: {
        name: body.name,
        age: Number(body.age),
        phone: body.phone,
        gender: body.gender,
        location: body.location,
        status: "New Contact",
        progress: 0,
        church: { connect: { id: user.churchId } },
        addedBy: { connect: { id: user.id } },
      },
    });
    await awardPoints(user.id, "New Contact", POINT_VALUES.NEW_CONTACT);

    return NextResponse.json(contact);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to create contact" },
      { status: 500 }
    );
  }
}

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
      return NextResponse.json([]);
    }

    const contacts = await prisma.contact.findMany({
      where: { churchId: user.churchId, deletedAt: null},
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(contacts);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to fetch contacts" },
      { status: 500 }
    );
  }
}