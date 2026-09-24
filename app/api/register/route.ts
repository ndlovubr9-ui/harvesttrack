import { prisma } from "@/lib/prisma";
import { verifyRequest } from "@/lib/verifyAuth";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const uid = await verifyRequest(req);

    if (!uid) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();

    const user = await prisma.user.create({
      data: {
        firebaseId: uid,
        firstname: body.firstname,
        lastname: body.lastname,
        email: body.email,
      },
    });

    return NextResponse.json(user);
  } catch (error) {
  console.error("REGISTER ERROR:", error);

  return NextResponse.json(
    {
      error:
        error instanceof Error
          ? error.message
          : String(error),
    },
    { status: 500 }
  );
}
}