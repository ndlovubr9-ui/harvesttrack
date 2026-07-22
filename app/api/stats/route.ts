import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyRequest } from "@/lib/verifyAuth";

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
      return NextResponse.json({
        contacts: 0,
        studies: 0,
        baptismPrep: 0,
        totalPoints: 0,
      });
    }

    const [contacts, studies, baptismPrep, pointsResult] = await Promise.all([
  prisma.contact.count({
    where: { churchId: user.churchId, deletedAt: null },
  }),
  prisma.study.count({
    where: { contact: { churchId: user.churchId, deletedAt: null } },
  }),
  prisma.contact.count({
    where: {
      churchId: user.churchId,
      status: "Preparing for Baptism",
      deletedAt: null,
    },
  }),
  prisma.user.aggregate({
    where: { churchId: user.churchId },
    _sum: { points: true },
  }),
]);

    return NextResponse.json({
      contacts,
      studies,
      baptismPrep,
      totalPoints: pointsResult._sum.points ?? 0,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to fetch stats" }, { status: 500 });
  }
}