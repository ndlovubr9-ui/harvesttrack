import { prisma } from "@/lib/prisma";
import { verifyRequest } from "@/lib/verifyAuth";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  try {
    const uid = await verifyRequest(req);

    if (!uid) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const q = searchParams.get("q")?.trim();

    const churches = await prisma.church.findMany({
      where: q
        ? { name: { contains: q, mode: "insensitive" } }
        : undefined,
      select: {
        id: true,
        name: true,
        conference: true,
        district: true,
        location: true,
      },
      orderBy: { name: "asc" },
      take: 20,
    });

    return NextResponse.json(churches);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to fetch churches" },
      { status: 500 }
    );
  }
}

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

    const church = await prisma.church.create({
      data: {
        name: body.name,
        conference: body.conference,
        district: body.district,
        location: body.location,
      },
    });

    await prisma.user.update({
      where: { firebaseId: uid },
      data: { churchId: church.id, role: "admin" },
    });

    return NextResponse.json(church);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "Failed to create church" },
      { status: 500 }
    );
  }
}

export async function PATCH(req: Request) {
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
      return NextResponse.json(
        { error: "You don't belong to a church" },
        { status: 400 }
      );
    }

    const body = await req.json();

    const church = await prisma.church.update({
      where: { id: requester.churchId },
      data: {
        name: body.name,
        conference: body.conference,
        district: body.district,
        location: body.location,
      },
    });

    return NextResponse.json(church);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "Failed to update church" },
      { status: 500 }
    );
  }
}