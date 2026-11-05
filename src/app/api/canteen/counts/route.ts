import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyApiAuth } from "@/lib/auth-guard";
import { getTodayServiceDate, formatServiceDateDisplay } from "@/lib/timezone";
import { MealType, ResponseStatus } from "@prisma/client";

export async function GET(req: NextRequest) {
  const auth = await verifyApiAuth(["CANTEEN", "ADMIN"]);
  if ("errorResponse" in auth) return auth.errorResponse;

  const { searchParams } = new URL(req.url);
  const serviceDate = searchParams.get("serviceDate") || getTodayServiceDate();

  // Find all opted in meals for this date
  const optInResponses = await prisma.mealResponse.findMany({
    where: {
      serviceDate,
      status: ResponseStatus.OPT_IN,
      user: { isActive: true },
    },
  });

  // Find collections
  const collections = await prisma.mealCollection.findMany({
    where: { serviceDate },
  });

  const getMealStats = (mealType: MealType) => {
    const requested = optInResponses.filter((r) => r.mealType === mealType).length;
    const collected = collections.filter((c) => c.mealType === mealType).length;
    return {
      requested,
      collected,
      pending: Math.max(0, requested - collected),
    };
  };

  return NextResponse.json({
    serviceDate,
    serviceDateDisplay: formatServiceDateDisplay(serviceDate),
    meals: {
      breakfast: getMealStats(MealType.BREAKFAST),
      lunch: getMealStats(MealType.LUNCH),
      dinner: getMealStats(MealType.DINNER),
    },
    totalRequested: optInResponses.length,
    totalCollected: collections.length,
    totalPending: Math.max(0, optInResponses.length - collections.length),
  });
}

