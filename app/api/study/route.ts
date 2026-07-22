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
    const { contactId, topic, notes, date, nextDate } = body;

    if (!contactId || !topic || !date || !nextDate) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({ where: { firebaseId: uid } });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const contact = await prisma.contact.findUnique({
      where: { id: contactId },
    });

    if (!contact) {
      return NextResponse.json({ error: "Contact not found" }, { status: 404 });
    }

    if (contact.churchId !== user.churchId) {
      return NextResponse.json(
        { error: "You don't have access to this contact" },
        { status: 403 }
      );
    }

    const study = await prisma.study.create({
      data: {
        topic,
        notes: notes ?? "",
        date: new Date(date),
        nextDate: new Date(nextDate),
        contactId,
      },
    });

    await awardPoints(user.id, "Bible Study Logged", POINT_VALUES.STUDY_LOGGED);

    return NextResponse.json(study);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to create study" },
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

    const { searchParams } = new URL(req.url);
    const contactId = searchParams.get("contactId");

    if (!contactId) {
      return NextResponse.json(
        { error: "Missing contactId" },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({ where: { firebaseId: uid } });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const contact = await prisma.contact.findUnique({
      where: { id: contactId },
    });

    if (!contact || contact.churchId !== user.churchId) {
      return NextResponse.json(
        { error: "You don't have access to this contact" },
        { status: 403 }
      );
    }

    const studies = await prisma.study.findMany({
      where: { contactId },
      orderBy: { date: "desc" },
    });

    return NextResponse.json(studies);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to fetch studies" },
      { status: 500 }
    );
  }
}