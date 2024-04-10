import { Prisma, PrismaClient } from "@prisma/client";

export const prisma = new PrismaClient();

export function isUniqueConstraintError(
  e: unknown
): e is Prisma.PrismaClientKnownRequestError {
  return (
    e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002"
  );
}
