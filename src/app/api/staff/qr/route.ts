import { NextRequest, NextResponse } from "next/server";
import { verifyApiAuth } from "@/lib/auth-guard";
import { prisma } from "@/lib/prisma";
import { getOrCreateMealQr } from "@/lib/qr";
import { getTodayServiceDate, formatServiceDateDisplay } from "@/lib/timezone";
import { MealType } from "@prisma/client";

export async function GET(req: NextRequest) {
  const auth = await verifyApiAuth(["STAFF"]);
  if ("errorResponse" in auth) return auth.errorResponse;
  const { session } = auth;

  const { searchParams } = new URL(req.url);
  const targetDate = searchParams.get("serviceDate") || getTodayServiceDate();

  // Find all OPT_IN responses for this staff member and date
  const optInResponses = await prisma.mealResponse.findMany({
    where: {
      userId: session.userId,
      serviceDate: targetDate,
      status: "OPT_IN",
    },
    include: {
      user: {
        include: { profile: true },
      },
    },
  });

  // Find any existing collections for this user and date
  const collections = await prisma.mealCollection.findMany({
    where: {
      userId: session.userId,
      serviceDate: targetDate,
    },
  });

  const collectionMap = new Map<string, Date>();
  collections.forEach((c) => collectionMap.set(c.mealType, c.collectedAt));

  const mealQrs = [];

  for (const resp of optInResponses) {
    const isCollected = collectionMap.has(resp.mealType);
    const qrData = await getOrCreateMealQr(session.userId, targetDate, resp.mealType);

    if (qrData) {
      mealQrs.push({
        mealType: resp.mealType,
        token: qrData.token,
        dataUrl: qrData.dataUrl,
        isCollected,
        collectedAt: collectionMap.get(resp.mealType) || null,
        expiresAt: qrData.expiresAt,
      });
    }
  }

  return NextResponse.json({
    serviceDate: targetDate,
    serviceDateDisplay: formatServiceDateDisplay(targetDate),
    qrs: mealQrs,
    totalOptIn: optInResponses.length,
  });
}

