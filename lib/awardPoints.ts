import { prisma } from "@/lib/prisma";

export const POINT_VALUES = {
  NEW_CONTACT: 5,
  STUDY_LOGGED: 10,
  PREPARING_FOR_BAPTISM: 20,
  BAPTIZED: 50,
} as const;

export async function awardPoints(
  userId: string,
  type: string,
  points: number
) {
  await prisma.$transaction([
    prisma.activity.create({
      data: { type, points, userId },
    }),
    prisma.user.update({
      where: { id: userId },
      data: { points: { increment: points } },
    }),
  ]);
}