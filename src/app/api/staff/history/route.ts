import { NextRequest, NextResponse } from "next/server";
import { verifyApiAuth } from "@/lib/auth-guard";
import { prisma } from "@/lib/prisma";
import { formatIST, formatServiceDateDisplay } from "@/lib/timezone";

export async function GET(req: NextRequest) {
  const auth = await verifyApiAuth(["STAFF"]);
  if ("errorResponse" in auth) return auth.errorResponse;
  const { session } = auth;

  // Fetch responses grouped by serviceDate
  const responses = await prisma.mealResponse.findMany({
    where: { userId: session.userId },
    orderBy: [{ serviceDate: "desc" }, { mealType: "asc" }],
    take: 60,
  });

  const collections = await prisma.mealCollection.findMany({
    where: { userId: session.userId },
    orderBy: { collectedAt: "desc" },
    take: 60,
  });

  const collectionSet = new Set(
    collections.map((c) => `${c.serviceDate}_${c.mealType}`)
  );

  const history = responses.map((r) => {
    const key = `${r.serviceDate}_${r.mealType}`;
    const collected = collectionSet.has(key);
    const collectionRecord = collections.find(
      (c) => c.serviceDate === r.serviceDate && c.mealType === r.mealType
    );

    return {
      id: r.id,
      serviceDate: r.serviceDate,
      serviceDateDisplay: formatServiceDateDisplay(r.serviceDate),
      mealType: r.mealType,
      status: r.status,
      collected,
      collectedAt: collectionRecord ? formatIST(collectionRecord.collectedAt) : null,
      updatedAt: formatIST(r.updatedAt),
    };
  });

  return NextResponse.json({ history });
}

